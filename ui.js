/* คำนวณอัตโนมัติเมื่อพิมพ์ + จัดผลลัพธ์เป็นแถวแบบสมุดบัญชี */
(function(){
  var KEY=/(ภาษีที่ต้องจ่าย|รับสุทธิ|ค่างวดต่อเดือน|เงินสะสมรวม|ประหยัดรวม|ประหยัด |ควรตั้งราคา|ค่า OT|หมดหนี้|ได้รับจริง|ภาษีหลัง|^รวม|ค่างวดใหม่)/;
  function fmt(el){
    if(el.querySelector(".row,.note"))return;
    var parts=el.innerHTML.split(/<br\s*\/?>/i),items=[],key=-1;
    parts.forEach(function(p){
      var m=p.match(/^([\s\S]*?)<b>([\s\S]*?)<\/b>([\s\S]*)$/);
      if(m){var lab=m[1].trim();if(key<0&&KEY.test(lab))key=items.length;
        items.push({lab:lab,val:m[2],unit:m[3].trim()});}
      else if(p.trim())items.push({note:p.trim()});
    });
    if(!items.length)return;
    if(key<0)for(var i=items.length-1;i>=0;i--)if(!items[i].note){key=i;break}
    el.innerHTML=items.map(function(x,i){
      if(x.note)return '<div class="note">'+x.note+'</div>';
      return '<div class="row'+(i===key?' key':'')+'"><span class="lab">'+x.lab+'</span><span class="val">'+x.val+(x.unit?'<small>'+x.unit+'</small>':'')+'</span></div>';
    }).join("");
  }
  document.addEventListener("DOMContentLoaded",function(){
    var r=document.getElementById("r");
    if(r){new MutationObserver(function(){fmt(r)}).observe(r,{childList:true});fmt(r);}
    var btn=document.getElementById("b")||document.getElementById("btn");
    if(btn){var t;document.querySelectorAll(".card input").forEach(function(i){
      i.addEventListener("input",function(){clearTimeout(t);t=setTimeout(function(){btn.click()},150)});
      i.addEventListener("change",function(){btn.click()});});
      btn.classList.add("ghost");}
  });
})();
