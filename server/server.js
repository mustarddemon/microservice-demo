var express = require('express');
var path = require('path');
//Route file contains all API information
var routes = require('./routes/index');
var app = express();

//Specifies where views are located and using jade engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Specifies root path and where routes are defined
app.use('/', routes);

//Specifies where css, js files and images and other information is
app.use(express.static(path.join(__dirname, 'public')));

//Uses Port 3000 if no DEV_PORT env variable is set
app.listen(process.env.PORT || 3000);
