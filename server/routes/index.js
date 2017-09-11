var express = require('express');
var Promise = require('bluebird');
var request = require('supertest');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var userHelper = require('../lib/user_helper');
var oracleQueryHelper = require('../lib/oracle_query_helper');
var mysqlQueryHelper = require('../lib/mysql_query_helper');


/* GET home page. */
router.get('/', function(req, res) {

  //Data passed in can be used in jade template engine
  return res.render('index.pug');
});

//createUser?userTemplate=developerRoleWithSomething
router.get('/createUser', function(req, res) {
  var userTemplate = req.query.userTemplate;
  if (!userTemplate) {
    return res.status(400).send({
      message: 'userTemplate is required and must be one of consumer or internal'
    });
  }

  var domain = 'localhost:3000';
  var path = '/users';
  var body = {
    username: 'nick' + Date.now(),
    password: 'welcome'
  };

  var headers = {
    Authorization: 'oauth token'
  };

  //make a request to create a user
  console.log('making request to ' + domain + path);
  return request(domain)
  .post(path)
  .set(headers)
  .send(body)
  .then(function (response) {
    console.log('GOT RESPONSE', response.body);
    if (response.statusCode !== 201) {
      return res.status(500).send({
        message: 'downstream attempt to call server failed'
      });
    }
    return res.status(200).send(response.body);
  });

});

router.get('/createUserUi', function(req, res) {
});

router.get('/createThingOnlyThroughTheUi', function(req, res) {

    //spawn a process that calls your UI scripts
});

router.post('/storeResultsFromUI', function(req, res) {

})

router.get('/pool/:poolName/entry', function(req, res) {

  //TBD

});



//create/cancelled/widget?userType=asdf
// router.get('create/:status/widget', function(req, res) {
//   let status = req.params.status;
//   //userTemplate
//   //widget props
//   //widget status cancelled or out of stock
//
//   var resultObject = {};
//   //make a call to localhost:3000/users
//   resultObject.user = response.body;
//   //make a call to localhost:3000/user/:userId/widget
//   resultObject.widget = response.body;
//
//   //make a call to set the state of the widget
//
// });


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
