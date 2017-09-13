const util = require('util');
const winston = require('winston');
const express = require('express');
const Promise = require('bluebird');
const request = require('supertest');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
const userHelper = require('../lib/user_helper');
const poolsStorage = require('../lib/pool_storage');
const poolsDb = require('../lib/poolsDb');
const oracleQueryHelper = require('../lib/oracle_query_helper');
const mysqlQueryHelper = require('../lib/mysql_query_helper');
winston.level = process.env.LOG || 'info';


/* GET home page. */
router.get('/', function(req, res) {

  //Data passed in can be used in jade template engine
  return res.render('index.pug');
});

//createUser?userTemplate=developerRoleWithSomething
router.get('/users', function(req, res) {
  //All good apis should have error handling
  let userTemplate = req.query.userTemplate;
  if (!userTemplate) {
    return res.status(400).send({
      message: 'userTemplate is required and must be one of consumer or internal'
    });
  }

  //Consolidate data needed for user creation to simplify
  let domain = 'localhost:3000';
  let path = '/users';
  let body = {
    username: 'nick' + Date.now(),
    password: 'welcome'
  };

  //Handle authorization to simplify request
  let headers = {
    Authorization: 'oauth token'
  };

  //make a request to create a user
  return request(domain)
  .post(path)
  .set(headers)
  .send(body)
  .then(function (response) {
    if (response.statusCode !== 201) {
      return res.status(500).send({
        message: 'downstream attempt to call server failed'
      });
    }
    return res.status(200).send(response.body);
  });

});

router.get('/createUserUi', function(req, res) {
  return res.render('dataManagement');
});

router.get('/createThingOnlyThroughTheUi', function(req, res) {

    //spawn a process that calls your UI scripts
});

router.post('/storeResultsFromUI', function(req, res) {

});

router.get('/pool/:poolName/entry', function (req, res) {
  let poolName = req.params.poolName;

  winston.log('debug', 'loading config for pool ' + poolName);
  let pool = poolsStorage.loadConfig(poolName);
  winston.log('debug', `loaded pool info ${util.inspect(pool)}`);

  //Get count of pool
  return poolsDb.getCountForPool(poolName)
  .then(function(count) {
    winston.log('debug', `Received count ${count}`);
    if (count === 0) {
      //create it through normal means if pool is empty
      let createUrl = pool.createUrl;
      winston.log('debug', `No entries exist for pool ${poolName} will shore up and create directly through ${createUrl}`);
      poolsStorage.shoreUpPool(poolName);
      return res.status(404).send({
        message: `Data Pools for ${poolName} are empty will try to refill try again in a few minutes.`
      });
    } else {
      //Get the entry from the pool
      return poolsStorage.getEntry(poolName);
    }
  })
  .then(function(entry) {
    //this will run behind the scenes
    poolsStorage.shoreUpPool(poolName);
    return res.status(200).send(entry.data);
  })
  .catch(function(err) {
    return res.status(500).send({
      message: `ERROR: Failed to create or retrieve entry with error ${util.inspect(err)}`
    });
  });

});


//***************************************************************************
//
//Sample REST API get request
router.get('/users/:user_id', function(req, res) {
  //Can access variables in path
  var userId = req.params.user_id;
  var user = userHelper.getUser(userId);
  if (!user) {
    return res.status(404).send({
      message: `could not find user ${userId}`
    });
  }

  return res.status(200).send(user);
});

//Can post with req variable
router.post('/users', jsonParser, function(req, res) {

  let result = userHelper.createUser(req.body);
  if (result.message) {
    return res.status(400).send(result);
  }
  return res.status(201).send(result);

});

router.post('/superslowusers', jsonParser, function(req, res) {

  let result = userHelper.createUser(req.body);
  if (result.message) {
    return res.status(400).send(result);
  }
  setTimeout(function() {
    return res.status(201).send(result);
  }, 5000);

});

router.post('/user/:userId/widgets', jsonParser, function(req, res) {
  let userId = req.params.userId;
  result = userHelper.createWidget(userId, req.body);
  if (result.message) {
    return res.status(400).send(result);
  } else {
    return res.status(201).send(result);
  }
});

router.get('/runquery', function(req, res) {
  let query = 'select * ' +
  'from sm_application_property ' +
  'where PROPERTY_NAME = \'affiliate.speedbump.active\'';
  return oracleQueryHelper.runQuery(query)
  .then(function(result) {
    return res.status(200).send(result);
  });
});

router.get('/runmysqlquery', function(req, res) {
  let query = 'select * ' +
  'from t_test';
  return mysqlQueryHelper.runQuery(query)
  .then(function(results) {
    return res.status(200).send(results);
  });
});

module.exports = router;
