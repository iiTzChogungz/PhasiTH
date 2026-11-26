# ภาษีTH (PhasiTH)

เว็บคำนวณการเงินส่วนบุคคลสำหรับคนไทย ฟรี สแตติกล้วน (Vercel)

- สร้างหน้าทั้งหมด: `node build.js https://phasith.vercel.app` (สร้าง .html, sitemap.xml, robots.txt)
- ตรวจอัตโนมัติ: `node check.js` (สูตร, ลิงก์, JSON-LD, คอนทราสต์ WCAG AA, หน้าเงินเดือน)
- ทดสอบหน้าจอจริง: `node tests/serve.js &` แล้ว `NODE_PATH=$(npm root -g) node tests/ui.js`
- ค่าตามกฎหมาย (อัตราภาษี, เพดานประกันสังคม) อยู่ที่ `config.js` ที่เดียว
- ดีไซน์: ดู `DESIGN.md`
- ภาพตัวอย่างแชร์และไอคอน: `NODE_PATH=$(npm root -g) node tools/og.js` (ต้องมี Playwright, ผลลัพธ์ commit ลง `og/` และ `icons/`)
- เพิ่มสปอนเซอร์: แก้ `content/sponsors.json` แล้ว `node build.js`
- แก้ข้อมูลผู้สร้าง: `content/creator.json`
