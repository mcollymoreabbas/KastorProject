var allData = [];

// Variable for the visualization instance
var leafletMap, mapboxMap;
// Start application by loading the data
loadData();

function loadData() {
  // Hubway XML station feed

  var locationUrl = "./data/KastorLocationsNY.json";
  var peopleUrl = "./data/KastorPeopleNY.json";
  var locationData = [];
  var peopleData = [];
  var locationGeoJSON = {};
  var temp = [];
  var peopleGeoJSON = [];
  var peopleFields = [];
  // TO-DO: LOAD DATA

  //use data
  //  console.log(data)

  $.getJSON(locationUrl)
    .then(function (lData) {
      // ...worked, put it in #view-graphic
      lData = lData.Data;
      lData.sort(function (a, b) {
        return a["First Year"] - b["First Year"];
      });
      // get rid of duplicates at some poitn

      lData.forEach(function (d) {
        temp.push(
          JSON.parse(
            '{"type": "Feature", "geometry": {"type": "Point", "coordinates": [' +
              d.x +
              "," +
              d.y +
              ']}, "properties": { "name": "' +
              d["Locality"] +
              '", ' +
              '"firstYear": ' +
              d["First Year"] +
              ', "geoID": "' +
              d["Geocoding ID"] +
              '",' +
              '"personnel":[]' + ',"buildingType": "' + d["Building"]+ '"' +
              "}}"
          )
        );
      });

      locationGeoJSON = { type: "FeatureCollection", features: temp };

      // console.log(locationGeoJSON);
      allData.push(lData);
    })
    .fail(function () {
      // ...didn't work, handle it
    });
  $.getJSON(peopleUrl)
    .then(function (pData) {
      pData.Fields.forEach((element) => {
        peopleFields.push(element["Fied"]);
      });
      peopleFields.push("Geocoding ID");

      pData.Data.map((item) => {
        // console.log(item)
        const filteredItem = {};
        peopleFields.forEach((field) => {
          if (item.hasOwnProperty(field)) {
            filteredItem[field] = item[field];
          }
        });
        peopleData.push(filteredItem);
      });

      peopleData.sort(function (a, b) {
        return a.GovernmentEmployeeNumber - b.GovernmentEmployeeNumber;
      });
      // issue with the personnel popping up right now

      peopleData.forEach(function (p) {
        locationGeoJSON["features"].forEach(function (t) {
          if (p["Geocoding ID"] == t.properties.geoID) {
            t.properties["personnel"].push(p);
          }
        });
      });

      allData.push(peopleData);
      allData.push(locationGeoJSON);
      $.getJSON("./data/NYBoundaries.json").then(function (boundaries) {
        allData.push(boundaries);
      });
      // leafletMap = new LeafletMap("leaflet-map", allData, [43.2994, -74.21798]);
      mapboxMap = new MapBoxMap("mapbox-map", allData, [-75.5, 43]);
      mapboxMap.initVis();

      document
        .getElementById("timeSlider")
        .addEventListener("change", function (e) {
          document.getElementById("yearLabel").innerText =
            "Current Year: " + e.target.value;
          // ok so when e changes, get the value from the slider and then update mapBox
          // mapboxMap.removeMarkers();
          // mapboxMap.addMarkers(e.target.value);
          // mapboxMap.plotMarkers(e.target.value);
          // leafletMap.changeYear(e.target.value);
        });
    })
    .fail(function () {
      // ...didn't work, handle it
    });
}
