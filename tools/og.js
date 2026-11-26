// สร้างภาพตัวอย่างตอนแชร์ (og/*.png) และไอคอนแอป (icons/*.png):  NODE_PATH=$(npm root -g) node tools/og.js
const fs = require("fs"), path = require("path"); global.window = global;
const root = path.join(__dirname, ".."); process.chdir(root);
require("./../config.js"); require("./../calc.js"); const { TOOLS, fmt } = require("./../tools.js"); const CREATOR = require("../content/creator.json");
const { chromium } = require("playwright");
const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=Pridi:wght@600;700&display=swap">';
const BASE = `*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#E9EEEB;color:#16201C;font-family:"IBM Plex Sans Thai",sans-serif;display:flex;flex-direction:column;padding:56px 64px;position:relative;overflow:hidden}
.brand{display:flex;align-items:center;gap:14px;font:700 34px "Pridi",serif}.brand b{display:grid;place-items:center;width:46px;height:46px;border:3px solid #1D3CB8;color:#1D3CB8;border-radius:50%;font:600 26px "IBM Plex Mono"}
.main{flex:1;display:flex;gap:56px;align-items:center}.t{flex:1.1;font:700 64px/1.25 "Pridi",serif}.t small{display:block;font:400 28px "IBM Plex Sans Thai";color:#4B5951;margin-top:22px}
.slip{width:470px;background:#fff;border-top:8px solid #16201C;padding:28px 30px 34px;position:relative}.slip:after{content:"";position:absolute;left:0;right:0;top:calc(100% - 1px);height:16px;background:linear-gradient(-45deg,transparent 12px,#fff 0) 0 0/24px 16px,linear-gradient(45deg,transparent 12px,#fff 0) 0 0/24px 16px}
.r{display:flex;align-items:baseline;gap:8px;padding:9px 0;font-size:22px;color:#4B5951}.r i{flex:1;border-bottom:3px dotted #B9C4BE;transform:translateY(-5px)}.r em{font:500 25px "IBM Plex Mono";font-style:normal;color:#16201C}
.k{border-top:3px solid #16201C;margin-top:12px;padding-top:16px;display:flex;justify-content:space-between;align-items:center;font:600 24px "IBM Plex Sans Thai"}.k strong{background:#FFE45C;padding:2px 12px;font:600 44px "IBM Plex Mono"}
.by{position:absolute;left:64px;bottom:38px;font-size:23px;color:#4B5951}`;
function slipHTML(res) {
  const rows = res.rows.filter((_, i) => i !== res.key).slice(0, 3).map((r) => `<div class="r">${r.l}<i></i><em>${r.v}</em></div>`).join("");
  const k = res.rows[res.key]; return `<div class="slip">${rows}${k ? `<div class="k"><span>${k.l}</span><strong>${k.v}</strong></div>` : ""}</div>`;
}
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const shot = async (html, out, w = 1200, h = 630) => { await p.setViewportSize({ width: w, height: h }); await p.setContent(`<html><head>${FONT}<style>${BASE}</style></head><body>${html}</body></html>`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); await p.screenshot({ path: out }); };
  const files = fs.readdirSync(".").filter((f) => f.endsWith(".html") && f !== "404.html");
  for (const f of files) {
    const name = f.replace(".html", ""), html = fs.readFileSync(f, "utf8");
    const title = (html.match(/<title>(.*?)<\/title>/)[1] || "").split(" | ")[0];
    let slip = "", big = title, sub = "คำนวณฟรี ไม่ต้องสมัคร";
    const tool = TOOLS.find((t) => t.id === name), m = name.match(/^take-home-(\d+)$/);
    if (tool) { slip = slipHTML(tool.compute(Object.fromEntries(tool.fields.map((x) => [x.id, x.value])))); big = tool.h1; }
    else if (m) { const s = +m[1], r = TOOLS.find((t) => t.id === "salary").compute({ salary: s }); slip = slipHTML(r); big = `เงินเดือน ${fmt(s)} บาท รับสุทธิเท่าไร`; sub = "หักภาษีและประกันสังคมแล้ว"; }
    else if (name === "index") { slip = slipHTML(TOOLS.find((t) => t.id === "salary").compute({ salary: 30000 })); big = "เงินเดือนเท่านี้ เหลือเข้าบัญชีเท่าไร"; sub = "คำนวณภาษี เงินเดือนสุทธิ ค่างวด ฟรี"; }
    else if (name === "about") { big = `สร้างโดย ${CREATOR.handle}`; sub = CREATOR.roles.join(" · "); }
    const tfs = big.length > 34 && !slip ? "font-size:56px" : "";
    await shot(`<div class="brand"><b>฿</b>${CONFIG.brand.name}</div><div class="main"><div class="t" style="${tfs}">${big}<small>${sub}</small></div>${slip}</div><div class="by">${CONFIG.brand.site} · สร้างโดย @${CREATOR.handle}</div>`, `og/${name}.png`);
  }
  const mark = (pad, size) => `<div style="width:${size}px;height:${size}px;background:#E9EEEB;display:grid;place-items:center;position:fixed;inset:0"><div style="width:${size * (1 - pad * 2)}px;height:${size * (1 - pad * 2)}px;border:${size * 0.04}px solid #1D3CB8;border-radius:50%;display:grid;place-items:center;color:#1D3CB8;font:600 ${size * 0.5 * (1 - pad * 2)}px 'IBM Plex Mono'">฿</div></div>`;
  for (const [n, size, pad] of [["icon-192", 192, 0.12], ["icon-512", 512, 0.12], ["icon-180", 180, 0.12], ["icon-maskable-512", 512, 0.26]]) {
    await p.setViewportSize({ width: size, height: size }); await p.setContent(`<html><head>${FONT}<style>body{margin:0;width:${size}px;height:${size}px;overflow:hidden}</style></head><body>${mark(pad, size)}</body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250); await p.screenshot({ path: `icons/${n}.png` });
  }
  await b.close(); console.log("og:", files.length, "images + 4 icons");
})();
