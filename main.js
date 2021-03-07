var map;

// Credits for map located on bottom right of map


// Basemap options located on top right of map
var grayscale   = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
}),
    terrain  = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
	maxZoom: 20,
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

//Legend div in bottom right of map
var legend = new (L.Control.extend({
     options: { position: 'bottomright' }
    }));

var legend2 = new (L.Control.extend({
     options: { position: 'bottomright' }
    }));

var HucButtonToggles = {
    showHuc02: 2,
    showHuc04: 4,
    showHuc06: 6,
    showHuc08: 8,
    showHuc10: 10,
    showHuc12: 12
};


// Initialize global variables for data layers
var Huc02,
    HucSort,
    States,
    stateSelection,
    Huc,
    Selection;

//Layer options located in key
var hucLayer = L.layerGroup(),
    txLayers = L.layerGroup(),
    selectHucLayer = L.layerGroup(),
    statesLayer = L.layerGroup(),
    extrasLayer = L.layerGroup();



//createMap builds map, returns variable globalMap
function createMap(){
    
	//create map
    map = L.map('map', {
            center: [30.98, -91.9],
            zoom: 6,
            minZoom: 4,
            maxZoom: 14,
            layers:grayscale
        });
    
    // Add the Leaflet easyPrint plugin to the map
    /*var printer = L.easyPrint({
      		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
      		filename: 'myMap',
      		exportOnly: true,
      		hideControlContainer: true
		}).addTo(map);*/
    
    var baseLayers = {
        "Grayscale": grayscale,
        "Terrain": terrain,
    };
    
   var displayLayers = {
       "States": statesLayer,
       "Watersheds": selectHucLayer,
       "Water's Path": extrasLayer,
   };
    
    
    //call getData
    getData(map);

    L.control.layers(baseLayers, displayLayers).addTo(map);
    
};


//getData loads geoJSON

function getData(map){
    
    // load the cancer tract data 
    var state = $.getJSON("resources/spatialdata/States.geojson"),
        h2 = $.getJSON("resources/spatialdata/H2.geojson");
    
    //call function responses
    $.when(state, h2).then(function (response1, response2) {
     //You have both responses at this point.
       
        // create layer and add to the layer group
        States = L.geoJson(response1, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(statesLayer);
        States.on('click', function(e) { document.getElementById('stateSel').value = (e.layer.feature.properties.SID); });

        //default layer style
        function style(feature) {
            return {
                fillColor: 'blue',
                weight: 2,
                opacity: 1,
                color: 'white',  //Outline color
                fillOpacity: 0.2
            };
        };    


        //iterate through each feature in the geoJSON
        function onEachFeature(feature, layer) {
            var popup = (layer.feature.properties.name).toLocaleString();
            layer.bindPopup(popup);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
            };

        //set the highlight on the map
        function highlightFeature(e) {

            var layer = e.target;
            layer.setStyle({fillOpacity: 1.0,
                           color: 'red'});
                this.openPopup();
        };

        function resetHighlight(e) {
            States.setStyle(style);
            this.closePopup();
        };
        
        // create layer and add to layer group
        Huc02 = L.geoJson(response2, {
            style: style,
            onEachFeature: onFeature
        }).addTo(selectHucLayer);
        
        //iterate through each feature in the geoJSON
        function onFeature(feature, layer) {
            var popup = "<center><b>" + (layer.feature.properties.name).toLocaleString() + "</b>" +
                "<br> HUC ID:" + (layer.feature.properties.huc2).toLocaleString() + "</br></center>";
            layer.bindPopup(popup);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHlight
            });
        };
        
        function resetHlight(e) {
            Huc02.setStyle(style);
            this.closePopup();
        };
        
        
        statesLayer.addTo(map);

        
});
};
    
function selectData(e){
    
};


$(document.getElementById('gotostate')).click(function(){
    var state = document.getElementById('stateSel').value;
    console.log(state);
    var match = States.eachLayer(function(layer) {
    if (layer.feature.properties.SID == state) {
        map.fitBounds(layer.getBounds());
        stateSelection = layer;
        return map.fitBounds(layer.getBounds());
    }
    });
    statesLayer.clearLayers();
    stateSelection.addTo(statesLayer);
    document.getElementById('selectState').style.display = 'none';
    document.getElementById('refreshbutton').style.display = 'block';
    document.getElementById('HUCshow').style.display = 'block';
    document.getElementById('selectHUC').style.display = 'none';
    fineDetails();
    
});

$(document.getElementById('expandHUC')).click(function(){
    document.getElementById('selectState').style.display = 'none';
    document.getElementById('refreshbutton').style.display = 'block';
    document.getElementById('HUCshow').style.display = 'none';
    document.getElementById('selectHUC').style.display = 'block';
});
     

