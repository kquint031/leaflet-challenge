// Load the GeoJSON data.
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3.
d3.json(geoData).then(function(data) {

  createFeatures(data.features);
});

function markerSize(mag){
  return mag * 5;
  
}

function markerColor(depth) {
  if (depth > 90) {
    return "#EC0606"; // Red for depths greater than 90 km
  } else if (depth > 70) {
    return "#FF8701"; // Orange for depths between 70 and 90 km
  } else if (depth > 50) {
    return "#FFBB59"; // Light orange for depths between 50 and 70 km
  } else if (depth > 30) {
    return "#F3F306"; // Yellow for depths between 30 and 50 km
  } else if (depth > 10) {
    return "#D3F306"; // Light green for depths between 10 and 30 km
  } else {
    return "#8BF306"; // Green for depths less than 10 km
  }
}

function createFeatures(earthquakeData){

    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${feature.properties.mag}</p>`);
    };

    let earthquakes = L.geoJSON(earthquakeData,{
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.75,
          color: "black",
          weight: 1,
        });
      },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);

}

function createMap(earthquakes) {
// Create the tile layer background of the map.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    });

    // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create legend

  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");

    let grades = [0, 10, 30, 50, 70, 90];
    let labels = [];

    for (let i = 0; i < grades.length; i++) {
      let color = markerColor(grades[i]+1);
      let colorHTML = '<span style = "background:'+ color + '"></span>';
      let rangeHTML = grades[i] + (grades[i+1]? "&ndash;" + grades[i+1] + "<br>":"+");

      labels.push(  '<div class="legend-item"><div class="legend-color" style="background-color: ' + color + '"></div>' +
      '<div class="legend-label">' + rangeHTML + '</div></div>');
    }

    div.innerHTML = labels.join("");

    return div;
  };

  // Adding the legend to the map.
  legend.addTo(myMap);
}