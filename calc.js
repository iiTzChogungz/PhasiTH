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
