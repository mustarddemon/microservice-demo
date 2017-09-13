const MongoHelper = require('./mongo_helper');
const testDb = new MongoHelper('data-pools');

const _ = require('lodash');
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const MongoDB = require('mongodb');
Promise.promisifyAll(MongoDB);

const winston = require('winston');
winston.level = process.env.LOG || 'info';

const methods = {

  addRecordToPool: function(poolName, data) {
    const addResultFunc = function() {
      return testDb.getDb('data-pools')
        .then(function(db) {
          return testDb.insertRecord(db, poolName, data);
        });
    };
    return retry(addResultFunc, { max_tries: 3, interval: 200 });
  },

  //For every record retrieved delete it from the pool
  getRecordFromPool: function(poolName) {
    winston.debug(`Retrieving record from ${poolName} for env ${env}`);

    //You can pass env in to store data per environment
    //querying in mongo at a simple level is just an object
    // const query = { env: env };
    const query = {};
    //The above query says find all records that have an environment of env
    let retrievedRecord;
    let mainDB;

    //First find a record using a query
    return testDb.getDb('data-pools')
      .then(function(db) {
        mainDB = db;
        return db.collection(poolName)
          .findOne(query);
      })
      .then(function(foundRecord) {
        winston.debug(`Found record ${foundRecord}`);
        retrievedRecord = foundRecord;
        // now delete
        winston.debug('Now deleting record from pool');
        const query = {
          _id: new MongoDB.ObjectID(retrievedRecord['_id'])
        };
        return mainDB.collection(poolName)
          .remove(query);
      })
      .then(function() {
        return retrievedRecord;
      });
  },

  getCountForPool: function(poolName) {
    const query = { };
    winston.debug(`getting count from pool ${poolName}`);
    return testDb.getDb('data-pools')
      .then(function(db) {
        return db.collection(poolName)
          .count(query);
      });
  },

  emptyPool: function(poolName) {
    if (!env || !poolName) {
      return Promise.reject(new Error('Cannot empty pool without env and poolname'));
    }
    const query = { env: env };
    return testDb.getDb('data-pools')
      .then(function(db) {
        winston.debug(`Clearing out pool: ${poolName} for env ${env}`);
        return db.collection(poolName)
          .remove(query);
      });
  }

};

module.exports = _.merge(methods, testDb);
