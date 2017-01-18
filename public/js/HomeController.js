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
			}).service('multipartForm', ['$http','$window', function($http, $window) {
				this.post = function(uploadUrl, data){
					var formData = new FormData();
					
					for(var key in data){
						if(key == "luogoCercato"){
							for(var key in data.luogoCercato){
								//non usando application/json per l'immagine
								//snocciolo l'oggetto
								formData.append(key, data.luogoCercato[key]);
							}
						}
						if(key != "lat"){
							formData.append(key, data[key]);
						}
						
						console.log(key);
						console.log(data[key]);
					}
					$http.post(uploadUrl, formData, {
						transformRequest: angular.indentity,
						headers: {'Content-Type': undefined}
					}).success(function (data) {
						$window.location.href = '/users/success?id_luogo='+ data;
					});
				}

			}]).config(function($translateProvider) {
				$translateProvider.translations('it', {
					cerca : 'Cerca',
					place : 'Città',
					tutti : "Tutti",
					fissi : "Fissi",
					nome : "Nome",
					descizione : "Descizione es: sbarre, panche, gradoni... ecc.",
					temporanei : "Temporanei",
					inserisci: "Inserisci nuovo luogo d'interesse",
					orario: "Orario",
					ristoro: "Punto ristoro es. bar, pizzeria, nessuno",
					attrezzature: "Attrezzature  es. giochi, scivoli, nessuna",
					dal: "dal",
					al: "al",
					fisso: "Fisso",
					errorNome: "Inserire nome",
					errorDesc: "Inserire descrizione",
					errorCitta: "Inserire citta'",
					errorOrario: "Inserire orario",
					errorDal: "Inserire data da",
					errorAl: "Inserire data a",
					errorAttrezzatura: "Inserire attrezzature",
					errorRistoro: "Inserire punto ristoro",
					salva: "Salva",
					aperto: "Sempre aperto",
					inserisci: "Inserisci i dati del luogo d'interesse",
					allenamento: "Vorrei allenarmi",
					dove: "So dove allenarmi",
					back: "Indietro",
					search: "Cerca",
					grazie: "Grazie per il tuo contributo, altri utenti lo troveranno utilissimo"
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
					errorNome: "Insert name",
					errorCitta: "Insert city'",
					errorDesc: "Insert description",
					errorOrario: "Insert time",
					errorDal: "Insert date from",
					errorAl: "Insert date at",
					errorAttrezzatura: "Insert equipments",
					errorRistoro: "Insert snack areas",
					salva:"Save",
					aperto: "Ever open",
					back: "Back",
					allenamento: "I would train",
					dove: "I know where to train",
					search: "Search",
					inserisci: "Insert the datas for the point of interest",
					grazie: "Thank you for your contribution, others will find it useful users"

				});
				$translateProvider.preferredLanguage('it');
				$translateProvider.useSanitizeValueStrategy('escape');

			}).controller(
					'genericCtrl', ['$scope', '$window', '$translate', '$http', 'multipartForm', 'cercami',
					function($scope, $window, $translate, $http, multipartForm, cercami) {
						$scope.result = {};
						$scope.loggated = {};
						$scope.paginaInserimento = false;
						$scope.dettaglio = function(idLuogoEvento) {
							if(!idLuogoEvento){
								return;
							}
							$window.location.href = '/detail?id_luogo='+ idLuogoEvento + '&dettaglio=true';
						};
						$scope.verify =  function(address) {
							$.getJSON('/verify', function(data) {
								$scope.loggated.logged= data;
							});
						};
						$scope.loginHome = function() {
							$window.location.href = "/login";
						};
						$scope.changeLanguage = function(langKey) {
							$translate.use(langKey);
							$scope.lingua = langKey;
						};
						$scope.logout=  function() {
							alert("passa")
							$scope.loggated.logged= false;
							$window.location.href = "/users/logout";
						};
						$scope.getLuogoMap=  function(address) {
							$scope.verify();
							if(address){
								$scope.result.cercaPostoNew  = address;
							}else{
								$scope.result.cercaPostoNew  = $('#autocomplete').val();
							}
							
							function vai(){
								console.log("post chiamata");
							}
							cercami.cerca($scope, $window, $scope.result.cercaPostoNew, false, $scope.result.tipo, vai);
//							setTimeout(function(){
//								if(!$scope.result.luogoCercato.trovato){
//									$scope.result.cercaPostoNew = "Roma";
//									//cercami.cerca($scope, $window, $scope.result.cercaPostoNew, false, $scope.result.tipo);
//								}
//							}, 2000);
						};
						$scope.lingua = $translate.use();
					}]).factory('cercami', function() {
						console.log("HomeController.cercami");

						 var factory = {};
						factory.cerca = function($scope, $window, address, nuovo, tipo, callback) {
							var cerca= $scope.result.cercaPostoNew;
							$scope.result = {};
							$scope.result.cercaPostoNew = cerca;
							if (address == null) {
								address = $window.cittaMia;
							}
							$scope.cercaPosto = address;
							var stampa = "";
							var cercaComune = false;
							var locations = [];

//							callback();
							// pulisco oggetto a ogni ricerca
							localitaFind = {}
							$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyATlH8FPWYGZEORYiLPoOSvtgrOzF8-690',
									function(data) {
										if (data.status == 'OK') {
											$scope.result.trovato = true;
											$('#datiResult').html("");
											$.each(data.results, function(i, v) {
													var markerIs = [
															v.formatted_address,
															v.geometry.location.lat,
															v.geometry.location.lng ];

													locations.push(markerIs);

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
	
												$scope.result.luogoCercato.trovato = true;
												
												var i;
												$.getJSON('/getListaForCity?citta='+ $scope.result.luogoCercato.localita, function(data) {
													$scope.result.luogoCercato.listaLuoghi = data.listaLuoghi;
													$scope.$apply(); 
													if ($scope.result.luogoCercato.listaLuoghi) {
														for (i = 0; i < $scope.result.luogoCercato.listaLuoghi.length; i++) {
															var latiParse = parseFloat($scope.result.luogoCercato.listaLuoghi[i].latitudine);
															var longitudineParse = parseFloat($scope.result.luogoCercato.listaLuoghi[i].longitudine);
															
															var position = {
																lat : latiParse,
																lng : longitudineParse
															};
															marker.push(new google.maps.Marker(
															{
																position : position,
																map : map,
																animation : google.maps.Animation.DROP,
																title : $scope.result.luogoCercato.listaLuoghi[i].nome
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
											$scope.result.trovato = false;
											$scope.$apply(); 
										}
										// 66FFB2 colore verdino
									}).success({
									});
						}
						return factory;
					}).controller( 'luogoCtrl', ['$scope', '$window', '$translate', 'multipartForm', 'cercami', function($scope, $window,  $translate, multipartForm, cercami) {
						console.log("Controller luogoCtrl istanziato: luogoCtrl");
						$scope.luogo = {};
						$scope.luogo.fisso = true;
						$scope.luogo.aperto = true;
						$scope.loggated = {};
						$scope.paginaInserimento = true;
						$scope.changeLanguage = function(langKey) {
							$translate.use(langKey);
							$scope.lingua = langKey;
						};
						$scope.salva = function() {
							console.log("salva");
							 if (!$scope.myForm.$valid  && false) {
								console.log("rotto");
							    $scope.submitted = true;
							    return;
							  }
							 
							 console.log($scope.luogo);
								var uploadUrl = "/users/upload";
								multipartForm.post(uploadUrl, $scope.luogo);
								$scope.luogo = {};
						};
						$scope.getLuogoById =  function(idLuogo) {
							if(!idLuogo){
								alert("id luogo non presente");
								return;
							}
							$.getJSON('/getLuogoById?idLuogo='+ idLuogo, function(data) {
								$scope.luogoInserito = data;
								$scope.$apply();
								cercami.cerca($scope, $window, $scope.luogoInserito.luogo.ricerca, true, null);
							});
						};
						$scope.cercaLuogo = function(address) {
							console.log("HomeController.cercalLuogo");
							if(address){
								$scope.luogo.cercaPostoNew  = address;
							}else{
								$scope.luogo.cercaPostoNew  = $('#autocomplete').val();
							}
							console.log($scope.luogo.cercaPostoNew);

							cercami.cerca($scope, $window, $scope.luogo.cercaPostoNew, true, null);
						};
						$scope.verificaLogin = function() {
							$.getJSON('/verify', function(data) {
								$scope.loggated.logged= data;
							});
						};
						$scope.inizia = function(address){
							$scope.cercaLuogo(address);
							$scope.verificaLogin();
						}
						$scope.goBack = function(page) {
							if(page){
								$window.location.href = page;
							}else{
								$window.location.href = '/cerca';
							}
						};
						$scope.lingua = $translate.use();
						
					}]);

})();
