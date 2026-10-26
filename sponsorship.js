(function(){
  "use strict";
  const KEY = "shopmax99_sponsorships";
  const PAYKEY = "shopmax99_sponsor_payments";
  const PACKAGES = {
    week1: {id:"week1", label:"1 Week", price:50, days:7},
    week2: {id:"week2", label:"2 Weeks", price:100, days:14},
    month2: {id:"month2", label:"2 Months", price:300, days:60}
  };
  const read=(k,f=[])=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??f}catch(e){return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const now=()=>Date.now();
  function all(){return read(KEY,[]).filter(x=>x && x.productId);}
  function active(s,t=now()){
    const start=new Date(s.startAt||0).getTime(); const end=new Date(s.endAt||0).getTime();
    return s.status==="active" && start<=t && end>t;
  }
  function getActive(){ return all().filter(s => active(s)); }
  function activeForProduct(id){ return getActive().find(s=>String(s.productId)===String(id))||null; }
  function packageInfo(id){return PACKAGES[id]||null;}
  function cleanup(){const list=all().map(s=>{if(s.status==="payment_pending"||s.status==="cancelled")return s;return active(s)?s:{...s,status:"expired"};});write(KEY,list);return list;}
  function sellerProducts(){try{return JSON.parse(localStorage.getItem("shopmax99_products")||"[]")}catch(e){return[]}}
  function findProduct(id){return sellerProducts().find(p=>String(p.id)===String(id))||null;}
  function findSeller(){let sellers=read("shopmax99_sellers",[]), u=read("shopmax99_user",null);return sellers.find(s=>String(s.email||"").toLowerCase()===String(u?.email||"").toLowerCase())||null;}
  function money(n){return `₹${Number(n||0).toLocaleString("en-IN")}`;}
  function save(list){write(KEY,list);window.dispatchEvent(new Event("shopmax99-sponsorship-change"));window.dispatchEvent(new Event("storage"));}

  function createPendingSellerSponsorship(productId, packageId){
    const p=findProduct(productId), seller=findSeller(), pkg=packageInfo(packageId);
    if(!p||!seller||!pkg) return {ok:false,message:"Product, seller or package not found."};
    if(activeForProduct(productId)) return {ok:false,message:"This product is already sponsored."};
    const paymentId=`SPAY-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const sponsor={id:`SP-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,productId:p.id,sellerId:seller.id||"",sellerEmail:seller.email||"",productName:p.name||"",category:p.category||p.productCategory||"others",packageId:pkg.id,amount:pkg.price,source:"seller_paid",status:"payment_pending",paymentId,createdAt:new Date().toISOString(),startAt:null,endAt:null};
    const list=all(); list.unshift(sponsor); save(list);
    const payments=read(PAYKEY,[]);payments.unshift({paymentId,sponsorshipId:sponsor.id,productId:p.id,amount:pkg.price,method:"online",status:"pending",createdAt:new Date().toISOString()});write(PAYKEY,payments);
    return {ok:true,sponsor,paymentId,amount:pkg.price};
  }
  function confirmOnlinePayment(paymentId,gatewayRef){
    const list=all(); const i=list.findIndex(s=>s.paymentId===paymentId); if(i<0)return {ok:false,message:"Sponsorship payment not found."};
    const s=list[i]; if(s.status!=="payment_pending") return {ok:false,message:"Payment already processed."};
    const pkg=packageInfo(s.packageId); if(!pkg)return {ok:false,message:"Invalid sponsorship package."};
    const start=new Date(); const end=new Date(start.getTime()+pkg.days*86400000);
    list[i]={...s,status:"active",startAt:start.toISOString(),endAt:end.toISOString(),paymentStatus:"paid",gatewayReference:gatewayRef||"",activatedAt:start.toISOString()}; save(list);
    const payments=read(PAYKEY,[]); const pi=payments.findIndex(x=>x.paymentId===paymentId); if(pi>=0)payments[pi]={...payments[pi],status:"paid",gatewayReference:gatewayRef||"",paidAt:start.toISOString()}; write(PAYKEY,payments);
    return {ok:true,sponsorship:list[i]};
  }
  function adminSponsor(productId,startDate,endDate,note){
    const p=findProduct(productId); if(!p)return {ok:false,message:"Product ID not found."};
    const start=new Date(`${startDate}T00:00:00`), end=new Date(`${endDate}T23:59:59.999`);
    if(isNaN(start)||isNaN(end)||end<=start)return {ok:false,message:"Select a valid start and end date."};
    const list=all().filter(s=>!(String(s.productId)===String(productId)&&s.source==="admin_free"&&s.status==="active"));
    list.forEach((s,idx)=>{ if(String(s.productId)===String(productId) && active(s)) list[idx]={...s,status:"cancelled",cancelledAt:new Date().toISOString(),cancelReason:"Admin sponsorship override"}; });
    const s={id:`SP-ADM-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,productId:p.id,sellerId:p.sellerId||"",sellerEmail:p.sellerEmail||"",productName:p.name||"",category:p.category||p.productCategory||"others",packageId:"admin_free",amount:0,source:"admin_free",status:"active",paymentStatus:"not_required",startAt:start.toISOString(),endAt:end.toISOString(),note:note||"",createdAt:new Date().toISOString()};
    list.unshift(s);save(list);return {ok:true,sponsorship:s};
  }
  function remove(id){const list=all();const i=list.findIndex(s=>String(s.id)===String(id));if(i<0)return false;list[i]={...list[i],status:"cancelled",cancelledAt:new Date().toISOString()};save(list);return true;}
  function removeByProduct(productId){const list=all();let changed=false;const out=list.map(s=>{if(String(s.productId)===String(productId)&&active(s)){changed=true;return {...s,status:"cancelled",cancelledAt:new Date().toISOString()};}return s});if(changed)save(out);return changed;}

  function openSellerModal(productId){
    const p=findProduct(productId); if(!p)return;
    cleanup();
    const existing=activeForProduct(productId);
    const old=document.getElementById("sm99SponsorModal"); if(old)old.remove();
    const modal=document.createElement("div"); modal.id="sm99SponsorModal"; modal.className="sm99-sponsor-modal";
    modal.innerHTML=`<div class="sm99-sponsor-dialog"><button class="sm99-sponsor-close" type="button">×</button><span class="sm99-sponsor-kicker">SPONSORED VISIBILITY</span><h2>Promote this product</h2><p class="sm99-sponsor-product"><strong>${esc(p.name)}</strong><small>Product ID: ${esc(p.id)} · ${esc(p.category||p.productCategory||"Other")}</small></p><div class="sm99-sponsor-packages">${Object.values(PACKAGES).map(x=>`<button type="button" class="sm99-sponsor-package" data-package="${x.id}"><span>${x.label}</span><strong>${money(x.price)}</strong><small>Live for ${x.days} days</small></button>`).join("")}</div><div class="sm99-sponsor-note"><i class="fa-solid fa-circle-info"></i><span>Payment must be successfully confirmed by the online payment gateway before the sponsorship becomes active. A click alone never activates promotion.</span></div><div class="sm99-sponsor-payment-area" id="sm99SponsorPaymentArea"><div class="sm99-sponsor-selected">Select a sponsorship package above.</div></div><div class="sm99-sponsor-status" id="sm99SponsorStatus"></div></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove(); modal.querySelector(".sm99-sponsor-close").onclick=close; modal.addEventListener("click",e=>{if(e.target===modal)close()});
    if(existing){modal.querySelector("#sm99SponsorStatus").innerHTML=`<div class="sm99-sponsor-active"><i class="fa-solid fa-circle-check"></i> Active until ${new Date(existing.endAt).toLocaleDateString("en-IN")}</div>`;return;}
    modal.querySelectorAll("[data-package]").forEach(btn=>btn.addEventListener("click",()=>{
      const pkg=packageInfo(btn.dataset.package); const area=modal.querySelector("#sm99SponsorPaymentArea");
      area.innerHTML=`<div class="sm99-sponsor-checkout"><div><span>Selected</span><strong>${pkg.label}</strong></div><div><span>Amount</span><strong>${money(pkg.price)}</strong></div><button type="button" class="sm99-sponsor-pay" id="sm99SponsorPay"><i class="fa-solid fa-lock"></i> Proceed to Online Payment</button><small>UPI / Card / Net Banking gateway</small></div>`;
      area.querySelector("#sm99SponsorPay").onclick=()=>{
        const result=createPendingSellerSponsorship(productId,pkg.id); if(!result.ok){modal.querySelector("#sm99SponsorStatus").textContent=result.message;return;}
        modal.querySelector("#sm99SponsorStatus").innerHTML=`<div class="sm99-sponsor-pending"><strong>Payment initiated</strong><span>Payment ID: ${esc(result.paymentId)}</span><small>Sponsorship will activate only after the gateway sends a successful payment confirmation.</small></div>`;
        area.innerHTML=`<div class="sm99-sponsor-gateway-placeholder"><i class="fa-solid fa-shield-halved"></i><strong>Secure payment gateway required</strong><p>Connect Razorpay/other gateway on the secure backend. On successful payment, call <code>ShopMax99.sponsorship.confirmOnlinePayment(paymentId, gatewayReference)</code>.</p></div>`;
      };
    }));
  }

  window.ShopMax99=window.ShopMax99||{};
  window.ShopMax99.sponsorship={KEY,PACKAGES,getAll:all,getActive,activeForProduct,packageInfo,cleanup,openSellerModal,createPendingSellerSponsorship,confirmOnlinePayment,adminSponsor,remove,removeByProduct};
  window.addEventListener("shopmax99-sponsorship-change",()=>{window.dispatchEvent(new Event("shopmax99-sponsorship-refresh"));});
})();
