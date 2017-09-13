const winston = require('winston');
winston.level = process.env.LOG || 'info';
const express = require('express');
const path = require('path');
//Route file contains all API information
const routes = require('./routes/index');
const MongoHelper = require('./lib/mongo_helper');
const testDb = new MongoHelper('data-pools');
const app = express();

//Specifies where views are located and using jade engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Specifies root path and where routes are defined
app.use('/', routes);


//Specifies where css, js files and images and other information is
app.use(express.static(path.join(__dirname, 'public')));

//Uses Port 3000 if no DEV_PORT env variable is set
winston.log('info', 'Starting on port 3000');
testDb.connect(() => {
  app.listen(process.env.PORT || 3000);

});
