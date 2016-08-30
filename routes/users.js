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

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

router.all('/', function(req, res) {
	res.render('upload.html', {});
});
var id;

var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var gfs = Grid(conn.db);

router.post('/upload', upload.single('immagine'), function(req, res) {
	try {

		console.log(req.file);

		var dirname = require('path').dirname(__dirname);
		var filename = req.file.originalname;
		var path = req.file.path;
		var type = req.file.mimetype;

		var read_stream = fs.createReadStream(dirname + '/' + path);

		var writestream = gfs.createWriteStream({
			filename : filename
		});
		read_stream.pipe(writestream);
		writestream.on('close', function(file) {
			id = file._id;
			console.log(file._id + 'Written To DB');
		});
		res.end();
	} catch (err) {
		console.log(err);
	}
});

router.get('/leggi', function(req, res) {
	try {
		console.log("entro");
		var pic_id = '57a0af85738141f018d1249d';
		console.log("entro" + pic_id);

		var listaImmagini;
		gfs.files.find({
			_id : pic_id
		}).toArray(function(err, files) {
			if (err) {
				res.json(err);
			}
			if (files) {
				for (i = 0; i < files.length; i++) {
					console.log("ia" + files[i]._id);
				}
				var mime = 'image/jpeg';
				res.set('Content-Type', mime);
				var read_stream = gfs.createReadStream({
					filename : pic_id
				});
				read_stream.pipe(res);
			} else {
				res.json('File Not Found');
			}
		});
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
