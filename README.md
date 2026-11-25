# Graphical calculator — group coursework

Browser calculator exercise with arithmetic/scientific operations, expression input, graph-display placeholders, and an optional video-backed start screen. Created by **Oleksandr Lisnytskyi, Kenny Joseph, and Vadim Rudenko**; this repository does not establish a separate individual ownership claim for each feature.

## Preview

Run `python -m http.server 8080 --bind 127.0.0.1` from the repository and open http://127.0.0.1:8080. Use an HTTP server because `script.js` imports ES modules. The historical Plotly CDN include requires network access; the shipped expression UI does not currently draw graphs. No backend is required. GitHub Pages publishes the static files from `main`.

## Check

Use Node 22+ and run `npm test` (no package install required). Tests cover arithmetic, division by zero, scientific-function boundaries, and radian-based trigonometry in `calculations.js`. JavaScript's existing `NaN`/infinity behavior remains explicit; these tests do not certify the full expression parser.

`calculations.js` contains math operations; `script.js` handles the UI/parser; `index.html` and `style.css` contain the original presentation. The original missing logo is replaced by the existing Numpad title. Historical placeholder social links and unfinished graph display remain coursework limitations, not a finished commercial product. Original authorship and design files remain; generated Windows download metadata has been removed.

## Browser regressions

In a Python 3.12 virtual environment, run:

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser.py
```

The suite serves the current checkout on an ephemeral loopback port, blocks external traffic, and replaces only the optional Plotly CDN response. It verifies pointer calculations/history at 1440, 390 and 320 px, missing-video/script behavior, keyboard skip/focus, reduced motion and the six-second intro fallback. No form/provider requests are sent. CI runs these checks alongside the unchanged math regressions.

The opening video is hidden until it actually plays, never intercepts pointer input, and dismisses on interaction, media failure, completion or the bounded fallback. It is skipped for reduced motion. The calculator works without the opening-video module.
