var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require('multer')
var upload = multer({
	dest : 'uploads/'
})
var Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1/test');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

router.all('/', function(req, res) {
	res.render('upload.html', {});
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
	try {

		var fileImmagine = req.file;

		conn.db.collection('luogo_evento').count(function(err, count) {
			console.dir(count);
		});

		var nuovoEvento = req.body;
		console.log(nuovoEvento);

		var momentaneo = true;
		if (nuovoEvento.fisso == 'true') {
			momentaneo = false;
		}
		var nomeImmagine;
		if (fileImmagine) {
			nomeImmagine = fileImmagine.originalname;
		}

		conn.db.collection('luogo_evento').insertOne({
			"nazione" : nuovoEvento.nazione,
			"provincia" : nuovoEvento.provincia,
			"citta" : nuovoEvento.localita.toLowerCase(),
			"via" : nuovoEvento.localita,
			"cap" : nuovoEvento.localita,
			"orario" : nuovoEvento.orari,
			"nome" : nuovoEvento.nome,
			"descrizione" : nuovoEvento.descrizione,
			"punto_risotro" : nuovoEvento.risotro,
			"attrezzature" : nuovoEvento.attrezzatura,
			"longitudine" : nuovoEvento.longi,
			"latitudine" : nuovoEvento.lat,
			"momentaneo" : momentaneo,
			"valido_da" : nuovoEvento.dal,
			"valido_a" : nuovoEvento.al,
			"foto" : nomeImmagine
		}, function(err, result) {
			console.log(err);
			console.log(result);

		});

		var dirname = require('path').dirname(__dirname);
		var filename = req.file.originalname;
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
		res.end();

	} catch (err) {
		console.log(err);
	}

	res.end();
});

router.get('/leggi/:nome', function(req, res) {
	try {

		var nomeFile= req.params.nome;
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
//			console.log(files[0].contentType)
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
