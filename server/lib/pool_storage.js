const _ = require('lodash');
const util = require('util');
const request = require('supertest');
const Promise = require('bluebird');
const poolsDb = require('./poolsDb');
const pools = require('../../config/pools');
const winston = require('winston');
winston.level = process.env.LOG || 'info';

module.exports = {

  loadConfig: function(poolName) {
    var pool = pools[poolName];
    if (!pool) {
      throw new Error(`Cannot load pool information no pool with name ${poolName} exists`);
    }

    if (!pool.createUrl || !pool.poolSize) {
      throw new Error(`Pool ${poolName} is not configured correctly needs to specify createUrl and poolSize`);
    }
    return pools[poolName];
  },

  createPoolEntry: function(poolName) {
    let self = this;
    let domain = 'localhost:3000';
    let pool = self.loadConfig(poolName);
    let verb = pool.verb || 'get';
    let modelFileName = pool.modelFileName;
    let url = pool.createUrl;
    let additionalParams = pool.additionalParams;
    let path = url;

    let model = {};

    if (modelFileName) {
      model = require('../data/models/' + modelFileName);
    }
    let body = _.cloneDeep(model);
    winston.log('debug', 'Creating record through: ' + domain + path);
    return request(domain)
    [verb](path)
    .send(body)
    .then(function(response) {
      if (response.statusCode !== 200 && response.statusCode !== 201) {
        return Promise.reject(new Error(`Attempt to create data through ${domain + path} failed with status code ${response.statusCode} and error ${util.inspect(response.body)}`));
      }
      //otherwise write to the pool
      let recordToAdd = {
        data: response.body
      };
      if (additionalParams) {
        winston.log('debug', `Adding additional params ${util.inspect(additionalParams)}`);
        additionalParams.forEach(param => {
          recordToAdd.data[param.name] = param.value;
        });
      }
      return poolsDb.addRecordToPool(poolName, recordToAdd);
    })
    .then(function() {
      return Promise.resolve();
    });
  },

  shoreUpPool: function(poolName) {
    //TODO this will change to use rabbit MQ when we are set up
    winston.log('debug', `Shoring up pool ${poolName}`);
    var self = this;
    var pool = self.loadConfig(poolName);
    //Get a count of current records in the pool
    return poolsDb.getCountForPool(poolName)
    .then(function(count) {
      winston.log('debug', `Count for pool ${poolName} is ${count}`);
      var promises = [];
      if (count < pool.poolSize) {
        var recordsToCreate = pool.poolSize - count;
        winston.log('debug', `Count is less than pool size will shore up and create ${recordsToCreate} new records`);
        //build a simple array counting out the number of creations to take place
        while (recordsToCreate-- > 0) {
          promises.push(recordsToCreate);
        }

        //Promise.each will create an array of promises but run them sequentially
        return Promise.each(promises, function() {
          //WE use 'new' Promise here because setTimeout is asynchronous using callbacks and this is how we wrap it in a promise
          return new Promise(function(resolve) {
            setTimeout(function() {
              winston.log('debug', 'Creating new entry');
              return self.createPoolEntry(poolName)
              .then(resolve)
              .catch(function(err) {
                winston.log('warn', `CAUGHT ERROR CREATING ENTRY ${util.inspect(err)}`);
                return resolve(err);
              });
            }, 10000);
          });
        });
      }
    });

  },

  getEntry: function(poolName) {
    //use create endoint to retrieve a new entry
    return poolsDb.getRecordFromPool(poolName);
  },

};
