# Delphi overview: build

Generates the deck one folder up: `slides/NN.svg`, `delphi-overview.pdf`, `delphi-overview.pptx` and `index.html`.

- `slides.js`: every slide as a 1600×900 SVG, with its speaker notes. Edit this.
- `build.js`: writes the site from `slides.js` and `index.template.html`.
- `preview.js`: renders slides to `out/png/` to look at, e.g. `node preview.js 3 4`.

Needs Node, `pptxgenjs` (`npm i -g pptxgenjs`) and `rsvg-convert` (`brew install librsvg`).

```sh
cd delphi-overview/build
git rm -q -r ../slides                      # drop slides that no longer exist
NODE_PATH=$(npm root -g) node build.js ..
```
