# ภาษีTH (PhasiTH)

เว็บคำนวณการเงินส่วนบุคคลสำหรับคนไทย ฟรี สแตติกล้วน (Vercel)

- สร้างหน้าทั้งหมด: `node build.js https://phasith.vercel.app` (สร้าง .html, sitemap.xml, robots.txt)
- ตรวจอัตโนมัติ: `node check.js` (สูตร, ลิงก์, JSON-LD, คอนทราสต์ WCAG AA, หน้าเงินเดือน)
- ทดสอบหน้าจอจริง: `node tests/serve.js &` แล้ว `NODE_PATH=$(npm root -g) node tests/ui.js`
- ค่าตามกฎหมาย (อัตราภาษี, เพดานประกันสังคม) อยู่ที่ `config.js` ที่เดียว
- ดีไซน์: ดู `DESIGN.md`
