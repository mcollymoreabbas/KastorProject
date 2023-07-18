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

  const popup = new mapboxgl.Popup({ closeOnClick: true });
  // , offset: popupOffsets

  mapboxgl.accessToken =
    "pk.eyJ1Ijoia2FzdG9ycHJvamVjdCIsImEiOiJjbGlkZ2Q0Z3Ywc2N5M2RwZjVrcnJhMmNvIn0.e1tZnLbd-wfMVODWHJH4ew";
  const map = new mapboxgl.Map({
    container: vis.parentElement, // container ID
    style: "mapbox://styles/mapbox/light-v11", // style URL
    center: [-75.5, 43], // starting position [lng, lat]
    zoom: 6, // starting zoom
  });

  //     style: "mapbox://styles/kastorproject/clk8k8t5j032r01qv0x5sah8o", // minimo URL

  //     style: "mapbox://styles/kastorproject/clk8k78xh031b01qj2ccc8gkn", // cali terrain URL

  //     style: "mapbox://styles/kastorproject/clk8k4knw033a01ns024f3h44", // bubble URL

  //     style: "mapbox://styles/mapbox/satellite-v9", // style URL

  //     style: "mapbox://styles/mapbox/light-v11", // style URL

  // initial load of the map
  map.on("load", () => {
    // county data
    var originalCountyData = {
      ...vis.data[1], // Spread the existing object properties
      features: vis.data[1].features.filter(function (d) {
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
      // clusterMaxZoom: 7,
      clusterRadius: 40,
    });
    // LOCATIONS NO CLUSTER
    map.addSource("allLocations", {
      type: "geojson",
      data: vis.data[0],
      generateId: true,
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
          ["boolean", ["feature-state", "hovered"], false],
          3,
          1,
        ],
        "circle-stroke-color": [
          "case",
          ["boolean", ["feature-state", "hovered"], false],
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

    map.addLayer({
      id: "allPoints",
      type: "circle",
      source: "allLocations",
      paint: {
        "circle-color": "#C3B1E1",
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
      },
      layout: {
        visibility: "none",
      },
    });
    map.on("mousemove", ["unclustered-point", "allPoints"], (e) => {
      var currData = e.features[0].properties;
      document.getElementById("clickedPanel").setAttribute("display", "none");
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
    });
    map.on("click", ["unclustered-point", "allPoints"], (e) => {
      console.log(e);
      var clickedPoint = map.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point", "allPoints"],
      });
      console.log(clickedPoint);
      document.getElementById("locInfo").innerHTML =
        "Clicked Location: " + clickedPoint[0].properties.name;
      if (clickedPoint[0].properties.personnel != undefined) {
        clickedPoint[0].properties.personnel = JSON.parse(
          clickedPoint[0].properties.personnel
        );
        var personnelString = "";

        clickedPoint[0].properties.personnel.forEach(function (p) {
          console.log(p);
          personnelString = personnelString + "<li>" + p["Full Name"] + "</li>";
        });
        document.getElementById("personnelInfo").innerHTML = personnelString;
      }
    });
    map.on("zoom", () => {
      if (map.getZoom() < 4) {
        map.setLayoutProperty("clusters", "visibility", "none");
        map.setLayoutProperty("cluster-count", "visibility", "none");
        map.setLayoutProperty("unclustered-point", "visibility", "none");
        map.setLayoutProperty("allPoints", "visibility", "visible");
      } else {
        map.setLayoutProperty("clusters", "visibility", "visible");
        map.setLayoutProperty("cluster-count", "visibility", "visible");
        map.setLayoutProperty("unclustered-point", "visibility", "visible");
        map.setLayoutProperty("allPoints", "visibility", "none");
      }
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
          ...vis.data[1],
          features: vis.data[1].features.filter(function (d) {
            var sDate = new Date(d.properties["START_DATE"]);
            var eDate = new Date(d.properties["END_DATE"]);
            var currDate = new Date(sliderYear);
            var bool = sDate < currDate && eDate >= currDate;
            return bool;
          }),
        };
        var newStateData = {
          ...vis.data[2],
          features: vis.data[2].features.filter(function (d) {
            var sDate = new Date(d.properties["START_DATE"]);
            var eDate = new Date(d.properties["END_DATE"]);
            var currDate = new Date(sliderYear);
            var bool = sDate < currDate && eDate >= currDate;
            return bool;
          }),
        };
        vis.map.getSource("countyBoundaries").setData(newCountyData);
        vis.map.getSource("stateBoundaries").setData(newStateData);
      });

    var locID = null;

    map.on(
      "mousemove",
      [
        "County Fill",
        "1798 Tax Divisions",
        "State Fill",
        "1814 District",
        "State Boundaries",
        "County Boundaries",
        "District Outlines",
        "Tax Outlines",
        "clusters",
      ],
      (e) => {
        var clusterLayer = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        var stateLayer = map.queryRenderedFeatures(e.point, {
          layers: ["State Fill"],
        });
        var countyLayer = map.queryRenderedFeatures(e.point, {
          layers: ["County Fill"],
        });
        var taxLayer = map.queryRenderedFeatures(e.point, {
          layers: ["1798 Tax Divisions"],
        });
        var districtLayer = map.queryRenderedFeatures(e.point, {
          layers: ["1814 District"],
        });
        if (clusterLayer.length > 0) {
          const clusterId = clusterLayer[0].properties.cluster_id;
          const pointCount = clusterLayer[0].properties.point_count;
          const clusterSource = map.getSource("locations");
          if (pointCount) {
            clusterSource.getClusterLeaves(
              clusterId,
              pointCount,
              0,
              (error, features) => {
                // Print cluster leaves in the console
                var clusterString = "<a><strong>";
                if (features) {
                  features.forEach(function (point) {
                    clusterString =
                      clusterString + point.properties["name"] + " | ";
                  });
                }
                clusterString = clusterString + "</strong></a";
                popup
                  .setHTML(clusterString)
                  .setMaxWidth("400px")
                  .setLngLat(e.lngLat)
                  .addTo(map);
              }
            );
          }
          if (e.features.length === 0) return;
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
              // hovered: true,
            }
          );
        } else if (
          stateLayer.length > 0 ||
          countyLayer.length > 0 ||
          taxLayer.length > 0 ||
          districtLayer.length > 0
        ) {
          var hoverString = "";
          if (countyLayer.length > 0) {
            var currData = countyLayer[0].properties;
            hoverString =
              hoverString +
              "<h5>County: </h5> <a>" +
              currData["NAME"].charAt(0) +
              currData["NAME"].slice(1).toLowerCase() +
              ", " +
              currData["STATE_TERR"] +
              "</a>";
          }
          if (stateLayer.length > 0) {
            var currData = stateLayer[0].properties;
            hoverString =
              hoverString + "<h5>State: </h5><a>" + currData["NAME"] + "</a>";
          }
          if (taxLayer.length > 0) {
            var currData = taxLayer[0].properties;
            hoverString =
              hoverString +
              "<h5>Tax Div.: </h5><a>" +
              currData["TaxDivision1798"] +
              ", " +
              currData["State"] +
              "</a>";
          }
          if (districtLayer.length > 0) {
            var currData = districtLayer[0].properties;
            hoverString =
              hoverString +
              "<h5>1814 Dist.: </h5><a>" +
              currData["District1814"] +
              ", " +
              currData["State"] +
              "</a>";
          }

          popup
            .setHTML(hoverString)
            .setMaxWidth("400px")
            .setLngLat(e.lngLat)
            .addTo(map);
        }
      }
    );

    map.on(
      "mouseout",
      [
        "County Fill",
        "1798 Tax Divisions",
        "State Fill",
        "1814 District",
        "State Boundaries",
        "County Boundaries",
        "District Outlines",
        "Tax Outlines",
        "clusters",
        "unclustered-point",
        "allPoints",
      ],
      (e) => {
        popup.remove();
      }
    );
    // map.on("mouseout", "clusters", () => {
    //   popup.remove();
    // });
    map.on("click", "clusters", (e) => {
      console.log(e);
      var clickedPoint = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (clickedPoint[0].properties.point_count) {
        map.flyTo({
          center: e.lngLat,
          zoom: map.getZoom() + 1,
          speed: 0.7,
          curve: 1,
          easing(t) {
            return t;
          },
        });
      }
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
  });
  // CLOSE OF MAPLOAD
  console.log(vis.data);
  // document
  //   .getElementById("updateMapButton")
  //   .addEventListener("click", vis.updateMap());
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
  // end of map idle
  vis.map = map;
};

MapBoxMap.prototype.updateMap = function () {
  var vis = this;
  console.log(vis.map);
  if (!document.getElementById("locationToggle").checked) {
    vis.map.getSource("locations").setData(vis.data[0]);
  } else {
    var currYear = parseInt(document.getElementById("timeSlider").value);
    var newLocData = {
      ...vis.data[0],
      features: vis.data[0].features.filter(function (d) {
        var bool = false;
        if (!isNaN(d.properties.firstYear) || !isNaN(d.properties.lastYear)) {
          bool = d.properties.firstYear <= currYear;
        } else {
          bool = true;
        }
        return bool;
      }),
    };
    vis.map.getSource("locations").setData(newLocData);
  }
};
