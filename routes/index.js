var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
var url = require('url');
var passport = require('passport');

var url = 'mongodb://localhost:27017/test';
var db;

router.use(passport.initialize());
router.use(passport.session());

mongo.MongoClient.connect(url, function(err, data) {
	if (err)
		throw err;
	db = data;
});

router.all('/verify', function(req, res) {
	res.writeHead(200, {
		"Content-Type" : "application/json"
	});
	var json = JSON.stringify({
		loggato : req.isAuthenticated()
	});

	res.end(json);
});

router.all('/login', function(req, res) {
	if (!req.isAuthenticated()) {
		res.render('login.html', {});
	} else {
		res.redirect('/users');
	}
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


router.get('/detail', function(req, res) {
	var idLuogo;
	var fromDettaglio = false;

	if (req.query.dettaglio) {
		fromDettaglio = true;
	}
	if (req.query.id_luogo) {
		console.log("id_luogo >> " + req.query.id_luogo);
	}else{
		console.log("id_luogo NON PRESENTE");
		res.redirect('/');
		
	}
	
	res.render('detail.html', {
		dettaglio: fromDettaglio,
		idLuogo: req.query.id_luogo
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
	console.log("/home");
	var loggato = req.isAuthenticated();
	res.render('home.html', {
		title : 'Parents',
		loggato: loggato
	});
});

// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WADxsMkppXo

router.all('/cerca', function(req, res, next) {
	var city = "";
	var tipoLuogoEvento = "";
	console.log(req.query.citta);
	if (req.body.citta) {
		// citta dobbiamo cercare du db
		city = req.body.citta;
		tipoLuogoEvento = req.body.tipoLuogoEvento;
	} else if(req.query.citta) {
		city = req.query.citta;
	}else{
		// passiamo un default
		city = "Roma";
		tipoLuogoEvento = 3;
	}
	console.log("/home");
	var loggato = req.isAuthenticated();
	res.render('index.html', {
		citta : city,
		loggato: loggato,
		tipoLuogoEvento : tipoLuogoEvento
	});
});

router.get('/getLuogoById', function(req, res) {
	try {
		console.log("/getLuogoById");
	
	var idLuogo;
	if (req.query.idLuogo) {
		idLuogo = req.query.idLuogo;
		console.log("getLuogoById >>>" + idLuogo + "<<<");
	} else {
		console.log("Na " + city);
	}
	
	var o_id = new mongo.ObjectID(idLuogo);
	console.log(o_id);
	
	db.collection("luogo_evento").findOne({
		_id : o_id
	},
	function(err, docs) {
		if (err) {
			console.log("ERRORE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
			res.end(null);
			console.log("ERRORE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
			}
			console.log(docs);
			console.log(docs);
			var json = JSON.stringify({
				luogo : docs
			});
			res.end(json);
		});
	} catch (err) {
		console.log()
}
});

router.get('/getListaForCity', function(req, res) {

	var city = "";
	if (req.query.citta) {
		// dobbiamo cercare du db
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