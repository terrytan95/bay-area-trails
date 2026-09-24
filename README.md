# Bay Area Trails (旧金山湾区水彩 3D 步道地图)

An interactive, watercolor 3D digital elevation map of hiking and mountain biking trails across the 9-county San Francisco Bay Area.

Live: [https://terrytan.dev/trails/bay-area/](https://terrytan.dev/trails/bay-area/)

Inspired by [Tahoe Trails](https://trails-fun.warpspire.com/) by Kyle Aster.

## Features

- **Isometric Watercolor Relief**: Procedural GLSL watercolor shaders mimicking classic hand-painted trail maps, with golden oak savannahs, chaparral scrub, coastal redwoods, paper grain tooth, and shoreline water halos.
- **Over 2,170 Curated Trails**: 3,940+ miles of trails from regional authorities:
  - Bay Area Trails Collaborative (BATC) & Rails-to-Trails Conservancy
  - East Bay Regional Park District (EBRPD)
  - Santa Clara County Parks (SCCPRD)
  - Marin County Open Space District
  - National Park Service (GGNRA)
- **Planned Regional Trail Network**: Toggleable overlay showing proposed BATC connections and upgrades.
- **Elevation Profiles**: Interactive SVG elevation profiles, climb and descent stats, surface materials, and hike vs. bike designations.
- **Mobile Responsive**: Adaptive bottom-sheet drawer, touch gesture optimization, and responsive 3D viewport framing.
- **Optimized Performance**: Geometric RDP-simplified lines and Nginx gzip compression delivering smooth 60fps rendering with fast initial load.

## Data Sources

- Trails © OpenStreetMap contributors, BATC, EBRPD, SCC Parks, Marin County Parks, & NPS
- Elevation: USGS 3DEP / AWS Terrain Tiles

## License

MIT
