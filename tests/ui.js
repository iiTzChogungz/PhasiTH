const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
for(const pg of ['tax','salary','loan','refinance','vat','savings','withholding','tax-saving','freelance-rate','overtime','debt-payoff']){
 await p.goto('http://localhost:8765/'+pg+'.html');await p.click('#b, #btn');
 const r=await p.textContent('#r');const w=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 console.log(pg,'|',r.replace(/\s+/g,' ').slice(0,90),w?'OVERFLOW':'');}
await p.goto('http://localhost:8765/');await p.screenshot({path:process.argv[2]+'/home.png'});
console.log('errors:',errs.length?errs:'none');await b.close()})();
