
const fs = require('fs');

const bbox = { west: -123.05, east: -121.75, south: 36.95, north: 38.35 };
const midLat = (bbox.north + bbox.south) / 2;
const widthM = Math.round((bbox.east - bbox.west) * 111139 * Math.cos(midLat * Math.PI / 180));
const heightM = Math.round((bbox.north - bbox.south) * 111139);

function lonLatToXY(lon, lat) {
  const x = ((lon - bbox.west) / (bbox.east - bbox.west)) * widthM;
  const y = ((lat - bbox.south) / (bbox.north - bbox.south)) * heightM;
  return [Math.round(x), Math.round(y)];
}

// Major peaks in the Bay Area
const peaks = [
  { name: "Mount Diablo", lat: 37.8816, lon: -121.9141, ele: 1173 },
  { name: "Mount Tamalpais", lat: 37.9289, lon: -122.5777, ele: 784 },
  { name: "Mount Hamilton", lat: 37.3414, lon: -121.6428, ele: 1327 },
  { name: "Mount Saint Helena", lat: 38.6708, lon: -122.6322, ele: 1323 },
  { name: "Mission Peak", lat: 37.5126, lon: -121.9134, ele: 767 },
  { name: "Castle Rock", lat: 37.2300, lon: -122.0950, ele: 978 },
  { name: "Monument Peak", lat: 37.4950, lon: -121.8900, ele: 792 },
  { name: "San Bruno Mountain", lat: 37.6880, lon: -122.4330, ele: 402 },
  { name: "Montara Mountain", lat: 37.5750, lon: -122.4900, ele: 579 },
  { name: "Windy Hill", lat: 37.3640, lon: -122.2460, ele: 579 },
  { name: "Black Mountain", lat: 37.3190, lon: -122.1480, ele: 856 },
  { name: "Twin Peaks", lat: 37.7544, lon: -122.4477, ele: 282 },
  { name: "Vollmer Peak", lat: 37.8966, lon: -122.2280, ele: 581 },
  { name: "Grizzly Peak", lat: 37.8830, lon: -122.2350, ele: 536 },
  { name: "Mount Wanda", lat: 37.9940, lon: -122.1280, ele: 201 },
  { name: "Redwood Peak", lat: 37.8180, lon: -122.1850, ele: 490 },
  { name: "Rose Peak", lat: 37.5080, lon: -121.7080, ele: 1162 },
  { name: "Mount Umunhum", lat: 37.1600, lon: -121.8980, ele: 1063 },
  { name: "Mount Allison", lat: 37.5020, lon: -121.8980, ele: 808 },
  { name: "Eagle Rock", lat: 37.1750, lon: -122.2190, ele: 757 }
];

