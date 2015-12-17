'use strict';

require('dotenv').load();

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();
require('./app/config/passport')(passport);
mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/partials', express.static(process.cwd() + '/app/partials'));

app.use(session({
	secret: 'sJUUha(*(hhiuias02398sc',
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({url: process.env.MONGO_URI})
}));

app.use(passport.initialize());
app.use(passport.session());

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies


routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});