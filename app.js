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


var nomeFileConf = "conf";

var app = express();
app.engine('html', require('ejs').renderFile);

if(app.get('env') == 'development'){
	nomeFileConf = nomeFileConf +  "-test";
}
var config = require('./'+nomeFileConf+'.js');

app.use(bodyParser.json());

app.use(session({
	secret : 'ssshhhhh'
}));
var multer = require('multer');
// var upload = multer({
// dest : 'uploads/'
// });
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

passport.use(new TwitterStrategy({
	consumerKey : config.twitter.consumerKey,
	consumerSecret : config.twitter.consumerSecret,
	callbackURL : config.twitter.callbackURL,
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
// http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.WHeeqnopVXo
passport.use(new InstagramStrategy({
	clientID : config.instagram.clientID,
	clientSecret : config.instagram.clientSecret,
	callbackURL : config.instagram.callbackURL,
	passReqToCallback : true
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
console.log(config.twitter.consumerKey);
passport.use(new GoogleStrategy({
	clientID : config.google.clientID,
	clientSecret : config.google.clientSecret,
	callbackURL : config.google.callbackURL,
	passReqToCallback : true
}, function(request, accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});
}));
passport.use(new FacebookStrategy({
	clientID : config.facebook.clientID,
	clientSecret : config.facebook.clientSecret,
	callbackURL : config.facebook.callbackURL,
	profileFields : [ 'id', 'email', 'gender', 'link', 'locale', 'name',
			'timezone', 'updated_time', 'verified' ]
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function() {
		return done(null, profile);
	});

}));
passport.use(new LinkedInStrategy({
	consumerKey : config.linkedin.clientID,
	consumerSecret : config.linkedin.clientSecret,
	callbackURL : config.linkedin.callbackURL,
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


//https://codepen.io/ionic/pen/uzngt
//angular.module('ionic.example', ['ionic'])
//
//.controller('MapCtrl', function($scope, $ionicLoading, $compile) {
//  function initialize() {
//    var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
//    
//    var mapOptions = {
//      center: myLatlng,
//      zoom: 16,
//      mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
//    var map = new google.maps.Map(document.getElementById("map"),
//        mapOptions);
//    
//    //Marker + infowindow + angularjs compiled ng-click
//    var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
//    var compiled = $compile(contentString)($scope);
//
//    var infowindow = new google.maps.InfoWindow({
//      content: compiled[0]
//    });
//
//    var marker = new google.maps.Marker({
//      position: myLatlng,
//      map: map,
//      title: 'Uluru (Ayers Rock)'
//    });
//
//    google.maps.event.addListener(marker, 'click', function() {
//      infowindow.open(map,marker);
//    });
//
//    $scope.map = map;
//  }
//  google.maps.event.addDomListener(window, 'load', initialize);
//  
//  $scope.centerOnMe = function() {
//    if(!$scope.map) {
//      return;
//    }
//
//    $scope.loading = $ionicLoading.show({
//      content: 'Getting current location...',
//      showBackdrop: false
//    });
//
//    navigator.geolocation.getCurrentPosition(function(pos) {
//      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
//      $scope.loading.hide();
//    }, function(error) {
//      alert('Unable to get location: ' + error.message);
//    });
//  };
//  
//  $scope.clickTest = function() {
//    alert('Example of infowindow with ng-click')
//  };
//  
//});




/*global angular*/
//
//angular.module('ionicApp', ['ionic', 'ionic-material'])
//
//.config(function($stateProvider, $urlRouterProvider) {
//
//  $stateProvider
//    .state('eventmenu', {
//      url: '/event',
//      abstract: true,
//      templateUrl: 'templates/event-menu.html'
//    })
//    .state('eventmenu.home', {
//      url: '/home',
//      views: {
//        'menuContent' :{
//          templateUrl: 'templates/home.html'
//        }
//      }
//    })
//    .state('eventmenu.checkin', {
//      url: '/check-in',
//      views: {
//        'menuContent' :{
//          templateUrl: 'templates/check-in.html',
//          controller: 'CheckinCtrl'
//        }
//      }
//    })
//    .state('eventmenu.attendees', {
//      url: '/attendees',
//      views: {
//        'menuContent' :{
//          templateUrl: 'templates/attendees.html',
//          controller: 'AttendeesCtrl'
//        }
//      }
//    });
//
//  $urlRouterProvider.otherwise('/event/home');
//})
//
//.controller('MainCtrl', function($scope, ionicMaterialInk, ionicMaterialMotion, $ionicSideMenuDelegate, $timeout) {
//
//  $timeout(function(){
//    ionicMaterialInk.displayEffect();
//      ionicMaterialMotion.ripple();
//  },0);
//
//
//  $scope.attendees = [
//    { firstname: 'Nicolas', lastname: 'Cage' },
//    { firstname: 'Jean-Claude', lastname: 'Van Damme' },
//    { firstname: 'Keanu', lastname: 'Reeves' },
//    { firstname: 'Steven', lastname: 'Seagal' }
//  ];
//
//  $scope.toggleLeft = function() {
//    $ionicSideMenuDelegate.toggleLeft();
//  };
//})
//
//.controller('CheckinCtrl', function($scope, ionicMaterialInk, ionicMaterialMotion, $timeout) {
//
//  $timeout(function(){
//    ionicMaterialInk.displayEffect();
//      ionicMaterialMotion.ripple();
//  },0);
//
//
//  $scope.showForm = true;
//
//  $scope.shirtSizes = [
//    { text: 'Large', value: 'L' },
//    { text: 'Medium', value: 'M' },
//    { text: 'Small', value: 'S' }
//  ];
//
//  $scope.attendee = {};
//  $scope.submit = function() {
//    if(!$scope.attendee.firstname) {
//      /*jshint ignore:start*/
//      alert('Info required');
//      /*jshint ignore:end*/
//      return;
//    }
//    $scope.showForm = false;
//    $scope.attendees.push($scope.attendee);
//  };
//
//})
//
//.controller('AttendeesCtrl', function($scope, ionicMaterialInk, ionicMaterialMotion, $timeout) {
//
//  $timeout(function(){
//    ionicMaterialInk.displayEffect();
//      ionicMaterialMotion.ripple();
//  },0);
//
//
//  $scope.activity = [];
//  $scope.arrivedChange = function(attendee) {
//    var msg = attendee.firstname + ' ' + attendee.lastname;
//    msg += (!attendee.arrived ? ' has arrived, ' : ' just left, ');
//    msg += new Date().getMilliseconds();
//    $scope.activity.push(msg);
//    if($scope.activity.length > 3) {
//      $scope.activity.splice(0, 1);
//    }
//  };
//
//});
///*endglobal angular*/
//


