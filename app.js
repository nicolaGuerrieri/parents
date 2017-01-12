var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var multer = require('multer');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('express-session')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LinkedInStrategy = require('passport-linkedin');
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;

var app = express();
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());


app.use(session({secret: 'ssshhhhh'}));
var multer = require('multer');
//var upload = multer({
//	dest : 'uploads/'
//});
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

passport.use(new TwitterStrategy(
		{
			consumerKey : "HBAOqdMnwLZvqX4FAkLBvAcBI",
			consumerSecret : "Q5z7tXIFiwK5n3he86HzCT6IPgWM7U5jCbr0F8gU272RkZ9tVy",
			callbackURL : "http://127.0.0.1:3000/successoTwitter/"
		}, function(request, accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				return done(null, profile);
			});
		}));
//http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.WHeeqnopVXo
passport.use(new InstagramStrategy(
		{
			clientID : "634ced226f06464aa82dae2e84216de6",
			clientSecret : "cd9c9c145736448d8892392d81f4f73a",
			callbackURL : "http://127.0.0.1:3000/successoInstagram/",
			passReqToCallback : true
		}, function(request, accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				return done(null, profile);
			});
		}));
passport.use(new GoogleStrategy(
		{
			clientID : "217462498363-s171mghnqot6gt4un4b129gqj0542e3j.apps.googleusercontent.com",
			clientSecret : "33QSBQbCEy6bC1ZILV8NQ6xm",
			callbackURL : "http://127.0.0.1:3000/successoGoogle/",
			passReqToCallback : true
		}, function(request, accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				return done(null, profile);
			});
		}));
passport.use(new GoogleStrategy(
{
	clientID : "217462498363-s171mghnqot6gt4un4b129gqj0542e3j.apps.googleusercontent.com",
	clientSecret : "33QSBQbCEy6bC1ZILV8NQ6xm",
	callbackURL : "http://127.0.0.1:3000/successoGoogle/",
	passReqToCallback : true
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
passport.use(new FacebookStrategy({
	clientID : "199495637151146",
	clientSecret : "28e97694a33d63ef7937b035d0be8a3d",
	callbackURL : "http://localhost:3000/successo/",
	profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
	
}));
passport.use(new LinkedInStrategy({
    consumerKey: "77gmpicgy3yaip",
    consumerSecret: "9CPjAITKB0z3B7t9",
    callbackURL:  "http://localhost:3000/successoLinkedin/"
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



module.exports = app;
