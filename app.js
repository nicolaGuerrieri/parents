var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var multer = require('multer');

var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());

var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
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

// error handlers

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
