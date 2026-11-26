// ตรวจสอบอัตโนมัติ: ลิงก์ภายในไม่เสีย + สูตรคำนวณถูกต้อง  ใช้: node check.js
const fs=require("fs");global.window=global;require("./config.js");const C=require("./calc.js");
let bad=0;const ok=(c,m)=>{if(!c){console.log("FAIL",m);bad++}};
ok(C.incomeTax(440000)===21500,"tax 440k = 21,500 (ตัวอย่างอ้างอิง)");ok(C.incomeTax(150000)===0,"tax exempt");ok(C.incomeTax(750000)===65000,"tax 750k = 65,000 (rd.go.th)");ok(Math.abs(C.vat(107,.07,true).base-100)<1e-9,"vat");
ok(C.socialSecurity(50000)===CONFIG.socialSecurity.monthlyMax,"ss cap");
for(const f of fs.readdirSync(".").filter(x=>x.endsWith(".html")))
 for(const m of fs.readFileSync(f,"utf8").matchAll(/href="([^"#:]+)"/g))
  if(!fs.existsSync(m[1])&&!m[1].endsWith(".css"))ok(0,f+" -> "+m[1]);
console.log(bad?bad+" problems":"all ok");process.exit(bad?1:0);
