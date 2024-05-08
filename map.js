console.log("coming from map.js file");

const style = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 21,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

const map = new maplibregl.Map({
  container: "map",
  style: style,
  center: [-118.2437, 34.0522], // Los Angeles coordinates
  zoom: 10,
});



