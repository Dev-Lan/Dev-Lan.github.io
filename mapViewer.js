var mapDisplayed = false;
var currentlyDisplayed = '';
var mapId = "map-canvas";
var timeoutInMilliseconds = 15000;
var timer;
var locations;


function start() {
	var xmlhttp = new XMLHttpRequest();
	var url = "locations.txt";

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			locations = JSON.parse(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();

	// locations = 
	// 		[
	// 			{
	// 			"lat": "44.973463",
	// 			"long": "-93.230099"
	// 			},
	// 			{
	// 			"lat": "44.987704",
	// 			"long": "-93.229829"
	// 			},
	// 			{
	// 			"lat": "44.965485",
	// 			"long": "-93.204079"
	// 			},
	// 			{
	// 			"lat": "44.980299",
	// 			"long": "-93.234501"
	// 			},
	// 			{
	// 			"lat": "44.974162",
	// 			"long": "-93.226785"
	// 			},
	// 		]

}

function mapme() {
	if (!mapDisplayed) {
		displayMap()
		return;	
	} else {
		clearMap();
	}
	if (event.currentTarget != currentlyDisplayed) {
		displayMap();
	}
}

function displayMap() {
	var index = event.currentTarget.dataset.index;

	var latLongPos = new google.maps.LatLng(locations[index].lat,locations[index].long);
	var mapOptions = {
		center: latLongPos,
		zoom: 18
	};



	mapDisplayed = true;
	currentlyDisplayed = event.currentTarget;
	// create div
	var ddiv = document.createElement("div");
	ddiv.style.position="absolute"
	ddiv.style.width = "500px";
	ddiv.style.height = "500px";
	ddiv.style.left = "50%";
	ddiv.style.top = "50%";
	ddiv.style.margin = "-250px 0px 0px -250px";
	ddiv.setAttribute("id", mapId);
	ddiv.setAttribute("class", "mapViewer");
	document.body.appendChild(ddiv);
	// create map
	var map = new google.maps.Map(ddiv, mapOptions);
	// place marker
	var marker = new google.maps.Marker({
		position: latLongPos,
		map: map
	});
	// set timeout
	timer = window.setInterval("clearMap()", timeoutInMilliseconds);

}

function clearMap() {
	mapDisplayed = false;
	document.body.removeChild(document.getElementById(mapId));
	timer = window.clearInterval(timer);
}
window.addEventListener( "load", start, false );