// Major cities & towns
const cities = [
  { kind: "town", name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { kind: "town", name: "Oakland", lat: 37.8044, lon: -122.2712 },
  { kind: "town", name: "San Jose", lat: 37.3382, lon: -121.8863 },
  { kind: "town", name: "Berkeley", lat: 37.8716, lon: -122.2727 },
  { kind: "town", name: "Palo Alto", lat: 37.4419, lon: -122.1430 },
  { kind: "town", name: "Fremont", lat: 37.5485, lon: -121.9886 },
  { kind: "town", name: "San Rafael", lat: 37.9735, lon: -122.5311 },
  { kind: "town", name: "Santa Cruz", lat: 36.9741, lon: -122.0308 },
  { kind: "town", name: "Walnut Creek", lat: 37.9101, lon: -122.0652 },
  { kind: "town", name: "Redwood City", lat: 37.4852, lon: -122.2364 },
  { kind: "village", name: "Mill Valley", lat: 37.9060, lon: -122.5450 },
  { kind: "village", name: "Sausalito", lat: 37.8591, lon: -122.4853 },
  { kind: "village", name: "Tiburon", lat: 37.8735, lon: -122.4566 },
  { kind: "village", name: "Half Moon Bay", lat: 37.4636, lon: -122.4286 },
  { kind: "village", name: "Pacifica", lat: 37.6138, lon: -122.4869 },
  { kind: "village", name: "Los Gatos", lat: 37.2358, lon: -121.9624 },
  { kind: "village", name: "Saratoga", lat: 37.2638, lon: -122.0230 },
  { kind: "village", name: "Cupertino", lat: 37.3230, lon: -122.0322 },
  { kind: "village", name: "Mountain View", lat: 37.3861, lon: -122.0839 },
  { kind: "village", name: "Point Reyes Station", lat: 38.0691, lon: -122.8069 },
  { kind: "village", name: "Stinson Beach", lat: 37.9005, lon: -122.6444 },
  { kind: "village", name: "Bolinas", lat: 37.9096, lon: -122.6861 }
];

// Major water bodies / bays
const waterBodies = [
  { kind: "lake", name: "San Francisco Bay", lat: 37.68, lon: -122.32, area: 1040000000 },
  { kind: "lake", name: "San Pablo Bay", lat: 38.07, lon: -122.42, area: 230000000 },
  { kind: "lake", name: "Suisun Bay", lat: 38.08, lon: -122.05, area: 100000000 },
  { kind: "lake", name: "Pacific Ocean", lat: 37.50, lon: -122.75, area: 9999999999 },
  { kind: "lake", name: "Tomales Bay", lat: 38.12, lon: -122.88, area: 28000000 },
  { kind: "lake", name: "Lake Chabot", lat: 37.716, lon: -122.103, area: 1300000 },
  { kind: "lake", name: "Crystal Springs Reservoir", lat: 37.52, lon: -122.36, area: 6000000 },
  { kind: "lake", name: "San Andreas Lake", lat: 37.60, lon: -122.41, area: 2200000 },
  { kind: "lake", name: "Lake Del Valle", lat: 37.61, lon: -121.70, area: 3000000 },
  { kind: "lake", name: "Calero Reservoir", lat: 37.18, lon: -121.78, area: 1400000 },
  { kind: "lake", name: "Chesbro Reservoir", lat: 37.12, lon: -121.70, area: 1100000 },
  { kind: "lake", name: "Lexington Reservoir", lat: 37.19, lon: -121.98, area: 1800000 }
];

const labels = [];
for (const p of peaks) {
  const [x, y] = lonLatToXY(p.lon, p.lat);
  labels.push({ kind: "peak", name: p.name, x, y, ele: p.ele });
}
for (const c of cities) {
  const [x, y] = lonLatToXY(c.lon, c.lat);
  labels.push({ kind: c.kind, name: c.name, x, y });
}
for (const w of waterBodies) {
  const [x, y] = lonLatToXY(w.lon, w.lat);
  labels.push({ kind: w.kind, name: w.name, x, y, area: w.area });
}

// Bay Area boundary polygon for watercolor framing (basin)
// Outer polygon covering the 9-county Bay Area boundary
const basinGeo = [
  [-123.02, 38.33],
  [-122.80, 38.33],
  [-122.50, 38.33],
  [-122.20, 38.33],
  [-121.80, 38.33],
  [-121.77, 38.00],
  [-121.77, 37.50],
  [-121.77, 37.00],
  [-122.00, 36.97],
  [-122.25, 36.97],
  [-122.45, 37.20],
  [-122.55, 37.50],
  [-122.60, 37.80],
  [-122.80, 38.00],
  [-123.02, 38.20],
  [-123.02, 38.33]
];

const basin = basinGeo.map(([lon, lat]) => lonLatToXY(lon, lat));

const mapData = {
  bbox,
  widthM,
  heightM,
  grid: {
    width: 750,
    height: 1020,
    spacing: 50,
    scale: 4
  },
  elevation: {
    min: 0,
    max: 1327
  },
  basin,
  lakes: [], // In Bay Area, water is encoded directly in water_mask and terrain.bin
  labels,
  attribution: [
    "Trails © OpenStreetMap contributors (ODbL)",
    "Bay Area Trails Collaborative (BATC) & Rails-to-Trails Conservancy",
    "East Bay Regional Park District (EBRPD)",
    "Santa Clara County Parks & Recreation",
    "Marin County Open Space District",
    "National Park Service (GGNRA)",
    "Elevation: AWS Terrain Tiles (USGS 3DEP, SRTM)"
  ]
};

fs.writeFileSync('work/map.json', JSON.stringify(mapData, null, 2));
console.log("Saved work/map.json with", labels.length, "labels");

