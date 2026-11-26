#!/usr/bin/env node
/* สร้างทั้งเว็บ:  node build.js [https://โดเมน]   (ผลลัพธ์เป็นไฟล์ .html ใน root, Vercel เสิร์ฟแบบ clean URL) */
const fs = require("fs"), path = require("path");
global.window = global;
require("./config.js"); const Calc = require("./calc.js"); const { TOOLS, GROUPS, fmt: f, slipHTML } = require("./tools.js");
const CONTENT = require("./content.js"), GUIDES = require("./content/guides.json");
const SITE = (process.argv[2] || process.env.SITE_URL || "https://phasith.vercel.app").replace(/\/$/, "");
const NAME = "เครื่องมือเงินไทย", TODAY = new Date().toISOString().slice(0, 10);
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=Pridi:wght@600;700&display=swap";
const SAL = [15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 70000, 80000, 100000, 150000];
const pages = []; // {file, path}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const crumbLD = (items) => ld({ "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it[0], item: SITE + it[1] })) });
const faqLD = (faq) => ld({ "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });

function shell({ file, p, title, desc, body, jsonld = [], scripts = false, bare = false, noindex = false }) {
  const full = p === "/" ? title : `${title} | ${NAME}`;
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(desc)}">${noindex ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${SITE + p}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#E9EEEB">
<meta property="og:type" content="website"><meta property="og:locale" content="th_TH"><meta property="og:site_name" content="${NAME}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE + p}">
<meta name="google-site-verification" content="Or4ukEcD3GRHU0DjK7WAPo3XGqUdAftq1skqdrDpXdw">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="/style.css">
${jsonld.join("")}</head><body>
<header class="top"><div class="wrap"><a class="mark" href="/"><b aria-hidden="true">฿</b>${NAME}</a><nav aria-label="เมนูหลัก"><a href="/#tools">เครื่องมือ</a><a href="/#guides">บทความ</a><a href="/about">เกี่ยวกับ</a></nav></div></header>
<main>${body}</main>
<footer class="foot"><div class="wrap"><span>${NAME} · ใช้ฟรี คำนวณในเบราว์เซอร์ของคุณ ไม่เก็บข้อมูลที่กรอก</span><span><a href="/about">เกี่ยวกับ</a> · <a href="/privacy">นโยบายความเป็นส่วนตัว</a></span></div></footer>
${scripts ? '<script src="/config.js"></script><script src="/calc.js"></script><script src="/tools.js"></script><script src="/app.js"></script>' : ""}
</body></html>`;
  fs.writeFileSync(path.join(__dirname, file), html);
  if (!noindex) pages.push({ p });
}

const defaults = (t) => Object.fromEntries(t.fields.map((x) => [x.id, x.value]));
function fieldHTML(fl) {
  if (fl.type === "check") return `<div class="f chk"><label><input id="f-${fl.id}" name="${fl.id}" type="checkbox"${fl.value ? " checked" : ""}> ${fl.label}</label></div>`;
  return `<div class="f"><label for="f-${fl.id}">${fl.label}</label><div class="in"><input id="f-${fl.id}" name="${fl.id}" type="number" inputmode="decimal" min="0" step="${fl.step || "any"}" value="${fl.value}"><span class="u">${fl.unit}</span></div></div>`;
}
function bench(t, vals) {
  const form = `<form class="blank" data-tool="${t.id}" aria-label="กรอกข้อมูล">${t.fields.map((x) => fieldHTML(vals ? { ...x, value: vals[x.id] ?? x.value } : x)).join("")}</form>`;
  const v = vals ? { ...defaults(t), ...vals } : defaults(t);
  const slip = `<div class="slipwrap"><section class="slip" data-slip="${t.id}" aria-live="polite" aria-label="ผลลัพธ์"><div class="slip-head"><span>สรุปผล</span><span>${NAME}</span></div><div class="slip-body">${slipHTML(t, t.compute(v))}</div><div class="slip-foot"><span>ประมาณการ ไม่ใช่คำปรึกษา</span><button type="button" class="copy">คัดลอกผล</button></div></section></div>`;
  return { form, slip };
}
const crumb = (cur) => `<nav class="crumb wrap" aria-label="เส้นทาง"><a href="/">หน้าแรก</a> › ${cur}</nav>`;
const H1 = (t) => t.split(" ").map((x) => `<span class="nb">${x}</span>`).join(" ");
const link = (id) => { const t = TOOLS.find((x) => x.id === id); return `<li><a href="/${id}">${t.name}</a></li>`; };

// ---------- tool pages
for (const t of TOOLS) {
  const c = CONTENT[t.id]; const { form, slip } = bench(t);
  let explain = c.explain;
  if (explain.includes("__BRACKETS__")) {
    let prev = 0;
    const rows = CONFIG.brackets.map(([cap, r]) => { const a = prev; prev = cap; return `<tr><td class="n">${cap === Infinity ? "มากกว่า " + f(a) : f(a) + " – " + f(cap)}</td><td class="n">${r * 100}%</td></tr>`; }).join("");
    explain = explain.replace("__BRACKETS__", `<table><tr><th>เงินได้สุทธิ (บาท)</th><th>อัตรา</th></tr>${rows}</table>`);
  }
  const g = Object.entries(GUIDES).find(([, v]) => v.tool === t.id);
  const body = `${crumb(t.name)}<div class="wrap bench"><div><h1>${H1(t.h1)}</h1><p class="lede">${t.lede}</p><div style="margin-top:30px">${form}</div></div>${slip}</div>
<div class="wrap"><div class="prose">${explain}<h2>คำถามที่พบบ่อย</h2>${c.faq.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join("")}</div>
<div class="next"><h2 style="margin-top:0;font-size:1.15rem">ลองต่อ</h2><ul>${t.next.map(link).join("")}${g ? `<li><a href="/${g[0]}">บทความ: ${g[1].title}</a></li>` : ""}</ul></div>
<p class="disc">ผลลัพธ์เป็นการประมาณเพื่อประกอบการวางแผน ไม่ใช่คำปรึกษาด้านภาษีหรือการเงิน</p></div>`;
  shell({ file: `${t.id}.html`, p: `/${t.id}`, title: t.title, desc: t.desc, body, scripts: true,
    jsonld: [ld({ "@context": "https://schema.org", "@type": "WebApplication", name: t.name, url: `${SITE}/${t.id}`, description: t.desc, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "th", offers: { "@type": "Offer", price: "0", priceCurrency: "THB" } }),
      crumbLD([["หน้าแรก", "/"], [t.name, "/" + t.id]]), faqLD(c.faq)] });
}

// ---------- guides
for (const [slug, gd] of Object.entries(GUIDES)) {
  const tool = TOOLS.find((x) => x.id === gd.tool);
  const body = `${crumb(gd.title)}<div class="wrap"><article class="prose" style="padding-top:12px">${gd.html}${tool ? `<p style="margin-top:28px"><a href="/${tool.id}"><b>ลองคำนวณ: ${tool.name}</b></a></p>` : ""}</article>
<div class="next"><h2 style="margin-top:0;font-size:1.15rem">ลองต่อ</h2><ul>${(tool ? tool.next : []).map(link).join("")}</ul></div></div>`;
  shell({ file: `${slug}.html`, p: `/${slug}`, title: gd.title, desc: gd.desc, body,
    jsonld: [ld({ "@context": "https://schema.org", "@type": "Article", headline: gd.title, description: gd.desc, inLanguage: "th", dateModified: TODAY, author: { "@type": "Organization", name: NAME }, mainEntityOfPage: `${SITE}/${slug}` }), crumbLD([["หน้าแรก", "/"], [gd.title, "/" + slug]])] });
}

// ---------- salary take-home pages (computed, answer-first)
const salT = TOOLS.find((x) => x.id === "salary");
const salData = (s) => {
  const a = Calc.annualTax(s, 0), ss = Calc.socialSecurity(s), taxM = a.tax / 12, net = s - ss - taxM;
  let prev = 0; const walk = [];
  for (const [cap, r] of CONFIG.brackets) { if (a.net > prev) walk.push({ from: prev, to: Math.min(a.net, cap), r, tax: (Math.min(a.net, cap) - prev) * r }); prev = cap; }
  return { a, ss, taxM, net, walk, top: walk.length ? walk[walk.length - 1].r : 0 };
};
for (const s of SAL) {
  const d = salData(s), { a } = d, fs_ = f(s);
  const { form, slip } = bench(salT, { salary: s });
  const answer = `เงินเดือน ${fs_} บาท หลังหักประกันสังคม ${f(d.ss)} บาทและภาษีโดยประมาณ ${f(d.taxM)} บาท จะรับสุทธิประมาณ <b>${f(d.net)} บาท</b>ต่อเดือน`;
  const taxQ = a.tax === 0 ? `ไม่ต้องเสียภาษี เพราะเงินได้สุทธิต่อปีประมาณ ${f(a.net)} บาท ไม่เกิน 150,000 บาท`
    : `ต้องเสียภาษีประมาณ ${f(a.tax)} บาทต่อปี (เฉลี่ย ${f(d.taxM)} บาทต่อเดือน) เงินได้สุทธิ ${f(a.net)} บาทอยู่ในขั้นภาษี ${d.top * 100}%`;
  const faq = [[`เงินเดือน ${fs_} บาท ต้องเสียภาษีไหม`, taxQ],
    [`เงินเดือน ${fs_} บาท ประกันสังคมหักเท่าไร`, `หักประมาณ ${f(d.ss)} บาทต่อเดือน (5% ของค่าจ้างภายใต้เพดานที่กำหนด รวม ${f(a.ss)} บาทต่อปี)`],
    [`เงินเดือน ${fs_} บาท รับสุทธิต่อปีเท่าไร`, `ประมาณ ${f(d.net * 12)} บาทต่อปี หลังหักประกันสังคมและภาษี`]];
  const rowsA = [["เงินได้ต่อปี", a.gross], ["หักค่าใช้จ่ายเหมา", -a.expense], ["หักค่าลดหย่อนส่วนตัว", -CONFIG.personalAllowance], ["หักประกันสังคมทั้งปี", -a.ss], ["เงินได้สุทธิ", a.net]];
  const walkT = d.walk.length ? `<table><tr><th>ช่วงเงินได้สุทธิ</th><th>อัตรา</th><th>ภาษี (บาท)</th></tr>${d.walk.map((w) => `<tr><td class="n">${f(w.from)} – ${f(w.to)}</td><td class="n">${w.r * 100}%</td><td class="n">${f(w.tax)}</td></tr>`).join("")}</table>` : `<p>เงินได้สุทธิไม่เกิน 150,000 บาท จึงไม่มีช่วงที่ต้องเสียภาษี</p>`;
  const cmp = SAL.map((x) => { const y = salData(x); return `<tr><td>${x === s ? `<b>${f(x)}</b>` : `<a href="/take-home-${x}">${f(x)}</a>`}</td><td class="n">${f(y.net)}</td></tr>`; }).join("");
  const body = `${crumb(`เงินเดือน ${fs_}`)}<div class="wrap bench"><div><h1>${H1(`เงินเดือน ${fs_} บาท รับสุทธิเท่าไร`)}</h1><p class="lede">${answer}</p><div style="margin-top:30px">${form}</div><p class="mut" style="margin-top:18px">แก้ตัวเลขเงินเดือนในช่องเพื่อลองจำนวนอื่นได้ทันที</p></div>${slip}</div>
<div class="wrap"><div class="prose"><h2>คิดทีละขั้นสำหรับเงินเดือน ${fs_} บาท</h2>
<table><tr><th>รายการ</th><th>บาทต่อปี</th></tr>${rowsA.map(([l, v]) => `<tr><td>${l}</td><td class="n">${v < 0 ? "−" : ""}${f(Math.abs(v))}</td></tr>`).join("")}</table>
<h3>ภาษีตามขั้นบันได</h3>${walkT}
<p>รวมภาษีต่อปี <b>${f(a.tax)}</b> บาท หรือเฉลี่ย ${f(d.taxM)} บาทต่อเดือน</p>
<h2>เงินเดือนอื่นที่คนค้นบ่อย</h2><table><tr><th>เงินเดือน (บาท)</th><th>รับสุทธิต่อเดือน</th></tr>${cmp}</table>
<h2>คำถามที่พบบ่อย</h2>${faq.map(([q, x]) => `<h3>${q}</h3><p>${x}</p>`).join("")}
<p class="mut">สมมติฐาน: มีเฉพาะเงินเดือน ไม่มีโบนัสหรือค่าลดหย่อนอื่นนอกจากส่วนตัวและประกันสังคม และเฉลี่ยภาษีเท่ากันทุกเดือน ภาษีที่นายจ้างหักจริงอาจต่างเล็กน้อย</p></div>
<div class="next"><ul>${["tax", "tax-saving", "loan"].map(link).join("")}</ul></div></div>`;
  shell({ file: `take-home-${s}.html`, p: `/take-home-${s}`, title: `เงินเดือน ${fs_} บาท รับสุทธิเท่าไร หลังหักภาษีและประกันสังคม`,
    desc: `เงินเดือน ${fs_} บาท หลังหักประกันสังคมและภาษี รับสุทธิประมาณ ${f(d.net)} บาทต่อเดือน พร้อมวิธีคิดทีละขั้น`, body, scripts: true,
    jsonld: [faqLD(faq), crumbLD([["หน้าแรก", "/"], [`เงินเดือน ${fs_}`, `/take-home-${s}`]]), ld({ "@context": "https://schema.org", "@type": "WebPage", name: `เงินเดือน ${fs_} บาท รับสุทธิเท่าไร`, url: `${SITE}/take-home-${s}`, inLanguage: "th" })] });
}

// ---------- home
const hero = bench(salT);
const tocRows = (items) => items.map((x) => `<a class="toc-row" href="${x.href}" data-find="${esc(x.find)}"><span class="n">${x.n}</span><span class="lead" aria-hidden="true"></span><span class="d">${x.d}</span></a>`).join("");
const home = `<div class="wrap hero"><div><h1>${H1("เงินเดือนเท่านี้ เหลือเข้าบัญชีเท่าไร")}</h1><p class="lede">ใส่เงินเดือน ดูยอดสุทธิหลังหักประกันสังคมและภาษีทันที ฟรี ไม่ต้องสมัคร ข้อมูลที่กรอกไม่ถูกส่งออกจากเครื่องของคุณ</p><div class="blank" style="max-width:none">${hero.form}</div></div>${hero.slip}</div>
<div class="wrap" id="tools"><div class="toc-head"><h2 style="margin:0">เครื่องมือทั้งหมด</h2><div class="find"><label for="q" class="mut" style="display:block">ค้นหา</label><input id="q" type="search" placeholder="เช่น ภาษี ผ่อนบ้าน" autocomplete="off"></div></div>
${GROUPS.map((gname) => `<section class="toc-group"><h2>${gname}</h2>${tocRows(TOOLS.filter((t) => t.group === gname).map((t) => ({ href: "/" + t.id, n: t.name, d: t.short, find: `${t.name} ${t.short} ${t.title}` })))}</section>`).join("")}
<p id="empty" class="mut" hidden>ไม่พบเครื่องมือที่ตรงกับคำค้น</p></div>
<div class="wrap band"><h2 style="font-size:1.15rem">เงินเดือนยอดนิยม รับสุทธิเท่าไร</h2><ul class="chips">${SAL.map((s) => `<li><a href="/take-home-${s}">${f(s)}</a></li>`).join("")}</ul></div>
<div class="wrap" id="guides"><div class="toc-head"><h2 style="margin:0">บทความ</h2></div><section class="toc-group">${tocRows(Object.entries(GUIDES).map(([k, v]) => ({ href: "/" + k, n: v.title, d: "", find: v.title })))}</section></div>
<div class="wrap"><p class="disc" style="padding-top:28px">ผลลัพธ์เป็นการประมาณเพื่อประกอบการวางแผน ไม่ใช่คำปรึกษาด้านภาษีหรือการเงิน</p></div>`;
shell({ file: "index.html", p: "/", title: `${NAME} | คำนวณภาษี เงินเดือนสุทธิ ค่างวด ฟรี`, desc: "เครื่องมือคำนวณการเงินส่วนบุคคลสำหรับคนไทย ฟรี: เงินเดือนสุทธิ ภาษีเงินได้ ค่างวดผ่อนบ้าน รีไฟแนนซ์ VAT ดอกเบี้ยทบต้น", body: home, scripts: true,
  jsonld: [ld({ "@context": "https://schema.org", "@type": "WebSite", name: NAME, url: SITE + "/", inLanguage: "th" })] });

// ---------- static pages
shell({ file: "about.html", p: "/about", title: "เกี่ยวกับเว็บไซต์", desc: `เกี่ยวกับ${NAME}`, body: `${crumb("เกี่ยวกับ")}<div class="wrap"><div class="prose"><h1>เกี่ยวกับเว็บไซต์</h1><p>${NAME}เป็นชุดเครื่องมือคำนวณการเงินส่วนบุคคลฟรี คำนวณทั้งหมดในเบราว์เซอร์ของคุณ ไม่ส่งข้อมูลที่กรอกไปที่ใด</p><p>ค่าตามกฎหมาย เช่น อัตราภาษีและเพดานประกันสังคม อยู่ในไฟล์เดียว และมีการตรวจทานทุกเดือน ผลลัพธ์เป็นการประมาณเพื่อประกอบการวางแผนเท่านั้น ไม่ใช่คำปรึกษาด้านภาษี กฎหมาย หรือการลงทุน หากพบตัวเลขไม่ตรงกับประกาศทางการ โปรดแจ้งผ่านหน้า GitHub ของโครงการ</p></div></div>` });
shell({ file: "privacy.html", p: "/privacy", title: "นโยบายความเป็นส่วนตัว", desc: "นโยบายความเป็นส่วนตัวของเว็บไซต์", body: `${crumb("นโยบายความเป็นส่วนตัว")}<div class="wrap"><div class="prose"><h1>นโยบายความเป็นส่วนตัว</h1><p>เว็บนี้คำนวณในเบราว์เซอร์ของคุณ ข้อมูลที่กรอกไม่ถูกส่งไปเก็บที่เซิร์ฟเวอร์ ผู้ให้บริการโฮสติ้งอาจเก็บบันทึกการเข้าชมตามปกติ เช่น ที่อยู่ IP และหน้าที่เปิด เพื่อความปลอดภัยและสถิติการใช้งาน</p></div></div>` });
fs.writeFileSync("404.html", `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ไม่พบหน้า | ${NAME}</title><meta name="robots" content="noindex"><link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap" style="padding-block:64px"><h1>ไม่พบหน้าที่ต้องการ</h1><p class="lede"><a href="/">กลับหน้าแรกเพื่อเลือกเครื่องมือ</a></p></main></body></html>`);

// ---------- sitemap + robots
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((x) => `<url><loc>${SITE + (x.p === "/" ? "/" : x.p)}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`built ${pages.length} pages for ${SITE}`);
