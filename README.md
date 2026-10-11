<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>اسأل قبل ما تشتري 100%</title><style>body{background:#020617;color:#fff;font-family:system-ui;padding:14px}button{background:#22c55e;border:none;padding:16px;width:100%;border-radius:14px;font-weight:800;font-size:18px}input{width:100%;padding:14px;border-radius:14px;border:none;margin:8px 0}.card{background:#1e293b;border-radius:16px;padding:14px;margin-top:12px}#reader{display:none}</style></head><body>
<h2>🌍 اسأل قبل ما تشتري - 100%</h2>
<button onclick="startCam()">📷 امسح اي باركود من اي دولة</button>
<div id="reader"></div>
<input id="bc" placeholder="6224009210817 رودس">
<div id="res"></div>
<script src="https://unpkg.com/html5-qrcode@2.3.10/html5-qrcode.min.js"></script>
<script>
const DB={"6224009210817":{n:"جبنة رودس شيدر طبيعي 100% 250جم",k:312,f:24,s:2,sl:2.1,b:"طبيعية 100% - المعلقة 12 سعرة فقط - تنفع للدايت"}, "6223001360056":{n:"مياه اكوافينا 600مل",k:0,f:0,s:0,sl:0,b:"0 سعرة - ممتاز للكلى والدايت والرياضة"}, "6221001095769":{n:"شيبسي ملح",k:536,f:34,s:3,sl:1.8,b:"536 سعرة - دهون عالية"}};
function show(c){let x=DB[c];if(!x)return 0;document.getElementById('res').innerHTML='<div class=card><h3>'+x.n+'</h3><div style="font-size:32px;font-weight:900">'+x.k+' سعرة / 100جم</div><div>دهون:'+x.f+'g سكر:'+x.s+'g ملح:'+x.sl+'g</div><div style="margin-top:8px;background:#020617;padding:8px;border-radius:8px">💡 '+x.b+'</div><button style="background:#25D366;margin-top:8px" onclick="window.open(\'https://wa.me/?text='+encodeURIComponent(x.n+' '+x.k+' سعرة - '+location.href)+'\')">واتساب</button></div>';return 1}
async function get(code){code=code.replace(/\D/g,'');if(code.length<7)return;document.getElementById('bc').value=code;if(show(code))return;document.getElementById('res').innerHTML='⏳ بدور عالميا...';try{let r=await fetch('https://world.openfoodfacts.org/api/v0/product/'+code+'.json');let j=await r.json();document.getElementById('res').innerHTML=j.status==0?'🔍 مش لاقيه - جرب 6224009210817':j.product.product_name}catch(e){document.getElementById('res').innerHTML='🔍 جرب 6224009210817'}};
let qr;function startCam(){document.getElementById('reader').style.display='block';qr=new Html5Qrcode("reader");qr.start({facingMode:"environment"},{fps:10,qrbox:250},t=>{get(t);qr.stop();document.getElementById('reader').style.display='none'})}
document.getElementById('bc').addEventListener('input',e=>get(e.target.value));get('6224009210817');
</script></body></html>
