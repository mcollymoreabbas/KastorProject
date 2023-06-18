MapBoxMap = function (_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.currYear = 1789;

  // data[0] is locationsgeojson
  // data [1] is countiesgeojson
};

MapBoxMap.prototype.initVis = function () {
  var vis = this;

  const popup = new mapboxgl.Popup({ closeOnClick: false });

  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2FzdG9ycHJvamVjdCIsImEiOiJjbGlkZ2Q0Z3Ywc2N5M2RwZjVrcnJhMmNvIn0.e1tZnLbd-wfMVODWHJH4ew";
  const map = new mapboxgl.Map({
    container: vis.parentElement, // container ID
    style: "mapbox://styles/mapbox/satellite-v9", // style URL
    center: [-75.5, 43], // starting position [lng, lat]
    zoom: 6, // starting zoom
  });

  // non-prototyupe function for loading personnel?

  // initial load of the map
  map.on("load", () => {
    // county data
    // FILTER COUNTY DATA ON LOAD?
    // upload geojson to url?
    map.addSource("countyBoundaries", {
      type: "geojson",
      data: vis.data[1],
      generateId: true,
    });
    map.addLayer({
      id: "counties",
      source: "countyBoundaries",
      type: "fill",
      paint: {
        "fill-color": "#EE4B2B",
        "fill-opacity": 0.3,
        "fill-outline-color": "black",
      },
    });
    // location data
    map.addSource("locations", {
      type: "geojson",
      data: vis.data[0],
      generateId: true,
      cluster: true,
      clusterMaxZoom: 7,
      clusterRadius: 40,
    });
    // zoomed out clusters
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
        "circle-stroke-width": [
          "case",
          ["boolean", ["feature-state", "clicked"], false],
          3,
          1,
        ],
        "circle-stroke-color": [
          "case",
          ["boolean", ["feature-state", "clicked"], false],
          "#FFFFFF",
          "#000000",
        ],
      },
    });
    // cluster count label
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
    // individual location points
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
    var locID = null;

    map.on("click", "clusters", (e) => {
      // TODO: FIX BUG WITH THIS CODE
      // maybe this one can just create a popup that'll have a UL
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });

      const clusterId = features[0].properties.cluster_id;
      console.log(e, features[0]);
      const pointCount = features[0].properties.point_count;
      const clusterSource = map.getSource("locations");

      clusterSource.getClusterLeaves(
        clusterId,
        pointCount,
        0,
        (error, features) => {
          // Print cluster leaves in the console
          console.log("Cluster leaves:", error, features);
          var clusterString = "";
          if (features) {
            features.forEach(function (point) {
              clusterString =
                clusterString +
                "<br> <strong>" +
                point.properties["name"] +
                "</strong>";
            });
          }
          document.getElementById("displayList").innerHTML = clusterString;
        }
      );

      if (e.features.length === 0) return;

      document.getElementById("clickedPanel").setAttribute("display", "block");

      if (locID) {
        map.removeFeatureState({
          source: "locations",
          id: locID,
        });
      }

      locID = e.features[0].id;

      map.setFeatureState(
        {
          source: "locations",
          id: locID,
        },
        {
          clicked: true,
        }
      );
    });

    map.on("click", "unclustered-point", (e) => {
      var currData = e.features[0].properties;
      console.log(currData);
      document.getElementById("clickedPanel").setAttribute("display", "none");
      // var displayString = "<strong>Personnel: </strong> <br>";
      // if (currData.personnel.length > 0) {
      //   currData.personnel.forEach(function (p) {
      //     displayString = displayString + "<a>" + p["Full Name"] + "</a> <br>";
      //   });
      // }
      popup
        .setLngLat(e.lngLat)
        .setHTML(
          "<div id = 'locPopup'><h5>" +
            currData.name +
            ", <br>" +
            "New York</h5>" +
            "<strong>Built in: " +
            currData.firstYear +
            "</strong></div>"
        )
        .addTo(map);
      document.getElementById("displayList").innerHTML = displayString;

      // perhaps populate a scrollable list if there are personnel?
    });
    // cursor so that user knows to click
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    // html functions to change time
    document
      .getElementById("timeSlider")
      .addEventListener("input", function (e) {
        document.getElementById("yearLabel").innerHTML =
          "<strong>Current Year: </strong>" + e.target.value;
      });
    document
      .getElementById("timeSlider")
      .addEventListener("change", function (e) {
        var currYear = e.target.value + "-31-12";

        // ok so i can just <= the dates it seems
        //  here is where eventually you'll need to change the source data
        // for the boundaries, you need to sort by end_date
        // must start befroe and end after t, it can be the first of the year?
        // extend to 1833 ig
        // need to adjust the source datas
        // the
        // make this function minimal
        // can do similar editing of the personnel in this sections as well?
      });
    console.log(vis.data);

    // CLOSE OF MAPLOAD
  });

  // CLOSE OF INITVIS
};
