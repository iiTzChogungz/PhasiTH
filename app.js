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

/* คัดลอกอีเมล */
document.querySelectorAll(".copy[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var t = b.textContent;
    try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = "คัดลอกแล้ว"; setTimeout(function () { b.textContent = t; }, 1600); }, function () {}); } catch (e) {}
  });
});

/* บันทึกสลิปเป็นภาพ (ลายน้ำชื่อเว็บและผู้สร้าง) */
(function () {
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function draw(tool, res) {
    var W = 1080, P = 72, rows = res.rows, rowH = 76, keyI = res.key;
    var H = 520 + rows.length * rowH + (res.note ? 120 : 0);
    var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
    var ink = "#16201C", mut = "#4B5951", blue = "#1D3CB8", hl = "#FFE45C", rule = "#B9C4BE";
    x.fillStyle = "#E9EEEB"; x.fillRect(0, 0, W, H);
    var top = 70, bottom = H - 70;
    x.fillStyle = "#fff"; x.fillRect(48, top, W - 96, bottom - top);
    x.fillStyle = ink; x.fillRect(48, top, W - 96, 10);
    x.beginPath(); for (var i = 48; i + 28 <= W - 48; i += 28) { x.lineTo(i, bottom); x.lineTo(i + 14, bottom + 14); x.lineTo(i + 28, bottom); } x.lineTo(W - 48, bottom - 1); x.lineTo(48, bottom - 1); x.closePath(); x.fillStyle = "#fff"; x.fill();
    var body = '"IBM Plex Sans Thai",sans-serif', mono = '"IBM Plex Mono",monospace', disp = '"Pridi",serif';
    x.textBaseline = "alphabetic";
    x.fillStyle = mut; x.font = "400 26px " + body; x.fillText("สรุปผล", P + 24, top + 70);
    x.textAlign = "right"; x.fillText(CONFIG.brand.name, W - P - 24, top + 70); x.textAlign = "left";
    x.fillStyle = ink; x.font = "600 44px " + disp; x.fillText(tool.name, P + 24, top + 140);
    x.strokeStyle = rule; x.setLineDash([8, 8]); x.lineWidth = 2; x.beginPath(); x.moveTo(P + 24, top + 170); x.lineTo(W - P - 24, top + 170); x.stroke(); x.setLineDash([]);
    var y = top + 240;
    rows.forEach(function (r, i) {
      if (i === keyI) return;
      x.fillStyle = mut; x.font = "400 30px " + body; x.fillText(r.l, P + 24, y);
      x.textAlign = "right"; x.fillStyle = ink; x.font = "500 34px " + mono; var vv = r.v + " " + r.u; x.fillText(vv, W - P - 24, y); x.textAlign = "left";
      var lw = x.measureText(r.l).width; x.font = "400 30px " + body; var l0 = P + 24 + x.measureText(r.l).width + 14;
      x.font = "500 34px " + mono; var l1 = W - P - 24 - x.measureText(vv).width - 14;
      if (l1 > l0) { x.strokeStyle = rule; x.setLineDash([2, 8]); x.lineWidth = 3; x.lineCap = "round"; x.beginPath(); x.moveTo(l0, y - 8); x.lineTo(l1, y - 8); x.stroke(); x.setLineDash([]); }
      y += rowH;
    });
    if (keyI >= 0 && rows[keyI]) {
      var k = rows[keyI]; y += 6; x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(P + 24, y - 36); x.lineTo(W - P - 24, y - 36); x.stroke();
      x.fillStyle = ink; x.font = "600 32px " + body; x.fillText(k.l, P + 24, y + 34);
      x.font = "600 56px " + mono; var kv = k.v, kw = x.measureText(kv).width; x.font = "400 26px " + body; var uw = x.measureText(" " + k.u).width;
      var bx = W - P - 24 - kw - uw - 24;
      x.fillStyle = hl; x.fillRect(bx, y - 22, kw + uw + 24, 84);
      x.fillStyle = "#16201C"; x.font = "600 56px " + mono; x.fillText(kv, bx + 12, y + 40); x.font = "400 26px " + body; x.fillText(" " + k.u, bx + 12 + kw, y + 40);
      y += 110;
    }
    if (res.note) { x.fillStyle = mut; x.font = "400 26px " + body; wrap(x, res.note, P + 24, y + 20, W - 2 * P - 48, 36); y += 90; }
    x.fillStyle = blue; x.font = "600 30px " + body; x.fillText(CONFIG.brand.name + "  ·  " + CONFIG.brand.site, P + 24, bottom - 60);
    x.fillStyle = mut; x.font = "400 24px " + body; x.fillText("สร้างโดย @" + CONFIG.brand.by + "  ·  ประมาณการ ไม่ใช่คำปรึกษา", P + 24, bottom - 22);
    return c;
  }
  function wrap(x, t, px, py, mw, lh) { var line = "", yy = py; Array.from(t).forEach(function (ch) { var test = line + ch; if (x.measureText(test).width > mw) { x.fillText(line, px, yy); line = ch; yy += lh; } else line = test; }); x.fillText(line, px, yy); }
  document.querySelectorAll("[data-slip] .save").forEach(function (btn) {
    var slip = btn.closest("[data-slip]"), tool = TOOLS.filter(function (t) { return t.id === slip.dataset.slip; })[0];
    btn.addEventListener("click", function () {
      var form = document.querySelector('form[data-tool="' + tool.id + '"]'), res = tool.compute(readValues(tool, form));
      var go = function () {
        draw(tool, res).toBlob(function (blob) {
          if (!blob) return;
          var file = new File([blob], "phasith-" + tool.id + ".png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: CONFIG.brand.name }).catch(function () {}); return; }
          var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
        }, "image/png");
      };
      if (document.fonts && document.fonts.load) Promise.all(['600 44px "Pridi"', '400 30px "IBM Plex Sans Thai"', '500 34px "IBM Plex Mono"', '600 30px "IBM Plex Sans Thai"']).then(function (a) { return Promise.all(a.map(function (f) { return document.fonts.load(f, "ก1"); })); }).then(go, go); else go();
    });
  });
})();
