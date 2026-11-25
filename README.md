# Graphical calculator — group coursework

Browser calculator exercise with arithmetic/scientific operations, expression input, Plotly graphing, and a video-backed start screen. Created by **Oleksandr Lisnytskyi, Kenny Joseph, and Vadim Rudenko**; this repository does not establish a separate individual ownership claim for each feature.

## Preview

Run `python -m http.server 8080 --bind 127.0.0.1` from the repository and open http://127.0.0.1:8080. Use an HTTP server because `script.js` imports ES modules. Graph rendering loads Plotly from its existing CDN; it requires network access. No backend or deployment is configured.

## Check

Use Node 22+ and run `npm test` (no package install required). Tests cover arithmetic, division by zero, scientific-function boundaries, and radian-based trigonometry in `calculations.js`. JavaScript's existing `NaN`/infinity behavior remains explicit; these tests do not certify the full expression parser.

`calculations.js` contains math operations; `script.js` handles the UI/parser; `index.html` and `style.css` contain the original presentation. Historical placeholder social links and any missing design assets are retained as coursework limitations, not represented as a finished commercial product. Original authorship and design files remain; generated Windows download metadata has been removed.
