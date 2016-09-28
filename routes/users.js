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
var testNameFile = "";
router.post('/upload', upload.single('file'), function(req, res) {
	try {
		console.log(req.body);
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
});


router.get('/leggi', function(req, res) {
	try {
		
		console.log("entro" + testNameFile);

		var listaImmagini;
		
		
		gfs.files.find({ filename: testNameFile}).toArray(function (err, files) {

		if(files.length===0){
			return res.status(400).send({
				message: 'File not found'
			});
		}

		//res.writeHead(200, {'Content-Type': files[0].contentType});
		res.writeHead(200, {'Content-Type': 'image/png'});
		console.log(files[0].contentType)
		var readstream = gfs.createReadStream({
			  filename: files[0].filename
		});

		readstream.on('data', function(chunk) {
			res.write(chunk);
		});

		readstream.on('end', function() {
			res.end();        
		});

		readstream.on('error', function (err) {
		  console.log('An error occurred!', err);
		  throw err;
		});
	  });
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
