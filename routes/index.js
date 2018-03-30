var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var mongo = require('mongodb');
var assert = require('assert');
var urlD = require('url');
var passport = require('passport');
const opts = {
	logDirectory: '../log',
	fileNamePattern: 'index_<DATE>.log',
	dateFormat: 'YYYY.MM.DD'
};
//const log = require('simple-node-logger').createSimpleLogger();
const log = require('simple-node-logger').createRollingFileLogger(opts);

var configEnv = require('../../conf-env.js');
log.info('urldb', configEnv.ambiente.urldb, '', '');
console.log(configEnv.ambiente.urldb);

var db;
var channel = "/prod";
router.use(passport.initialize());
router.use(passport.session());


mongo.MongoClient.connect(configEnv.ambiente.urldb, function (err, data) {
	if (err)
		throw err;
	db = data;
});
log.info('Start server', channel, '', '');
router.all('/verify', function (req, res) {
	log.info('/verify', channel, '', '');
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var json = JSON.stringify({
		loggato: req.isAuthenticated()
	});

	res.end(json);
});

router.all('/login', function (req, res) {
	log.info('/login', channel, '', '');
	console.log(configEnv.ambiente.urldb);
	if (!req.isAuthenticated()) {
		log.info('/login', channel, 'true', '');
		res.render('login.html', {});
	} else {
		res.redirect('/users');
	}
});

router.all('/privacy', function (req, res) {
	log.info('/privacy', channel, '', '');
	res.render('privacy.html', {});
});


