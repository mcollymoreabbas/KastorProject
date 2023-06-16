MapBoxMap = function (_parentElement, _data, _mapPosition) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.mapPosition = _mapPosition;
  this.currMarkers = [];
  this.currYear = 1789;
  this.markerArr = [];

  // data[0] is locationsdata
  // eventually should get rid of this
  // data[1] is people
  // data[2] is locationsgeojson
  // data [3] is countiesgeojson
};

MapBoxMap.prototype.initVis = function () {
  var vis = this;

  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2FzdG9ycHJvamVjdCIsImEiOiJjbGlkZ2Q0Z3Ywc2N5M2RwZjVrcnJhMmNvIn0.e1tZnLbd-wfMVODWHJH4ew";
  const map = new mapboxgl.Map({
    container: vis.parentElement, // container ID
    style: "mapbox://styles/mapbox/satellite-v9", // style URL
    center: vis.mapPosition, // starting position [lng, lat]
    zoom: 6, // starting zoom
  });

  // initial load of the map
  map.on("load", () => {
    // county data
    map.addSource("countyBoundaries", {
      type: "geojson",
      data: vis.data[3],
      generateId: true,
    });
    console.log(vis.data);
    map.addLayer({
      id: "counties",
      source: "countyBoundaries",
      type: "fill",
      paint: {
        "fill-color": "#CCFF66",
        "fill-opacity": 0.3,
        "fill-outline-color": "black",
      },
    });
    // building data
    map.addSource("buildings", {
      type: "geojson",
      data: vis.data[2],
      generateId: true,
      cluster: true,
      clusterMaxZoom: 7,
      clusterRadius: 40,
    });

    map.addLayer({
      id: "buildings-viz",
      type: "circle",
      source: "buildings",
      paint: {
        "circle-radius": ["step", ["get", "point_count"], 10, 20, 30],
        "circle-color": "#301934",
      },
    });
    vis.map.on("mousemove", "buildings-viz", function (e) {
      // Get the marker's description from the dataset
      var currData = e.features[0].properties;
      document.getElementById("Name").innerHTML = currData.name;
      document.getElementById("State").innerHTML = "New York";
      document.getElementById("BuildingYear").innerHTML = currData.firstYear;
      document.getElementById("Coords").innerHTML =
        "(" +
        Math.round(10 * e.lngLat["lng"]) / 10 +
        "," +
        Math.round(10 * e.lngLat["lat"]) / 10 +
        ")";

      console.log(currData);
      document.getElementById("Personnel").innerHTML += "<ul> </ul>";
      // currData.personnel.forEach(function (d) {
      //   var personnelList = document.getElementById("personnel");
      //   var li = document.createElement("li");
      //   li.appendChild(document.createTextNode(d));
      //   personnelList.appendChild(li);
      // });

      // Show a tooltip with the description
    });
    // remove tooltip when off building
    vis.map.on("mouseleave", "buildings-viz", function (e) {
      document.getElementById("Name").innerHTML = "";
      document.getElementById("State").innerHTML = "";
      document.getElementById("BuildingYear").innerHTML = "";
      document.getElementById("Coords").innerHTML = "";
      document.getElementById("Personnel").innerHTML = "";
    });
  });

  vis.map = map;

  console.log(vis.data);

  // a lot of mapbox can be entered and edited dynamically without further functions,
  // which is quicker for the loading of the data
};

MapBoxMap.prototype.changeYear = function (newYear) {
  var vis = this;

  var markersToMove = [];

  if (newYear > vis.currYear) {
    markersToMove = vis.data[0].filter(function (d) {
      return d["First Year"] <= newYear && d["First Year"] >= vis.currYear;
    });
    vis.addMarkers(markersToMove);
  } else {
  }
  vis.currMarkers = [];
  vis.currMarkers = vis.data[0].filter(function (d) {
    return d["First Year"] <= newYear;
  });
  vis.addMarkers(vis.currMarkers);

  vis.currYear = newYear;
  // vis.removeMarkers();
};

// coujld eventually make all the add and remove markers stuff private?
MapBoxMap.prototype.addMarkers = function (newMarkers) {
  var vis = this;

  vis.removeMarkers();
  // console.log(newMarkers);
  // location is name
  // newMarkers.forEach(function (m) {
  //   var el = document.createElement("div");
  //   el.className = m["Geocoding ID"];
  //   el.data = m;

  //   var currMarker = new mapboxgl.Marker().setLngLat([m.x, m.y]).addTo(vis.map);
  //   vis.markerArr.push(currMarker);
  //   // console.log(currMarker);
  // });

  // Add hover effect to markers
  vis.map.on("mousemove", "buildings-viz", function (e) {
    // Get the marker's description from the dataset
    var currData = e.features[0].properties;
    document.getElementById("Name").innerHTML = currData.name;
    document.getElementById("State").innerHTML = "New York";
    document.getElementById("BuildingYear").innerHTML = currData.firstYear;
    document.getElementById("Coords").innerHTML =
      "(" +
      Math.round(10 * e.lngLat["lng"]) / 10 +
      "," +
      Math.round(10 * e.lngLat["lat"]) / 10 +
      ")";

    console.log(currData);
    document.getElementById("Personnel").innerHTML += "<ul> </ul>";
    // currData.personnel.forEach(function (d) {
    //   var personnelList = document.getElementById("personnel");
    //   var li = document.createElement("li");
    //   li.appendChild(document.createTextNode(d));
    //   personnelList.appendChild(li);
    // });

    // Show a tooltip with the description
  });
  // remove tooltip when off building
  vis.map.on("mouseleave", "buildings-viz", function (e) {
    document.getElementById("Name").innerHTML = "";
    document.getElementById("State").innerHTML = "";
    document.getElementById("BuildingYear").innerHTML = "";
    document.getElementById("Coords").innerHTML = "";
    document.getElementById("Personnel").innerHTML = "";
  });
};

// future implementation of add and remove to help with large data files

MapBoxMap.prototype.removeMarkers = function (oldMarkers) {
  var vis = this;

  // if(vis.map.getLayer('buildings')){
  //   vis.map.removeLayer('buildings');
  // }
  vis.markerArr.forEach(function (marker) {
    // Apply selection style or perform other actions
    marker.remove();
  });
  vis.currMarkers = [];
  vis.markerArr = [];
};
