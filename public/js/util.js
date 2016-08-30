function geolocate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = {
				lat : position.coords.latitude,
				lng : position.coords.longitude
			};
			var circle = new google.maps.Circle({
				center : geolocation,
				radius : position.coords.accuracy
			});
			autocomplete.setBounds(circle.getBounds());
		});
	}
}


function localitaFinde(cap, localita, regione , provincia, via,  nazione, longi, lat) {
	this.cap = cap,
	this.localita = localita,
	this.regione = regione,
	this.provincia= provincia,
	this.via = via,
	this.nazione = nazione,
	this.longitudine = longi,
	this.lat = lat
};

var localitaFind = {};

function stampaOggetto(localitaFind){
	var res =
		localitaFind.cap + " \n " +
		localitaFind.via + " \n "  +
		localitaFind.localita + " \n "  +
		localitaFind.provincia + " \n "  +
		localitaFind.regione + " \n "  +
		localitaFind.nazione + " \n "  +
		localitaFind.longi + " \n "  +
		localitaFind.lat + " \n " ;
	
	console.log(res);
}


function fillInAddress() {
	// Get the place details from the autocomplete object.
	var place = autocomplete.getPlace();
	console.log(place);
}
function ricercaSuServer(localita){
	
}

function getLuogo(address) {
	var stampa = "";
	var cercaComune = false;
	var locations = [];
	
	//pulisco oggetto a ogni ricerca 
	localitaFind = {}
	$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='
			+ address + '&key=AIzaSyATlH8FPWYGZEORYiLPoOSvtgrOzF8-690',
			function(data) {
				if (data.status == 'OK') {
					$('#datiResult').html("");
					$.each(data.results, function(i, v) {

						var markerIs = [ v.formatted_address,
								v.geometry.location.lat,
								v.geometry.location.lng ];

						locations.push(markerIs);

						console.log(locations.length);
						var divResult = $('<div class=\"col-lg-12\"></div> ');
						$('#datiResult').append(divResult);
						var stampa = "";
						$.each(v.address_components, function(i, g) {
							if (g.types[0] == 'point_of_interest') {
								stampa += g.long_name + " ";								
							}
							if (g.types[0] == 'route') {
								stampa += " Via: " + g.long_name + " ";
								localitaFind.via = g.long_name;;
							}
							if (g.types[0] == 'locality') {
								stampa += "Localita " + g.long_name;
								localitaFind.localita = g.long_name;
							}
							if (g.types[0] == 'administrative_area_level_3') {
								stampa += " Comune: " + g.long_name + " ";
								var dd = g.long_name;
							}
							if (g.types[0] == 'administrative_area_level_2') {
								stampa += " Provincia: " + g.long_name + " ";
								localitaFind.provincia = g.long_name;	
							}
							if (g.types[0] == 'administrative_area_level_1') {
								stampa += " Regione: " + g.long_name + " ";
								localitaFind.regione = g.long_name;	
							}
							if (g.types[0] == 'country') {
								stampa += " Nazione: " + g.long_name + " ";
								localitaFind.nazione = g.long_name;	
							}
							if (g.types[0] == 'postal_code') {
								stampa += " CAP: " + g.long_name + " ";
								localitaFind.cap = g.long_name;	
							}

						});
						stampa += "\n latitudine: " + v.geometry.location.lat
								+ " longitudine: " + v.geometry.location.lng;
								
						localitaFind.longi = v.geometry.location.lng;
						localitaFind.lat = v.geometry.location.lat;
						divResult.text(stampa);
						
					});

					var myOptions = {
						zoom : 14,
						center : new google.maps.LatLng(locations[0][1],
								locations[0][2]),
						mapTypeId : google.maps.MapTypeId.ROADMAP
					};
					map = new google.maps.Map(document
							.getElementById("map_container"), myOptions);

					var marker, i;
					for (i = 0; i < locations.length; i++) {
						//console.log(locations[i][0]);
						marker = new google.maps.Marker({
							position : new google.maps.LatLng(locations[i][1],
									locations[i][2]),
							map : map,
							title : locations[i][0]
						});
					}
				} else {
					getLuogo("Roma");
				}
				// 66FFB2 colore verdino
				
			
			});
}