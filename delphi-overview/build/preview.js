const fs = require("fs"); const { execFileSync } = require("child_process");
const { slides, svg } = require("./slides.js");
fs.mkdirSync("out/svg", { recursive: true }); fs.mkdirSync("out/png", { recursive: true });
const only = process.argv.slice(2).map(Number);
slides.forEach((sl, i) => {
  if (only.length && !only.includes(i + 1)) return;
  const n = String(i + 1).padStart(2, "0");
  fs.writeFileSync(`out/svg/${n}.svg`, svg(sl));
  execFileSync("rsvg-convert", ["-w", "1600", "-o", `out/png/${n}.png`, `out/svg/${n}.svg`]);
});
