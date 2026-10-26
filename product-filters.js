(function(){
  "use strict";
  const FIELD_DEFS = [
    ["category","Category",["category","productCategory"]],
    ["subcategory","Sub Category",["subcategory"]],
    ["gender","Gender",["gender"]],
    ["color","Color",["color","colour"]],
    ["fabric","Fabric",["fabric"]],
    ["size","Size",["size","sizes"]],
    ["price","Price",["customerPrice","price","sellingPrice"]],
    ["rating","Rating",["rating","averageRating"]],
    ["occasion","Occasion",["occasion","ocassion"]],
    ["combo","Combo",["combo","comboOf","comboPack"]],
    ["discount","Discount",["discount","discountPercent","discountPercentage"]],
    ["fitShape","Fit / Shape",["fitShape","fit","shape"]],
    ["material","Material",["material"]],
    ["bottomLength","Bottom Length",["bottomLength"]],
    ["printPattern","Print Or Pattern Type",["printOrPatternType","printPatternType","printPattern"]],
    ["ornamentation","Ornamentation",["ornamentation"]],
    ["bottomPattern","Bottom Pattern Type",["bottomPatternType","bottomPattern"]],
    ["surfaceStyling","Surface Styling",["surfaceStyling"]],
    ["backType","Back Type",["backType"]],
    ["loomType","Loom Type",["loomType"]],
    ["compatibleModels","Compatible Models",["compatibleModels","compatibleModel"]],
    ["waistRise","Waist Rise",["waistRise"]],
    ["bottomType","Bottom Type",["bottomType"]],
    ["dialDesign","Dial Design",["dialDesign"]],
    ["type","Type",["type","productType"]]
  ];

  const LABELS = Object.fromEntries(FIELD_DEFS.map(x=>[x[0],x[1]]));
  const BOOL_KEYS = new Set([]);
  const PRICE_KEY = "price";
  const RATING_KEY = "rating";

  function esc(value){
    const d=document.createElement("div"); d.textContent=String(value ?? ""); return d.innerHTML;
  }
  function norm(v){ return String(v ?? "").trim().toLowerCase(); }
  function valuesFrom(raw){
    if (raw == null || raw === "") return [];
    if (Array.isArray(raw)) return raw.flatMap(valuesFrom).filter(Boolean);
    if (typeof raw === "object") return Object.values(raw).flatMap(valuesFrom).filter(Boolean);
    return String(raw).split(/\s*[,|/]\s*/).map(x=>x.trim()).filter(Boolean);
  }
  function rawValue(product, key){
    const def=FIELD_DEFS.find(x=>x[0]===key); if(!def) return undefined;
    for(const prop of def[2]) if(product && product[prop] != null && product[prop] !== "") return product[prop];
    return undefined;
  }
  function priceOf(p){
    const n=Number(rawValue(p,PRICE_KEY)); return Number.isFinite(n) ? n : 0;
  }
  function ratingOf(p){
    const n=Number(rawValue(p,RATING_KEY)); return Number.isFinite(n) ? n : 0;
  }
  function discountOf(p){
    const direct=rawValue(p,"discount");
    if(direct !== undefined){
      const n=Number(String(direct).replace(/[^0-9.\-]/g,""));
      if(Number.isFinite(n)) return n;
    }
    const old=Number(p?.sellerPrice);
    const current=priceOf(p);
    if(Number.isFinite(old) && old>current && current>0) return ((old-current)/old)*100;
    return 0;
  }
  function boolValue(raw){
    if(typeof raw === "boolean") return raw;
    const s=norm(raw); return ["true","yes","1","y","gold","mall","available"].includes(s);
  }
  function fieldHasData(products,key){
    if(key===PRICE_KEY || key===RATING_KEY) return products.some(p=>key===PRICE_KEY ? priceOf(p)>0 : ratingOf(p)>0);
    if(key==="discount") return products.some(p=>discountOf(p)>0);
    return products.some(p=>{
      const raw=rawValue(p,key); return BOOL_KEYS.has(key) ? boolValue(raw) : valuesFrom(raw).length>0;
    });
  }
  const FIXED_OPTIONS = {
    category: [["men","Men"],["women","Women"],["kids","Kids"],["home","Home & Living"],["beauty","Beauty"],["mobile","Mobile"],["fitness","Fitness"],["electronics","Electronics"],["others","Others"]],
    subcategory: [["Cloths","Cloths"],["Watch","Watch"],["Shoes","Shoes"],["Bags","Bags"],["Accessories","Accessories"],["TV","TV"],["AC","AC"],["Refrigerator","Refrigerator"],["Washing Machine","Washing Machine"],["Cooler","Cooler"],["Speaker","Speaker"],["Headphones","Headphones"],["Computer","Computer"],["Mobile Phones","Mobile Phones"],["Chargers & Cables","Chargers & Cables"],["Cases & Covers","Cases & Covers"],["Kitchen","Kitchen"],["Furniture","Furniture"],["Home Decor","Home Decor"],["Storage","Storage"],["Appliances","Appliances"],["Makeup","Makeup"],["Skincare","Skincare"],["Hair Care","Hair Care"],["Fragrance","Fragrance"],["Fitness Equipment","Fitness Equipment"],["Fitness Accessories","Fitness Accessories"],["Sports Accessories","Sports Accessories"],["Others","Others"]],
    gender: [["Male","Male"],["Female","Female"],["Kids","Kids"],["Unisex","Unisex"]],
    size: [["XS","XS"],["S","S"],["M","M"],["L","L"],["XL","XL"],["XXL","XXL"],["XXXL","XXXL"]],
    fabric: [["Cotton","Cotton"],["Rayon","Rayon"],["Silk","Silk"],["Georgette","Georgette"],["Chiffon","Chiffon"],["Linen","Linen"],["Denim","Denim"],["Polyester","Polyester"],["Wool","Wool"],["Blended","Blended"],["Other","Other"]],
    color: [["Black","Black"],["White","White"],["Red","Red"],["Blue","Blue"],["Green","Green"],["Yellow","Yellow"],["Pink","Pink"],["Purple","Purple"],["Brown","Brown"],["Grey","Grey"],["Silver","Silver"],["Gold","Gold"],["Other","Other"]],
    occasion: [["Casual","Casual"],["Party","Party"],["Wedding","Wedding"],["Festive","Festive"],["Formal","Formal"],["Daily Wear","Daily Wear"]],
    combo: [["Single","Single"],["Pack of 2","Pack of 2"],["Pack of 3","Pack of 3"],["Pack of 4","Pack of 4"],["Combo","Combo"]],
    fitShape: [["Regular","Regular"],["Slim","Slim"],["Relaxed","Relaxed"],["Oversized","Oversized"],["Straight","Straight"],["A-Line","A-Line"]],
    material: [["Cotton","Cotton"],["Leather","Leather"],["Metal","Metal"],["Plastic","Plastic"],["Steel","Steel"],["Wood","Wood"],["Silicone","Silicone"],["Other","Other"]],
    bottomLength: [["Ankle Length","Ankle Length"],["Full Length","Full Length"],["Knee Length","Knee Length"],["Cropped","Cropped"],["Short","Short"]],
    printPattern: [["Solid","Solid"],["Floral","Floral"],["Printed","Printed"],["Striped","Striped"],["Checked","Checked"],["Geometric","Geometric"],["Embroidered","Embroidered"],["Other","Other"]],
    ornamentation: [["Embroidery","Embroidery"],["Lace","Lace"],["Sequins","Sequins"],["Zari","Zari"],["None","None"]],
    bottomPattern: [["Solid","Solid"],["Printed","Printed"],["Checked","Checked"],["Striped","Striped"],["Embroidered","Embroidered"]],
    surfaceStyling: [["Lace","Lace"],["Sequins","Sequins"],["Ruffles","Ruffles"],["Pleats","Pleats"],["Embroidery","Embroidery"]],
    backType: [["Regular","Regular"],["Open Back","Open Back"],["Keyhole","Keyhole"],["Button Back","Button Back"]],
    loomType: [["Handloom","Handloom"],["Powerloom","Powerloom"],["Other","Other"]],
    waistRise: [["Low Rise","Low Rise"],["Mid Rise","Mid Rise"],["High Rise","High Rise"]],
    bottomType: [["Jeans","Jeans"],["Trousers","Trousers"],["Leggings","Leggings"],["Shorts","Shorts"],["Skirt","Skirt"],["Palazzo","Palazzo"]],
    dialDesign: [["Round","Round"],["Square","Square"],["Rectangular","Rectangular"],["Other","Other"]],
    type: [["Analog","Analog"],["Digital","Digital"],["Smart","Smart"],["Other","Other"]]
  };
  function optionValues(products,key){
    if(FIXED_OPTIONS[key]) return FIXED_OPTIONS[key];
    if(key===PRICE_KEY || key===RATING_KEY || key==="discount") return [];
    const map=new Map();
    products.forEach(p=>valuesFrom(rawValue(p,key)).forEach(v=>{const k=norm(v);if(!map.has(k))map.set(k,v);}));
    return [...map.entries()];
  }
  function availableDefs(products){
    return FIELD_DEFS;
  }
  function defaultState(){ return {options:{},minPrice:"",maxPrice:"",minRating:"",minDiscount:""}; }
  function getState(el){ return el.__sm99FilterState || defaultState(); }
  function setState(el,state){ el.__sm99FilterState=state; }
  function selectedOptions(state,key){ return Array.isArray(state.options?.[key]) ? state.options[key] : []; }
  function toggleOption(state,key,value,checked){
    state.options=state.options||{}; const arr=new Set(selectedOptions(state,key));
    checked ? arr.add(value) : arr.delete(value); state.options[key]=[...arr];
  }
  function matches(p,state){
    for(const [key, selected] of Object.entries(state.options||{})){
      if(!selected.length) continue;
      if(BOOL_KEYS.has(key)){
        const wantYes=selected.includes("yes"), wantNo=selected.includes("no");
        const actual=boolValue(rawValue(p,key));
        if((wantYes&&!actual) || (wantNo&&actual)) return false;
        continue;
      }
      const productVals=valuesFrom(rawValue(p,key)).map(norm);
      const aliases={male:["male","men"],female:["female","women"],kids:["kids","kid","children"]};
      if(!selected.some(v=>{const sv=norm(v); return (aliases[sv]||[sv]).some(a=>productVals.includes(a));})) return false;
    }
    const price=priceOf(p);
    if(state.minPrice!=="" && price < Number(state.minPrice)) return false;
    if(state.maxPrice!=="" && price > Number(state.maxPrice)) return false;
    const rating=ratingOf(p);
    if(state.minRating!=="" && rating < Number(state.minRating)) return false;
    const discount=discountOf(p);
    if(state.minDiscount!=="" && discount < Number(state.minDiscount)) return false;
    return true;
  }
  function activeCount(state){
    return Object.values(state.options||{}).reduce((n,a)=>n+(a?.length||0),0)
      + (state.minPrice!==""?1:0)+(state.maxPrice!==""?1:0)+(state.minRating!==""?1:0)+(state.minDiscount!==""?1:0);
  }
  function render(container,products,onChange){
    if(!container) return;
    const old=getState(container), state={...defaultState(),...old,options:{...(old.options||{})}}; setState(container,state);
    const defs=availableDefs(products);
    const priceVals=products.map(priceOf).filter(v=>v>0);
    const min=Math.floor(Math.min(...priceVals,0)), max=Math.ceil(Math.max(...priceVals,0));
    const filterGroups=defs.map(([key,label])=>{
      if(key===PRICE_KEY){
        const hasPrice=priceVals.length>0;
        return `<section class="sm99-filter-group ${hasPrice?"":"is-empty"}"><button type="button" class="sm99-filter-heading" data-filter-toggle="${key}"><span>${label}</span><i class="fa-solid fa-chevron-down"></i></button><div class="sm99-filter-body" data-filter-body="${key}">${hasPrice?`<div class="sm99-range-row"><input type="number" min="0" placeholder="Min" data-filter-min="price" value="${esc(state.minPrice)}"><span>to</span><input type="number" min="0" placeholder="Max" data-filter-max="price" value="${esc(state.maxPrice)}"></div><small>₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}</small>`:`<div class="sm99-filter-unavailable">No price data available.</div>`}</div></section>`;
      }
      if(key===RATING_KEY){
        return `<section class="sm99-filter-group"><button type="button" class="sm99-filter-heading" data-filter-toggle="${key}"><span>${label}</span><i class="fa-solid fa-chevron-down"></i></button><div class="sm99-filter-body" data-filter-body="${key}">${[4,3,2,1].map(v=>`<label class="sm99-check"><input type="radio" name="sm99-rating-${container.id}" value="${v}" data-filter-rating ${String(state.minRating)===String(v)?"checked":""}><span class="sm99-stars">${"★".repeat(v)}${"☆".repeat(5-v)}</span><span>${v}+ rating</span></label>`).join("")}<button type="button" class="sm99-clear-mini" data-clear-rating>Clear</button></div></section>`;
      }
      if(key==="discount"){
        return `<section class="sm99-filter-group"><button type="button" class="sm99-filter-heading" data-filter-toggle="${key}"><span>${label}</span><i class="fa-solid fa-chevron-down"></i></button><div class="sm99-filter-body" data-filter-body="${key}">${[10,20,30,40,50].map(v=>`<label class="sm99-check"><input type="radio" name="sm99-discount-${container.id}" value="${v}" data-filter-discount ${String(state.minDiscount)===String(v)?"checked":""}><span>${v}% or more</span></label>`).join("")}<button type="button" class="sm99-clear-mini" data-clear-discount>Clear</button></div></section>`;
      }
      const opts=optionValues(products,key);
      const chosen=new Set(selectedOptions(state,key));
      const optionMarkup=opts.length
        ? opts.map(([v,text])=>`<label class="sm99-check"><input type="checkbox" data-filter-option="${esc(key)}" value="${esc(v)}" ${chosen.has(v)?"checked":""}><span>${esc(text)}</span></label>`).join("")
        : `<div class="sm99-filter-unavailable">No options available.</div>`;
      return `<section class="sm99-filter-group ${opts.length?"":"is-empty"}"><button type="button" class="sm99-filter-heading" data-filter-toggle="${key}"><span>${esc(label)}</span><i class="fa-solid fa-chevron-down"></i></button><div class="sm99-filter-body" data-filter-body="${key}">${optionMarkup}</div></section>`;
    }).join("");
    container.innerHTML=`<div class="sm99-filter-top"><div><strong><i class="fa-solid fa-sliders"></i> Filters</strong><span class="sm99-filter-count" data-filter-count>${activeCount(state)?activeCount(state)+" active":"Relevant filters"}</span></div><button type="button" class="sm99-clear-all" data-clear-filters>Clear All</button></div><div class="sm99-filter-groups">${filterGroups||'<div class="sm99-no-filters">No additional product attributes are available for this catalogue yet.</div>'}</div>`;
    container.style.display='none';
    container.classList.remove('sm99-filter-single-view');
    container.querySelectorAll('.sm99-filter-group').forEach(g=>{ g.hidden=false; });
    container.querySelectorAll("[data-filter-toggle]").forEach(btn=>btn.addEventListener("click",()=>{const body=container.querySelector(`[data-filter-body="${btn.dataset.filterToggle}"]`); body?.classList.toggle("is-collapsed"); btn.classList.toggle("is-collapsed",body?.classList.contains("is-collapsed"));}));
    container.querySelectorAll("[data-filter-option]").forEach(input=>input.addEventListener("change",()=>{toggleOption(state,input.dataset.filterOption,input.value,input.checked); setState(container,state); onChange?.(state);}));
    container.querySelectorAll("[data-filter-min]").forEach(input=>input.addEventListener("input",()=>{state.minPrice=input.value;setState(container,state);onChange?.(state);}));
    container.querySelectorAll("[data-filter-max]").forEach(input=>input.addEventListener("input",()=>{state.maxPrice=input.value;setState(container,state);onChange?.(state);}));
    container.querySelectorAll("[data-filter-rating]").forEach(input=>input.addEventListener("change",()=>{state.minRating=input.checked?input.value:"";setState(container,state);onChange?.(state);}));
    container.querySelectorAll("[data-filter-discount]").forEach(input=>input.addEventListener("change",()=>{state.minDiscount=input.checked?input.value:"";setState(container,state);onChange?.(state);}));
    container.querySelector("[data-clear-rating]")?.addEventListener("click",()=>{state.minRating="";setState(container,state);render(container,products,onChange);onChange?.(state);});
    container.querySelector("[data-clear-discount]")?.addEventListener("click",()=>{state.minDiscount="";setState(container,state);render(container,products,onChange);onChange?.(state);});
    container.querySelector("[data-clear-filters]")?.addEventListener("click",()=>{const fresh=defaultState();setState(container,fresh);render(container,products,onChange);onChange?.(fresh);});
  }
  const ICON_PATHS={category:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',gender:'<circle cx="9" cy="9" r="4"/><path d="M12 12l6 6M15 15h5v-5"/>',color:'<circle cx="12" cy="12" r="8"/>',fabric:'<path d="M4 6c4-3 8 3 16 0M4 12c4-3 8 3 16 0M4 18c4-3 8 3 16 0"/>',size:'<path d="M4 4h16v16H4zM8 4v4M12 4v2M16 4v4"/>',price:'<path d="M7 4h8l4 4-7 12L5 8z"/>',rating:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',occasion:'<rect x="4" y="5" width="16" height="15" rx="2"/>',combo:'<rect x="4" y="5" width="7" height="7" rx="1"/><rect x="13" y="12" width="7" height="7" rx="1"/>',discount:'<path d="M7 17 17 7"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/>',fitShape:'<path d="M7 4h10l2 5-4 3v8H9v-8L5 9z"/>',material:'<path d="M5 5h14v14H5zM8 8h8v8H8z"/>',bottomLength:'<path d="M7 4v16M17 4v16"/>',printPattern:'<path d="M5 5h14v14H5zM8 8h2v2H8zM14 14h2v2h-2z"/>',ornamentation:'<path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>',bottomPattern:'<path d="M4 6h16M4 12h16M4 18h16"/>',surfaceStyling:'<path d="M4 8h16M4 12h16M4 16h16"/>',backType:'<path d="M7 5h10l3 4-3 10H7L4 9z"/>',loomType:'<path d="M5 4v16M19 4v16M5 8h14M5 12h14M5 16h14"/>',compatibleModels:'<rect x="6" y="3" width="12" height="18" rx="2"/>',waistRise:'<path d="M6 5h12v5l-3 3v7H9v-7l-3-3z"/>',bottomType:'<path d="M7 4h10l1 16h-5l-1-9-1 9H6z"/>',dialDesign:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',type:'<path d="M5 5h14v14H5zM9 9h6v6H9z"/>'};
  function svgIcon(key){ return `<svg class="sm99-filter-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[key]||ICON_PATHS.type}</svg>`; }
  function renderToolbar(toolbar,filterBox){
    if(!toolbar) return;
    toolbar.innerHTML=`
      <div class="sm99-filter-menu-wrap">
        <button type="button" class="sm99-filter-main-btn" data-filter-menu-toggle aria-expanded="false">
          <svg class="sm99-filter-main-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4"></path>
          </svg>
          <span>Filters</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <button type="button" class="category-footer-jump sm99-footer-jump-main" data-scroll-footer aria-label="Go to Footer">
          <i class="fa-solid fa-arrow-down"></i>
          <span>Go to Footer</span>
        </button>
        <div class="sm99-sort-inline" aria-label="Sort products">
          <label for="sm99HomeSortSelect"><i class="fa-solid fa-arrow-down-wide-short"></i><span>Sort</span></label>
          <select id="sm99HomeSortSelect" class="sm99-sort-select" aria-label="Sort products">
            <option value="relevance">Relevance</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Customer Ratings</option>
            <option value="new">Newest Arrivals</option>
          </select>
        </div>
        <div class="sm99-filter-menu" data-filter-menu hidden>
          <div class="sm99-filter-menu-head"><strong>All Filters</strong><button type="button" data-filter-menu-close aria-label="Close filters"><i class="fa-solid fa-xmark"></i></button></div>
          <div class="sm99-filter-menu-grid">
            ${FIELD_DEFS.map(([key,label])=>`<button type="button" class="sm99-filter-menu-item" data-open-filter="${key}">${svgIcon(key)}<span>${esc(label)}</span><i class="fa-solid fa-chevron-right"></i></button>`).join("")}
          </div>
        </div>
      </div>`;

    const wrap=toolbar.querySelector('.sm99-filter-menu-wrap');
    const toggle=toolbar.querySelector('[data-filter-menu-toggle]');
    const menu=toolbar.querySelector('[data-filter-menu]');
    const close=toolbar.querySelector('[data-filter-menu-close]');
    const sortSelect=toolbar.querySelector('#sm99HomeSortSelect');
    if(sortSelect){
      sortSelect.value = window.__shopmax99CurrentSort || "relevance";
      sortSelect.addEventListener('change',()=>{
        window.__shopmax99CurrentSort = sortSelect.value;
        if(typeof window.setShopMax99Sort === 'function') window.setShopMax99Sort(sortSelect.value);
      });
    }
    const closeMenu=()=>{ menu.hidden=true; toggle.setAttribute('aria-expanded','false'); wrap.classList.remove('is-open'); };
    toggle.addEventListener('click',(e)=>{e.stopPropagation(); menu.hidden=!menu.hidden; toggle.setAttribute('aria-expanded',String(!menu.hidden)); wrap.classList.toggle('is-open',!menu.hidden);});
    close.addEventListener('click',closeMenu);
    toolbar.querySelectorAll('[data-open-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.openFilter;
      const group=filterBox?.querySelector(`[data-filter-toggle="${key}"]`)?.closest('.sm99-filter-group');
      closeMenu();
      if(!group || !filterBox) return;
      filterBox.style.display='block';
      filterBox.classList.add('sm99-filter-single-view');
      filterBox.querySelectorAll('.sm99-filter-group').forEach(g=>{ g.hidden = g !== group; });
      const body=group.querySelector(`[data-filter-body="${key}"]`);
      body?.classList.remove('is-collapsed');
      group.querySelector('.sm99-filter-heading')?.classList.remove('is-collapsed');
      group.classList.add('sm99-filter-focus');
      group.scrollIntoView({behavior:'smooth',block:'nearest'});
      setTimeout(()=>group.classList.remove('sm99-filter-focus'),900);
    }));
    document.addEventListener('click',(e)=>{ if(!wrap.contains(e.target)) closeMenu(); },{once:false});
  }

  function apply(products,state){ return (products||[]).filter(p=>matches(p,state||defaultState())); }
  function hasActive(state){return activeCount(state)>0;}
  window.ShopMax99=window.ShopMax99||{};
  window.ShopMax99.productFilters={render,apply,defaultState,activeCount,hasActive,fieldDefs:FIELD_DEFS,labels:LABELS,renderToolbar};
})();
