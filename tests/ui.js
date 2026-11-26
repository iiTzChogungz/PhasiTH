// รัน: node tests/serve.js & NODE_PATH=$(npm root -g) node tests/ui.js [โฟลเดอร์เก็บภาพ]
const {chromium}=require('playwright');const B='http://localhost:8765';
(async()=>{const b=await chromium.launch();let bad=0;
for(const [name,vp] of [['mobile',{width:390,height:800}],['small',{width:320,height:640}],['desktop',{width:1280,height:900}]]){
 const p=await b.newPage({viewport:vp});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/fonts|net::|ERR_/.test(m.text())&&errs.push(m.text()));
 const tools=['salary','tax','tax-saving','withholding','vat','loan','refinance','debt-payoff','savings','freelance-rate','overtime'];
 for(const pg of [...tools,'take-home-30000','take-home-15000']){
  await p.goto(B+'/'+pg);
  const inp=await p.$('.in input');await inp.fill('50000');await p.waitForTimeout(120);
  const key=await p.$$eval('.slip .key strong',e=>e.length),rows=await p.$$eval('.slip .r',e=>e.length);
  const ow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(!(key===1||pg==='debt-payoff')||ow){errs.push(`BAD ${pg} key=${key} rows=${rows} overflow=${ow}`)}}
 for(const pg of ['about','advertise']){await p.goto(B+'/'+pg);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+pg)}
 await p.goto(B+'/salary');const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null),p.click('.save')]);
 if(!dl)errs.push('no image download');else{const f=await dl.path();const sz=require('fs').statSync(f).size;if(sz<20000)errs.push('image too small '+sz);if(process.argv[2]&&name==='desktop')await dl.saveAs(process.argv[2]+'/share.png')}
 await p.goto(B+'/');await p.fill('#q','ภาษี');
 const vis=await p.$$eval('.toc-row[data-find]',e=>e.filter(x=>!x.hidden).length);if(vis<4)errs.push('search '+vis);
 await p.fill('#q','');
 if(process.argv[2]){await p.goto(B+'/');await p.waitForTimeout(1100);await p.screenshot({path:process.argv[2]+`/home-${name}.png`,fullPage:true});
  await p.goto(B+'/tax');await p.screenshot({path:process.argv[2]+`/tax-${name}.png`,fullPage:true});}
 console.log(name,errs.length?errs:'ok');bad+=errs.length;await p.close();}
await b.close();process.exit(bad?1:0)})();
