var allData = [];

// Variable for the visualization instance
var leafletMap, mapboxMap;
// Start application by loading the data
loadData();
// organize the data load at the VERY END
function loadData() {
  // Hubway XML station feed

  var locationUrl = "./data/AllLocations.json";
  var peopleUrl = "./data/KastorPeopleNY.json";
  var taxUrl = "./data/1798_Tax_Divisions_Merged.json";
  var districtUrl = "./data/1814_Districts_Merged.json";
  var countyUrl = "./data/CountyBoundaries.json";
  var stateUrl = "./data/StateBoundaries.json";
  var peopleData = [];
  var locationGeoJSON = {};
  var temp = [];
  var peopleFields = [];
  // TO-DO: LOAD DATA

  //use data
  $.when(
    $.getJSON(locationUrl),
    $.getJSON(peopleUrl),
    $.getJSON(countyUrl),
    $.getJSON(stateUrl),
    $.getJSON(taxUrl),
    $.getJSON(districtUrl)
  )
    .then(function (
      lData,
      pData,
      countyBoundaries,
      stateBoundaries,
      taxBoundaries,
      districtBoundaries
    ) {
      lData = lData[0];
      pData = pData[0];
      countyBoundaries = countyBoundaries[0];
      stateBoundaries = stateBoundaries[0];
      taxBoundaries = taxBoundaries[0];
      districtBoundaries = districtBoundaries[0];
      lData = lData["Data"];

      pData["Fields"].forEach((element) => {
        peopleFields.push(element["Fied"]);
      });
      peopleFields.push("Geocoding ID");

      pData["Data"].map((item) => {
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

      lData.forEach(function (d) {
        // this is the issue, you are using the + which is fro a string ig
        const coordinates = [parseFloat(d.x), parseFloat(d.y)];

        if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
          // Handle the case where d.x or d.y is not a valid number
          // console.error("Invalid coordinates:", d.x, d.y);
        } else {
          const jsonString = JSON.stringify({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [d.y, d.x],
            },
            properties: {
              name: d["Geocoding Location"],
              country: d["Country"],
              polity: d["Polity"],
              sector: d["Sector"],
              geoID: d["Geocode Number"],
              state: d["State"],
              buildingType: d["Type"],
            },
          });

          // Parse the JSON string
          const parsedData = JSON.parse(jsonString);
          temp.push(parsedData);
        }
      });

      locationGeoJSON = { type: "FeatureCollection", features: temp };
      // issue with the personnel popping up right now
      // filter and merge all the personnel to one object right now
      locationGeoJSON.features.forEach(function (loc) {
        var temp = peopleData.filter(function (p) {
          return p["Geocoding ID"] == loc.properties.geoID;
        });
        if (temp.length > 0) {
          var personnelArr = [
            {
              employeeID: temp[0]["GovernmentEmployeeNumber"],
              appointments: temp,
            },
          ];
          var smallestYear = temp.reduce((smallest, obj) => {
            return obj["Record Year"] < smallest
              ? obj["Record Year"]
              : smallest;
          }, Infinity);
          var biggestYear = temp.reduce((biggest, obj) => {
            return obj["Record Year"] >= biggest ? obj["Record Year"] : biggest;
          }, -Infinity);
          loc.properties.firstYear = smallestYear;
          loc.properties.lastYear = biggestYear;
          loc.properties.personnel = personnelArr;
          // if(loc.properties.state == "NY"){
          //   console.log(loc)
          // }
        }
      });

      allData.push(locationGeoJSON);
      allData.push(countyBoundaries);
      allData.push(stateBoundaries);
      allData.push(taxBoundaries);
      allData.push(districtBoundaries);
      mapboxMap = new MapBoxMap("mapbox-map", allData);
      mapboxMap.initVis();
    })

    .fail(function () {
      // ...didn't work, handle it
    });
}
