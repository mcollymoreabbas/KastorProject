MapBoxMap = function (_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;

  // data[0] is locationsgeoJSON
  // data [1] is countyBoundariesgeoJSON
  //data [2] is stateBoundariesgeoJSON
  //data[3] is taxes
  //data[4] is 1814 district
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

  // initial load of the map
  map.on("load", () => {
    // county data
    var originalCountyData = {
      ...vis.data[1], // Spread the existing object properties
      features: vis.data[1].features.filter(function (d) {
        // console.log(d, d["START_DATE"])
        var sDate = new Date(d.properties["START_DATE"]);
        var eDate = new Date(d.properties["END_DATE"]);
        var currDate = new Date("1832-12-31");
        var bool = sDate < currDate && eDate >= currDate;
        return bool;
      }), // Filter the array based on a condition
    };

    var originalStateData = {
      ...vis.data[2], // Spread the existing object properties
      features: vis.data[2].features.filter(function (d) {
        // console.log(d, d["START_DATE"])
        var sDate = new Date(d.properties["START_DATE"]);
        var eDate = new Date(d.properties["END_DATE"]);
        var currDate = new Date("1832-12-31");
        var bool = sDate < currDate && eDate >= currDate;
        return bool;
      }), // Filter the array based on a condition
    };

    // BOUNDARY SOURCE DATA
    map.addSource("countyBoundaries", {
      type: "geojson",
      data: originalCountyData,
      generateId: true,
    });
    map.addSource("stateBoundaries", {
      type: "geojson",
      data: originalStateData,
      generateId: true,
    });
    // LOCATION SOURCE DATA
    map.addSource("locations", {
      type: "geojson",
      data: vis.data[0],
      generateId: true,
      cluster: true,
      clusterMaxZoom: 7,
      clusterRadius: 40,
    });
    //TAX SOURCE DATA
    map.addSource("taxes", {
      type: "geojson",
      data: vis.data[3],
      generateId: true,
    });
    //1814 DISTRICT DATA
    map.addSource("district", {
      type: "geojson",
      data: vis.data[4],
      generateId: true,
    });

    // COUNTY OUTLINE LAYER
    map.addLayer({
      id: "County Boundaries",
      source: "countyBoundaries",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        visibility: "none",
      },
      paint: {
        "line-color": "white",
        "line-width": 2,
      },
    });

    // COUNTY FILL LAYER
    map.addLayer({
      id: "County Fill",
      source: "countyBoundaries",
      type: "fill",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#EE4B2B",
        "fill-opacity": 0,
        "fill-outline-color": "green",
      },
    });
    // STATE OUTLINE LAYER
    map.addLayer({
      id: "State Boundaries",
      source: "stateBoundaries",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        visibility: "none",
      },
      // interpolation numbers need work
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "ID_NUM"],
          0,
          "#FF0000",
          20,
          "#FFFF00",
          50,
          "#A020F0",
          80,
          "#00FF00",
          110,
          "#FFA500",
          150,
          "#FFC0CB",
          180,
          "#808080",
        ],
        "line-width": 6,
      },
    });
    // STATE FILL LAYER
    map.addLayer({
      id: "State Fill",
      source: "stateBoundaries",
      type: "fill",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#EE4B2B",
        "fill-opacity": 0,
        "fill-outline-color": "white",
      },
    });
    // TAX OUTLINE LAYER
    map.addLayer({
      id: "Tax Outlines",
      source: "taxes",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        visibility: "none",
      },
      paint: {
        "line-color": "blue",
        "line-width": 2,
      },
    });
    // TAX FILL LAYER
    map.addLayer({
      id: "1798 Tax Divisions",
      source: "taxes",
      type: "fill",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#EE4B2B",
        "fill-opacity": 0,
        "fill-outline-color": "white",
      },
    });
    // DISTRICT OUTLINE LAYER
    map.addLayer({
      id: "District Outlines",
      source: "district",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        visibility: "none",
      },
      paint: {
        "line-color": "red",
        "line-width": 2,
      },
    });
    // DISTRICT FILL LAYER
    map.addLayer({
      id: "1814 District",
      source: "district",
      type: "fill",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#EE4B2B",
        "fill-opacity": 0,
        "fill-outline-color": "white",
      },
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

    var locID = null;

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });

      const clusterId = features[0].properties.cluster_id;
      const pointCount = features[0].properties.point_count;
      const clusterSource = map.getSource("locations");

      clusterSource.getClusterLeaves(
        clusterId,
        pointCount,
        0,
        (error, features) => {
          // Print cluster leaves in the console
          var clusterString = "";
          if (features) {
            clusterString = clusterString + "<h5>Cities in Cluster: </h5>";
            features.forEach(function (point) {
              clusterString =
                clusterString +
                "<strong>" +
                point.properties["name"] +
                "</strong> <br> ";
            });
          }
          document.getElementById("clusterList").innerHTML = clusterString;
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
      document.getElementById("clusterList").innerHTML = "";
      document.getElementById("clickedPanel").setAttribute("display", "none");
      // console.log(currData);
      if (currData.state != undefined) {
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            "<div id = 'locPopup'><h5>" +
              currData.name +
              ", <br>" +
              currData.state +
              ", " +
              currData.country +
              "</h5>" +
              "</div>"
          )
          .addTo(map);
      } else {
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            "<div id = 'locPopup'><h5>" +
              currData.name +
              ", <br>" +
              currData.country +
              "</h5>" +
              "</div>"
          )
          .addTo(map);
      }

      if (currData.personnel != undefined) {
        e.features[0].properties.personnel = JSON.parse(
          e.features[0].properties.personnel
        );
        // console.log("personnel")
      }
      // perhaps populate a scrollable list if there are personnel?
    });

    map.on("mousemove", "County Fill", (county) => {
      document.getElementById("hoverPanel").style.visibility = "visible";
      document.getElementById("hoverPanel").style.left = county.point.x + "px";
      document.getElementById("hoverPanel").style.top = county.point.y + "px";
      var currData = county.features[0].properties;
      document.getElementById("countyInfo").innerHTML =
        "<h5><strong>Hovered County: </strong>" +
        currData["NAME"].charAt(0) +
        currData["NAME"].slice(1).toLowerCase() +
        ", " +
        currData["STATE_TERR"] +
        "</h5>";
    });
    map.on("mouseleave", "County Fill", () => {
      document.getElementById("hoverPanel").style.visibility = "hidden";
      document.getElementById("countyInfo").innerHTML = "";
    });
    map.on("mousemove", "State Fill", (state) => {
      document.getElementById("hoverPanel").style.visibility = "visible";
      document.getElementById("hoverPanel").style.left = state.point.x + "px";
      document.getElementById("hoverPanel").style.top = state.point.y + "px";
      var currData = state.features[0].properties;
      document.getElementById("stateInfo").innerHTML =
        "<h5><strong>Hovered State: </strong>" + currData["NAME"] + "</h5>";
    });
    map.on("mouseleave", "State Fill", () => {
      document.getElementById("hoverPanel").style.visibility = "hidden";
      document.getElementById("stateInfo").innerHTML = "";
    });
    map.on("mousemove", "1798 Tax Divisions", (tax) => {
      document.getElementById("hoverPanel").style.visibility = "visible";
      document.getElementById("hoverPanel").style.left = tax.point.x + "px";
      document.getElementById("hoverPanel").style.top = tax.point.y + "px";
      var currData = tax.features[0].properties;
      document.getElementById("taxInfo").innerHTML =
        "<h5><strong>Hovered 1798 Tax Division: </strong>" +
        currData["TaxDivision1798"] +
        ", " +
        currData["State"] +
        "</h5>";
    });
    map.on("mouseleave", "1798 Tax Divisions", () => {
      document.getElementById("hoverPanel").style.visibility = "hidden";
      document.getElementById("taxInfo").innerHTML = "";
    });
    map.on("mousemove", "1814 District", (district) => {
      document.getElementById("hoverPanel").style.visibility = "visible";
      document.getElementById("hoverPanel").style.left =
        district.point.x + "px";
      document.getElementById("hoverPanel").style.top = district.point.y + "px";
      var currData = district.features[0].properties;
      document.getElementById("districtInfo").innerHTML =
        "<h5><strong>Hovered 1814 District: </strong>" +
        currData["District1814"] +
        ", " +
        currData["State"] +
        "</h5>";
    });
    map.on("mouseleave", "1814 District", () => {
      document.getElementById("hoverPanel").style.visibility = "hidden";
      document.getElementById("districtInfo").innerHTML = "";
    });
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
        var sliderYear = e.target.value + "-12-31";
        var newCountyData = {
          ...vis.data[1], // Spread the existing object properties
          features: vis.data[1].features.filter(function (d) {
            // console.log(d, d["START_DATE"])
            var sDate = new Date(d.properties["START_DATE"]);
            var eDate = new Date(d.properties["END_DATE"]);
            var currDate = new Date(sliderYear);
            var bool = sDate < currDate && eDate >= currDate;
            return bool;
          }), // Filter the array based on a condition
        };
        var newStateData = {
          ...vis.data[2], // Spread the existing object properties
          features: vis.data[2].features.filter(function (d) {
            // console.log(d, d["START_DATE"])
            var sDate = new Date(d.properties["START_DATE"]);
            var eDate = new Date(d.properties["END_DATE"]);
            var currDate = new Date(sliderYear);
            var bool = sDate < currDate && eDate >= currDate;
            return bool;
          }), // Filter the array based on a condition
        };

        var currYear = parseInt(document.getElementById("timeSlider").value);
        var newLocData = {
          ...vis.data[0],
          features: vis.data[0].features.filter(function (d) {
            var bool = false;
            // console.log(d, d["START_DATE"])
            if (
              !isNaN(d.properties.firstYear) ||
              !isNaN(d.properties.lastYear)
            ) {
              bool = (d.properties.firstYear <= currYear);
              // bool =
              //   d.properties.firstYear >= currYear &&
              //   d.properties.lastYear <= currYear;
            }
            return bool;
          }),
        };
        map.getSource("locations").setData(newLocData);

        map.getSource("countyBoundaries").setData(newCountyData);
        map.getSource("stateBoundaries").setData(newStateData);
      });
    // document
    //   .getElementById("locYearButton")
    //   .addEventListener("click", function (switchValue) {
    //     console.log(switchValue);
    //     switchValue = switchValue.target.value;
    //     console.log(switchValue);

    //     if (switchValue) {
    //       var currYear = document.getElementById("timeSlider").value;
    //       var newLocData = {
    //         ...vis.data[0],
    //         features: vis.data[0].features.filter(function (d) {
    //           var bool = false;
    //           // console.log(d);

    //           // console.log(d, d["START_DATE"])
    //           if (
    //             !isNaN(d.properties.firstYear) ||
    //             !isNaN(d.properties.lastYear)
    //           ) {
    //             bool =
    //               d.properties.firstYear >= currYear &&
    //               d.properties.lastYear <= currYear;
    //           }
    //           return bool;
    //         }),
    //       };
    //       map.getSource("locations").setData(newLocData);
    //       document.getElementById("locYearButton").target.value = false;
    //     } else {
    //       map.getSource("locations").setData(vis.data[0]);
    //       document.getElementById("locYearButton").target.value = true;
    //     }
    //     console.log(switchValue, document.getElementById("timeSlider").value);
    //   });
    console.log(vis.data);
    // CLOSE OF MAPLOAD
  });

  map.on("idle", () => {
    // If these two layers were not added to the map, abort
    if (
      !map.getLayer("State Boundaries") ||
      !map.getLayer("County Boundaries") ||
      !map.getLayer("1814 District") ||
      !map.getLayer("1798 Tax Divisions") ||
      !map.getLayer("State Fill") ||
      !map.getLayer("County Fill")
    ) {
      return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = [
      "State Boundaries",
      "County Boundaries",
      "1814 District",
      "1798 Tax Divisions",
    ];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }

      // Create a link.
      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id;
      link.className = "";

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        const visibility = map.getLayoutProperty(clickedLayer, "visibility");

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === "visible") {
          map.setLayoutProperty(clickedLayer, "visibility", "none");
          this.className = "";
        } else {
          this.className = "active";
          map.setLayoutProperty(clickedLayer, "visibility", "visible");
        }
        if (clickedLayer == "State Boundaries") {
          if (map.getLayoutProperty("State Fill", "visibility") === "visible") {
            map.setLayoutProperty("State Fill", "visibility", "none");
          } else {
            map.setLayoutProperty("State Fill", "visibility", "visible");
          }
        } else if (clickedLayer == "County Boundaries") {
          if (
            map.getLayoutProperty("County Fill", "visibility") === "visible"
          ) {
            map.setLayoutProperty("County Fill", "visibility", "none");
          } else {
            map.setLayoutProperty("County Fill", "visibility", "visible");
          }
        } else if (clickedLayer == "1798 Tax Divisions") {
          if (
            map.getLayoutProperty("Tax Outlines", "visibility") === "visible"
          ) {
            map.setLayoutProperty("Tax Outlines", "visibility", "none");
          } else {
            map.setLayoutProperty("Tax Outlines", "visibility", "visible");
          }
        } else if (clickedLayer == "1814 District") {
          if (
            map.getLayoutProperty("District Outlines", "visibility") ===
            "visible"
          ) {
            map.setLayoutProperty("District Outlines", "visibility", "none");
          } else {
            map.setLayoutProperty("District Outlines", "visibility", "visible");
          }
        }
      };

      const layers = document.getElementById("toggleMenu");
      layers.appendChild(link);
    }
  });

  // CLOSE OF INITVIS
};
