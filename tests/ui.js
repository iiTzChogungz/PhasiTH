// รัน: python3 -m http.server 8765 & NODE_PATH=$(npm root -g) node tests/ui.js [โฟลเดอร์เก็บภาพ]
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [name,vp] of [['mobile',{width:390,height:800}],['desktop',{width:1280,height:900}]]){
 const p=await b.newPage({viewport:vp});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/fonts|net::/.test(m.text())&&errs.push(m.text()));
 for(const pg of ['tax','salary','loan','refinance','vat','savings','withholding','tax-saving','freelance-rate','overtime','debt-payoff']){
  await p.goto('http://localhost:8765/'+pg+'.html');
  const first=await p.$('.card input[type=number]');await first.fill('50000');await p.waitForTimeout(350);
  const rows=await p.$$eval('#r .row',e=>e.length);const key=await p.$$eval('#r .row.key',e=>e.length);
  const ow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(name==='mobile'||pg==='tax')console.log(name,pg,'rows',rows,'key',key,ow?'OVERFLOW':'');
  if(!rows||key!==1||ow)errs.push('BAD '+pg);
  if(process.argv[2]&&pg==='tax')await p.screenshot({path:process.argv[2]+`/tax-${name}.png`,fullPage:true});}
 await p.goto('http://localhost:8765/');
 await p.fill('#q','ภาษี');const vis=await p.$$eval('#grid .tile',e=>e.filter(x=>x.style.display!=='none').length);console.log(name,'search ภาษี ->',vis,'tiles');
 await p.fill('#q','');
 if(process.argv[2])await p.screenshot({path:process.argv[2]+`/home-${name}.png`,fullPage:true});
 console.log(name,'errors:',errs.length?errs:'none');await p.close();}
await b.close()})();