router.all('/utenti', function (req, res, next) {
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];
	db.collection("utente").find({}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					utenti: lista
				});

				res.end(json);
			}
		});

	});
});
/* GET home page. */
router.all('/auth/twitter/login', passport.authenticate('twitter'));
router.all('/auth/instagram/login', passport.authenticate('instagram'));
router.all('/auth/linkedin/login', passport.authenticate('linkedin'));
router.all('/auth/facebook/login', passport.authenticate('facebook'));
router.get('/auth/google/login', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/plus.login',
		'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

router.get('/successo', passport.authenticate('facebook', {
	failureRedirect: '/'
}), function (req, res) {

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.get('/successoTwitter', passport.authenticate('twitter', {
	failureRedirect: '/'
}), function (req, res) {

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});
router.get('/successoLinkedin', passport.authenticate('linkedin', {
	failureRedirect: '/'
}), function (req, res) {

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});
router.get('/successoInstagram', passport.authenticate('instagram', {
	failureRedirect: '/'
}), function (req, res) {

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.get('/successoGoogle', passport.authenticate('google', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('', req.session);
	log.info('', "Autenticato 1" + req.isAuthenticated());

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.all('/utente', function (req, res) {
	var logged = req.param.logged;
	var utente = req.param.utente;
	res.render('upload.html', {
		aut: logged,
		utente: utente
	});
});

router.get('/detail', function (req, res) {
	var idLuogo;
	var fromDettaglio = false;

	if (req.query.dettaglio) {
		fromDettaglio = true;
	}
	if (req.query.id_luogo) {
		log.info('', "id_luogo >> " + req.query.id_luogo);
	} else {
		log.info('', "id_luogo NON PRESENTE");
		res.redirect('/');

	}

	res.render('detail.html', {
		dettaglio: fromDettaglio,
		idLuogo: req.query.id_luogo
	});
});

function ensureAuthenticated(req, res, next) {
	log.info('ensureAuthenticated', channel, 'autenticato? ', req.isAuthenticated());
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

router.get('/', function (req, res, next) {
	log.info('/home', channel, '', '');
	var loggato = req.isAuthenticated();
	log.info('/home', channel, 'autenticato? ', loggato)
	res.render('home.html', {
		title: 'Parents',
		loggato: loggato
	});
});

// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WADxsMkppXo

router.all('/cerca', function (req, res, next) {
	var city = "";
	var tipoLuogoEvento = "";
	log.info('/cerca', channel, 'citta: ', req.query.citta);
	if (req.body.citta) {
		// citta dobbiamo cercare du db
		city = req.body.citta;
		tipoLuogoEvento = req.body.tipoLuogoEvento;
	} else if (req.query.citta) {
		city = req.query.citta;
	} else {
		// passiamo un default
		city = "Roma";
		tipoLuogoEvento = 3;
	}
	var loggato = req.isAuthenticated();
	res.render('index.html', {
		citta: city,
		loggato: loggato,
		tipoLuogoEvento: tipoLuogoEvento
	});
});

router
	.get(
	'/getLuogoById',
	function (req, res) {
		try {
			log.info('/getLuogoById', channel, 'idLuogo: ', idLuogo);


			var idLuogo;
			if (req.query.idLuogo) {
				idLuogo = req.query.idLuogo;
				log.info('/getLuogoById', channel, 'idLuogo: ', idLuogo);
			} else {
				log.info('', "Na " + city);
			}

			var o_id = new mongo.ObjectID(idLuogo);
			db.collection("luogo_evento")
				.findOne(
				{
					_id: o_id
				},
				function (err, docs) {
					if (err) {
						log.error('/getLuogoById', channel, 'err: ', err);
						res.end(null);
					}
					log.info('/getLuogoById', channel, 'docs: ', docs);
					var json = JSON.stringify({
						luogo: docs
					});
					res.end(json);
				});
		} catch (err) {
			log.error(err)
		}
	});


router
	.get(
	'/elimina',
	function (req, res) {
		try {
			log.info('/elimina', channel, 'idLuogo: ', idLuogo);


			var idLuogo;
			if (req.query.idLuogo) {
				idLuogo = req.query.idLuogo;
				log.info('/elimina', channel, 'idLuogo: ', idLuogo);
			} else {
				log.info('', "Na " + city);
			}

			var o_id = new mongo.ObjectID(idLuogo);
			db.collection("luogo_evento")
				.remove(
				{
					_id: o_id
				},
				function (err, docs) {
					if (err) {
						log.error('/elimina', channel, 'err: ', err);
						res.end(null);
					}
					log.info('/elimina', channel, 'docs: ', docs);
					var json = JSON.stringify({
						luogo: docs
					});
					res.end(json);
				});
		} catch (err) {
			log.error(err)
		}
	});


router.get('/getListaForCity', function (req, res) {
	var city = "";
	if (req.query.citta) {
		// dobbiamo cercare du db
		city = req.query.citta;
		log.info('/getLuogoById', channel, 'city: ', city);
	} else {
		log.info('/getLuogoById', channel, 'city: ', 'non presente');
	}

	res.writeHead(200, {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*"
	});
	var lista = [];
	db.collection("luogo_evento").find({
		$or: [{
			"citta": city.toLowerCase()
		}, {
			"citta": city
		}]
	}, function (err, docs) {
		if (err) {
			log.error('/getLuogoById', channel, 'err: ', err);
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi: lista
				});

				//	res.setHeader("Access-Control-Allow-Origin", "*");

				res.end(json);
			}
		});

	});
});
router.get('/attivita', function (req, res) {
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	//var lista = [{ "nome": "cali", "img": "cali.png", "mostra": "Calystenics", "selezionato": false }, { "nome": "vita", "img": "vita.png", "mostra": "Percorsi vita", "selezionato": false }, { "nome": "pesi", "img": "pesi.png", "mostra": "Palestre outdoor", "selezionato": false }, { "nome": "anelli", "img": "anelli.png", "mostra": "Percorso ad ostacoli", "selezionato": false }, { "nome": "walk", "selezionato": false, "mostra": "Corsa" }, { "nome": "basketball", "selezionato": false, "mostra": "Basket" }, { "nome": "bicycle", "selezionato": false, "mostra": "Percorsi ciclabili" }];
	var lista = [{"nome":"struttura","img":"gabbia.png","mostra":"Macchinari","selezionato":false},{"nome":"pesi","img":"pesi.png","mostra":"Palestre outdoor","selezionato":false},{"nome":"anelli","img":"anelli.png","mostra":"Percorso ad ostacoli","selezionato":false},{"nome":"cali","img":"cali.png","mostra":"Calystenics","selezionato":false},{"nome":"walk","selezionato":false,"mostra":"Corsa"}];
	//[{'nome': 'cali', 'img': 'cali.png', 'selezionato': false}, {'nome': 'vita', 'img': 'vita.png', 'selezionato': false},{'nome': 'trek', 'img': 'trek.png', 'selezionato': false}, {'nome': 'pesi', 'img': 'pesi.png', 'selezionato': false}, {'nome': 'anelli', 'img': 'anelli.png', 'selezionato': false},{'nome': 'walk', 'selezionato': false}, {'nome': 'american-football', 'selezionato': false}, {'nome': 'basketball', 'selezionato': false}, {'nome': 'bicycle', 'selezionato': false}, {'nome':'body', 'selezionato': false}, {'nome': 'football', 'selezionato': false}, {'nome': 'tennisball', 'selezionato': false}, {'nome': 'water', 'selezionato': false}, {'nome': 'paw', 'selezionato': false}, {'nome': 'pizza', 'selezionato': false}, {'nome': 'restaurant', 'selezionato': false}, {'nome': 'cafe', 'selezionato': false}];

	var attivita = JSON.stringify({
		listaAttivita: lista
	});

	res.end(attivita);

});
router.all('/verify', function (req, res) {
	log.info('/verify', channel, '', '');
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var json = JSON.stringify({
		loggato: req.isAuthenticated()
	});

	res.end(json);
});

router.all('/login', function (req, res) {
	log.info('/login', channel, '', '');
	if (!req.isAuthenticated()) {
		res.render('login.html', {});
	} else {
		res.redirect('/users');
	}
});

router.all('/privacy', function (req, res) {
	res.render('privacy.html', {});
});


/* GET home page. */
router.all('/auth/twitter/login', passport.authenticate('twitter'));
router.all('/auth/instagram/login', passport.authenticate('instagram'));
router.all('/auth/linkedin/login', passport.authenticate('linkedin'));
router.all('/auth/facebook/login', passport.authenticate('facebook'));
router.get('/auth/google/login', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/plus.login',
		'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

router.get('/successoFacebook', passport.authenticate('facebook', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('/successoFacebook', channel, 'login facebook: ', req.isAuthenticated());
	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.get('/successoTwitter', passport.authenticate('twitter', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('/successoTwitter', channel, 'login successoTwitter: ', req.isAuthenticated());
	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});
router.get('/successoLinkedin', passport.authenticate('linkedin', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('/successoLinkedin', channel, 'login successoLinkedin: ', req.isAuthenticated());
	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});
router.get('/successoInstagram', passport.authenticate('instagram', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('/successoInstagram', channel, 'login successoInstagram: ', req.isAuthenticated());
	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.get('/successoGoogle', passport.authenticate('google', {
	failureRedirect: '/'
}), function (req, res) {
	log.info('/successoGoogle', channel, 'login successoGoogle: ', req.isAuthenticated());

	if (req.isAuthenticated()) {
		req.param.logged = true;
		req.param.utente = req.user;
	} else {
		req.param.logged = false;
	}
	res.redirect('/users');
});

router.all('/utente', function (req, res) {
	var logged = req.param.logged;
	var utente = req.param.utente;
	res.render('upload.html', {
		aut: logged,
		utente: utente
	});
});


router.get('/detail', function (req, res) {
	log.info('/detail', channel, '', '');

	var idLuogo;
	var fromDettaglio = false;
	log.info('/detail', channel, 'req.query.dettaglio: ', req.query.dettaglio);

	if (req.query.dettaglio) {
		fromDettaglio = true;
	}
	if (req.query.id_luogo) {
		log.info('/detail', channel, 'req.query.id_luogo: ', req.query.id_luogo);
	} else {
		log.info('', "id_luogo NON PRESENTE");
		res.redirect('/');

	}

	res.render('detail.html', {
		dettaglio: fromDettaglio,
		idLuogo: req.query.id_luogo
	});
});

function ensureAuthenticated(req, res, next) {
	log.info('', "Autenticato " + req.isAuthenticated());
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

router.get('/', function (req, res, next) {
	log.info('', "/home");
	var loggato = req.isAuthenticated();
	res.render('home.html', {
		title: 'Parents',
		loggato: loggato
	});
});

// http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.WADxsMkppXo

router.all('/cerca', function (req, res, next) {
	var city = "";
	var tipoLuogoEvento = "";
	log.info('', req.query.citta);
	if (req.body.citta) {
		// citta dobbiamo cercare du db
		city = req.body.citta;
		tipoLuogoEvento = req.body.tipoLuogoEvento;
	} else if (req.query.citta) {
		city = req.query.citta;
	} else {
		// passiamo un default
		city = "Roma";
		tipoLuogoEvento = 3;
	}
	log.info('', "/home");
	var loggato = req.isAuthenticated();
	res.render('index.html', {
		citta: city,
		loggato: loggato,
		tipoLuogoEvento: tipoLuogoEvento
	});
});

router.get('/getLuogoById', function (req, res) {

	try {
		log.info('', "/getLuogoById");

		var idLuogo;
		if (req.query.idLuogo) {
			idLuogo = req.query.idLuogo;
			log.info('', "getLuogoById >>>" + idLuogo + "<<<");
		} else {
			log.info('', "Na " + city);
		}

		var o_id = new mongo.ObjectID(idLuogo);
		log.info('', o_id);

		db.collection("luogo_evento").findOne({
			_id: o_id
		},
			function (err, docs) {
				if (err) {
					log.error('', "ERRORE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
					res.end(null);
					log.error('', "ERRORE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
				}
				log.info('', docs);
				log.info('', docs);
				var json = JSON.stringify({
					luogo: docs
				});
				res.end(json);
			});
	} catch (err) {
		log.error(err)
	}
});

router.get('/getListaForCity', function (req, res) {

	var city = "";
	if (req.query.citta) {
		// dobbiamo cercare du db
		city = req.query.citta;
		log.info('', "getListaForCity >>>" + city + "<<<");
	} else {
		log.info('', "Na " + city);
	}

	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];
	db.collection("luogo_evento").find({
		$or: [{
			"citta": city.toLowerCase()
		}, {
			"citta": city
		}]
	}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi: lista
				});

				res.end(json);
			}
		});

	});
});

router.get('/getOrganizzazioni', function (req, res) {
	console.log(req.query.citta);
	var city = "";
	if (req.query.citta) {
		// dobbiamo cercare du db
		city = req.query.citta;
		log.info('', "getOrganizzazioni >>>" + city + "<<<");
	} else {
		log.info('', "Na " + city);
	}

	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];
	db.collection("organizzazione").find({
		$or: [{
			"citta": city.toLowerCase()
		}, {
			"citta": city
		}]
	}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi: lista
				});

				res.end(json);
			}
		});

	});
});
router.get('/getRaccordo', function (req, res) {

	console.log(req.query.idOrganizzazione);

	var idOrganizzazione = "";
	if (req.query.idOrganizzazione) {
		// dobbiamo cercare du db
		idOrganizzazione = req.query.idOrganizzazione;
		log.info('', "idOrganizzazione >>>" + idOrganizzazione + "<<<");
	} else {
		log.info('', "Na " + idOrganizzazione);
	}
	var o_id = new mongo.ObjectID(idOrganizzazione);
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];
	db.collection("luogo_organizzazione").find({
		"organizzazione_id": o_id
	}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi: lista
				});

				res.end(json);
			}
		});

	});
});
router.get('/getOrganizzazione', function (req, res) {

	console.log(req.query.idOrganizzazione);

	var idOrganizzazione = "";
	if (req.query.idOrganizzazione) {
		// dobbiamo cercare du db
		idOrganizzazione = req.query.idOrganizzazione;
		log.info('', "idOrganizzazione >>>" + idOrganizzazione + "<<<");
	} else {
		log.info('', "Na " + idOrganizzazione);
	}
	var o_id = new mongo.ObjectID(idOrganizzazione);
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];


	db.collection("organizzazione").findOne({
		_id: o_id
	}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}

		var json = JSON.stringify({
			organizzazione: docs
		});

		res.end(json);
	});
});
router.get('/getRaccordoByLuogo', function (req, res) {

	console.log(req.query.idLuogo);

	var idLuogo = "";
	if (req.query.idLuogo) {
		// dobbiamo cercare du db
		idLuogo = req.query.idLuogo;
		log.info('', "idLuogo >>>" + idLuogo + "<<<");
	} else {
		log.info('', "Na " + idLuogo);
	}
	var o_id = new mongo.ObjectID(idLuogo);
	res.writeHead(200, {
		"Content-Type": "application/json"
	});
	var lista = [];
	db.collection("luogo_organizzazione").find({
		"luogo_id": o_id
	}, function (err, docs) {
		if (err) {
			log.error('', "ERRORE ")
			res.end(null);
		}
		docs.each(function (err, doc) {
			if (doc) {
				lista.push(doc);
				log.info('', doc);
			} else {
				var json = JSON.stringify({
					listaLuoghi: lista
				});

				res.end(json);
			}
		});

	});
});
module.exports = router;