$(document.getElementById('showHuc10')).click(function(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc10",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    //document.getElementsByClassName("btn btn-info btn-sm").className = "btn btn-success btn-sm";
    
    hucFiltering(id,sel,state);
    
    
    
    
});

function hucFiltering(id, sel, state){
    
    var resetbuttons = document.getElementsByClassName("btn btn-info btn-sm");
    
    //reset all buttons to default color
    if (!(resetbuttons[0]===undefined)) {
        document.getElementById(resetbuttons[0].id).className = "btn btn-success btn-sm";
    }
    
    //indicate what huc size is selected by button color
    document.getElementById(id).className = "btn btn-info btn-sm";
    Huc = $.getJSON('resources/spatialdata/'+state+'/'+sel+'.geojson');
    
    
    $.when(Huc).then(function (response1) {
    
     // create layer and add to the layer group
        HucSort = L.geoJson(response1, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(selectHucLayer);

        //default layer style
        function style(feature) {
            return {
                fillColor: 'green',
                weight: 2,
                opacity: 1,
                color: 'white',  //Outline color
                fillOpacity: 0.2
            };
        };    
        
        var hucid = 'huc'+sel;


        //iterate through each feature in the geoJSON
        function onEachFeature(feature, layer) {
            var popup = "<center><b>" + (layer.feature.properties.name).toLocaleString() + "</b>" +
                "<br> HUC ID:" + (layer.feature.properties.huc).toLocaleString() + "</br></center>";
            layer.bindPopup(popup);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
            };

        //set the highlight on the map
        function highlightFeature(e) {

            var layer = e.target;
            layer.setStyle({fillOpacity: 1.0,
                           color: 'red'});
                this.openPopup();
        };

        function resetHighlight(e) {
            HucSort.setStyle(style);
            this.closePopup();
        };
    
});
    
    
    
};

$(document.getElementById('showHuc12')).click(function(){
    fineDetails();
});
$(document.getElementById('showFine')).click(function(){
    fineDetails();
});

function fineDetails(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc12",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    var resetbuttons = document.getElementsByClassName("btn btn-info btn-sm");
    
    //reset all buttons to default color
    if (!(resetbuttons[0]===undefined)) {
        document.getElementById(resetbuttons[0].id).className = "btn btn-success btn-sm";
    };
    
    //indicate what huc size is selected by button color  
    document.getElementById(id).className = "btn btn-info btn-sm";
    
    /*if (state = "TX" ) {
        Huc0512 = $.getJSON('resources/spatialdata/'+state+'/'+sel+'/05.geojson');
        Huc1212 = $.getJSON('resources/spatialdata/'+state+'/'+sel+'/12.geojson');
        Huc1312 = $.getJSON('resources/spatialdata/'+state+'/'+sel+'/13.geojson');
        
        $.when(Huc0512, Huc1212, Huc1312).then(function (response1, response2, response3) {
            // create layer and add to the layer group
            HucSort1 = L.geoJson(response1, {
                
            }).addTo(txLayers);
            
            HucSort2 = L.geoJson(response2, {
                
            }).addTo(txLayers);
            
            HucSort3 = L.geoJson(response3, {
                
            }).addTo(txLayers);
            
            HucSort1.on('click', function(e) {
                downstreamtx(e)

            });
            
        function downstreamtx(e){
            var selection = [],
                    selectedNode = e.sourceTarget.feature;
                selection.push(selectedNode);
                console.log(selectedNode.properties.tohuc);

                function getHucIndex(target, toHuc){
                    for(let i = 0; i < target.getLayers().length; i++){
                        if (toHuc == target.getLayers()[i].feature.properties.huc){
                            return i;
                        }
                    }
                    return -1;
                }

                //Selection = getHucIndex(HucSort, selectedNode.properties.tohuc);
                //console.log(HucSort[2].feature.properties.huc);

                function downstream(target, selectedNode){
                    nextHuc = getHucIndex(target, selectedNode.properties.tohuc);
                    while(nextHuc != -1) {
                        selection.push(target.getLayers()[nextHuc].feature);
                        nextHuc = getHucIndex(target, target.getLayers()[nextHuc].feature.properties.tohuc);
                    }
                }

                downstream(HucSort, selectedNode);
                Selection = L.geoJson(selection, {
                    style: styleW,
                    onEachFeature: onEachFeature
                }).addTo(extrasLayer); 
        }

            
            
        });
        
    } else {*/
        
        Huc = $.getJSON('resources/spatialdata/'+state+'/'+sel+'.geojson');


        $.when(Huc).then(function (response1) {

         // create layer and add to the layer group
            HucSort = L.geoJson(response1, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(selectHucLayer);

            HucSort.on('click', function(e) {

                var selection = [],
                    selectedNode = e.sourceTarget.feature;
                selection.push(selectedNode);
                console.log(selectedNode.properties.tohuc);

                function getHucIndex(target, toHuc){
                    for(let i = 0; i < target.getLayers().length; i++){
                        if (toHuc == target.getLayers()[i].feature.properties.huc){
                            return i;
                        }
                    }
                    return -1;
                }

                //Selection = getHucIndex(HucSort, selectedNode.properties.tohuc);
                //console.log(HucSort[2].feature.properties.huc);

                function downstream(target, selectedNode){
                    nextHuc = getHucIndex(target, selectedNode.properties.tohuc);
                    while(nextHuc != -1) {
                        selection.push(target.getLayers()[nextHuc].feature);
                        nextHuc = getHucIndex(target, target.getLayers()[nextHuc].feature.properties.tohuc);
                    }
                }

                downstream(HucSort, selectedNode);
                Selection = L.geoJson(selection, {
                    style: styleW,
                    onEachFeature: onEachFeature
                }).addTo(extrasLayer); 

            });

        //default layer style
        function style(feature) {
            return {
                fillColor: 'green',
                weight: 2,
                opacity: 1,
                color: 'white',  //Outline color
                fillOpacity: 0.2
            };
        };    
        
        var hucid = 'huc'+sel;


        //iterate through each feature in the geoJSON
        function onEachFeature(feature, layer) {
            var popup = "<center><b>" + (layer.feature.properties.name).toLocaleString() + "</b>" +
                "<br> HUC ID:" + (layer.feature.properties.huc).toLocaleString() + "</br></center>";
            layer.bindPopup(popup);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
            };

        //set the highlight on the map
        function highlightFeature(e) {

            var layer = e.target;
            layer.setStyle({fillOpacity: 1.0,
                           color: 'red'});
                this.openPopup();
        };

        function resetHighlight(e) {
            HucSort.setStyle(style);
            this.closePopup();
        };
    
    function styleW(feature) {
        return {
            fillColor: 'blue',
            weight: 2,
            opacity: 1,
            color: 'navy',  //Outline color
            fillOpacity: 0.2
        };
    };    
});
    selectHucLayer.addTo(map);
    extrasLayer.addTo(map);
}


$(document.getElementById('showHuc02')).click(function(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc02",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    //document.getElementsByClassName("btn btn-info btn-sm").className = "btn btn-success btn-sm";
    
    hucFiltering(id,sel,state);
});
$(document.getElementById('showHuc04')).click(function(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc04",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    //document.getElementsByClassName("btn btn-info btn-sm").className = "btn btn-success btn-sm";
    
    hucFiltering(id,sel,state);
});
$(document.getElementById('showHuc06')).click(function(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc06",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    //document.getElementsByClassName("btn btn-info btn-sm").className = "btn btn-success btn-sm";
    
    hucFiltering(id,sel,state);
});
$(document.getElementById('showHuc08')).click(function(){
    HucSort={};
    selectHucLayer.clearLayers();
    
    var id = "showHuc08",
        sel = HucButtonToggles[id],
        state = document.getElementById('stateSel').value,
        call = 'resources/spatialdata/'+state+'/'+sel+'.geojson';
    
    console.log(call);
    
    //document.getElementsByClassName("btn btn-info btn-sm").className = "btn btn-success btn-sm";
    
    hucFiltering(id,sel,state);
});
$(document.getElementById('showCounties')).click(function(){});


$(document.getElementById('refresh')).click(function(){
    document.getElementById('selectState').style.display = 'block';
    document.getElementById('refreshbutton').style.display = 'none';
    document.getElementById('HUCshow').style.display = 'none';
    document.getElementById('selectHUC').style.display = 'none';
    
    extrasLayer.clearLayers();
    selectHucLayer.clearLayers();
    map.removeLayer(selectHucLayer);
    getData(map);
    
});
$(document.getElementById('addstates')).click(function(){
    document.getElementById('selectState').style.display = 'block';
    document.getElementById('refreshbutton').style.display = 'none';
    document.getElementById('HUCshow').style.display = 'none';
    document.getElementById('selectHUC').style.display = 'none';
    
    selectHucLayer.clearLayers();
    map.removeLayer(selectHucLayer);
    getData(map);
    
});

//when the page loads, AJAX & call createMap to render map tiles and data.
$(document).ready(init);
function init(){
    //globalOutput = document.querySelector("header output");
    
    //remove old data and clean up display

    createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([43.78, -88.78], 5.5); //[lat, lng], zoom
    });
};


