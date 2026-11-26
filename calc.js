(function (g) {
  const C = () => g.CONFIG;
  function incomeTax(net) {
    let prev = 0, tax = 0;
    for (const [cap, r] of C().brackets) {
      if (net > prev) tax += (Math.min(net, cap) - prev) * r;
      prev = cap;
    }
    return tax;
  }
  function annualTax(salaryMonthly, otherDeduct) {
    const c = C(), gross = salaryMonthly * 12;
    const expense = Math.min(gross * c.expenseRate, c.expenseCap);
    const ss = socialSecurity(salaryMonthly) * 12;
    const net = Math.max(0, gross - expense - c.personalAllowance - ss - (otherDeduct || 0));
    return { gross, expense, ss, net, tax: incomeTax(net) };
  }
  function socialSecurity(m) {
    const s = C().socialSecurity;
    return Math.min(Math.min(m, s.wageCap) * s.rate, s.monthlyMax);
  }
  function takeHome(m, otherDeduct) {
    const a = annualTax(m, otherDeduct), ss = socialSecurity(m);
    const taxM = a.tax / 12;
    return { ss, taxM, net: m - ss - taxM };
  }
  function loan(principal, ratePct, years) {
    const n = years * 12, r = ratePct / 100 / 12;
    const pay = r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
    return { pay, total: pay * n, interest: pay * n - principal };
  }
  g.Calc = { incomeTax, annualTax, socialSecurity, takeHome, loan };
  if (typeof module !== "undefined") module.exports = g.Calc;
})(typeof window !== "undefined" ? window : global);
(function (g) {
  const C = g.Calc;
  C.vat = (amt, rate, included) => included
    ? { base: amt / (1 + rate), vat: amt - amt / (1 + rate), total: amt }
    : { base: amt, vat: amt * rate, total: amt * (1 + rate) };
  C.compound = (p0, monthly, ratePct, years) => {
    let b = p0, r = ratePct / 100 / 12;
    for (let i = 0; i < years * 12; i++) b = (b + monthly) * (1 + r);
    const inv = p0 + monthly * years * 12;
    return { balance: b, invested: inv, gain: b - inv };
  };
  C.withholding = (amt, ratePct) => ({ wh: amt * ratePct / 100, net: amt - amt * ratePct / 100 });
})(typeof window !== "undefined" ? window : global);
(function (g) {
  const C = g.Calc;
  C.refinance = (bal, oldRate, newRate, yearsLeft, fee) => {
    const a = C.loan(bal, oldRate, yearsLeft), b = C.loan(bal, newRate, yearsLeft);
    return { oldPay: a.pay, newPay: b.pay, saveMonth: a.pay - b.pay, saveTotal: a.total - b.total - fee };
  };
  C.taxSaved = (salaryMonthly, extraDeduct) => {
    const a = C.annualTax(salaryMonthly, 0).tax, b = C.annualTax(salaryMonthly, extraDeduct).tax;
    return { before: a, after: b, saved: a - b };
  };
  C.freelanceRate = (targetMonthly, billableHours, expensesMonthly, whPct) => {
    const need = (targetMonthly + expensesMonthly) / (1 - whPct / 100);
    return { perHour: need / billableHours, perMonth: need };
  };
  C.overtime = (monthly, hours, mult) => {
    const hourly = monthly / 30 / 8;
    return { hourly, pay: hourly * mult * hours };
  };
  C.debtMonths = (debt, ratePct, pay) => {
    const r = ratePct / 100 / 12;
    if (pay <= debt * r) return { months: Infinity, interest: Infinity };
    const n = Math.log(pay / (pay - debt * r)) / Math.log(1 + r);
    return { months: Math.ceil(n), interest: pay * Math.ceil(n) - debt };
  };
})(typeof window !== "undefined" ? window : global);

(function (g) {
  const C = g.Calc;
  C.bonusTax = (m, bonus) => {
    const cf = g.CONFIG, base = C.annualTax(m, 0).tax, gross = m * 12 + bonus;
    const expense = Math.min(gross * cf.expenseRate, cf.expenseCap), ss = C.socialSecurity(m) * 12;
    const tax = C.incomeTax(Math.max(0, gross - expense - cf.personalAllowance - ss));
    return { base, tax, extra: tax - base, bonusNet: bonus - (tax - base) };
  };
  C.goalMonths = (target, current, monthly, ratePct) => {
    if (current >= target) return { months: 0, saved: current, gain: 0 };
    const r = ratePct / 100 / 12; let b = current;
    for (let n = 1; n <= 1200; n++) { b = (b + monthly) * (1 + r); if (b >= target) return { months: n, saved: current + monthly * n, gain: b - current - monthly * n }; }
    return { months: Infinity, saved: 0, gain: 0 };
  };
})(typeof window !== "undefined" ? window : global);
