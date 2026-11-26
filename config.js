// ค่าคงที่ทางกฎหมาย — ตรวจสอบกับกรมสรรพากร/สำนักงานประกันสังคมทุกต้นปี แล้วแก้ที่นี่ที่เดียว
window.CONFIG = {
  year: 2026,
  verified: { socialSecurity: '2026-11 (จากข่าว)', taxBrackets: 'ยังไม่ยืนยันกับ rd.go.th' },
  brackets: [ // [เพดานเงินได้สุทธิ, อัตรา]
    [150000, 0], [300000, 0.05], [500000, 0.10], [750000, 0.15],
    [1000000, 0.20], [2000000, 0.25], [5000000, 0.30], [Infinity, 0.35]
  ],
  personalAllowance: 60000,
  expenseRate: 0.5, expenseCap: 100000,
  socialSecurity: { rate: 0.05, wageCap: 17500, monthlyMax: 875 }, // เพดาน 17,500 ช่วง 2569-2571 (ข่าว: ไทยรัฐ/ประชาชาติ) ยืนยันกับ sso.go.th
  siteName: "เครื่องมือเงินไทย",
  // ลิงก์ affiliate: ใส่ url หลังสมัครโปรแกรมแล้ว (เว้นว่าง = ไม่แสดง) pages = หน้าที่จะแสดง (ว่าง = ทุกหน้า)
  affiliates: [
    { title: "ปลดหนี้/รีไฟแนนซ์: เปรียบเทียบสินเชื่อ", desc: "ดูข้อเสนอสินเชื่อและบัตรจากพาร์ทเนอร์", url: "", pages: ["refinance.html","loan.html","debt-payoff.html","guide-refinance.html","guide-debt.html"] },
    { title: "ออมและลงทุน: เปรียบเทียบบัญชี/กองทุน", desc: "ดูผลิตภัณฑ์ออมเงินจากพาร์ทเนอร์", url: "", pages: ["savings.html","guide-compound.html","tax-saving.html","guide-tax-deductions.html"] },
    { title: "อุปกรณ์สำหรับฟรีแลนซ์/ทำงานที่บ้าน", desc: "สินค้าแนะนำบน Shopee/Lazada", url: "", pages: ["freelance-rate.html","guide-freelance-pricing.html","withholding.html","guide-withholding.html"] }
  ],
  adsenseClient: "" // ใส่ ca-pub-xxxx เมื่ออนุมัติแล้ว
};
