/* คำนวณสดเมื่อพิมพ์ + คัดลอกผลลัพธ์ */
(function () {
  document.querySelectorAll("form[data-tool]").forEach(function (form) {
    var tool = TOOLS.filter(function (t) { return t.id === form.dataset.tool; })[0];
    var slip = document.querySelector('[data-slip="' + tool.id + '"]');
    if (!tool || !slip) return;
    var out = slip.querySelector(".slip-body");
    function run() {
      var res = tool.compute(readValues(tool, form));
      out.innerHTML = slipHTML(tool, res);
      slip.dataset.text = tool.name + "\n" + res.rows.map(function (r) { return r.l + ": " + r.v + " " + r.u; }).join("\n");
    }
    form.addEventListener("input", run);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var copy = slip.querySelector(".copy");
    if (copy) copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "คัดลอกแล้ว"; setTimeout(function () { copy.textContent = "คัดลอกผล"; }, 1600); };
      try { navigator.clipboard.writeText(slip.dataset.text + "\nคำนวณที่ phasith.vercel.app").then(done, function () {}); } catch (e) {}
    });
    run();
  });
  var q = document.getElementById("q");
  if (q) q.addEventListener("input", function () {
    var v = q.value.trim().toLowerCase(), n = 0;
    document.querySelectorAll("[data-find]").forEach(function (x) {
      var ok = !v || x.dataset.find.toLowerCase().indexOf(v) > -1; x.hidden = !ok; if (ok) n++;
    });
    document.querySelectorAll(".toc-group").forEach(function (g) { g.hidden = !g.querySelector("[data-find]:not([hidden])"); });
    var e = document.getElementById("empty"); if (e) e.hidden = n > 0;
  });
})();
