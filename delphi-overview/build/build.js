// node build.js <site-dir>: writes <site-dir>/slides/NN.svg, delphi-overview.pdf (vector),
// delphi-overview.pptx (native titles + notes over 2x renders) and index.html.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const pptxgen = require("pptxgenjs");
const { slides, svg, C } = require("./slides.js");

const site = path.resolve(process.argv[2]);
const tmp = path.join(__dirname, "out", "pptx");
fs.mkdirSync(path.join(site, "slides"), { recursive: true });
fs.mkdirSync(tmp, { recursive: true });
const n = (i) => String(i + 1).padStart(2, "0");

// Web + PDF: the full slide as vector SVG.
const svgs = slides.map((sl, i) => {
  const p = path.join(site, "slides", `${n(i)}.svg`);
  fs.writeFileSync(p, svg(sl));
  return p;
});
execFileSync("rsvg-convert", ["-f", "pdf", "-o", path.join(site, "delphi-overview.pdf"), ...svgs]);
execFileSync("rsvg-convert", ["-w", "1200", "-o", path.join(site, "slides", "cover.png"), svgs[0]]); // link previews

// PPTX: kicker and title as editable text, the rest as a 3200px render.
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 × 5.625 in = 1600 × 900 px at 160 px/in
pres.title = "Delphi: where your agent's context comes from";
pres.author = "NER Software";
const px = (v) => v / 160;
const pt = (v) => v * 0.45;
slides.forEach((sl, i) => {
  const png = path.join(tmp, `${n(i)}.png`);
  const body = path.join(tmp, `${n(i)}.svg`);
  fs.writeFileSync(body, svg(sl, { withHeader: false }));
  execFileSync("rsvg-convert", ["-w", "3200", "-o", png, body]);
  const s = pres.addSlide();
  s.background = { color: (sl.dark ? C.ink : C.paper).slice(1) };
  s.addImage({ path: png, x: 0, y: 0, w: 10, h: 5.625 });
  if (!sl.dark) {
    s.addShape(pres.shapes.RECTANGLE, { x: px(80), y: px(58), w: px(15), h: px(15), fill: { color: C.gold.slice(1) }, line: { color: C.gold.slice(1) } });
    s.addText(sl.kicker, { x: px(108), y: px(52), w: 7, h: px(26), margin: 0, valign: "middle", fontFace: "Helvetica Neue", fontSize: pt(18), bold: true, color: C.gold.slice(1), charSpacing: 1.6 });
    s.addText(sl.title, { x: px(80), y: px(88), w: px(1440), h: px(64), margin: 0, valign: "middle", fontFace: "Georgia", fontSize: pt(50), bold: true, color: C.ink.slice(1), fit: "shrink" });
  }
  s.addNotes(sl.notes);
});

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const data = slides.map((sl, i) => ({ src: `slides/${n(i)}.svg`, kicker: sl.kicker ?? (i ? "TRY IT" : "INTRO"), title: sl.title, notes: sl.notes }));
const template = fs.readFileSync(path.join(__dirname, "index.template.html"), "utf8");
fs.writeFileSync(
  path.join(site, "index.html"),
  template
    .replace("/*SLIDES*/", JSON.stringify(data, null, 2).replace(/</g, "\\u003c"))
    .replace("<!--NOSCRIPT-->", data.map((d) => `<figure><img src="${d.src}" alt="${esc(d.title)}"><figcaption><strong>${esc(d.title)}</strong> ${esc(d.notes)}</figcaption></figure>`).join("\n"))
    .replace("<!--FIRST-->", data[0].src),
);

pres.writeFile({ fileName: path.join(site, "delphi-overview.pptx") }).then(() => console.log(`built ${slides.length} slides into ${site}`));
