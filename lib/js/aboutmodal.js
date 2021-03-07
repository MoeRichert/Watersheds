$(".scrollable").scrollable({circular: false}).autoscroll({interval:10000,autoplay: false });

$('.scroll-pane').jScrollPane({ autoReinitialise: true });
$('.events-wrapper').jScrollPane({ autoReinitialise: true });


//MAIN CAROUSEL	
$(function() {
	$('#carousel.carousel').each(function() {
		$(this).carousel({
			interval: 4000 //disables carousel sliding until user clicks
		});		
	});
});

//SWIPING FOR MAIN CAROUSEL
$("#carousel .carousel-inner").swipe( {
	//Generic swipe handler for all directions
	swipeLeft:function(event, direction, distance, duration, fingerCount) {
		$(this).parent().carousel('next'); 
	},
	swipeRight: function() {
		$(this).parent().carousel('prev'); 
	},
	//distance that triggers swipe
	threshold:50
});
  
//FEATURED EVENT CAROUSEL 
$(function() {
  $('#waterMap.carousel').each(function(){
    $(this).carousel({
      interval: false //disables carousel sliding until user clicks
    });
  });
});




$(document).ready(function() {
  var mymap;
    // Credits for map located on bottom right of map


// Basemap options located on top right of map
    var dark  = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributor'
    });
    
    // Initialize global variables for data layers
    var Park,
        Boundaries;

    //Layer options located in key
    var boundaryLayer = L.layerGroup(),
        parkLayer = L.layerGroup();

  function initializeMap() {
    //create map
    mymap = L.map('map', {
            center: [30.98, -91.9],
            zoom: 6,
            minZoom: 4,
            maxZoom: 14,
            layers:dark
        });

    //call getData
    getwData(mymap);
  };
    
    getwData(map){
        var state = $.getJSON("resources/spatialdata/ebr/LA.geojson"),
            county = $.getJSON("resources/spatialdata/modal/ebr.geojson"),
            blackwater = $.getJSON("resources/spatialdata/modal/blackwater.geojson"),
            h16 = $.getJSON("resources/spatialdata/modal/huc16.geojson"),
            h14 = $.getJSON("resources/spatialdata/modal/huc14.geojson"),
            h12 = $.getJSON("resources/spatialdata/modal/huc12.geojson"),
            h10 = $.getJSON("resources/spatialdata/LA/10.geojson"),
            h08 = = $.getJSON("resources/spatialdata/LA/8.geojson"),
            h06 = $.getJSON("resources/spatialdata/LA/6.geojson"),
            h04 = = $.getJSON("resources/spatialdata/LA/4.geojson"),
            h02 = $.getJSON("resources/spatialdata/H2.geojson");
        
            //call function responses
    $.when(state, county, blackwater, h16, h14, h12, h10, h08, h06, h04, h02).then(function (res1, res2, res3, res16, res12, res10, res08, res06, res04, res02) {
     //You have both responses at this point.
       
        // create layer and add to the layer group
        Boundaries = L.geoJson(res1, res2 {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(boundaryLayer);
        //States.on('click', function(e) { document.getElementById('stateSel').value = (e.layer.feature.properties.SID); });

        //default layer style
        function style(feature) {
            return {
                fillColor: 'blue',
                weight: 2,
                opacity: 1,
                color: 'white',  //Outline color
                fillOpacity: 0
            };
        };
        boundaryLayer.addTo(map);
        
        Park = L.geoJson(res3 {
            style: parkstyle,
            onEachFeature: onEachFeature
        }).addTo(parkLayer);
        //States.on('click', function(e) { document.getElementById('stateSel').value = (e.layer.feature.properties.SID); });

        //default layer style
        function parkstyle(feature) {
            var colorToUse = "",
                fillO = 1;
            
            if (feature.properties.Layer === "flow") colorToUse = "#FFCC00", fillO = 0;
            else if (feature.properties.Layer === "trails") colorToUse = "#FFFF99";
            else if (feature.properties.Layer === "forest") colorToUse = "#006633";
            else if (feature.properties.Layer === "youngforest") colorToUse = "#669933";
            else if (feature.properties.Layer === "grass") colorToUse = "#99CC66";
            else if (feature.properties.Layer === "water") colorToUse = "#66CCCC";
            else if (feature.properties.Layer === "waterback") colorToUse = "#669999";
            else if (feature.properties.Layer === "paved") colorToUse = "#999999";
            else if (feature.properties.Layer === "shelter") colorToUse = "#FFFFFF";
            else colorToUse = "#000000";
            
            return {
                fillColor: colorToUse,
                weight: 0,
                opacity: 0,
                color: 'black',  //Outline color
                fillOpacity: fillO
            };
        };
        parkLayer.addTo(map);
    }
    

  // Re-init map before show modal
  $('#myModal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    $("#location-map").css("width", "100%");
    $("#waterMap").css("width", "100%");
  });

  // Trigger map resize event after modal shown
  $('#myModal').on('shown.bs.modal', function() {
    //google.maps.event.trigger(map, "resize");
    //map.setCenter(myLatlng);
  });
});