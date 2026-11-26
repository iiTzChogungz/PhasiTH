// เซิร์ฟเวอร์ทดสอบที่ทำ clean URL แบบเดียวกับ Vercel:  node tests/serve.js [พอร์ต]
const http=require("http"),fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");const types={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".xml":"text/xml",".txt":"text/plain"};
http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split("?")[0]);if(u==="/")u="/index";
 let f=path.join(root,u);if(!path.extname(f))f+=".html";
 if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404,{"content-type":"text/html"});return r.end(fs.readFileSync(path.join(root,"404.html")))}
 r.writeHead(200,{"content-type":types[path.extname(f)]||"text/plain"});r.end(fs.readFileSync(f))}).listen(+process.argv[2]||8765);
