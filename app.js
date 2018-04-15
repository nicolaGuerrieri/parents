var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('express-session')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LinkedInStrategy = require('passport-linkedin');
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;


var nomeFileConf = "conf";
var configEnv= require('./conf-env.js');
var app = express();
app.engine('html', require('ejs').renderFile);


if(configEnv.ambiente.dev == true){
	nomeFileConf = nomeFileConf +  "-test";
}
var config = require('./'+nomeFileConf+'.js');

app.use(bodyParser.json());

app.use(session({
	secret : 'ssshhhhh'
}));
var multer = require('multer');
// var upload = multer({
// dest : 'uploads/'
// });
app.use(bodyParser.urlencoded({
	extended : false
}));

app.use('/', routes);
app.use('/users', users);
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;


passport.use(new TwitterStrategy({
	consumerKey : config.twitter.consumerKey,
	consumerSecret : config.twitter.consumerSecret,
	callbackURL : config.twitter.callbackURL,
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));

console.log(">>>>>>>>>>" + config.google.callbackURL);
// http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.WHeeqnopVXo
passport.use(new InstagramStrategy({
	clientID : config.instagram.clientID,
	clientSecret : config.instagram.clientSecret,
	callbackURL : config.instagram.callbackURL,
	passReqToCallback : true
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
process.env.prd = false;
passport.use(new GoogleStrategy({
	clientID : config.google.clientID,
	clientSecret : config.google.clientSecret,
	callbackURL : config.google.callbackURL,
	passReqToCallback : true
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
passport.use(new FacebookStrategy({
	clientID : config.facebook.clientID,
	clientSecret : config.facebook.clientSecret,
	callbackURL : config.facebook.callbackURL,
	profileFields : [ 'id', 'email', 'gender', 'link', 'locale', 'name',
			'timezone', 'updated_time', 'verified' ]
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});

}));
passport.use(new LinkedInStrategy({
	consumerKey : config.linkedin.clientID,
	consumerSecret : config.linkedin.clientSecret,
	callbackURL : config.linkedin.callbackURL,
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});

}));
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error.html', {
			message : err.message,
			error : err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error.html', {
		message : err.message,
		error : {}
	});
});

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
module.exports = app;
