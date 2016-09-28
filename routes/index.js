var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = require('url');

var url = 'mongodb://localhost:27017/test';
var db;

MongoClient.connect(url, function(err, data) {
	if (err)
		throw err;
	db = data;
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('home.html', {
		title : 'Express'
	});
});

router.get('/cerca', function(req, res) {
	res.render('index.html', {});
});

router.post('/cerca', function(req, res, next) {
	var city = "";
	if (req.body.citta) {
		// cela citta dobbiamo cercare du db
		city = req.body.citta;
	} else {
		// passiamo un default
		city = "Roma";
	}
	res.render('index.html', {
		citta : city
	});
});

router.get('/getListaForCity', function(req, res) {

	var city = "";
	if (req.query.citta) {
		// ce la citta dobbiamo cercare du db
		city = req.query.citta;
		console.log("getListaForCity >>> " +city);
	}else{
		console.log("Na " + city);
	}

	res.writeHead(200, {
		"Content-Type" : "application/json"
	});
	var lista = [];
	db.collection("luogo_evento").find({
		'citta': city.toLowerCase()
	}, function(err, docs) {
		
		if (err) {
			console.log("ERRORE ")
			res.end(null);
		}
		docs.each(function(err, doc) {
			if (doc) {
				lista.push(doc);
				console.log(doc.citta);
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