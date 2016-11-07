var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = require('url');
var passport = require('passport');

var url = 'mongodb://localhost:27017/test';
var db;

router.use(passport.initialize());
router.use(passport.session());

MongoClient.connect(url, function(err, data) {
	if (err)
		throw err;
	db = data;
});

router.all('/login', function(req, res) {
	res.render('login.html', {});
});

/* GET home page. */
router.all('/auth/facebook/login', passport.authenticate('facebook'));
router.get('/auth/google/login', passport.authenticate('google', {
	scope : [ 'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.profile.emails.read' ]
}));

router.get('/successo', passport.authenticate('facebook', {
	failureRedirect : '/'
}), function(req, res) {
	
	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});
router.get('/successoGoogle', passport.authenticate('google', {
	failureRedirect : '/'
}), function(req, res) {
	console.log(req.session);
	console.log("Autenticato 1" + req.isAuthenticated());

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.all('/utente', function(req, res) {
	var logged = req.param.logged;
	var utente = req.param.utente;
	res.render('upload.html', {
		aut : logged,
		utente : utente
	});
});

function ensureAuthenticated(req, res, next) {
	console.log("Autenticato " + req.isAuthenticated());
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

router.get('/', function(req, res, next) {
	res.render('home.html', {
		title : 'Parents'
	});
});

// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WADxsMkppXo

router.all('/cerca', function(req, res, next) {
	var city = "";
	var tipoLuogoEvento = "";
	console.log();
	if (req.body.citta) {
		// citta dobbiamo cercare du db
		city = req.body.citta;
		tipoLuogoEvento = req.body.tipoLuogoEvento;
	} else {
		// passiamo un default
		city = "Roma";
		tipoLuogoEvento = 3;
	}
	res.render('index.html', {
		citta : city,
		tipoLuogoEvento : tipoLuogoEvento
	});
});

router.get('/getListaForCity', function(req, res) {

	var city = "";
	if (req.query.citta) {
		// ce la citta dobbiamo cercare du db
		city = req.query.citta;
		console.log("getListaForCity >>>" + city + "<<<");
	} else {
		console.log("Na " + city);
	}

	res.writeHead(200, {
		"Content-Type" : "application/json"
	});
	var lista = [];
	db.collection("luogo_evento").find({
		$or : [ {
			"citta" : city.toLowerCase()
		}, {
			"citta" : city
		} ]
	}, function(err, docs) {

		if (err) {
			console.log("ERRORE ")
			res.end(null);
		}
		docs.each(function(err, doc) {
			if (doc) {
				lista.push(doc);
				console.log(doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi : lista
				});

				res.end(json);
			}
		});

	});
});

module.exports = router;
//