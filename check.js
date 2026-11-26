// ตรวจอัตโนมัติ: สูตร, ลิงก์ภายใน (clean URL), JSON-LD, คอนทราสต์สี, หน้าเงินเดือน   ใช้: node check.js
const fs=require("fs");global.window=global;require("./config.js");const C=require("./calc.js");const {TOOLS}=require("./tools.js");
let bad=0;const ok=(c,m)=>{if(!c){console.log("FAIL",m);bad++}};
// สูตร
ok(C.incomeTax(440000)===21500,"tax 440k = 21,500 (ตัวอย่างอ้างอิง)");ok(C.incomeTax(150000)===0,"exempt");ok(C.incomeTax(750000)===65000,"750k = 65,000 (rd.go.th)");
ok(Math.abs(C.vat(107,.07,true).base-100)<1e-9,"vat");ok(C.socialSecurity(50000)===CONFIG.socialSecurity.monthlyMax,"ss cap");
for(const t of TOOLS){const v=Object.fromEntries(t.fields.map(f=>[f.id,f.value]));const r=t.compute(v);
 ok(r.rows.every(x=>!/NaN|Infinity/.test(x.v)),"tool "+t.id+" NaN");ok(r.key>=0&&r.key<r.rows.length||t.id==="debt-payoff","tool "+t.id+" key");}
// หน้า
const pages=fs.readdirSync(".").filter(x=>x.endsWith(".html"));
const exists=u=>u==="/"||fs.existsSync("."+u+".html")||fs.existsSync("."+u);
for(const f of pages){const h=fs.readFileSync(f,"utf8");
 for(const m of h.matchAll(/href="(\/[^"#?]*)/g))ok(exists(m[1]),f+" -> "+m[1]);
 for(const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){try{JSON.parse(m[1])}catch(e){ok(0,f+" JSON-LD invalid")}}
 if(f!=="404.html"){ok(/<title>.+<\/title>/.test(h),f+" title");ok(/rel="canonical"/.test(h),f+" canonical");ok(/<h1[ >]/.test(h),f+" h1");ok((h.match(/<h1[ >]/g)||[]).length===1,f+" one h1");}
 if(/^take-home-/.test(f)){const text=h.replace(/<[^>]+>/g," ");ok(text.length>2500,f+" thin");ok(/ประมาณ [\d,.]+ บาท/.test(text),f+" answer");}}
// ไฟล์ประกอบ
for(const f of pages.filter(x=>x!=="404.html"))ok(fs.existsSync("og/"+f.replace(".html",".png")),"og image "+f);
const man=JSON.parse(fs.readFileSync("manifest.webmanifest","utf8"));for(const i of man.icons)ok(fs.existsSync("."+i.src),"icon "+i.src);
ok(fs.existsSync("sw.js")&&fs.existsSync("llms.txt"),"sw/llms");
ok(!pages.some(f=>/เครื่องมือเงินไทย/.test(fs.readFileSync(f,"utf8"))),"old brand name remains");
// ซ้ำกัน: หน้าเงินเดือนต้องไม่เหมือนกัน
const sal=pages.filter(f=>/^take-home-/.test(f)).map(f=>fs.readFileSync(f,"utf8").match(/<meta name="description" content="(.*?)"/)[1]);
ok(new Set(sal).size===sal.length,"duplicate descriptions");
// คอนทราสต์ WCAG AA
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const R=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const pairs={light:[["#16201C","#E9EEEB"],["#4B5951","#E9EEEB"],["#1D3CB8","#E9EEEB"],["#4B5951","#FFFFFF"],["#1D3CB8","#FFFFFF"],["#16201C","#FFE45C"]],
 dark:[["#E8EFEB","#0F1512"],["#A3B1AA","#0F1512"],["#9DB2FF","#0F1512"],["#A3B1AA","#17201C"],["#9DB2FF","#17201C"],["#16201C","#F2D24B"]]};
for(const [k,ps] of Object.entries(pairs))for(const [a,b] of ps)ok(R(a,b)>=4.5,`contrast ${k} ${a}/${b} = ${R(a,b).toFixed(2)}`);
console.log(bad?bad+" problems":"all ok");process.exit(bad?1:0);
