/* นิยามเครื่องมือ (ใช้ทั้งในเบราว์เซอร์และตอน build) */
(function (g) {
  const f = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const C = () => g.Calc;
  const GROUPS = ["ภาษี", "สินเชื่อและหนี้", "ออมเงิน", "ทำงานและรายได้"];

  const TOOLS = [
    { id: "salary", group: "ภาษี", name: "เงินเดือนสุทธิ", short: "หลังหักประกันสังคมและภาษี",
      title: "คำนวณเงินเดือนสุทธิ หลังหักภาษีและประกันสังคม",
      h1: "เงินเดือนเท่านี้ เหลือเข้าบัญชีเท่าไร",
      desc: "ใส่เงินเดือน ดูทันทีว่าหลังหักประกันสังคมและภาษีหัก ณ ที่จ่ายแล้วเหลือเข้าบัญชีเท่าไร ฟรี ไม่ต้องสมัคร",
      lede: "ใส่เงินเดือนก่อนหัก แล้วดูยอดที่ได้รับจริงต่อเดือน",
      fields: [{ id: "salary", label: "เงินเดือนก่อนหัก", value: 30000, unit: "บาท/เดือน" }],
      compute(v) {
        const h = C().takeHome(v.salary, 0);
        return { key: 2, rows: [
          { l: "เงินสมทบประกันสังคม", v: f(h.ss), u: "บาท" },
          { l: "ภาษีหัก ณ ที่จ่ายโดยประมาณ", v: f(h.taxM), u: "บาท" },
          { l: "รับสุทธิต่อเดือน", v: f(h.net), u: "บาท" },
          { l: "รับสุทธิต่อปี", v: f(h.net * 12), u: "บาท" }] };
      }, next: ["tax", "tax-saving", "loan"] },

    { id: "tax", group: "ภาษี", name: "ภาษีเงินได้บุคคลธรรมดา", short: "จากเงินเดือน ตามอัตราขั้นบันได",
      title: "คำนวณภาษีเงินได้บุคคลธรรมดา จากเงินเดือน",
      h1: "ภาษีเงินได้จากเงินเดือน ต้องจ่ายเท่าไร",
      desc: "คำนวณภาษีเงินได้บุคคลธรรมดาจากเงินเดือน ตามอัตราขั้นบันได หักค่าใช้จ่ายและค่าลดหย่อนให้อัตโนมัติ",
      lede: "ใส่เงินเดือนและค่าลดหย่อนอื่นต่อปี (ถ้ามี) ระบบหักค่าใช้จ่ายเหมาและลดหย่อนส่วนตัวให้เอง",
      fields: [{ id: "salary", label: "เงินเดือนต่อเดือน", value: 50000, unit: "บาท" },
               { id: "other", label: "ค่าลดหย่อนอื่นต่อปี (ประกัน กองทุน ฯลฯ)", value: 0, unit: "บาท" }],
      compute(v) {
        const a = C().annualTax(v.salary, v.other), c = g.CONFIG;
        const r = { key: 5, rows: [
          { l: "เงินได้ต่อปี", v: f(a.gross), u: "บาท" },
          { l: "หักค่าใช้จ่ายเหมา", v: f(a.expense), u: "บาท" },
          { l: "ลดหย่อนส่วนตัวและอื่นๆ", v: f(c.personalAllowance + (v.other || 0)), u: "บาท" },
          { l: "เงินสมทบประกันสังคม", v: f(a.ss), u: "บาท" },
          { l: "เงินได้สุทธิ", v: f(a.net), u: "บาท" },
          { l: "ภาษีที่ต้องจ่ายต่อปี", v: f(a.tax), u: "บาท" },
          { l: "เฉลี่ยต่อเดือน", v: f(a.tax / 12), u: "บาท" },
          { l: "อัตราภาษีที่แท้จริง", v: a.gross ? ((a.tax / a.gross) * 100).toFixed(2) : "0", u: "%" }] };
        if (a.tax === 0) r.note = "เงินได้สุทธิไม่เกิน 150,000 บาท จึงไม่ต้องเสียภาษี";
        return r;
      }, next: ["tax-saving", "salary", "withholding"] },

    { id: "tax-saving", group: "ภาษี", name: "ลดหย่อนภาษีประหยัดได้เท่าไร", short: "ใส่ยอดลดหย่อน ดูภาษีที่ลดลง",
      title: "คำนวณภาษีที่ประหยัดได้จากค่าลดหย่อนเพิ่ม",
      h1: "ลดหย่อนเพิ่ม ประหยัดภาษีได้เท่าไร",
      desc: "ใส่ยอดลดหย่อนเพิ่ม เช่น ประกัน กองทุน แล้วดูว่าภาษีลดลงเท่าไร",
      lede: "เทียบภาษีก่อนและหลังลดหย่อนเพิ่ม เพื่อตัดสินใจก่อนซื้อ",
      fields: [{ id: "salary", label: "เงินเดือนต่อเดือน", value: 60000, unit: "บาท" },
               { id: "extra", label: "ยอดลดหย่อนเพิ่มต่อปี", value: 50000, unit: "บาท" }],
      compute(v) {
        const x = C().taxSaved(v.salary, v.extra);
        return { key: 2, note: "เครื่องมือนี้ไม่ตรวจเพดานลดหย่อนแต่ละประเภท ตรวจกับกรมสรรพากรก่อนซื้อ",
          rows: [{ l: "ภาษีก่อนลดหย่อนเพิ่ม", v: f(x.before), u: "บาท" },
                 { l: "ภาษีหลังลดหย่อนเพิ่ม", v: f(x.after), u: "บาท" },
                 { l: "ประหยัดได้", v: f(x.saved), u: "บาท/ปี" }] };
      }, next: ["tax", "salary", "savings"] },

    { id: "withholding", group: "ภาษี", name: "ภาษีหัก ณ ที่จ่าย", short: "สำหรับฟรีแลนซ์ 1% 3% 5%",
      title: "คำนวณภาษีหัก ณ ที่จ่าย สำหรับฟรีแลนซ์",
      h1: "ถูกหัก ณ ที่จ่าย ได้เงินจริงเท่าไร",
      desc: "คำนวณภาษีหัก ณ ที่จ่าย 1% 3% 5% จากค่าจ้างฟรีแลนซ์ ดูยอดที่ได้รับจริง",
      lede: "ใส่ค่าจ้างและอัตราที่ลูกค้าหัก",
      fields: [{ id: "amt", label: "ค่าจ้างก่อนหัก", value: 10000, unit: "บาท" },
               { id: "rate", label: "อัตราหัก", value: 3, unit: "%", step: "0.5" }],
      compute(v) {
        const w = C().withholding(v.amt, v.rate);
        return { key: 1, rows: [{ l: "ภาษีที่ถูกหัก", v: f(w.wh), u: "บาท" },
                                { l: "ได้รับจริง", v: f(w.net), u: "บาท" }] };
      }, next: ["freelance-rate", "tax", "vat"] },

    { id: "vat", group: "ภาษี", name: "VAT 7%", short: "แยกหรือรวมภาษีมูลค่าเพิ่ม",
      title: "คำนวณ VAT 7% แบบรวมและแยกภาษี",
      h1: "คำนวณ VAT 7% รวมหรือแยกจากราคา",
      desc: "คำนวณภาษีมูลค่าเพิ่ม 7% ทั้งแบบราคายังไม่รวม VAT และราคารวม VAT แล้ว",
      lede: "ใส่ราคา แล้วเลือกว่าราคานั้นรวม VAT แล้วหรือยัง",
      fields: [{ id: "amt", label: "จำนวนเงิน", value: 1000, unit: "บาท" },
               { id: "inc", label: "ราคานี้รวม VAT แล้ว", type: "check", value: false }],
      compute(v) {
        const x = C().vat(v.amt, 0.07, v.inc);
        return { key: 2, rows: [{ l: "ราคาก่อน VAT", v: f(x.base), u: "บาท" },
                                { l: "VAT 7%", v: f(x.vat), u: "บาท" },
                                { l: "ราคารวม", v: f(x.total), u: "บาท" }] };
      }, next: ["withholding", "freelance-rate", "tax"] },

    { id: "loan", group: "สินเชื่อและหนี้", name: "ค่างวดผ่อนบ้าน/รถ", short: "ค่างวดและดอกเบี้ยรวม",
      title: "คำนวณค่างวดผ่อนบ้าน รถ และสินเชื่อ",
      h1: "ผ่อนเดือนละเท่าไร ดอกเบี้ยรวมเท่าไร",
      desc: "คำนวณค่างวดต่อเดือนและดอกเบี้ยรวมของสินเชื่อบ้าน รถ หรือสินเชื่อส่วนบุคคล",
      lede: "ใส่ยอดกู้ ดอกเบี้ย และจำนวนปีที่ผ่อน",
      fields: [{ id: "p", label: "ยอดกู้", value: 2000000, unit: "บาท" },
               { id: "i", label: "ดอกเบี้ยต่อปี", value: 6, unit: "%", step: "0.1" },
               { id: "y", label: "ระยะเวลา", value: 25, unit: "ปี" }],
      compute(v) {
        const l = C().loan(v.p, v.i, v.y);
        return { key: 0, rows: [{ l: "ค่างวดต่อเดือน", v: f(l.pay), u: "บาท" },
                                { l: "ดอกเบี้ยรวม", v: f(l.interest), u: "บาท" },
                                { l: "ยอดชำระรวม", v: f(l.total), u: "บาท" }] };
      }, next: ["refinance", "debt-payoff", "salary"] },

    { id: "refinance", group: "สินเชื่อและหนี้", name: "รีไฟแนนซ์บ้าน คุ้มไหม", short: "เทียบดอกเบี้ยและค่าธรรมเนียม",
      title: "คำนวณรีไฟแนนซ์บ้าน คุ้มหรือไม่",
      h1: "รีไฟแนนซ์บ้าน คุ้มหรือไม่คุ้ม",
      desc: "เทียบค่างวดเดิมกับค่างวดใหม่ หักค่าธรรมเนียมแล้วประหยัดจริงเท่าไร",
      lede: "ใส่หนี้คงเหลือ ดอกเบี้ยเดิมและใหม่ และค่าธรรมเนียมที่ต้องจ่าย",
      fields: [{ id: "b", label: "ยอดหนี้คงเหลือ", value: 2000000, unit: "บาท" },
               { id: "o", label: "ดอกเบี้ยเดิม", value: 6.5, unit: "%", step: "0.1" },
               { id: "n", label: "ดอกเบี้ยใหม่", value: 4.5, unit: "%", step: "0.1" },
               { id: "y", label: "ระยะเวลาที่เหลือ", value: 20, unit: "ปี" },
               { id: "fee", label: "ค่าธรรมเนียมรวม (ประเมิน จดจำนอง ฯลฯ)", value: 20000, unit: "บาท" }],
      compute(v) {
        const x = C().refinance(v.b, v.o, v.n, v.y, v.fee);
        const r = { key: 3, rows: [{ l: "ค่างวดเดิม", v: f(x.oldPay), u: "บาท" },
                                   { l: "ค่างวดใหม่", v: f(x.newPay), u: "บาท" },
                                   { l: "ประหยัดต่อเดือน", v: f(x.saveMonth), u: "บาท" },
                                   { l: "ประหยัดรวมหลังหักค่าธรรมเนียม", v: f(x.saveTotal), u: "บาท" }] };
        if (x.saveTotal <= 0) r.note = "ตามตัวเลขนี้ยังไม่คุ้มที่จะรีไฟแนนซ์";
        return r;
      }, next: ["loan", "debt-payoff", "savings"] },

    { id: "debt-payoff", group: "สินเชื่อและหนี้", name: "เวลาปลดหนี้", short: "จ่ายเดือนละเท่าไร หมดหนี้เมื่อไร",
      title: "คำนวณเวลาปลดหนี้บัตรเครดิตและสินเชื่อ",
      h1: "จ่ายเดือนละเท่านี้ หมดหนี้เมื่อไร",
      desc: "ดูว่าต้องใช้กี่เดือนจึงปลดหนี้หมด และเสียดอกเบี้ยรวมเท่าไร",
      lede: "ใส่ยอดหนี้ ดอกเบี้ย และยอดที่จ่ายจริงต่อเดือน",
      fields: [{ id: "d", label: "ยอดหนี้", value: 100000, unit: "บาท" },
               { id: "i", label: "ดอกเบี้ยต่อปี", value: 16, unit: "%", step: "0.1" },
               { id: "p", label: "จ่ายต่อเดือน", value: 5000, unit: "บาท" }],
      compute(v) {
        const x = C().debtMonths(v.d, v.i, v.p);
        if (x.months === Infinity) return { key: -1, note: "ยอดที่จ่ายไม่พอแม้แต่ดอกเบี้ย หนี้จะไม่ลดลง ต้องจ่ายเพิ่ม", rows: [] };
        return { key: 0, rows: [{ l: "ปลดหนี้ได้ใน", v: String(x.months), u: "เดือน" },
                                { l: "คิดเป็น", v: (x.months / 12).toFixed(1), u: "ปี" },
                                { l: "ดอกเบี้ยรวม", v: f(x.interest), u: "บาท" }] };
      }, next: ["loan", "refinance", "salary"] },

    { id: "savings", group: "ออมเงิน", name: "ดอกเบี้ยทบต้น / ออมรายเดือน", short: "ดูเงินสะสมระยะยาว",
      title: "คำนวณดอกเบี้ยทบต้นและเงินออมรายเดือน",
      h1: "ออมเดือนละเท่านี้ อีกกี่ปีได้เท่าไร",
      desc: "คำนวณเงินสะสมจากการออมรายเดือนและดอกเบี้ยทบต้นในระยะยาว",
      lede: "ใส่เงินต้น เงินออมต่อเดือน ผลตอบแทน และจำนวนปี",
      fields: [{ id: "p", label: "เงินต้น", value: 0, unit: "บาท" },
               { id: "m", label: "ออมเพิ่มต่อเดือน", value: 5000, unit: "บาท" },
               { id: "i", label: "ผลตอบแทนต่อปี", value: 4, unit: "%", step: "0.1" },
               { id: "y", label: "ระยะเวลา", value: 20, unit: "ปี" }],
      compute(v) {
        const c = C().compound(v.p, v.m, v.i, v.y);
        return { key: 0, note: "ผลตอบแทนจริงไม่แน่นอน ตัวเลขนี้เป็นการสมมติ",
          rows: [{ l: "เงินสะสมรวม", v: f(c.balance), u: "บาท" },
                 { l: "เงินที่ลงไปเอง", v: f(c.invested), u: "บาท" },
                 { l: "ผลตอบแทน", v: f(c.gain), u: "บาท" }] };
      }, next: ["tax-saving", "loan", "salary"] },

    { id: "freelance-rate", group: "ทำงานและรายได้", name: "ราคาฟรีแลนซ์ต่อชั่วโมง", short: "ตั้งราคาให้ถึงรายได้เป้าหมาย",
      title: "คำนวณราคาฟรีแลนซ์ต่อชั่วโมง",
      h1: "ฟรีแลนซ์ควรตั้งราคาชั่วโมงละเท่าไร",
      desc: "คำนวณราคาต่อชั่วโมงที่ต้องเรียกเก็บ เพื่อให้ได้รายได้ตามเป้าหลังหักค่าใช้จ่ายและภาษีหัก ณ ที่จ่าย",
      lede: "ใส่รายได้ที่อยากได้ ค่าใช้จ่ายธุรกิจ และชั่วโมงที่เรียกเก็บเงินได้จริง",
      fields: [{ id: "t", label: "รายได้ที่ต้องการต่อเดือน", value: 40000, unit: "บาท" },
               { id: "x", label: "ค่าใช้จ่ายธุรกิจต่อเดือน", value: 5000, unit: "บาท" },
               { id: "h", label: "ชั่วโมงที่เรียกเก็บเงินได้ต่อเดือน", value: 80, unit: "ชม." },
               { id: "w", label: "อัตราหัก ณ ที่จ่ายที่คาด", value: 3, unit: "%" }],
      compute(v) {
        const q = C().freelanceRate(v.t, v.h, v.x, v.w);
        return { key: 0, rows: [{ l: "ควรตั้งราคา", v: f(q.perHour), u: "บาท/ชม." },
                                { l: "ยอดที่ต้องออกบิลต่อเดือน", v: f(q.perMonth), u: "บาท" }] };
      }, next: ["withholding", "vat", "tax"] },

    { id: "overtime", group: "ทำงานและรายได้", name: "ค่าล่วงเวลา (OT)", short: "จากเงินเดือนและจำนวนชั่วโมง",
      title: "คำนวณค่าล่วงเวลา (OT)",
      h1: "ทำ OT กี่ชั่วโมง ได้เงินเท่าไร",
      desc: "คำนวณค่าล่วงเวลาจากเงินเดือน จำนวนชั่วโมง และตัวคูณ",
      lede: "ใส่เงินเดือน ชั่วโมง OT และตัวคูณ (เช่น 1.5 สำหรับวันทำงานปกติ)",
      fields: [{ id: "m", label: "เงินเดือน", value: 20000, unit: "บาท" },
               { id: "hr", label: "ชั่วโมง OT", value: 10, unit: "ชม." },
               { id: "k", label: "ตัวคูณ", value: 1.5, unit: "เท่า", step: "0.5" }],
      compute(v) {
        const o = C().overtime(v.m, v.hr, v.k);
        return { key: 1, note: "ตัวคูณตามกฎหมายแรงงานขึ้นกับประเภทวันและลูกจ้าง ตรวจกับกรมสวัสดิการและคุ้มครองแรงงาน",
          rows: [{ l: "ค่าจ้างต่อชั่วโมง", v: f(o.hourly), u: "บาท" },
                 { l: "ค่า OT", v: f(o.pay), u: "บาท" }] };
      }, next: ["salary", "tax", "freelance-rate"] }
  ];

  function readValues(tool, root) {
    const v = {};
    tool.fields.forEach((fl) => {
      const el = root.querySelector("#f-" + fl.id);
      v[fl.id] = fl.type === "check" ? !!(el && el.checked) : parseFloat(el && el.value) || 0;
    });
    return v;
  }
  function slipHTML(tool, res) {
    const rows = res.rows.filter((_, i) => i !== res.key), key = res.rows[res.key];
    const body = rows.length || key ? `<dl class="rows">${res.rows.map((r, i) => i === res.key ? "" : `<div class="r"><dt>${r.l}</dt><span class="lead" aria-hidden="true"></span><dd>${r.v}<small>${r.u}</small></dd></div>`).join("")}</dl>${key ? `<div class="key"><span>${key.l}</span><strong>${key.v}<small>${key.u}</small></strong></div>` : ""}` : "";
    return body + (res.note ? `<p class="note">${res.note}</p>` : "");
  }
  g.TOOLS = TOOLS; g.GROUPS = GROUPS; g.fmt = f; g.readValues = readValues; g.slipHTML = slipHTML;
  if (typeof module !== "undefined") module.exports = { TOOLS, GROUPS, fmt: f, slipHTML };
})(typeof window !== "undefined" ? window : global);
