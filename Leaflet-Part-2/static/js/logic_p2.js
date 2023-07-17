function createTectonicPlates() {
  // GeoJSON URL for tectonic plates
  let platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  // Get the tectonic plates data with d3
  d3.json(platesURL).then(function (data) {
    let tectonicPlates = L.geoJSON(data, {
      style: {
        color: "orange",
        weight: 2,
      },
    });

    // Add tectonic plates layer to the map
    tectonicPlates.addTo(tectonicPlatesOverlay);

    // Add tectonic plates layer to the layer control
    // overlayMaps["Tectonic Plates"] = tectonicPlates;
    // L.control.layers(baseMaps, overlayMaps, {
    //   collapsed: false,
    // }).addTo(myMap);
  });
}

  // Add additional base maps to the baseMaps object
  // baseMaps["Satellite Map"] = satelliteMap;
  // baseMaps["Dark Map"] = darkMap;

// Create separate overlay objects
let earthquakeOverlay = L.layerGroup();
let tectonicPlatesOverlay = L.layerGroup();

// Add overlays to the overlayMaps object
overlayMaps = {
  "Earthquakes": earthquakeOverlay,
  "Tectonic Plates": tectonicPlatesOverlay,
};

let satelliteMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

let darkMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
    attribution: '©️ OpenStreetMap contributors, ©️ CartoDB'
});

baseMaps={
  "Satellite Map": satelliteMap,
  "Dark Map": darkMap
}

let myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 4,
  layers: [satelliteMap, earthquakeOverlay]
});

let legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");

  let grades = [0, 10, 30, 50, 70, 90];
  let labels = [];

  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      markerColor(grades[i] + 1) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

// Adding the legend to the map.
legend.addTo(myMap);

// Create the layer control with separate overlays
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false,
}).addTo(myMap);

let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3.
d3.json(geoData).then(function (data) {
  createFeatures(data.features);
});

function markerSize(mag) {
  return mag * 4; // Adjust the multiplier to control the marker size
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

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr><p>${feature.properties.mag}</p>`
    );
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.75,
        color: "black",
        weight: 1,
      });
    },
    onEachFeature: onEachFeature,
  });
earthquakes.addTo(earthquakeOverlay)
}
 
createTectonicPlates();
