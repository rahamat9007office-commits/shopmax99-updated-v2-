(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const products=()=>window.getShopMax99Products?window.getShopMax99Products():[];
  const price=p=>Number(p.customerPrice??p.price??0);
  const card=p=>window.productCardPublic?window.productCardPublic(p):`<article class="sm99-mini-product"><img src="${p.image||''}" alt=""><b>${esc(p.name)}</b><strong>₹${price(p)}</strong></article>`;

  function renderFlash(){
    const host=$('#sm99FlashProducts'); if(!host)return;
    const list=products().filter(p=>Number(p.discountPercent||p.discount||0)>0 || Number(p.sellerPrice||0)>price(p)).slice(0,10);
    const fallback=products().slice(0,10);
    host.innerHTML=(list.length?list:fallback).map(card).join('');
  }
  function countdown(){
    const el=$('#sm99FlashCountdown'); if(!el)return;
    const key='shopmax99_flash_end'; let end=Number(localStorage.getItem(key));
    if(!end || end<Date.now()){end=Date.now()+6*60*60*1000;localStorage.setItem(key,String(end));}
    const tick=()=>{let d=Math.max(0,end-Date.now());const h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);el.textContent=[h,m,s].map(x=>String(x).padStart(2,'0')).join(':');};tick();setInterval(tick,1000);
  }
  function renderPersonal(){
    const section=$('#sm99PersonalRows'); if(!section)return;
    let recent=[];try{recent=JSON.parse(localStorage.getItem('shopmax99_recent_views')||'[]')}catch(e){}
    if(!recent.length){section.hidden=true;return;}
    section.hidden=false;
    const r=$('#sm99RecentProducts'),i=$('#sm99InspiredProducts');
    if(r)r.innerHTML=recent.slice(0,6).map(card).join('');
    const cats=[...new Set(recent.map(x=>String(x.category||x.productCategory||'').toLowerCase()).filter(Boolean))];
    const inspired=products().filter(p=>cats.includes(String(p.category||p.productCategory||'').toLowerCase())&&!recent.some(r=>String(r.id)===String(p.id))).sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)).slice(0,6);
    if(i)i.innerHTML=inspired.map(card).join('');
  }
  function voice(){
    const btn=$('#sm99VoiceSearch');const input=$('#productSearch');if(!btn||!input)return;
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){btn.title='Voice search is not supported in this browser';return;}
    btn.addEventListener('click',()=>{const r=new SR();r.lang='en-IN';r.interimResults=false;r.onstart=()=>btn.classList.add('listening');r.onend=()=>btn.classList.remove('listening');r.onresult=e=>{input.value=e.results[0][0].transcript;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();};r.start();});
  }
  function sortControl(){
    const select=document.querySelector('#sm99HomeSortSelect');
    if(select && window.__shopmax99CurrentSort) select.value=window.__shopmax99CurrentSort;
  }
  function bundle(){document.addEventListener('click',e=>{const b=e.target.closest('[data-bundle-main]');if(!b)return;const ids=[b.dataset.bundleMain,...[...document.querySelectorAll('.sm99-bundle-check:checked')].map(x=>x.dataset.bundleProduct)];ids.forEach(id=>document.querySelector(`[data-action="modal-add-cart"][data-product-id="${CSS.escape(id)}"]`)?.click());window.ShopMax99?.showToast?.('Bundle added — 5% bundle saving applied.');});}
  function init(){renderFlash();countdown();renderPersonal();voice();location();bundle();setTimeout(sortControl,800);setInterval(()=>{document.querySelectorAll('.sm99-urgency-time').forEach(el=>{let key='shopmax99_urgency_'+(el.closest('.product-detail')?.querySelector('h2')?.textContent||'x');let end=Number(sessionStorage.getItem(key));if(!end){end=Date.now()+45*60*1000;sessionStorage.setItem(key,String(end));}let d=Math.max(0,end-Date.now());el.textContent=[Math.floor(d/60000),Math.floor(d/1000)%60].map(x=>String(x).padStart(2,'0')).join(':');});},1000);}
  document.addEventListener('DOMContentLoaded',init);
  window.addEventListener('storage',renderPersonal);
  window.ShopMax99CustomerUX={refresh:()=>{renderFlash();renderPersonal();}};
})();
