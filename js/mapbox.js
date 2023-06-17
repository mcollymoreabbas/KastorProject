MapBoxMap = function (_parentElement, _data, _mapPosition) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.mapPosition = _mapPosition;
  this.currYear = 1789;

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
    map.addLayer({
      id: "counties",
      source: "countyBoundaries",
      type: "fill",
      paint: {
        "fill-color": "#3EB489",
        "fill-opacity": 0.3,
        "fill-outline-color": "black",
      },
    });
    // building data
    map.addSource("locations", {
      type: "geojson",
      data: vis.data[2],
      generateId: true,
      cluster: true,
      clusterMaxZoom: 7,
      clusterRadius: 40,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "locations",
      paint: {
        "circle-radius": ["step", ["get", "point_count"], 20, 4, 30, 8, 40],
        "circle-color": [
          "step",
          ["get", "point_count"],

          "#b8e2f6",
          4,
          "#7bbad8",
          8,
          "#375360",
        ],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#000000",

      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "locations",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "locations",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#C3B1E1",
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
      },
    });

    // map.on("mouseenter", "clusters", function (e, item) {
    //   console.log(e, item);
    // });

    // map.on("click", "clusters", (e) => {
    //   // TODO: FIX BUG WITH THIS CODE
    //   const features = map.queryRenderedFeatures(e.point, {
    //     layers: ["clusters"],
    //   });

    //   const clusterId = features[0].properties.cluster_id;
    //   console.log(e, features[0]);
    //   map
    //     .getSource("locations")
    //     .getClusterExpansionZoom(clusterId, (err, zoom) => {
    //       if (err) return;

    //       map.easeTo({
    //         center: e.lngLat,
    //         zoom: zoom,
    //       });
    //     });
    // });
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("click", "unclustered-point", (e) => {
      // // MAJOR EDITING REQUIRED
      // const coordinates = e.features[0].geometry.coordinates.slice();
      // const mag = e.features[0].properties.mag;
      // const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";

      // // Ensure that if the map is zoomed out such that
      // // multiple copies of the feature are visible, the
      // // popup appears over the copy being pointed to.
      // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      // }

      // new mapboxgl.Popup()
      //   .setLngLat(coordinates)
      //   .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
      //   .addTo(map);
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
      document.getElementById("Personnel").innerHTML += "<ul> </ul>";
      // currData.personnel.forEach(function (d) {
      //   var personnelList = document.getElementById("personnel");
      //   var li = document.createElement("li");
      //   li.appendChild(document.createTextNode(d));
      //   personnelList.appendChild(li);
      // });

      // Show a tooltip with the description
    });
    // FIGURE OUT HOW TO CLICK OFF THE POINT
    // map.on("mouseleave", "unclustered-point", function (e) {
    //   document.getElementById("Name").innerHTML = "";
    //   document.getElementById("State").innerHTML = "";
    //   document.getElementById("BuildingYear").innerHTML = "";
    //   document.getElementById("Coords").innerHTML = "";
    //   document.getElementById("Personnel").innerHTML = "";
    // });
  });

  vis.map = map;

  // a lot of mapbox can be entered and edited dynamically without further functions,
  // which is quicker for the loading of the data
};

// COULD POSSIBLE CREATE MORE FUNCTIONS HERE IF NECESSARY
// PROBS NEED ONE FOR CHANGING THE YEAR
