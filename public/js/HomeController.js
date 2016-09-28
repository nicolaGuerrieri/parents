(function() {
	'use strict';
	angular
			.module("helpParents", [ 'pascalprecht.translate'])
			.directive('fileModel', ['$parse', function ($parse) {
				return {
					restrict:'A',
					link: function(scope, element, attrs){
						var model = $parse(attrs.fileModel);
						var modelSetter = model.assign;
						
						element.bind('change', function(){
							scope.$apply(function(){
								modelSetter(scope, element[0].files[0]);
							});
						});
					}
				}
			}]).directive('myEnter', function () {
			    return function (scope, element, attrs) {
			        element.bind("keydown keypress", function (event) {
			            if(event.which === 13) {
			                scope.$apply(function (){
			                    scope.$eval(attrs.myEnter);
			                });
			
			                event.preventDefault();
			            }
			        });
			    };
			}).directive('valida', function() {
	    	  return {
	    	    require: 'ngModel',
	    	    link: function(scope, element, attr, mCtrl) {
	    	      function myValidation(value) {
	    	        if (value.indexOf("e") > -1) {
	    	          mCtrl.$setValidity('charE', true);
	    	        } else {
	    	          mCtrl.$setValidity('charE', false);
	    	        }
	    	        return value;
	    	      }
	    	      mCtrl.$parsers.push(myValidation);
	    	    }
	    	  };
			}).service('multipartForm', ['$http', function($http) {
				this.post = function(uploadUrl, data){
					var formData = new FormData();
					console.log(data);
					for(var key in data){
						console.log(key);
						formData.append(key, data[key]);
					}
//					$http.post(uploadUrl, formData, {
//						transformRequest: angular.indentity,
//						headers: {'Content-Type': undefined}
//					});
				}

			}]).config(function($translateProvider) {
				$translateProvider.translations('it', {
					cerca : 'Cerca',
					place : 'Città',
					tutti : "Tutti",
					fissi : "Fissi",
					nome : "Nome",
					descizione : "Descizione",
					temporanei : "Temporanei",
					inserisci: "Inserisci nuovo luogo d'interesse",
					orario: "Orario",
					ristoro: "Punto ristoro es. bar, pizzeria",
					attrezzature: "Attrezzature  es. giochi, scivoli",
					dal: "dal",
					al: "al",
					fisso: "Fisso",
					salva: "Salva"

				}).translations('en', {
					cerca : 'Search',
					place : 'Place',
					tutti : "All",
					fissi : "Stationary",
					nome : "Name",
					descizione : "Description",
					temporanei : "Temporary",
					inserisci: "Insert new point of interest",
					orario: "Time",
					ristoro:"Snack areas",
					attrezzature:"Equipments",
					dal:"from",
					al:"to",
					fisso: "Stable",
					salva:"Save"
				});
				$translateProvider.preferredLanguage('it');
				$translateProvider.useSanitizeValueStrategy('escape');

			}).controller(
					'genericCtrl', ['$scope', '$window', '$translate', 'multipartForm', 'cercami',
					function($scope, $window, $translate, multipartForm, cercami) {
						$scope.result = {};
						$scope.changeLanguage = function(langKey) {
							$translate.use(langKey);
							$scope.lingua = langKey;
						};
						$scope.getLuogoMap=  function(address) {
							
							if(address){
								$scope.result.cercaPostoNew  = address;
							}else{
								$scope.result.cercaPostoNew  = $('#autocomplete').val();
							}
							$scope.result.cercaPostoNew  = $('#autocomplete').val();

							//$scope.result.cercaPostoNew = address;
							cercami.cerca($scope, $window, $scope.result.cercaPostoNew, false);
						};
						
						$scope.lingua = $translate.use();
					}]).factory('cercami', function() {
						 var factory = {};
						factory.cerca = function($scope, $window, address, nuovo) {

							if (address == null) {
								address = $window.cittaMia;

							}
							$scope.cercaPosto = address;
							var stampa = "";
							var cercaComune = false;
							var locations = [];

							// pulisco oggetto a ogni ricerca
							localitaFind = {}
							$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='
											+ address
											+ '&key=AIzaSyATlH8FPWYGZEORYiLPoOSvtgrOzF8-690',
									function(data) {
										if (data.status == 'OK') {
											$('#datiResult').html("");
											$.each(data.results, function(i, v) {
													var markerIs = [
															v.formatted_address,
															v.geometry.location.lat,
															v.geometry.location.lng ];

													locations.push(markerIs);

													console.log(locations.length);
													var divResult = $('<div class=\"col-lg-12\"></div> ');
													$('#datiResult').append(divResult);
													var stampa = "";
													$.each(v.address_components, function(i,g) {
													if (g.types[0] == 'point_of_interest') {
														stampa += g.long_name
																+ " ";
													}
													if (g.types[0] == 'route') {
														stampa += " Via: "
																+ g.long_name
																+ " ";
														localitaFind.via = g.long_name;
														;
													}
													if (g.types[0] == 'locality') {
														stampa += "Localita "
																+ g.long_name;
														localitaFind.localita = g.long_name;
													}
													if (g.types[0] == 'administrative_area_level_3') {
														stampa += " Comune: "
																+ g.long_name
																+ " ";
														var dd = g.long_name;
													}
													if (g.types[0] == 'administrative_area_level_2') {
														stampa += " Provincia: "
																+ g.long_name
																+ " ";
														localitaFind.provincia = g.long_name;
													}
													if (g.types[0] == 'administrative_area_level_1') {
														stampa += " Regione: "
																+ g.long_name
																+ " ";
														localitaFind.regione = g.long_name;
													}
													if (g.types[0] == 'country') {
														stampa += " Nazione: "
																+ g.long_name
																+ " ";
														localitaFind.nazione = g.long_name;
													}
													if (g.types[0] == 'postal_code') {
														stampa += " CAP: "
																+ g.long_name
																+ " ";
														localitaFind.cap = g.long_name;
													}

												});
												stampa += "\n latitudine: "
														+ v.geometry.location.lat
														+ " longitudine: "
														+ v.geometry.location.lng;

												localitaFind.longi = v.geometry.location.lng;
												localitaFind.lat = v.geometry.location.lat;
												divResult.text(stampa);
												console.log(localitaFind);

											});
											var myOptions = {
												zoom : 12,
												center : new google.maps.LatLng(
														locations[0][1],
														locations[0][2]),
												mapTypeId : google.maps.MapTypeId.ROADMAP
											};
											var map = new google.maps.Map(document.getElementById("map_container"),myOptions);
											var marker = [];
											if(nuovo){
												$scope.luogo.luogoCercato= localitaFind;
											}else{
												$scope.result.luogoCercato = localitaFind;
											
												$scope.result.luogoCercato.listaLuoghi = [];
	
												
												var i;
												$.getJSON('/getListaForCity?citta='+ $scope.result.luogoCercato.localita, function(data) {
													$scope.result.listaLuoghi = data.listaLuoghi;
													$scope.$apply()
													if ($scope.result.luogoCercato.listaLuoghi) {
														console.log("size " + $scope.result.listaLuoghi.length);
														for (i = 0; i < $scope.result.listaLuoghi.length; i++) {
															var position = {
																lat : $scope.result.listaLuoghi[i].latitudine,
																lng : $scope.result.listaLuoghi[i].longitudine
															};
															marker.push(new google.maps.Marker(
															{
																position : position,
																map : map,
																animation : google.maps.Animation.DROP,
																title : $scope.result.listaLuoghi[i].nome
															}));
														}
													}
												});
											}
											for (i = 0; i < locations.length; i++) {
												marker.push(new google.maps.Marker(
													{
														position : new google.maps.LatLng(
																locations[i][1],
																locations[i][2]),
														map : map,
														animation : google.maps.Animation.DROP,
														title : locations[i][0]
													}));
											}
										} else {
											this.getLuogoMap("Roma");
										}
										// 66FFB2 colore verdino
									});
						}
						return factory;
					}).controller( 'luogoCtrl', ['$scope', '$window', '$translate', 'multipartForm', 'cercami', function($scope, $window,  $translate, multipartForm, cercami) {
						$scope.luogo = {};
						$scope.changeLanguage = function(langKey) {
							$translate.use(langKey);
							$scope.lingua = langKey;
						};
						$scope.salva = function() {
							var uploadUrl = "/users/upload";
							multipartForm.post(uploadUrl, $scope.luogo)
						};
						$scope.cercaLuogo = function(address) {
							if(address){
								$scope.luogo.cercaPostoNew  = address;
							}else{
								$scope.luogo.cercaPostoNew  = $('#autocomplete').val();
							}
							cercami.cerca($scope, $window, $scope.luogo.cercaPostoNew, true);
						};
						$scope.lingua = $translate.use();
					}]);

})();
