(function() {

	'use strict';

	angular.module('helpParents', [])

	angular.module('cercatore').service('cercami', cercami);

	cercami.$inject = [ '$scope', '$window'];

	function cercami($scope, $window) {

		var service = {
			cerca : cerca
		};

		return service;

		function cerca(address) {
			if (address == null) {
				address = $window.cittaMia;

			}
			$scope.cercaPosto = address;
			var stampa = "";
			var cercaComune = false;
			var locations = [];

			// pulisco oggetto a ogni ricerca
			localitaFind = {}
			$
					.getJSON(
							'https://maps.googleapis.com/maps/api/geocode/json?address='
									+ address
									+ '&key=AIzaSyATlH8FPWYGZEORYiLPoOSvtgrOzF8-690',
							function(data) {
								if (data.status == 'OK') {
									$('#datiResult').html("");
									$
											.each(
													data.results,
													function(i, v) {
														var markerIs = [
																v.formatted_address,
																v.geometry.location.lat,
																v.geometry.location.lng ];

														locations
																.push(markerIs);

														console
																.log(locations.length);
														var divResult = $('<div class=\"col-lg-12\"></div> ');
														$('#datiResult')
																.append(
																		divResult);
														var stampa = "";
														$
																.each(
																		v.address_components,
																		function(
																				i,
																				g) {
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

													});
									var myOptions = {
										zoom : 12,
										center : new google.maps.LatLng(
												locations[0][1],
												locations[0][2]),
										mapTypeId : google.maps.MapTypeId.ROADMAP
									};
									var map = new google.maps.Map(document
											.getElementById("map_container"),
											myOptions);

									$scope.result = localitaFind;
									$scope.result.listaLuoghi = [];

									var marker = [];
									var i;
									// cerca.getList().then(function(arrItems){
									$
											.getJSON(
													'/getListaForCity?citta='
															+ $scope.result.localita,
													function(data) {
														$scope.result.listaLuoghi = data.listaLuoghi;
														$scope.$apply()
														if ($scope.result.listaLuoghi) {
															console
																	.log("size "
																			+ $scope.result.listaLuoghi.length);
															for (i = 0; i < $scope.result.listaLuoghi.length; i++) {
																var position = {
																	lat : $scope.result.listaLuoghi[i].latitudine,
																	lng : $scope.result.listaLuoghi[i].longitudine
																};
																console
																		.log(position);
																marker
																		.push(new google.maps.Marker(
																				{
																					position : position,
																					map : map,
																					animation : google.maps.Animation.DROP,
																					title : $scope.result.listaLuoghi[i].nome
																				}));
															}
														}
													});
									for (i = 0; i < locations.length; i++) {
										marker
												.push(new google.maps.Marker(
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
	}
})();
