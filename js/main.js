var allData = [];

// Variable for the visualization instance
var leafletMap, mapboxMap;
// Start application by loading the data
loadData();
// organize the data load at the VERY END
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
  $.when(
    $.getJSON(locationUrl),
    $.getJSON(peopleUrl),
    $.getJSON("./data/NYBoundaries.json")
  )
    .then(function (lData, pData, boundaries) {
      lData = lData[0];
      pData = pData[0];
      boundaries = boundaries[0];
      console.log(lData, pData, boundaries);

      // ...worked, put it in #view-graphic
      lData = lData["Data"];
      lData.sort(function (a, b) {
        return a["First Year"] - b["First Year"];
      });
      // get rid of duplicates at some poitn

      lData.forEach(function (d) {
        // this is the issue, you are using the + which is fro a string ig

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
              '"personnel":[]' +
              ',"buildingType": "' +
              d["Building"] +
              '"' +
              "}}"
          )
        );
      });
      locationGeoJSON = { type: "FeatureCollection", features: temp };

      pData["Fields"].forEach((element) => {
        peopleFields.push(element["Fied"]);
      });
      peopleFields.push("Geocoding ID");

      pData["Data"].map((item) => {
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

      allData.push(locationGeoJSON);
      allData.push(boundaries);
      
      mapboxMap = new MapBoxMap("mapbox-map", allData);
      mapboxMap.initVis();
    })


    .fail(function () {
      // ...didn't work, handle it
    });

  
}
