var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require('multer')
var passport = require('passport');
var Grid = require('gridfs-stream');
var passport = require('passport');


var upload = multer({
	dest : 'uploads/'
})
var Schema = mongoose.Schema;
mongoose.connect('mongodb://127.0.0.1/test');
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;

// router.all('/', passport.authenticate('facebook', {
// failureRedirect : '/'
// }), function(req, res) {
// var logged = req.param.logged;
// var utente = req.param.utente;
// res.render('upload.html', {
// aut : logged,
// utente : utente
// });
// });
router.all('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});


router.all('/', function(req, res) {
	console.log("/ " + req.isAuthenticated());
	if (!req.isAuthenticated()) {
		res.redirect('/');
	}else{
		res.render('upload.html', {});
	}
});

	
router.all('/loggated', function(req, res, next) {
	var logged = false;
	if (req.isAuthenticated()) {
		logged = true;
	}
	var json = JSON.stringify({
		loggato : logged
	});
	res.end(json);
});


var id;

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var gfs = Grid(conn.db);
var testNameFile = "";

/*******************************************************************************
 * console.log(nuovoEvento.cercaPostoNew); console.log(nuovoEvento.localita);
 * console.log(nuovoEvento.provincia); console.log(nuovoEvento.regione);
 * console.log(nuovoEvento.nazione); console.log(nuovoEvento.longi);
 * console.log(nuovoEvento.lat); console.log(nuovoEvento.nome);
 * console.log(nuovoEvento.descrizione); console.log(nuovoEvento.orari);
 * console.log(nuovoEvento.dal); console.log(nuovoEvento.al);
 * console.log(nuovoEvento.ristoro); console.log(nuovoEvento.attrezzatura);
 ******************************************************************************/

router.post('/upload', upload.single('file'), function(req, res) {
	console.log("/upload");

	try {

		
		var fileImmagine = req.file;
		var nomeImmagine;
		var nuovoEvento = req.body;
		var momentaneo = true;
		var sempreAperto = true;

//		conn.db.collection('luogo_evento').count(function(err, count) {
//			console.dir(count);
//		});
		if (nuovoEvento.fisso == 'true') {
			momentaneo = false;
		}
		if (nuovoEvento.aperto == 'true') {
			sempreAperto = false;
		}
		if (fileImmagine) {
			nomeImmagine = fileImmagine.originalname;
		}
		if(nuovoEvento.localita == undefined){
			console.log("problema localita");
			return;
		}
		var luogoEvento = {
			"ricerca" : nuovoEvento.cercaPostoNew,
			"nazione" : nuovoEvento.nazione,
			"provincia" : nuovoEvento.provincia,
			"citta" : nuovoEvento.localita.toLowerCase(),
			"via" : nuovoEvento.localita,
			"cap" : nuovoEvento.localita,
			"orario" : nuovoEvento.orari,
			"nome" : nuovoEvento.nome,
			"descrizione" : nuovoEvento.descrizione,
			"punto_risotro" : nuovoEvento.ristoro,
			"attrezzature" : nuovoEvento.descrizione,
			"longitudine" : nuovoEvento.longi,
			"latitudine" : nuovoEvento.lat,
			"momentaneo" : momentaneo,
			"sempreAperto" : sempreAperto,
			"valido_da" : nuovoEvento.dal,
			"valido_a" : nuovoEvento.al,
			"utente" : req.user,
			"foto" : nomeImmagine
		}
		console.log(luogoEvento);
		conn.db.collection('luogo_evento').insertOne(luogoEvento, function(err, result) {
			if(err){
				console.log("err " + err);
				res.redirect("/");
			}
//			var ogget =  luogoEvento.get( "_id" );
			console.log("result >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			console.log(luogoEvento._id);
		});
		if(req.file){
			console.log("presente immagine");

			var dirname = require('path').dirname(__dirname);
			var filename = "";
			filename = req.file.originalname;
		
			var path = req.file.path;
			var type = req.file.mimetype;
	
			var read_stream = fs.createReadStream(dirname + '/' + path);
	
			var writestream = gfs.createWriteStream({
				filename : filename
			});
			testNameFile = filename;
			read_stream.pipe(writestream);
			writestream.on('close', function(file) {
				id = file._id;
				console.log(file._id + 'Written To DB');
			});
		}
		 res.end(""+luogoEvento._id);

	} catch (err) {
		console.log("errore >>> " + err);
		throw err;
	}
});

router.get('/success', function(req, res) {
	var idLuogo;
	console.log(req.isAuthenticated());
	if(!req.isAuthenticated()){
		res.redirect("/");
	}
	if (req.query.id_luogo) {
		console.log("id_luogo >> " + req.query.id_luogo);
	}
	res.render('detail.html', {
		idLuogo: req.query.id_luogo
	});
});


router.get('/leggi/:nome', function(req, res) {
	console.log("/leggi/:nome");
	try {

		var nomeFile = req.params.nome;
		console.log("entro" + nomeFile);
		var listaImmagini;

		gfs.files.find({
			filename : nomeFile
		}).toArray(function(err, files) {

			if (files.length === 0) {
				return res.status(400).send({
					message : 'File not found'
				});
			}

			// res.writeHead(200, {'Content-Type': files[0].contentType});
			res.writeHead(200, {
				'Content-Type' : 'image/png'
			});
			// console.log(files[0].contentType)
			var readstream = gfs.createReadStream({
				filename : files[0].filename
			});

			readstream.on('data', function(chunk) {
				res.write(chunk);
			});

			readstream.on('end', function() {
				res.end();
			});

			readstream.on('error', function(err) {
				console.log('An error occurred!', err);
				throw err;
			});
		});
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
