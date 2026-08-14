# latterhouselife-planner-app
v.5

## Homepage carousel

A static, dependency-free homepage: a full-screen looping-video welcome
screen (the "Latter House Life" mark bottom-right, a "Start Here" button
top-left) that leads into an immersive 5-card horseshoe carousel for the
five rooms — Resources, Community, Scripture, Tools, and Library.

- `index.html` — markup for the welcome screen, carousel, and room modal
- `css/style.css` — dark/gold glass styling and the 3D horseshoe layout
- `js/main.js` — welcome → carousel transition, video loading, modal logic
- `assets/videos/` — drop the room background videos here (see that folder's
  README for exact filenames); cards fall back to a themed gradient until a
  file is present

To preview locally, serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`.
