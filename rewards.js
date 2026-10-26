(function(){
  "use strict";

  const PROMO_KEY="shopmax99_promocodes";
  const NOTIFY_KEY="shopmax99_notifications";
  const SPIN_KEY="shopmax99_spin_state";
  const APPLIED_KEY="shopmax99_applied_promo";
  const PROMO_RESET_VERSION="v17-clean-promo-inventory";

  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||"null");return v??fallback;}catch{return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const uid=()=>"SM99-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
  const customer=()=>read("shopmax99_customer_account",null);
  const session=()=>read("shopmax99_customer_session",null);
  const customerId=()=>String(customer()?.id||session()?.customerId||"");

  function addNotification(cid,title,message,type="info"){
    if(!cid)return;
    const list=read(NOTIFY_KEY,[]);
    list.unshift({id:uid(),customerId:String(cid),title,message,type,read:false,createdAt:new Date().toISOString()});
    write(NOTIFY_KEY,list.slice(0,300));
    renderNotificationUI();
  }

  const PROMO_LABELS={"2":"2% Discount","5":"5% Discount",reward99:"Item Reward up to ₹99",free_delivery:"Free Delivery"};
  const PROMO_PREFIXES={"2":"SM2", "5":"SM5", reward99:"SM99", free_delivery:"SMFD"};
  try{
    if(localStorage.getItem("shopmax99_promo_reset_version")!==PROMO_RESET_VERSION){
      localStorage.setItem(PROMO_KEY,"[]");
      localStorage.setItem("shopmax99_promo_reset_version",PROMO_RESET_VERSION);
    }
  }catch{}

  function createPromoObjects(type,count=1,cid="",source="admin"){
    const safeCount=Math.max(0,Math.floor(Number(count)||0));
    const prefix=PROMO_PREFIXES[type]||"SM";
    const label=PROMO_LABELS[type]||type;
    const now=Date.now();
    const created=[];
    for(let i=0;i<safeCount;i++){
      const code=`${prefix}-${Math.random().toString(36).slice(2,9).toUpperCase()}-${(now+i).toString(36).slice(-5).toUpperCase()}`;
      created.push({code,type,label,customerId:String(cid||""),source,used:false,createdAt:new Date(now+i).toISOString()});
    }
    return created;
  }

  function makePromo(type,cid="",source="admin"){
    const promo=createPromoObjects(type,1,cid,source)[0];
    if(!promo)return null;
    const list=read(PROMO_KEY,[]);
    list.unshift(promo);
    write(PROMO_KEY,list);
    if(cid) addNotification(cid,"New Reward / Gift Promo",promo.type==="reward99"?`One Item Free up to ₹99: ${promo.code}. Use it at checkout.`:`${promo.label}: ${promo.code}. Use it at checkout.`,"reward");
    return promo;
  }

  function addPromoBatch(type,count,cid="",source="admin"){
    const created=createPromoObjects(type,count,cid,source);
    if(!created.length)return [];
    const list=read(PROMO_KEY,[]);
    try{
      write(PROMO_KEY,created.reverse().concat(list));
      return created;
    }catch(err){
      return [];
    }
  }

  function deletePromoBatch(type,count){
    const n=Math.max(0,Math.floor(Number(count)||0));
    if(!n)return 0;
    const list=read(PROMO_KEY,[]);
    let removed=0;
    const kept=[];
    for(const promo of list){
      if(removed<n && String(promo.type)===String(type) && !promo.used && !promo.customerId){ removed++; continue; }
      kept.push(promo);
    }
    write(PROMO_KEY,kept);
    return removed;
  }

  function claimPromoForCustomer(type,cid){
    const list=read(PROMO_KEY,[]);
    const index=list.findIndex(p=>String(p.type)===String(type) && !p.used && !p.customerId);
    if(index<0)return null;
    const promo={...list[index],customerId:String(cid),assignedAt:new Date().toISOString()};
    list[index]=promo;
    write(PROMO_KEY,list);
    addNotification(cid,"New Reward / Gift Promo",promo.type==="reward99"?`One Item Free up to ₹99: ${promo.code}. Use it at checkout.`:`${promo.label}: ${promo.code}. Use it at checkout.` ,"reward");
    return promo;
  }

  function currentSpinState(){
    const s=read(SPIN_KEY,{count:0,lastByCustomer:{}});
    if(!s.lastByCustomer)s.lastByCustomer={};
    return s;
  }
  const WHEEL_SEGMENTS=16;
  const REWARD_SEGMENTS={
    "5":[0,8],
    reward99:[2,10],
    "2":[4,12],
    free_delivery:[6,14]
  };

  function rewardForSpin(next){
    let type="try", label="Try Next Time";
    if(next===20){type="2";label="2% Discount";}
    else if(next===50){type="5";label="5% Discount";}
    else if(next===100){type="reward99";label="One Item Free up to ₹99";}
    else if(next===200){type="free_delivery";label="Free Delivery";}

    const slots=type==="try"
      ? [1,3,5,7,9,11,13,15]
      : REWARD_SEGMENTS[type];
    if(type!=="try"){
      const available=read(PROMO_KEY,[]).some(p=>String(p.type)===String(type) && !p.used && !p.customerId);
      if(!available){ type="try"; label="Try Again"; }
    }
    const finalSlots=type==="try" ? [1,3,5,7,9,11,13,15] : REWARD_SEGMENTS[type];
    const segment=finalSlots[Math.floor(Math.random()*finalSlots.length)];
    return {type,label,segment};
  }

  let isSpinning=false;

  function spinWheel(){
    const cid=customerId();
    if(isSpinning)return;
    if(!session()?.loggedIn||!cid){ if(window.ShopMax99?.showToast) window.ShopMax99.showToast("Please login to use the Spin Wheel.","warning"); else alert("Please login to use the Spin Wheel."); return; }
    const state=currentSpinState();
    const day=new Date().toLocaleDateString("en-CA");
    if(state.lastByCustomer[cid]===day){ alert("You have already used today's spin."); return; }
    let next=Number(state.count||0)+1;
    const reward=rewardForSpin(next);
    state.count=next>=200?0:next;
    state.lastByCustomer[cid]=day;
    write(SPIN_KEY,state);
    const wheel=document.querySelector("#sm99SpinWheel");
    const disc=wheel?.querySelector(".sm99-wheel-disc");
    isSpinning=true;
    const spinButton=wheel?.querySelector("#sm99SpinButton");
    if(spinButton)spinButton.disabled=true;
    if(disc){
      const segmentAngle=360/WHEEL_SEGMENTS;
      const center=segmentAngle*reward.segment+segmentAngle/2;
      const target=270;
      const delta=(target-center+360)%360;
      disc.style.transform=`translateX(-50%) rotate(${1080 + delta}deg)`;
    }
    setTimeout(()=>{
      if(reward.type!=="try"){
        const promo=claimPromoForCustomer(reward.type,cid);
        if(promo){
          alert(`${reward.label}\nYour promo code: ${promo.code}`);
        }else{
          alert("Try Again — this reward is currently out of promo codes.");
        }
      }else{
        alert("Try next time!");
      }
      isSpinning=false;
      renderSpinWidget();
      renderNotificationUI();
    },2700);
  }

  function renderSpinWidget(){
    const home=document.getElementById("customerHome"); if(!home)return;
    let host=document.getElementById("sm99SpinWidget");
    if(!host){
      host=document.createElement("section"); host.id="sm99SpinWidget"; host.className="sm99-reward-section";
      const hero=home.querySelector(".hero-banner");
      (hero?.parentNode||home).insertBefore(host,hero?.nextSibling||home.firstChild);
    }
    const cid=customerId(), state=currentSpinState(), day=new Date().toLocaleDateString("en-CA"), used=cid&&state.lastByCustomer?.[cid]===day;
    host.innerHTML=`<div class="sm99-reward-card"><div class="sm99-reward-copy"><span class="sm99-reward-kicker">DAILY REWARD</span><h2>Spin & Win</h2><p>One spin per customer every day.</p><button type="button" class="sm99-spin-open" ${used||!cid?"disabled":""}><i class="fa-solid fa-rotate"></i> ${used?"Come Back Tomorrow":"Spin Now"}</button></div><div class="sm99-mini-wheel"><div class="sm99-mini-wheel-disc"></div><span>SPIN</span></div></div>`;
    host.querySelector(".sm99-spin-open")?.addEventListener("click",openSpinModal);
  }

  function openSpinModal(){
    let modal=document.getElementById("sm99SpinModal");
    if(!modal){
      modal=document.createElement("div"); modal.id="sm99SpinModal"; modal.className="sm99-reward-modal";
      modal.innerHTML=`<div class="sm99-reward-backdrop" data-close-spin></div><div class="sm99-reward-dialog"><button class="sm99-reward-close" data-close-spin>×</button><span class="sm99-reward-kicker">SHOPMAX99 REWARDS</span><h2>Spin the Wheel</h2><div id="sm99SpinWheel" class="sm99-spin-wheel"><div class="sm99-wheel-pin" aria-hidden="true"></div><div class="sm99-wheel-disc"><span class="w0">5%</span><span class="w1">TRY</span><span class="w2">FREE<br>₹99</span><span class="w3">TRY</span><span class="w4">2%</span><span class="w5">TRY</span><span class="w6">FREE<br>DELIVERY</span><span class="w7">TRY</span><span class="w8">5%</span><span class="w9">TRY</span><span class="w10">FREE<br>₹99</span><span class="w11">TRY</span><span class="w12">2%</span><span class="w13">TRY</span><span class="w14">FREE<br>DELIVERY</span><span class="w15">TRY</span></div><button id="sm99SpinButton" class="sm99-wheel-center">SPIN</button></div><p class="sm99-spin-note">Rewards are issued as single-use promo codes.</p></div>`;
      document.body.appendChild(modal);
      modal.querySelectorAll("[data-close-spin]").forEach(x=>x.addEventListener("click",()=>modal.remove()));
      modal.querySelector("#sm99SpinButton").addEventListener("click",spinWheel);
    }
    modal.classList.add("open");
  }

  function syncOrderNotifications(){
    const cid=customerId(); if(!cid)return;
    const orders=read("shopmax99_orders",[]).filter(o=>String(o.customerId||"")===cid);
    const seen=read("shopmax99_order_notification_states",{});
    let changed=false;
    orders.forEach(o=>{
      const state=String(o.status||"Placed");
      const key=String(o.id||"");
      if(key && seen[key]!==state){
        addNotification(cid,"Order Update",`${o.id}: ${state}`,"order");
        seen[key]=state; changed=true;
      }
    });
    if(changed)write("shopmax99_order_notification_states",seen);
  }

  function renderNotificationUI(){
    const actions=document.querySelector(".customer-header .header-actions"); if(!actions)return;
    let btn=document.getElementById("shopmax99NotificationBtn");
    if(!btn){
      btn=document.createElement("button"); btn.type="button"; btn.id="shopmax99NotificationBtn"; btn.className="header-icon-btn sm99-notification-btn"; btn.title="Notifications"; btn.innerHTML='<i class="fa-regular fa-bell"></i><span class="header-badge" id="shopmax99NotificationCount">0</span>';
      actions.insertBefore(btn,actions.firstChild); btn.addEventListener("click",toggleNotifications);
    }
    const cid=customerId(); const unread=read(NOTIFY_KEY,[]).filter(n=>String(n.customerId)===cid&&!n.read).length;
    const badge=document.getElementById("shopmax99NotificationCount"); if(badge){badge.textContent=unread;badge.hidden=unread===0;}
  }
  function toggleNotifications(){
    const cid=customerId();
    let panel=document.getElementById("sm99NotificationPanel");
    if(panel){panel.remove();return;}
    const notes=read(NOTIFY_KEY,[]).filter(n=>String(n.customerId)===cid).slice(0,30);
    panel=document.createElement("div"); panel.id="sm99NotificationPanel"; panel.className="sm99-notification-panel";
    const noteHtml=notes.length ? notes.map(n=>{const unread=n.read?"":"unread";const icon=n.type==="reward"?"fa-gift":n.type==="order"?"fa-box-open":"fa-bell";return `<button type="button" class="sm99-notification-item ${unread}" data-notification-id="${esc(n.id)}"><i class="fa-solid ${icon}"></i><div><strong>${esc(n.title)}</strong><p>${esc(n.message)}</p><small>${new Date(n.createdAt).toLocaleString("en-IN")} · Click for details</small></div><i class="fa-solid fa-chevron-right sm99-notification-arrow"></i></button>`;}).join('') : `<div class="sm99-notification-empty">No notifications.</div>`;
    panel.innerHTML=`<div class="sm99-notification-head"><strong>Notifications</strong><button type="button" id="sm99MarkNotifications">Mark all read</button></div><div class="sm99-notification-list">${noteHtml}</div>`;
    document.body.appendChild(panel);
    panel.addEventListener("click",(event)=>{
      const markBtn=event.target.closest("#sm99MarkNotifications");
      if(markBtn){
        event.preventDefault();
        event.stopPropagation();
        const all=read(NOTIFY_KEY,[]);
        all.forEach(n=>{if(String(n.customerId)===cid)n.read=true;});
        write(NOTIFY_KEY,all);
        panel.remove();
        renderNotificationUI();
        return;
      }

      const item=event.target.closest("[data-notification-id]");
      if(!item || !panel.contains(item)) return;
      event.preventDefault();
      const id=item.dataset.notificationId;
      const all=read(NOTIFY_KEY,[]);
      const note=all.find(n=>String(n.id)===String(id));
      if(!note)return;
      note.read=true;
      write(NOTIFY_KEY,all);
      panel.remove();
      showNotificationDetails(note);
      renderNotificationUI();
    });
    panel.querySelectorAll("[data-notification-id]").forEach(item=>{
      item.setAttribute("role","button");
      item.setAttribute("tabindex","0");
      item.addEventListener("keydown",event=>{
        if(event.key==="Enter" || event.key===" "){
          event.preventDefault();
          item.click();
        }
      });
    });
  }

  function showNotificationDetails(note){
    document.getElementById("sm99NotificationDetailModal")?.remove();
    const modal=document.createElement("div");
    modal.id="sm99NotificationDetailModal";
    modal.className="sm99-notification-detail-modal";
    const icon=note.type==="reward"?"fa-gift":note.type==="order"?"fa-box-open":"fa-bell";
    const typeLabel=note.type==="reward"?"Reward / Gift":note.type==="order"?"Order Update":"General Notification";
    const created=note.createdAt?new Date(note.createdAt).toLocaleString("en-IN"):"";
    modal.innerHTML=`
      <div class="sm99-notification-detail-backdrop" data-close-notification-detail></div>
      <div class="sm99-notification-detail-dialog" role="dialog" aria-modal="true" aria-label="Notification details">
        <button type="button" class="sm99-notification-detail-close" data-close-notification-detail aria-label="Close notification details">×</button>
        <div class="sm99-notification-detail-icon"><i class="fa-solid ${icon}"></i></div>
        <span class="sm99-reward-kicker">NOTIFICATION DETAILS</span>
        <div class="sm99-notification-detail-type">${esc(typeLabel)}</div>
        <h3>${esc(note.title)}</h3>
        <div class="sm99-notification-detail-body">${esc(note.message).replace(/\n/g,"<br>")}</div>
        <div class="sm99-notification-detail-meta">
          <div><span>Date &amp; Time</span><strong>${esc(created)}</strong></div>
          <div><span>Notification ID</span><strong>${esc(note.id)}</strong></div>
        </div>
        <button type="button" class="primary-btn" data-close-notification-detail>Close</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-close-notification-detail]").forEach(x=>x.addEventListener("click",()=>modal.remove()));
    const onKey=e=>{if(e.key==="Escape"){modal.remove();document.removeEventListener("keydown",onKey);}};
    document.addEventListener("keydown",onKey);
  }

  function renderPromoBox(){
    const summary=document.querySelector(".checkout-summary"); if(!summary)return;
    let box=document.getElementById("sm99CheckoutPromo");
    if(!box){
      box=document.createElement("div"); box.id="sm99CheckoutPromo"; box.className="sm99-checkout-promo";
      const items=document.getElementById("checkoutItems"); items?.parentNode?.insertBefore(box,items.nextSibling);
    }
    const applied=read(APPLIED_KEY,null);
    box.innerHTML=applied?`<div class="sm99-applied-promo"><span><i class="fa-solid fa-ticket"></i> ${esc(applied.code)}</span><button type="button" id="sm99RemovePromo">Remove</button></div>`:`<div class="sm99-promo-row"><input id="sm99PromoInput" placeholder="Enter promo code"><button type="button" id="sm99ApplyPromo">Apply</button></div><small>Use a reward or gift promo code.</small>`;
    box.querySelector("#sm99ApplyPromo")?.addEventListener("click",()=>{
      const code=String(box.querySelector("#sm99PromoInput")?.value||"").trim().toUpperCase();
      const promo=read(PROMO_KEY,[]).find(p=>String(p.code).toUpperCase()===code&&!p.used);
      const cid=customerId();
      if(!promo){alert("Invalid or already used promo code.");return;}
      if(promo.customerId && String(promo.customerId)!==cid){alert("This promo code is assigned to another customer.");return;}
      write(APPLIED_KEY,promo);
      if(typeof window.ShopMax99.checkoutSummaryRefresh==="function") window.ShopMax99.checkoutSummaryRefresh();
      else location.reload();
    });
    box.querySelector("#sm99RemovePromo")?.addEventListener("click",()=>{localStorage.removeItem(APPLIED_KEY);if(typeof window.ShopMax99.checkoutSummaryRefresh==="function")window.ShopMax99.checkoutSummaryRefresh();});
  }

  function renderAdminPromotions(){
    const host=document.querySelector('[data-admin-content="promotions"]'); if(!host)return;
    const promos=read(PROMO_KEY,[]); const users=read("shopmax99_users",[]);
    const giftOptions=[['2','2% Discount'],['5','5% Discount'],['reward99','Item Reward up to ₹99'],['free_delivery','Free Delivery']];
    const stats=giftOptions.map(([type,label])=>{
      const rows=promos.filter(p=>String(p.type)===type);
      return {type,label,total:rows.length,active:rows.filter(p=>!p.used).length,used:rows.filter(p=>p.used).length};
    });
    host.innerHTML=`<div class="sm99-promo-admin"><div class="sm99-promo-admin-head"><div><span>REWARDS CONTROL</span><h2>Promo Codes & Gifts</h2><p>Codes are classified by reward type. Bulk generation uses one storage write, so large batches do not freeze the page.</p></div></div><div class="sm99-promo-grid">${giftOptions.map(([type,label])=>{const st=stats.find(x=>x.type===type);return `<section class="sm99-promo-card"><h3>${label}</h3><div class="sm99-promo-stats"><span>Total <b>${st.total.toLocaleString('en-IN')}</b></span><span>Active <b>${st.active.toLocaleString('en-IN')}</b></span><span>Used <b>${st.used.toLocaleString('en-IN')}</b></span></div><div class="sm99-bulk-promo-row"><input type="number" min="1" max="100000" step="1" inputmode="numeric" class="sm99-promo-quantity" data-promo-quantity="${type}" placeholder="Generate quantity" aria-label="Number of ${esc(label)} promo codes"><button type="button" class="primary-btn" data-generate-promo="${type}">Generate</button></div><div class="sm99-bulk-promo-row sm99-delete-row"><input type="number" min="1" max="100000" step="1" inputmode="numeric" class="sm99-promo-delete-quantity" data-delete-promo-quantity="${type}" placeholder="Delete quantity"><button type="button" class="secondary-btn" data-delete-promo="${type}">Delete Active</button></div><small class="sm99-promo-hint">Generate 100 / 1000 / 100000 or delete the selected number of unused codes from this class.</small><div data-created-promo="${type}"></div></section>`;}).join('')}<section class="sm99-promo-card sm99-gift-card"><h3>Gift Promo Code</h3><input id="sm99GiftCustomerSearch" placeholder="Search Customer ID"><div id="sm99GiftCustomerResults"></div><select id="sm99GiftType">${giftOptions.map(([t,l])=>`<option value="${t}">${l}</option>`).join('')}</select><button type="button" class="primary-btn" id="sm99SendGiftPromo">Send Gift</button></section></div><section class="sm99-promo-list"><h3>Promo Inventory by Class</h3>${stats.map(st=>`<div class="sm99-promo-class-row"><strong>${esc(st.label)}</strong><span>${st.active.toLocaleString('en-IN')} active</span><span>${st.used.toLocaleString('en-IN')} used</span></div>`).join('')}</section></div>`;

    const generatePromoBatch=(type)=>{
      const input=host.querySelector(`[data-promo-quantity="${type}"]`);
      const raw=String(input?.value||"").trim(); const count=Number(raw);
      if(!/^\d+$/.test(raw)||count<1||count>100000){alert("Enter a number from 1 to 100000.");input?.focus();return;}
      const created=addPromoBatch(type,count,"","admin");
      if(!created.length){alert("Promo batch could not be stored. The browser storage limit was reached. Delete unused codes or generate a smaller batch.");return;}
      const out=host.querySelector(`[data-created-promo="${type}"]`);
      if(out){out.innerHTML=`<strong>${count.toLocaleString('en-IN')} promo codes generated.</strong><div class="sm99-generated-preview">${created.slice(0,5).map(p=>`<span>${esc(p.code)}</span>`).join('')}${count>5?`<span>+${(count-5).toLocaleString('en-IN')} more</span>`:""}</div>`;}
      if(input)input.value="";
      alert(`${count.toLocaleString('en-IN')} promo code(s) generated successfully.`);
      renderAdminPromotions();
    };
    const deletePromoBatchUI=(type)=>{
      const input=host.querySelector(`[data-delete-promo-quantity="${type}"]`); const raw=String(input?.value||"").trim(); const count=Number(raw);
      if(!/^\d+$/.test(raw)||count<1||count>100000){alert("Enter a delete quantity from 1 to 100000.");input?.focus();return;}
      const label=PROMO_LABELS[type]||type;
      if(!confirm(`Delete ${count.toLocaleString('en-IN')} unused ${label} promo codes?`))return;
      const removed=deletePromoBatch(type,count);
      alert(removed?`${removed.toLocaleString('en-IN')} ${label} code(s) deleted.`:"No unused codes were available in this class.");
      renderAdminPromotions();
    };
    host.querySelectorAll("[data-generate-promo]").forEach(btn=>{const type=btn.dataset.generatePromo;btn.addEventListener("click",()=>generatePromoBatch(type));host.querySelector(`[data-promo-quantity="${type}"]`)?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();generatePromoBatch(type);}});});
    host.querySelectorAll("[data-delete-promo]").forEach(btn=>{const type=btn.dataset.deletePromo;btn.addEventListener("click",()=>deletePromoBatchUI(type));host.querySelector(`[data-delete-promo-quantity="${type}"]`)?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();deletePromoBatchUI(type);}});});
    const search=host.querySelector("#sm99GiftCustomerSearch"), results=host.querySelector("#sm99GiftCustomerResults");
    search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();const found=users.filter(u=>String(u.id||u.customerId||u.name||u.email||u.mobile||"").toLowerCase().includes(q)).slice(0,8);results.innerHTML=q?found.map(u=>`<button type="button" data-gift-cid="${esc(u.id||u.customerId)}">${esc(u.id||u.customerId)} — ${esc(u.name||"Customer")}</button>`).join(''):"";results.querySelectorAll("[data-gift-cid]").forEach(b=>b.addEventListener('click',()=>{search.value=b.dataset.giftCid;results.innerHTML=`<strong>${esc(b.dataset.giftCid)}</strong>`;}));});
    host.querySelector("#sm99SendGiftPromo")?.addEventListener('click',()=>{const cid=search?.value.trim();if(!cid){alert("Enter a Customer ID.");return;}const p=makePromo(host.querySelector("#sm99GiftType").value,cid,"gift");alert(`Gift sent. Promo code: ${p.code}`);renderAdminPromotions();});
  }

  window.renderShopMax99Promotions=renderAdminPromotions;
  window.ShopMax99=window.ShopMax99||{};
  window.ShopMax99.renderPromoBox=renderPromoBox;
  window.ShopMax99.addNotification=addNotification;
  window.ShopMax99.makePromo=makePromo;
  window.ShopMax99.spinWheel=spinWheel;

  function init(){
    renderSpinWidget(); renderNotificationUI(); syncOrderNotifications();
    window.addEventListener("shopmax99-products-updated",renderSpinWidget);
    setInterval(()=>{renderNotificationUI();syncOrderNotifications();},3000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
