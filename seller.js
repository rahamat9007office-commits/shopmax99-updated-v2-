(function () {
    "use strict";

    const KEYS = {
        sellers: "shopmax99_sellers",
        products: "shopmax99_products",
        orders: "shopmax99_orders",
        user: "shopmax99_user",
        transactions: "shopmax99_transactions"
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [
        ...root.querySelectorAll(selector)
    ];

    function read(key, fallback = []) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function toast(message) {
        if (window.ShopMax99?.showToast) {
            window.ShopMax99.showToast(message);
        } else {
            alert(message);
        }
    }

    const PRICING = window.ShopMax99?.pricing || {
        categories:[19,29,39,49,59,69,79,89,99].map(price=>({id:`price_${price}`,price,label:`₹${price}`})),
        getCategory:value=>{const n=Number(value)||0;const price=[19,29,39,49,59,69,79,89,99].find(x=>n<=x)||99;return{id:`price_${price}`,price,label:`₹${price}`};},
        calculate:value=>{const n=Number(value)||0;if(n<=0||n>70)return{customerPrice:0,fee:0,rate:0,priceAdjustment:0};const fee=n===70?29:Number((n*0.15).toFixed(2));const base=Number((n+fee).toFixed(2));const c=Math.max(n,Math.ceil((base-9)/10)*10+9);return{customerPrice:c,fee,rate:n?fee/n*100:0,priceAdjustment:Number((c-base).toFixed(2))}},
        getFee:value=>{const n=Number(value)||0;return n>0&&n<=70?Number((PRICING.calculate(n).fee).toFixed(2)):0;},getSellerCap:()=>70
    };

    function pricingCategoryOptions(selected = "") {
        return PRICING.categories.map(item => `<option value="${esc(item.id)}" ${String(selected) === String(item.id) ? "selected" : ""}>${esc(item.label)}${item.price ? " category" : ""}</option>`).join("");
    }

    const PRODUCT_SUBCATEGORIES = {
        men: ["Cloths","Watch","Shoes","Bags","Accessories","Others"],
        women: ["Cloths","Watch","Shoes","Bags","Accessories","Others"],
        kids: ["Cloths","Watch","Shoes","Bags","Accessories","Others"],
        home: ["Kitchen","Furniture","Home Decor","Storage","Appliances","Others"],
        beauty: ["Makeup","Skincare","Hair Care","Fragrance","Tools & Accessories","Others"],
        mobile: ["Mobile Phones","Chargers & Cables","Cases & Covers","Mobile Accessories","Others"],
        fitness: ["Fitness Equipment","Yoga","Fitness Accessories","Sports Accessories","Others"],
        electronics: ["TV","AC","Refrigerator","Washing Machine","Cooler","Speaker","Headphones","Computer","Other Electronics","Others"],
        others: ["Others"]
    };

    const ATTRIBUTE_DEFS = {
        common: [
            ["color","Color","text","Black, Blue, White"],
            ["material","Material","text","Material"],
            ["brand","Brand","text","Brand name"],
            ["model","Model","text","Model"],
            ["type","Type","text","Type"]
        ],
        cloth: [
            ["stitchedStatus","Stitched / Unstitched","select",["Stitched","Unstitched"]],
            ["fabric","Fabric","select",["Cotton","Rayon","Silk","Georgette","Chiffon","Linen","Denim","Polyester","Wool","Blended","Other"]],
            ["gender","Gender","select",["Male","Female","Kids","Unisex"]],
            ["size","Size","multi",["XS","S","M","L","XL","XXL","XXXL"]],
            ["clothLength","Cloth Length","select",["2 m","2.25 m","2.5 m","2.75 m","3 m","3.5 m","4 m","5 m","6 m","Other"]],
            ["fitShape","Fit / Shape","select",["Regular","Slim","Relaxed","Oversized","Straight","A-Line","Other"]],
            ["occasion","Occasion","multi",["Casual","Party","Wedding","Festive","Formal","Daily Wear"]],
            ["printPattern","Print / Pattern Type","multi",["Solid","Floral","Printed","Striped","Checked","Geometric","Embroidered","Other"]],
            ["ornamentation","Ornamentation","text","Embroidery, Lace, Sequins"]
        ],
        watch: [
            ["gender","Gender","select",["Male","Female","Kids","Unisex"]],
            ["dialDesign","Dial Design","select",["Round","Square","Rectangular","Other"]],
            ["strapMaterial","Strap Material","select",["Leather","Metal","Silicone","Fabric","Other"]],
            ["watchType","Watch Type","select",["Analog","Digital","Smart Watch","Analog-Digital"]],
            ["waterResistance","Water Resistance","text","e.g. 5 ATM"],
            ["color","Color","text","Black, Silver, Gold"]
        ],
        shoes: [
            ["gender","Gender","select",["Male","Female","Kids","Unisex"]],
            ["size","Size","multi",["5","6","7","8","9","10","11","12"]],
            ["shoeType","Shoe Type","select",["Sneakers","Sports","Casual","Formal","Sandals","Slippers","Boots","Other"]],
            ["upperMaterial","Upper Material","text","Material"],
            ["color","Color","text","Black, White, Brown"]
        ],
        electronics: [
            ["brand","Brand","text","Brand name"],
            ["model","Model","text","Model number"],
            ["warranty","Warranty","text","e.g. 1 Year"],
            ["color","Color","text","Color"],
            ["type","Type","text","Product type"]
        ],
        tv: [
            ["brand","Brand","text","Brand name"], ["model","Model","text","Model number"],
            ["screenSize","Screen Size","select",["24 inch","32 inch","40 inch","43 inch","50 inch","55 inch","65 inch","75 inch","Other"]],
            ["displayType","Display Type","select",["LED","QLED","OLED","LCD","Other"]],
            ["resolution","Resolution","select",["HD","Full HD","4K","8K","Other"]],
            ["smartTV","Smart TV","select",["Yes","No"]]
        ],
        ac: [
            ["brand","Brand","text","Brand name"], ["model","Model","text","Model number"],
            ["acCapacity","Capacity","select",["1 Ton","1.5 Ton","2 Ton","2.5 Ton","Other"]],
            ["starRating","Energy Rating","select",["1 Star","2 Star","3 Star","4 Star","5 Star"]],
            ["inverter","Inverter","select",["Yes","No"]],
            ["acType","AC Type","select",["Split","Window","Portable","Other"]]
        ],
        mobile: [
            ["brand","Brand","text","Brand name"], ["model","Model","text","Model number"],
            ["ram","RAM","select",["2 GB","3 GB","4 GB","6 GB","8 GB","12 GB","16 GB"]],
            ["storage","Storage","select",["32 GB","64 GB","128 GB","256 GB","512 GB","1 TB"]],
            ["color","Color","text","Color"]
        ],
        kitchen: [["material","Material","select",["Steel","Aluminium","Glass","Plastic","Wood","Ceramic","Other"]],["capacity","Capacity","text","Capacity"],["color","Color","text","Color"]],
        furniture: [["material","Material","select",["Wood","Metal","Plastic","Engineered Wood","Glass","Other"]],["dimensions","Dimensions","text","L × W × H"],["color","Color","text","Color"]],
        beauty: [["brand","Brand","text","Brand name"],["skinType","Suitable For","select",["All Skin Types","Dry","Oily","Combination","Sensitive","Normal"]],["shade","Shade","text","Shade / Variant"],["quantity","Net Quantity","text","Quantity"]],
        charger: [["brand","Brand","text","Brand name"],["compatibleModels","Compatible Models","text","Compatible device models"],["power","Power","text","e.g. 25W"],["type","Type","select",["Charger","Cable","Adapter","Power Bank","Other"]]],
        fitness: [["material","Material","text","Material"],["color","Color","text","Color"],["weightCapacity","Weight / Capacity","text","Weight or capacity"],["type","Type","text","Product type"]],
        others: [["pleaseSpecify","Please Specify","text","Specify product sub-category"]]
    };

    function attributeFieldsFor(category, subcategory, product={}) {
        const sub = String(subcategory || "").toLowerCase();
        if (sub === "cloths") {
            const stitched = String(product.stitchedStatus || "").toLowerCase();
            const base = ATTRIBUTE_DEFS.cloth.filter(def => !["size","clothLength"].includes(def[0]));
            if (stitched === "stitched") base.push(ATTRIBUTE_DEFS.cloth.find(def => def[0] === "size"));
            if (stitched === "unstitched") base.push(ATTRIBUTE_DEFS.cloth.find(def => def[0] === "clothLength"));
            return base.filter(Boolean);
        }
        if (sub === "watch") return ATTRIBUTE_DEFS.watch;
        if (sub === "shoes") return ATTRIBUTE_DEFS.shoes;
        if (category === "electronics" && sub === "tv") return ATTRIBUTE_DEFS.tv;
        if (category === "electronics" && sub === "ac") return ATTRIBUTE_DEFS.ac;
        if (category === "mobile" && sub === "mobile phones") return ATTRIBUTE_DEFS.mobile;
        if (category === "mobile" && (sub === "chargers & cables" || sub === "mobile accessories")) return ATTRIBUTE_DEFS.charger;
        if (category === "home" && sub === "kitchen") return ATTRIBUTE_DEFS.kitchen;
        if (category === "home" && sub === "furniture") return ATTRIBUTE_DEFS.furniture;
        if (category === "beauty") return ATTRIBUTE_DEFS.beauty;
        if (category === "fitness") return ATTRIBUTE_DEFS.fitness;
        if (sub === "others") return ATTRIBUTE_DEFS.others;
        if (category === "electronics") return ATTRIBUTE_DEFS.electronics;
        return ATTRIBUTE_DEFS.common;
    }

    function attributeMarkup(product={}, category="", subcategory="") {
        const defs = attributeFieldsFor(category, subcategory, product);
        const controls = defs.map(([key,label,type,options]) => {
            const value = product[key] ?? "";
            if (type === "select") return `<label class="seller-field"><span>${esc(label)} <b>*</b></span><select data-product-attr="${esc(key)}" required><option value="">Select ${esc(label)}</option>${options.map(v=>`<option value="${esc(v)}" ${String(value)===String(v)?"selected":""}>${esc(v)}</option>`).join("")}</select></label>`;
            if (type === "multi") return `<label class="seller-field"><span>${esc(label)} <b>*</b></span><select data-product-attr="${esc(key)}" multiple required>${options.map(v=>`<option value="${esc(v)}" ${Array.isArray(value)?value.includes(v):String(value).split(/\s*[,|]\s*/).includes(v)?"selected":""}>${esc(v)}</option>`).join("")}</select></label>`;
            return `<label class="seller-field"><span>${esc(label)} <b>*</b></span><input data-product-attr="${esc(key)}" type="text" value="${esc(Array.isArray(value)?value.join(", "):value)}" placeholder="${esc(options || "")}" required></label>`;
        }).join("");
        return `<div class="seller-field seller-field-full seller-dynamic-attributes"><h3>Product Attributes &amp; Filters</h3><div class="seller-form-grid">${controls}</div></div>`;
    }
    function collectProductAttributes(root){
        const out={};
        root.querySelectorAll("[data-product-attr]").forEach(el=>{
            if(el.multiple) { const values=[...el.selectedOptions].map(o=>o.value).filter(Boolean); if(values.length) out[el.dataset.productAttr]=values; }
            else if(String(el.value||"").trim()) out[el.dataset.productAttr]=el.value.trim();
        });
        return out;
    }
    function filterAttributeMarkup(product={}) { return attributeMarkup(product, product.productCategory || product.category || "", product.subcategory || ""); }
    function collectFilterAttributes(root) { return collectProductAttributes(root); }
    function renderDynamicAttributes(form, category, subcategory, product={}) {
        const host=form.querySelector("#sellerDynamicAttributes"); if(!host) return;
        host.innerHTML=attributeMarkup(product,category,subcategory);
        const stitched=form.querySelector('[data-product-attr="stitchedStatus"]');
        stitched?.addEventListener("change",()=>{
            const current=collectProductAttributes(form);
            renderDynamicAttributes(form,category,subcategory,current);
        });
    }

    function calculateCustomerPrice(sellerPrice) { return Number(PRICING.calculate?.(sellerPrice)?.customerPrice || 0); }

    function updatePricingUI(form) {
        const sellerPrice=Number(form.querySelector("#sellerProductPrice")?.value||0);
        const customerPrice=calculateCustomerPrice(sellerPrice);
        const category=PRICING.getCategory(customerPrice);
        const priceEl=form.querySelector("#sellerCalculatedCustomerPrice");
        const categoryEl=form.querySelector("#sellerCalculatedCategory");
        const feeEl=form.querySelector("#sellerPlatformFeeText");
        if(priceEl) priceEl.textContent=customerPrice ? `₹${customerPrice}` : "₹0";
        if(categoryEl) categoryEl.textContent=customerPrice ? category.label : "—";
        if(feeEl) {
            const calc = PRICING.calculate?.(sellerPrice) || {};
            feeEl.textContent = customerPrice ? `₹${Number(calc.fee || 0).toFixed(2)} (${sellerPrice === 70 ? "Flat ₹29" : "15%"})` : "₹0";
        }
    }
    function getCurrentSeller() {
        const sellers = read(KEYS.sellers, []);
        const user = read(KEYS.user, null);

        const email = String(user?.email || "").toLowerCase();

        if (email) {
            const seller = sellers.find(
                s => String(s.email || "").toLowerCase() === email
            );

            if (seller) return seller;
        }

        return sellers[sellers.length - 1] || null;
    }

    function sellerProducts(seller) {
        if (!seller) return [];

        return read(KEYS.products, []).filter(product =>
            String(product.sellerEmail || "").toLowerCase() ===
            String(seller.email || "").toLowerCase()
        );
    }

    function statusLabel(status) {
        const value = String(status || "pending").toLowerCase();

        if (["approved","active"].includes(value)) return "Active";
        if (value === "rejected") return "Rejected";
        if (value === "blocked") return "Blocked";

        return "Active";
    }
    function initSellerCenter() {
        const pages = $("#sellerPages");

        if (!pages) return;

        if (!pages.dataset.built) {
            pages.dataset.built = "1";

            pages.innerHTML = `
                <div id="sellerPageContent"></div>
            `;
        }

        const seller = getCurrentSeller();

        const headerName = $("#sellerHeaderName");
        const headerStatus = $("#sellerHeaderStatus");

        if (headerName) {
            headerName.textContent =
                seller?.shopName ||
                seller?.fullName ||
                "Seller";
        }

        if (headerStatus) {
            headerStatus.textContent = seller
                ? statusLabel(seller.status)
                : "Not Registered";
        }

        $$("[data-seller-page]").forEach(button => {

            if (button.dataset.sellerBound === "1") return;

            button.dataset.sellerBound = "1";

            button.addEventListener("click", event => {
                event.preventDefault();

                showSellerPage(
                    button.dataset.sellerPage
                );
            });
        });

        showSellerPage("dashboard");
    }
    function showSellerPage(page = "dashboard") {

        const content =
            $("#sellerPageContent") ||
            $("#sellerPages");

        if (!content) return;

        $$("[data-seller-page]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.sellerPage === page
            );
        });

        const seller = getCurrentSeller();

        if (!seller) {

            content.innerHTML = `
                <div class="seller-empty-panel">

                    <div class="seller-empty-icon">
                        <i class="fa-solid fa-store"></i>
                    </div>

                    <h2>Seller Center</h2>

                    <p>
                        No seller registration found.
                    </p>

                    <button
                        type="button"
                        class="seller-primary-btn"
                        id="sellerRegisterFromPanel"
                    >
                        Register as Seller
                    </button>

                </div>
            `;

            $("#sellerRegisterFromPanel")?.addEventListener(
                "click",
                () => {
                    window.ShopMax99?.openModal(
                        "sellerRegisterModal"
                    );
                }
            );

            return;
        }

        switch (page) {

            case "list-product":
                renderListProduct(content, seller);
                break;

            case "approved":
                renderProductsPage(
                    content,
                    seller,
                    "approved"
                );
                break;

            case "pending":
                renderProductsPage(
                    content,
                    seller,
                    "pending"
                );
                break;

            case "rejected":
                renderProductsPage(
                    content,
                    seller,
                    "rejected"
                );
                break;

            case "edit-products":
                renderProductsPage(
                    content,
                    seller,
                    "edit"
                );
                break;

            case "sponsorship":
                renderSponsorshipPage(content, seller);
                break;

            case "orders":
                renderOrders(content, seller);
                break;

            case "earnings":
                renderEarnings(content, seller);
                break;

            case "profile":
                renderProfile(content, seller);
                break;

            default:
                renderDashboard(content, seller);
        }
    }
    function renderDashboard(content, seller) {

        const products = sellerProducts(seller);

        const total =
            products.length;

        const approved =
            products.filter(
                p =>
                    String(p.status).toLowerCase() ===
                    "approved"
            ).length;

        const pending =
            products.filter(
                p =>
                    String(p.status).toLowerCase() ===
                    "pending"
            ).length;

        const rejected =
            products.filter(
                p =>
                    String(p.status).toLowerCase() ===
                    "rejected"
            ).length;

        content.innerHTML = `

            <div class="seller-dashboard-hero">
                <div class="seller-dashboard-hero-content">
                    <div class="seller-dashboard-avatar"><i class="fa-solid fa-store"></i></div>
                    <div>
                        <span class="seller-kicker">SELLER CENTER</span>
                        <h1>Welcome back, ${esc(seller.fullName || seller.shopName || "Seller")} 👋</h1>
                        <p>Manage your ShopMax99 store, products and orders from one place.</p>
                        <div class="seller-dashboard-meta">
                            <span><i class="fa-solid fa-shop"></i> ${esc(seller.shopName || "My Store")}</span>
                            <span class="seller-dashboard-live"><i class="fa-solid fa-circle"></i> Store Active</span>
                        </div>
                    </div>
                </div>
                <div class="seller-dashboard-hero-actions">
                    <button type="button" class="seller-dashboard-action primary" data-seller-page="list-product"><i class="fa-solid fa-plus"></i> Add Product</button>
                    <button type="button" class="seller-dashboard-action" data-seller-page="orders"><i class="fa-solid fa-box"></i> View Orders</button>
                </div>
            </div>

            <div class="seller-stats-grid seller-dashboard-stats">
                <div class="seller-stat-card seller-stat-total">
                    <div class="seller-stat-icon"><i class="fa-solid fa-boxes-stacked"></i></div>
                    <div class="seller-stat-copy"><span>Total Products</span><strong>${total}</strong><small>Your complete catalogue</small></div>
                </div>
                <div class="seller-stat-card approved">
                    <div class="seller-stat-icon"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="seller-stat-copy"><span>Active Products</span><strong>${approved}</strong><small>Live on marketplace</small></div>
                </div>
                <div class="seller-stat-card pending">
                    <div class="seller-stat-icon"><i class="fa-solid fa-clock"></i></div>
                    <div class="seller-stat-copy"><span>Pending</span><strong>${pending}</strong><small>Needs attention</small></div>
                </div>
                <div class="seller-stat-card rejected">
                    <div class="seller-stat-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                    <div class="seller-stat-copy"><span>Rejected</span><strong>${rejected}</strong><small>Review and update</small></div>
                </div>
            </div>

            <div class="seller-dashboard-grid">
                <div class="seller-info-card seller-dashboard-store-card">
                    <div class="seller-dashboard-card-heading">
                        <div><span class="seller-card-kicker">STORE OVERVIEW</span><h2>${esc(seller.shopName || "My Store")}</h2></div>
                        <span class="seller-dashboard-store-badge"><i class="fa-solid fa-shield-check"></i> Verified Seller</span>
                    </div>

            <div class="seller-info-card">

                <h2>
                    ${esc(
                        seller.shopName ||
                        "My Store"
                    )}
                </h2>

                <div class="seller-info-row">
                    <span>Owner</span>
                    <strong>
                        ${esc(seller.fullName)}
                    </strong>
                </div>

                <div class="seller-info-row">
                    <span>Email</span>
                    <strong>
                        ${esc(seller.email)}
                    </strong>
                </div>

                <div class="seller-info-row">
                    <span>Status</span>
                    <strong>
                        ${esc(
                            statusLabel(
                                seller.status
                            )
                        )}
                    </strong>
                </div>

            </div>
        `;
    }
    function renderListProduct(content, seller) {

    content.innerHTML = `
        <div class="seller-page-header">
            <div>
                <span class="seller-kicker">PRODUCTS</span>
                <h1>List New Product</h1>
                <p>Add your product details and publish it instantly after the pricing rules are checked.</p>
            </div>
        </div>

        <form id="sellerProductForm" class="seller-product-form">

            <!-- PRODUCT IMAGES -->
            <div class="seller-field seller-field-full">

                <label>
                    Product Images
                    <b>*</b>
                </label>

                <div class="seller-image-grid">

                    <label class="seller-image-slot">
                        <span class="seller-image-placeholder">
                            <i class="fa-solid fa-plus"></i>
                            <small>Image 1</small>
                        </span>

                        <input
                            type="file"
                            class="seller-image-input"
                            accept="image/jpeg,image/png,image/webp"
                        >
                    </label>

                    <label class="seller-image-slot">
                        <span class="seller-image-placeholder">
                            <i class="fa-solid fa-plus"></i>
                            <small>Image 2</small>
                        </span>

                        <input
                            type="file"
                            class="seller-image-input"
                            accept="image/jpeg,image/png,image/webp"
                        >
                    </label>

                    <label class="seller-image-slot">
                        <span class="seller-image-placeholder">
                            <i class="fa-solid fa-plus"></i>
                            <small>Image 3</small>
                        </span>

                        <input
                            type="file"
                            class="seller-image-input"
                            accept="image/jpeg,image/png,image/webp"
                        >
                    </label>

                    <label class="seller-image-slot">
                        <span class="seller-image-placeholder">
                            <i class="fa-solid fa-plus"></i>
                            <small>Image 4</small>
                        </span>

                        <input
                            type="file"
                            class="seller-image-input"
                            accept="image/jpeg,image/png,image/webp"
                        >
                    </label>

                </div>

                <small>
                    All 4 images are mandatory. JPG, PNG or WebP. Maximum 100 KB per image.
                </small>

            </div>


            <!-- PRODUCT NAME -->

            <div class="seller-form-grid">

                <div class="seller-field seller-field-full">

                    <label for="sellerProductName">
                        Product Name
                        <b>*</b>
                    </label>

                    <input
                        id="sellerProductName"
                        name="name"
                        type="text"
                        required
                        maxlength="120"
                        placeholder="Enter product name"
                    >

                </div>


                <div class="seller-field">
                    <label for="sellerProductProductCategory">Category <b>*</b></label>
                    <select id="sellerProductProductCategory" name="productCategory" required>
                        <option value="">Select Category</option>
                        <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
                        <option value="home">Home & Living</option><option value="beauty">Beauty</option><option value="mobile">Mobile</option>
                        <option value="fitness">Fitness</option><option value="electronics">Electronics</option><option value="others">Others</option>
                    </select>
                </div>
                <div class="seller-field">
                    <label for="sellerProductSubcategory">Sub Category <b>*</b></label>
                    <select id="sellerProductSubcategory" name="subcategory" required><option value="">Select Sub Category</option></select>
                </div>
                <div id="sellerDynamicAttributes" class="seller-field seller-field-full"></div>
                <div class="seller-field">
                    <label for="sellerProductStock">Stock <b>*</b></label>
                    <input id="sellerProductStock" name="stock" type="number" min="1" step="1" required placeholder="Enter stock">
                </div>
                <div class="seller-field">
                    <label for="sellerProductWeight">Product Weight <b>*</b></label>
                    <div style="display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:8px;align-items:center;">
                        <input id="sellerProductWeight" name="productWeight" type="number" min="0.001" step="0.001" required placeholder="e.g. 500">
                        <select id="sellerProductWeightUnit" name="productWeightUnit" required>
                            <option value="gm">Gram (g)</option>
                            <option value="kg">Kilogram (kg)</option>
                        </select>
                    </div>
                    <small style="display:block;margin-top:6px;color:#777;font-weight:600;">Courier ke liye actual product weight enter karein.</small>
                </div>
                <div class="seller-field">
                    <label>Automatic Weight Conversion</label>
                    <div class="seller-fixed-price" id="sellerWeightPounds">0.00 lb</div>
                    <small style="display:block;margin-top:6px;color:#777;font-weight:600;">1 kg = 2.20462 lb</small>
                </div>
                <div class="seller-field">
                    <label for="sellerProductPrice">Seller Price <b>*</b></label>
                    <div class="seller-price-input"><span>₹</span><input id="sellerProductPrice" name="sellerPrice" type="number" min="1" max="70" step="1" required placeholder="Enter seller price"></div>
                </div>
                <div class="seller-field">
                    <label>Platform Fee / ShopMax99 Profit</label>
                    <div class="seller-fixed-price" id="sellerPlatformFeeText">₹0</div>
                </div>
                <div class="seller-field">
                    <label>Customer Price <small style="display:block;color:#777;font-weight:600;margin-top:4px;">Seller price max ₹70 • ShopMax99 fee included</small></label>
                    <div class="seller-fixed-price" id="sellerCalculatedCustomerPrice">₹0</div>
                </div>
                <div class="seller-field">
                    <label>Price Category</label>
                    <div class="seller-fixed-price" id="sellerCalculatedCategory">—</div>
                </div>
                <div class="seller-field seller-field-full">
                    <label for="sellerProductDescription">Description <b>*</b></label>
                    <textarea id="sellerProductDescription" name="description" rows="6" maxlength="2500" required placeholder="Describe your product..."></textarea>
                </div>
            </div>


            <!-- MESSAGE -->

            <div
                id="sellerProductMessage"
                class="seller-product-message"
            ></div>


            <!-- BUTTONS -->

            <div class="seller-form-actions">

                <button
                    type="reset"
                    class="seller-secondary-btn"
                    id="sellerResetProduct"
                >
                    <i class="fa-solid fa-rotate-left"></i>
                    Reset
                </button>

                <button
                    type="submit"
                    class="seller-primary-btn"
                >
                    <i class="fa-solid fa-paper-plane"></i>
                    Publish Product
                </button>

            </div>

        </form>
    `;


    const form =
        document.getElementById(
            "sellerProductForm"
        );

    if (!form) return;

    const categorySelect=form.querySelector("#sellerProductProductCategory");
    const subcategorySelect=form.querySelector("#sellerProductSubcategory");
    const refreshSubcategories=()=>{
        const list=PRODUCT_SUBCATEGORIES[categorySelect?.value]||[];
        if(subcategorySelect) subcategorySelect.innerHTML='<option value="">Select Sub Category</option>'+list.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
        renderDynamicAttributes(form,categorySelect?.value||"",subcategorySelect?.value||"");
    };
    categorySelect?.addEventListener("change",refreshSubcategories);
    subcategorySelect?.addEventListener("change",()=>renderDynamicAttributes(form,categorySelect?.value||"",subcategorySelect?.value||""));
    form.querySelector("#sellerProductPrice")?.addEventListener("input", () => updatePricingUI(form));
    const updateWeightPreview = () => {
        const value = Number(form.querySelector("#sellerProductWeight")?.value || 0);
        const unit = form.querySelector("#sellerProductWeightUnit")?.value || "gm";
        const kg = unit === "kg" ? value : value / 1000;
        const pounds = kg * 2.2046226218;
        const out = form.querySelector("#sellerWeightPounds");
        if (out) out.textContent = `${pounds.toFixed(3)} lb`;
    };
    form.querySelector("#sellerProductWeight")?.addEventListener("input", updateWeightPreview);
    form.querySelector("#sellerProductWeightUnit")?.addEventListener("change", updateWeightPreview);
    updateWeightPreview();
    updatePricingUI(form);
    const imageInputs =
        [
            ...form.querySelectorAll(
                ".seller-image-input"
            )
        ];


    imageInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    if (!file) return;


                    const allowed =
                        [
                            "image/jpeg",
                            "image/png",
                            "image/webp"
                        ];


                    if (
                        !allowed.includes(
                            file.type
                        )
                    ) {

                        alert(
                            "Only JPG, PNG or WebP images are allowed."
                        );

                        input.value = "";

                        return;
                    }


                    if (
                        file.size >
                        100 * 1024
                    ) {

                        alert(
                            "Image size must be 100 KB or less."
                        );

                        input.value = "";

                        return;
                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        () => {

                            const slot =
                                input.closest(
                                    ".seller-image-slot"
                                );

                            if (!slot) return;


                            slot.classList.add(
                                "has-image"
                            );


                            slot.style.backgroundImage =
                                `url("${reader.result}")`;


                            const placeholder =
                                slot.querySelector(
                                    ".seller-image-placeholder"
                                );


                            if (
                                placeholder
                            ) {

                                placeholder.innerHTML = `
                                    <i class="fa-solid fa-check"></i>
                                    <small>Selected</small>
                                `;

                            }

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }
    );
    form.addEventListener(
        "reset",
        () => {

            setTimeout(
                () => {

                    form
                        .querySelectorAll(
                            ".seller-image-slot"
                        )
                        .forEach(
                            slot => {

                                slot.classList.remove(
                                    "has-image"
                                );

                                slot.style.backgroundImage =
                                    "";

                                slot.innerHTML = `
                                    <span class="seller-image-placeholder">
                                        <i class="fa-solid fa-plus"></i>
                                        <small>
                                            Add Image
                                        </small>
                                    </span>

                                    <input
                                        type="file"
                                        class="seller-image-input"
                                        accept="image/jpeg,image/png,image/webp"
                                    >
                                `;

                            }
                        );
                    renderListProduct(
                        content,
                        seller
                    );

                },
                0
            );

        }
    );
    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "sellerProductMessage"
                );


            const name =
                document.getElementById(
                    "sellerProductName"
                ).value.trim();


            const productCategory =
                document.getElementById(
                    "sellerProductProductCategory"
                ).value;


            const stock =
                Number(
                    document.getElementById(
                        "sellerProductStock"
                    ).value
                );


            const sellerPrice = Number(document.getElementById("sellerProductPrice").value);
            if (!Number.isInteger(sellerPrice) || sellerPrice < 1 || sellerPrice > 70) { toast("Seller selling price must be between ₹1 and ₹70. Maximum allowed is ₹70."); return; }
            const productWeight = Number(document.getElementById("sellerProductWeight")?.value || 0);
            const productWeightUnit = document.getElementById("sellerProductWeightUnit")?.value || "gm";
            if (!Number.isFinite(productWeight) || productWeight <= 0) { toast("Product weight enter karna mandatory hai."); return; }
            const productWeightKg = productWeightUnit === "kg" ? productWeight : productWeight / 1000;
            const productWeightLb = productWeightKg * 2.2046226218;
            const customerPrice = calculateCustomerPrice(sellerPrice);
            const autoCategory = PRICING.getCategory(customerPrice);

            const description =
                document.getElementById(
                    "sellerProductDescription"
                ).value.trim();

            const productAttributes = collectProductAttributes(form);
            const images = [];


            imageInputs.forEach(
                input => {

                    const slot =
                        input.closest(
                            ".seller-image-slot"
                        );

                    if (
                        slot &&
                        slot.style.backgroundImage
                    ) {

                        const bg =
                            slot.style.backgroundImage;

                        const match =
                            bg.match(
                                /url\(["']?(.*?)["']?\)/
                            );

                        if (
                            match &&
                            match[1]
                        ) {

                            images.push(
                                match[1]
                            );

                        }

                    }

                }
            );


            if (!name) {

                message.textContent =
                    "Product name is required.";

                message.className =
                    "seller-product-message error";

                return;
            }


            const subcategory = document.getElementById("sellerProductSubcategory")?.value || "";
            if (!productCategory || !subcategory) {
                message.textContent = "Category and Sub Category are required.";
                message.className = "seller-product-message error";
                return;
            }

            if (!Number.isFinite(sellerPrice) || sellerPrice <= 0 || !Number.isFinite(customerPrice) || customerPrice <= 0) {
                message.textContent = "Seller price is required.";
                message.className = "seller-product-message error";
                return;
            }


            if (
                !Number.isInteger(stock) ||
                stock < 1
            ) {

                message.textContent =
                    "Stock minimum 1 hona chahiye.";

                message.className =
                    "seller-product-message error";

                return;
            }




            if (!description) {

                message.textContent =
                    "Product description is required.";

                message.className =
                    "seller-product-message error";

                return;
            }


            if (images.length !== imageInputs.length) {

                message.textContent =
                    "All 4 product images are required.";

                message.className =
                    "seller-product-message error";

                return;
            }
            const products =
                JSON.parse(
                    localStorage.getItem(
                        "shopmax99_products"
                    ) || "[]"
                );


            const productId =
                (typeof window.ShopMax99?.makeUniqueProductId === "function"
                    ? window.ShopMax99.makeUniqueProductId(new Set(products.map(item => String(item?.id || ""))))
                    : "SM99-P-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase());

            const product = {

                id: productId,
                productId,

                name,

                category: productCategory,
                productCategory,
                subcategory,
                pricingCategoryId: autoCategory.id,
                pricingCategory: autoCategory.label,
                description,
                sellerPrice,
                customerPrice,
                price: customerPrice,
                platformFee: Number(PRICING.getFee(sellerPrice).toFixed(2)),
                platformFeeRate: sellerPrice === 70 ? 0 : 15,
                platformPriceAdjustment: Number((PRICING.calculate?.(sellerPrice)?.priceAdjustment || 0).toFixed(2)),

                stock,
                productWeight,
                productWeightUnit,
                productWeightKg: Number(productWeightKg.toFixed(6)),
                productWeightLb: Number(productWeightLb.toFixed(6)),

                ...productAttributes,

                images,

                image:
                    images[0],

                status:
                    "approved",

                sellerEmail:
                    seller.email,

                sellerId:
                    seller.id || "",

                createdAt:
                    new Date()
                        .toISOString()

            };


            products.unshift(
                product
            );


            localStorage.setItem(
                "shopmax99_products",
                JSON.stringify(
                    products
                )
            );
            const sellerProducts =
                JSON.parse(
                    localStorage.getItem(
                        "shopmax99SellerProducts"
                    ) || "[]"
                );


            sellerProducts.unshift(
                {
                    ...product,
                    productId: product.id,
                    status:
                        "approved"
                }
            );


            localStorage.setItem(
                "shopmax99SellerProducts",
                JSON.stringify(
                    sellerProducts
                )
            );


            message.textContent =
                `Product published successfully in ${autoCategory.label} category. Product ID: ${product.id}`;

            message.className =
                "seller-product-message success";


            form.reset();


            setTimeout(
                () => {

                    renderListProduct(
                        content,
                        seller
                    );

                },
                1200
            );


            window.dispatchEvent(
                new CustomEvent(
                    "shopmax99-products-updated"
                )
            );

        }
    );
}
    function renderSponsorshipPage(content, seller) {
        const products = sellerProducts(seller).filter(p => String(p.status || "approved").toLowerCase() !== "rejected");
        const sponsor = window.ShopMax99?.sponsorship;
        const active = sponsor?.getActive?.().filter(s => String(s.sellerEmail || "").toLowerCase() === String(seller.email || "").toLowerCase()) || [];
        content.innerHTML = `
          <div class="seller-page-header">
            <div><span class="seller-kicker">PRODUCT SPONSORSHIP</span><h1>Promote Your Products</h1><p>Sponsored products category ke top visibility area mein <b>Sponsored</b> tag ke saath aggressively showcase honge.</p></div>
            <div class="seller-header-actions"><span class="seller-status-badge approved"><i class="fa-solid fa-bullhorn"></i> Sponsored Visibility</span></div>
          </div>
          <div class="sm99-seller-sponsor-rates">
            <article><span>1 Week</span><strong>₹50</strong><small>7 days</small></article>
            <article><span>2 Weeks</span><strong>₹100</strong><small>14 days</small></article>
            <article><span>2 Months</span><strong>₹300</strong><small>60 days</small></article>
          </div>
          <div class="sm99-seller-sponsor-notice"><i class="fa-solid fa-lock"></i><div><strong>Online payment required</strong><span>Successful gateway confirmation ke baad hi sponsorship active hogi. Payment click se automatically active nahi hogi.</span></div></div>
          <section class="seller-intel-panel"><div class="seller-panel-heading"><div><span class="seller-kicker">YOUR ACTIVE PROMOTIONS</span><h2>Sponsored Products</h2></div><span>${active.length} active</span></div>
            <div class="sm99-seller-sponsor-active-list">${active.length ? active.map(s=>`<div class="sm99-seller-sponsor-active"><div><strong>${esc(s.productName)}</strong><small>ID: ${esc(s.productId)} · ${esc(s.category)}</small></div><span>${new Date(s.endAt).toLocaleDateString("en-IN")} tak</span></div>`).join("") : '<div class="seller-empty-panel"><div class="seller-empty-icon"><i class="fa-solid fa-bullhorn"></i></div><h3>No active sponsorships</h3><p>Apne listed product ke saamne Sponsor button use karein.</p></div>'}</div>
          </section>
          <section class="seller-intel-panel"><div class="seller-panel-heading"><div><span class="seller-kicker">LISTED PRODUCTS</span><h2>Choose Product to Sponsor</h2></div><span>${products.length} products</span></div>
            <div class="sm99-seller-sponsor-grid">${products.map(product=>{const a=sponsor?.activeForProduct?.(product.id); return `<article class="sm99-seller-sponsor-product"><div class="sm99-seller-sponsor-product-image">${product.image||product.images?.[0]?`<img src="${esc(product.image||product.images[0])}" alt="">`:'<i class="fa-solid fa-box"></i>'}</div><div class="sm99-seller-sponsor-product-body"><span class="sm99-product-id-mini">${esc(product.id)}</span><h3>${esc(product.name)}</h3><p>${esc(product.category||product.productCategory||"Other")} · ₹${Number(product.customerPrice||product.price||0)}</p>${a?`<div class="sm99-sponsor-live"><i class="fa-solid fa-circle-check"></i> Sponsored till ${new Date(a.endAt).toLocaleDateString("en-IN")}</div>`:`<button type="button" class="seller-primary-btn sm99-sponsor-open" data-sponsor-product="${esc(product.id)}"><i class="fa-solid fa-bullhorn"></i> Sponsor this product</button>`}</div></article>`}).join("")}</div>
          </section>`;
        content.querySelectorAll("[data-sponsor-product]").forEach(btn=>btn.addEventListener("click",()=>window.ShopMax99?.sponsorship?.openSellerModal(btn.dataset.sponsorProduct)));
    }

   function renderProductsPage(content, seller, filter) {

    let products = sellerProducts(seller);

    if (filter !== "edit") {
        products = products.filter(product =>
            String(product.status || "").toLowerCase() ===
            filter
        );
    }

    const title =
        filter === "edit"
            ? "Edit Products"
            : statusLabel(filter);

    content.innerHTML = `
        <div class="seller-page-header">

            <div>
                <span class="seller-kicker">
                    PRODUCTS
                </span>

                <h1>
                    ${title}
                </h1>

                <p>
                    Manage your submitted products.
                </p>
            </div>

        </div>

        <div class="seller-products-list">

            ${
                products.length
                    ? products.map(product =>
                        productCard(product)
                    ).join("")
                    : `
                        <div class="seller-empty-panel">

                            <div class="seller-empty-icon">
                                <i class="fa-solid fa-box-open"></i>
                            </div>

                            <h3>
                                No products found
                            </h3>

                            <p>
                                There are no products
                                in this section yet.
                            </p>

                        </div>
                    `
            }

        </div>
    `;
    content
        .querySelectorAll("[data-edit-product]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editProduct(
                        button.dataset.editProduct
                    );

                }
            );

        });
    content
        .querySelectorAll("[data-delete-product]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteSellerProduct(
                        button.dataset.deleteProduct
                    );

                }
            );

        });

    content.querySelectorAll("[data-sponsor-product]").forEach(button => {
        button.addEventListener("click", () => window.ShopMax99?.sponsorship?.openSellerModal(button.dataset.sponsorProduct));
    });
}

   function productCard(product) {

    const status =
        String(
            product.status || "pending"
        ).toLowerCase();


    return `
        <div class="seller-product-card">

            <div class="seller-product-image">

                ${
                    product.image ||
                    product.images?.[0]
                        ? `
                            <img
                                src="${esc(
                                    product.image ||
                                    product.images?.[0]
                                )}"
                                alt="${esc(
                                    product.name
                                )}"
                            >
                        `
                        : `
                            <i class="fa-solid fa-box"></i>
                        `
                }

            </div>


            <div class="seller-product-details">

                <h3>
                    ${esc(product.name)}
                </h3>

                <p>
                    ${esc(product.category || "More")}
                    · Stock ${Number(product.stock || 0)}
                </p>

                <div class="seller-product-prices">

                    <span>
                        Seller ₹${Number(
                            product.sellerPrice || 0
                        )}
                    </span>

                    <span>
                        Customer ₹${Number(
                            product.customerPrice || 99
                        )}
                    </span>

                </div>


                <span
                    class="
                        seller-status-badge
                        ${
                            status.includes("approved") || status.includes("active")
                                ? "approved"
                                : status.includes("rejected") || status.includes("blocked")
                                    ? "rejected"
                                    : "pending"
                        }
                    "
                >
                    ${
                        status.includes("approved") || status.includes("active")
                            ? "Active"
                            : status.includes("rejected")
                                ? "Rejected"
                                : "Pending"
                    }
                </span>

            </div>


            <!-- SELLER ACTIONS -->

            <div class="seller-product-actions">

                <button
                    type="button"
                    class="seller-edit-btn"
                    data-edit-product="${esc(
                        product.id
                    )}"
                >
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>


                <button
                    type="button"
                    class="seller-delete-btn"
                    data-delete-product="${esc(
                        product.id
                    )}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>

                <button type="button" class="seller-primary-btn sm99-inline-sponsor" data-sponsor-product="${esc(product.id)}">
                    <i class="fa-solid fa-bullhorn"></i> Sponsor
                </button>

            </div>

        </div>
    `;
}
    function editProduct(id) {
        const products = read(KEYS.products, []);
        const index = products.findIndex(
            product => String(product.id) === String(id)
        );

        if (index === -1) {
            toast("Product not found.");
            return;
        }

        const product = products[index];
        const existingImages = Array.isArray(product.images)
            ? product.images
            : (product.image ? [product.image] : []);

        document.getElementById("sm99SellerEditModal")?.remove();

        const modal = document.createElement("div");
        modal.id = "sm99SellerEditModal";
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;">
                <div style="width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px;">
                        <div>
                            <h2 style="margin:0 0 5px;">Edit Product</h2>
                            <p style="margin:0;color:#666;font-size:13px;">Seller edits publish directly after the pricing rules are checked. No Admin approval is required for seller-owned product edits.</p>
                        </div>
                        <button type="button" data-close-edit style="border:0;background:#f1f1f1;border-radius:8px;padding:8px 12px;font-size:18px;cursor:pointer;">×</button>
                    </div>

                    <form id="sm99SellerEditForm">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                            <label style="display:block;">
                                <span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Product Name *</span>
                                <input id="sm99SellerEditName" required value="${esc(product.name || "")}" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;">
                            </label>
                            <label style="display:block;">
                                <span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Product Category *</span>
                                <select id="sm99SellerEditProductCategory" required style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;">
                                    ${[["men","Men"],["women","Women"],["kids","Kids"],["home","Home & Living"],["beauty","Beauty"],["mobile","Mobile"],["fitness","Fitness"],["electronics","Electronics"],["others","Others"]].map(([id,label])=>`<option value="${id}" ${(product.productCategory || product.category)===id?"selected":""}>${label}</option>`).join("")}
                                </select>
                            </label>
                            <label style="display:block;">
                                <span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Seller Price *</span>
                                <input id="sm99SellerEditPrice" type="number" min="1" max="70" step="1" required value="${Number(product.sellerPrice || 0)}" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;">
                            </label>
                            <label style="display:block;"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Customer Price</span><div id="sm99SellerEditCustomerPricePreview" class="seller-fixed-price">₹${Number(product.customerPrice || product.price || 0)}</div></label>
                            <label style="display:block;">
                                <span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Stock *</span>
                                <input id="sm99SellerEditStock" type="number" min="1" step="1" required value="${Number(product.stock || 1)}" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;">
                            </label>
                        </div>

                        <div id="sm99SellerEditFilterAttributes">${filterAttributeMarkup(product)}</div>

                        <label style="display:block;margin-top:14px;">
                            <span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Description *</span>
                            <textarea id="sm99SellerEditDescription" required rows="5" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;resize:vertical;">${esc(product.description || "")}</textarea>
                        </label>

                        <div style="margin-top:14px;padding:14px;background:#f8f8fb;border-radius:10px;">
                            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Product Images</div>
                            <div id="sm99SellerCurrentImages" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;">
                                ${existingImages.map((img, i) => `
                                    <div data-existing-image="${i}" style="position:relative;border:1px solid #ddd;border-radius:10px;padding:6px;background:#fff;">
                                        <img src="${esc(img)}" style="width:100%;height:90px;object-fit:contain;border-radius:7px;display:block;">
                                        <button type="button" data-remove-existing-image="${i}" style="position:absolute;top:4px;right:4px;border:0;border-radius:50%;width:24px;height:24px;background:#dc2626;color:#fff;cursor:pointer;font-weight:700;">×</button>
                                    </div>`).join("")}
                            </div>
                            <label style="display:block;font-size:13px;font-weight:600;margin-bottom:7px;">Replace / Add Images (up to 4)</label>
                            <input id="sm99SellerEditImages" type="file" accept="image/*" multiple style="width:100%;padding:10px;border:1px dashed #bbb;border-radius:8px;background:#fff;">
                            <div style="margin-top:6px;font-size:12px;color:#777;">Remove an existing image with ×. New images will be added up to 4 total.</div>
                        </div>

                        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
                            <button type="button" data-close-edit style="padding:10px 18px;border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;">Cancel</button>
                            <button type="submit" style="padding:10px 20px;border:0;background:#6d28d9;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const editSellerPrice = modal.querySelector("#sm99SellerEditPrice");
        const editCustomerPreview = modal.querySelector("#sm99SellerEditCustomerPricePreview");
        const syncEditPricing = () => {
            const selling = calculateCustomerPrice(Number(editSellerPrice?.value || 0));
            if (editCustomerPreview) editCustomerPreview.textContent = `₹${selling || 0}`;
        };
        editSellerPrice?.addEventListener("input", syncEditPricing);
        syncEditPricing();

        const close = () => modal.remove();
        modal.querySelectorAll("[data-close-edit]").forEach(button => {
            button.addEventListener("click", close);
        });

        const removedImages = new Set();
        modal.querySelectorAll("[data-remove-existing-image]").forEach(button => {
            button.addEventListener("click", () => {
                const i = Number(button.dataset.removeExistingImage);
                removedImages.add(i);
                modal.querySelector(`[data-existing-image="${i}"]`)?.remove();
            });
        });

        modal.querySelector("#sm99SellerEditForm").addEventListener("submit", async event => {
            event.preventDefault();

            const name = $("#sm99SellerEditName", modal).value.trim();
            const productCategory = $("#sm99SellerEditProductCategory", modal).value;
            const price = Number($("#sm99SellerEditPrice", modal).value);
            const customerPrice = calculateCustomerPrice(price);
            const autoCategory = PRICING.getCategory(customerPrice);
            const stock = Number($("#sm99SellerEditStock", modal).value);
            const description = $("#sm99SellerEditDescription", modal).value.trim();
            const filterAttributes = collectFilterAttributes(modal);
            const imageFiles = Array.from(modal.querySelector("#sm99SellerEditImages")?.files || []);
            let updatedImages = existingImages.filter((_, i) => !removedImages.has(i));

            if (imageFiles.length) {
                const fileImages = await Promise.all(imageFiles.map(file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                })));
                updatedImages = updatedImages.concat(fileImages);
            }

            updatedImages = updatedImages.filter(Boolean).slice(0, 4);
            if (!updatedImages.length) {
                toast("At least 1 product image is required.");
                return;
            }

            if (!name || !productCategory || !description) {
                toast("Name, product category and description are required.");
                return;
            }
            if (!Number.isInteger(price) || price < 1 || price > 70) {
                toast("Seller selling price must be between ₹1 and ₹70. Maximum allowed is ₹70.");
                return;
            }

            if (!Number.isInteger(stock) || stock < 1) {
                toast("Stock must be at least 1.");
                return;
            }

            const updated = {
                ...products[index],
                name,
                category: productCategory,
                productCategory,
                pricingCategoryId: autoCategory.id,
                sellerPrice: price,
                customerPrice,
                price: customerPrice,
                platformFee: Number(PRICING.getFee(price).toFixed(2)),
                stock,
                description,
                ...filterAttributes,
                images: updatedImages,
                image: updatedImages[0],
                status: "approved",
                pricingCategory: autoCategory.label,
                updatedAt: new Date().toISOString()
            };

            products[index] = updated;
            write(KEYS.products, products);

            window.dispatchEvent(new CustomEvent("shopmax99-products-updated"));
            close();
            showSellerPage("edit-products");
            toast(`Product updated and published in ${autoCategory.label}.`);
        });
    }

    function deleteSellerProduct(id) {

    let products =
        read(
            KEYS.products,
            []
        );


    const index =
        products.findIndex(
            product =>
                String(product.id) ===
                String(id)
        );


    if (index === -1) {

        toast(
            "Product not found."
        );

        return;
    }


    const product =
        products[index];


    const confirmed =
        confirm(
            `Delete "${product.name}" permanently?`
        );


    if (!confirmed) {
        return;
    }


    products.splice(
        index,
        1
    );


    write(
        KEYS.products,
        products
    );


    const requests =
        read(
            "nestedProductRequests",
            []
        );


    const filteredRequests =
        requests.filter(
            request =>
                String(
                    request.productId ||
                    request.product?.id ||
                    ""
                ) !==
                String(id)
        );


    write(
        "nestedProductRequests",
        filteredRequests
    );


    const sellerProductsData =
        read(
            "shopmax99SellerProducts",
            []
        );


    const filteredSellerProducts =
        sellerProductsData.filter(
            product =>
                String(product.id) !==
                String(id)
        );


    write(
        "shopmax99SellerProducts",
        filteredSellerProducts
    );


    window.dispatchEvent(
        new CustomEvent(
            "shopmax99-products-updated"
        )
    );


    toast(
        "Product successfully deleted."
    );


    const seller =
        getCurrentSeller();


    if (seller) {

        showSellerPage(
            "edit-products"
        );

    }
}
    function sellerOrderWorkflow(order, sellerEmail) {
        const key = String(sellerEmail || "").toLowerCase();
        const workflows = order?.sellerWorkflows || {};
        return workflows[key] || {
            status: order?.paymentStatus && /paid|success|completed|cash on delivery/i.test(String(order.paymentStatus)) ? "Awaiting Seller Action" : "Awaiting Payment",
            acceptedAt: "",
            rejectedAt: "",
            rejectionReason: "",
            pickupStatus: "Not Scheduled",
            pickupScheduledFor: ""
        };
    }

    function sellerCanProcessOrder(order) {
        return String(order?.paymentMethod || "").toUpperCase() === "COD" || /paid|success|completed|cash on delivery/i.test(String(order?.paymentStatus || ""));
    }

    function getNextPickupSlot(fromDate = new Date()) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + 1);
        while (d.getDay() === 0) d.setDate(d.getDate() + 1);
        d.setHours(10, 0, 0, 0);
        return {
            iso: d.toISOString(),
            label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " · 10:00 AM–2:00 PM"
        };
    }

    function saveSellerOrderDecision(orderId, sellerEmail, decision, reason = "") {
        const orders = read(KEYS.orders, []);
        const index = orders.findIndex(order => String(order.id) === String(orderId));
        if (index < 0) return toast("Order nahi mila.");

        const order = orders[index];
        const key = String(sellerEmail || "").toLowerCase();
        if (!key) return toast("Seller account email missing hai.");
        if (!sellerCanProcessOrder(order)) return toast("Online payment abhi successful nahi hai. Payment successful hone ke baad order accept/reject kar sakte ho.");

        const itemBelongsToSeller = (order.items || []).some(item => String(item.sellerEmail || "").toLowerCase() === key);
        if (!itemBelongsToSeller) return toast("Is order mein aapka product nahi hai.");

        order.sellerWorkflows = order.sellerWorkflows || {};
        const now = new Date();
        const base = order.sellerWorkflows[key] || {};

        if (decision === "accept") {
            const pickup = getNextPickupSlot(now);
            order.sellerWorkflows[key] = {
                ...base,
                status: "Accepted",
                acceptedAt: now.toISOString(),
                rejectedAt: "",
                rejectionReason: "",
                pickupStatus: "Pickup Scheduled",
                pickupRequestedAt: now.toISOString(),
                pickupScheduledFor: pickup.iso,
                pickupWindow: "10:00 AM–2:00 PM"
            };
            (order.courierShipments || []).forEach(shipment => {
                const matches = (shipment.items || []).some(si => (order.items || []).some(oi => String(oi.productId || oi.id || "") === String(si.productId || "") && String(oi.sellerEmail || "").toLowerCase() === key));
                if (matches) {
                    shipment.sellerStatus = "Accepted";
                    shipment.pickupStatus = "Pickup Scheduled";
                    shipment.pickupScheduledFor = pickup.iso;
                    shipment.pickupWindow = "10:00 AM–2:00 PM";
                    shipment.pickupRequestedAt = now.toISOString();
                }
            });
            order.trackingStatus = "Seller Accepted · Pickup Scheduled";
            order.trackingHistory = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
            order.trackingHistory.push({ status: "Seller Accepted", at: now.toISOString(), note: `Seller accepted the order. Estimated pickup: ${pickup.label}` });
            order.trackingHistory.push({ status: "Pickup Scheduled", at: now.toISOString(), note: `Courier pickup expected ${pickup.label}` });
        } else {
            order.sellerWorkflows[key] = {
                ...base,
                status: "Rejected",
                acceptedAt: "",
                rejectedAt: now.toISOString(),
                rejectionReason: reason || "Seller rejected the order",
                pickupStatus: "Not Scheduled",
                pickupRequestedAt: "",
                pickupScheduledFor: ""
            };
            (order.courierShipments || []).forEach(shipment => {
                const matches = (shipment.items || []).some(si => (order.items || []).some(oi => String(oi.productId || oi.id || "") === String(si.productId || "") && String(oi.sellerEmail || "").toLowerCase() === key));
                if (matches) {
                    shipment.sellerStatus = "Rejected";
                    shipment.pickupStatus = "Cancelled";
                    shipment.pickupScheduledFor = "";
                }
            });
            order.trackingStatus = "Seller Rejected";
            order.trackingHistory = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
            order.trackingHistory.push({ status: "Seller Rejected", at: now.toISOString(), note: reason || "Seller rejected the order" });
        }

        const states = Object.values(order.sellerWorkflows);
        if (states.length === 1) {
            order.status = decision === "accept" ? "Seller Accepted · Pickup Scheduled" : "Seller Rejected";
        } else if (states.length && states.every(state => state.status === "Accepted")) {
            order.status = "All Sellers Accepted · Pickup Scheduled";
        } else if (states.some(state => state.status === "Rejected")) {
            order.status = "Seller Action / Replacement Required";
        } else {
            order.status = "Seller Processing";
        }
        order.updatedAt = now.toISOString();
        orders[index] = order;
        write(KEYS.orders, orders);
        window.dispatchEvent(new CustomEvent("shopmax99-orders-updated", { detail: { orderId: order.id } }));
        toast(decision === "accept" ? `Order accepted. Pickup scheduled for ${getNextPickupSlot(now).label}.` : "Order rejected successfully.");
        setTimeout(() => showSellerPage("orders"), 120);
    }

    function renderOrders(
        content,
        seller
    ) {
        const orders = read(KEYS.orders, []);
        const sellerEmail = String(seller.email || "").toLowerCase();
        const mine = orders.filter(order => (order.items || []).some(item => String(item.sellerEmail || "").toLowerCase() === sellerEmail));

        content.innerHTML = `
            <div class="seller-page-header">
                <div>
                    <span class="seller-kicker">ORDERS</span>
                    <h1>Orders</h1>
                    <p>Customer orders containing your products. Accept/reject yahin se karo; acceptance ke baad pickup schedule bhi yahin dikhega.</p>
                </div>
            </div>
            <div class="seller-orders-list">
                ${mine.length ? mine.map(order => {
                    const wf = sellerOrderWorkflow(order, sellerEmail);
                    const canProcess = sellerCanProcessOrder(order);
                    const orderItems = (order.items || []).filter(item => String(item.sellerEmail || "").toLowerCase() === sellerEmail);
                    const pickup = wf.pickupScheduledFor ? new Date(wf.pickupScheduledFor).toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"}) + (wf.pickupWindow ? ` · ${esc(wf.pickupWindow)}` : "") : "Not scheduled";
                    const customerAddress = order.deliveryDetails ? [order.deliveryDetails.address, order.deliveryDetails.city, order.deliveryDetails.state, order.deliveryDetails.pincode].filter(Boolean).join(", ") : (order.destination || "—");
                    const statusClass = wf.status === "Accepted" ? "accepted" : wf.status === "Rejected" ? "rejected" : "pending";
                    return `
                        <article class="seller-order-card seller-order-card-rich">
                            <div class="seller-order-main">
                                <div class="seller-order-title-row"><strong>${esc(order.id)}</strong><span class="seller-order-state ${statusClass}">${esc(wf.status || "Awaiting Seller Action")}</span></div>
                                <p><b>Customer:</b> ${esc(order.customerName || "Customer")} · ${esc(order.customerMobile || "—")}</p>
                                <p><b>Items:</b> ${orderItems.map(i => esc(i.name || "Product")).join(", ")}</p>
                                <p><b>Deliver to:</b> ${esc(customerAddress)}</p>
                                <p><b>Payment:</b> ${esc(order.paymentMethod || "—")} · ${esc(order.paymentStatus || "—")}</p>
                            </div>
                            <div class="seller-order-side">
                                <strong class="seller-order-total">₹${Number(order.total || 0)}</strong>
                                ${wf.status === "Accepted" ? `
                                    <div class="seller-pickup-box"><span><i class="fa-solid fa-truck"></i> Pickup</span><strong>${esc(pickup)}</strong><small>${wf.pickupStatus === "Pickup Scheduled" ? "Courier pickup scheduled/expected" : esc(wf.pickupStatus || "—")}</small></div>
                                ` : wf.status === "Rejected" ? `<div class="seller-pickup-box rejected"><span><i class="fa-solid fa-circle-xmark"></i> Rejected</span><strong>${esc(wf.rejectionReason || "Seller rejected this order")}</strong></div>` : `
                                    <div class="seller-order-actions">
                                        <button type="button" class="seller-primary-btn" data-order-accept="${esc(order.id)}" ${canProcess ? "" : "disabled"}><i class="fa-solid fa-check"></i> Accept Order</button>
                                        <button type="button" class="seller-danger-btn" data-order-reject="${esc(order.id)}" ${canProcess ? "" : "disabled"}><i class="fa-solid fa-xmark"></i> Reject</button>
                                    </div>
                                    ${canProcess ? `<small class="seller-order-hint">Payment verified. Aap accept/reject kar sakte ho.</small>` : `<small class="seller-order-hint warning"><i class="fa-solid fa-lock"></i> Online payment successful hone ka wait hai.</small>`}
                                `}
                            </div>
                        </article>`;
                }).join("") : `
                    <div class="seller-empty-panel"><div class="seller-empty-icon"><i class="fa-solid fa-bag-shopping"></i></div><h3>No orders yet</h3><p>Orders containing your products will appear here.</p></div>
                `}
            </div>`;

        content.querySelectorAll("[data-order-accept]").forEach(btn => btn.addEventListener("click", () => saveSellerOrderDecision(btn.dataset.orderAccept, sellerEmail, "accept")));
        content.querySelectorAll("[data-order-reject]").forEach(btn => btn.addEventListener("click", () => {
            const reason = prompt("Order reject karne ka reason enter karo:", "Out of stock / unable to fulfill");
            if (reason === null) return;
            saveSellerOrderDecision(btn.dataset.orderReject, sellerEmail, "reject", reason.trim());
            showSellerPage("orders");
        }));
    }
    function renderEarnings(content, seller) {
        const orders = read(KEYS.orders, []);
        const transactions = read(KEYS.transactions, []);
        const sellerEmail = String(seller.email || "").toLowerCase();
        const existingIds = new Set(transactions.map(t => String(t.id || "")));
        orders.forEach(order => {
            const completed = /^(completed|complete|delivered|fulfilled|order completed|delivered successfully)$/i.test(String(order.status || order.orderStatus || order.deliveryStatus || "").trim());
            if (!completed) return;
            (order.items || []).forEach((item, index) => {
                const itemSellerEmail = String(item.sellerEmail || "").toLowerCase();
                if (itemSellerEmail !== sellerEmail) return;
                const txId = `TX-ORDER-${order.id}-${index}-${sellerEmail}`;
                if (existingIds.has(txId)) return;
                transactions.push({
                    id: txId,
                    category: "order",
                    type: "credit",
                    amount: Number(item.sellerPrice || 0) * Number(item.quantity || 1),
                    sellerId: seller.id || "",
                    sellerEmail,
                    reference: order.id,
                    description: `Order earning - ${item.name || "Product"}`,
                    status: "completed",
                    createdAt: order.date || new Date().toISOString()
                });
                existingIds.add(txId);
            });
        });
        write(KEYS.transactions, transactions);

        const mine = transactions
            .filter(t => String(t.sellerId || "") === String(seller.id || "") || String(t.sellerEmail || "").toLowerCase() === sellerEmail)
            .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const credits = mine.filter(t => String(t.type).toLowerCase() === "credit").reduce((sum,t)=>sum+Number(t.amount||0),0);
        const debits = mine.filter(t => String(t.type).toLowerCase() === "debit").reduce((sum,t)=>sum+Number(t.amount||0),0);
        const balance = credits - debits;

        content.innerHTML = `
            <div class="seller-page-header"><div><span class="seller-kicker">FINANCE</span><h1>Earnings</h1><p>Every seller credit, debit, charge and payout is recorded here.</p></div></div>
            <div class="seller-stats-grid">
                <div class="seller-stat-card approved"><span>Total Credits</span><strong>₹${credits.toFixed(0)}</strong></div>
                <div class="seller-stat-card"><span>Total Debits / Charges</span><strong>₹${debits.toFixed(0)}</strong></div>
                <div class="seller-stat-card"><span>Available Balance</span><strong>₹${balance.toFixed(0)}</strong></div>
            </div>
            <div class="seller-panel" style="margin-top:20px;overflow:auto;">
                <h2>Transaction History</h2>
                ${mine.length ? `<table style="width:100%;border-collapse:collapse;min-width:760px;"><thead><tr><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Date</th><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Category</th><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Reference</th><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Description</th><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Amount</th><th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Status</th></tr></thead><tbody>${mine.map(t=>{const credit=String(t.type).toLowerCase()==='credit'; return `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${esc(new Date(t.createdAt||Date.now()).toLocaleString())}</td><td style="padding:10px;border-bottom:1px solid #eee;">${esc(t.category||'other')}</td><td style="padding:10px;border-bottom:1px solid #eee;">${esc(t.reference||'-')}</td><td style="padding:10px;border-bottom:1px solid #eee;">${esc(t.description||'-')}</td><td style="padding:10px;border-bottom:1px solid #eee;color:${credit?'#138a3d':'#c62828'};font-weight:700;">${credit?'+':'-'}₹${Number(t.amount||0).toFixed(0)}</td><td style="padding:10px;border-bottom:1px solid #eee;">${esc(t.status||'completed')}</td></tr>`}).join('')}</tbody></table>` : `<p style="color:#777;">No transactions yet.</p>`}
            </div>`;
    }
    function renderProfile(
        content,
        seller
    ) {
        const field = (label, name, value, type = "text", extra = "") => `
            <label class="seller-account-field">
                <span>${esc(label)}</span>
                <input type="${type}" name="${esc(name)}" value="${esc(value || "")}" ${extra}>
            </label>`;

        content.innerHTML = `
            <div class="seller-page-header">
                <div>
                    <span class="seller-kicker">ACCOUNT</span>
                    <h1>Account Details</h1>
                    <p>Apne seller account, business aur settlement details yahin se update karein.</p>
                </div>
                <div class="seller-account-status-pill">
                    <i class="fa-solid fa-circle-check"></i> ${esc(statusLabel(seller.status))}
                </div>
            </div>

            <form id="sellerAccountDetailsForm" class="seller-account-details-form">
                <section class="seller-account-section">
                    <div class="seller-account-section-head">
                        <div><span>PERSONAL & BUSINESS</span><h3>Basic Account Details</h3></div>
                        <i class="fa-solid fa-store"></i>
                    </div>
                    <div class="seller-account-grid">
                        ${field("Full Legal Name", "fullName", seller.fullName, "text", "required maxlength=100")}
                        ${field("Shop / Business Name", "shopName", seller.shopName, "text", "required maxlength=120")}
                        <label class="seller-account-field"><span>Business Type</span><select name="businessType" required>
                            ${["Sole Proprietorship","Partnership","LLP","Private Limited Company","Public Limited Company","Individual / Freelancer"].map(v=>`<option ${String(seller.businessType||"")===v?"selected":""}>${v}</option>`).join("")}
                        </select></label>
                        ${field("Business Registration / UDYAM / CIN", "businessRegistrationNo", seller.businessRegistrationNo, "text", "maxlength=80")}
                        ${field("PAN Number", "pan", seller.pan, "text", "required maxlength=10 minlength=10 pattern=[A-Za-z]{5}[0-9]{4}[A-Za-z] style=\"text-transform:uppercase\" title=\"Enter a valid PAN number\"")}
                        ${field("GSTIN (if applicable)", "gstin", seller.gstin, "text", "maxlength=15 style=\"text-transform:uppercase\"")}
                    </div>
                </section>

                <section class="seller-account-section">
                    <div class="seller-account-section-head">
                        <div><span>CONTACT</span><h3>Contact & Pickup Details</h3></div>
                        <i class="fa-solid fa-address-book"></i>
                    </div>
                    <div class="seller-account-grid">
                        ${field("Email Address", "email", seller.email, "email", "required maxlength=120 autocomplete=email")}
                        ${field("Mobile Number", "phone", seller.phone, "tel", "required maxlength=10 minlength=10 pattern=[0-9]{10} inputmode=numeric autocomplete=tel title=\"Enter a valid 10-digit mobile number\"")}
                        <label class="seller-account-field seller-account-field-full"><span>Address <b>*</b></span><textarea name="contactAddress" rows="2" required maxlength="300" autocomplete="street-address">${esc(seller.contactAddress||"")}</textarea></label>
                        <label class="seller-account-field seller-account-field-full"><span>Pickup / Business Address <b>*</b></span><textarea name="address" rows="3" required maxlength="300">${esc(seller.address||seller.pickupAddress||"")}</textarea></label>
                        ${field("City", "city", seller.city, "text", "required maxlength=60")}
                        ${field("State", "state", seller.state, "text", "required maxlength=60")}
                        ${field("PIN Code", "pincode", seller.pincode, "text", "required maxlength=6 minlength=6 pattern=[0-9]{6} inputmode=numeric title=\"Enter a valid 6-digit PIN code\"")}
                        <label class="seller-account-field seller-account-field-full"><span>Return Address</span><textarea name="returnAddress" rows="3" required maxlength="300">${esc(seller.returnAddress||"")}</textarea></label>
                    </div>
                </section>

                <section class="seller-account-section">
                    <div class="seller-account-section-head">
                        <div><span>SETTLEMENT</span><h3>Bank & Payout Details</h3></div>
                        <i class="fa-solid fa-building-columns"></i>
                    </div>
                    <div class="seller-account-grid">
                        ${field("Account Holder Name", "accountHolderName", seller.accountHolderName, "text", "required maxlength=100")}
                        ${field("Bank Name", "bankName", seller.bankName, "text", "required maxlength=100")}
                        ${field("Bank Account Number", "accountNumber", seller.accountNumber, "text", "required maxlength=30 inputmode=numeric")}
                        ${field("IFSC Code", "ifsc", seller.ifsc, "text", "required maxlength=11 minlength=11 pattern=[A-Za-z]{4}0[A-Za-z0-9]{6} style=\"text-transform:uppercase\" title=\"Enter a valid 11-character IFSC code\"")}
                        ${field("UPI ID", "upiId", seller.upiId, "text", "required maxlength=100 pattern=[A-Za-z0-9._-]+@[A-Za-z0-9.-]+ title=\"Enter a valid UPI ID, for example name@bank\"")}
                    </div>
                    <div class="seller-account-security-note"><i class="fa-solid fa-shield-halved"></i><span>Bank details payout/settlement ke liye use hongi. Sensitive information ko sirf authorized seller account se update karein.</span></div>
                </section>

                <div class="seller-account-actions">
                    <span id="sellerAccountDetailsMessage" class="seller-account-message"></span>
                    <button type="reset" class="seller-secondary-btn" id="sellerAccountResetBtn">Reset</button>
                    <button type="submit" class="seller-primary-btn"><i class="fa-solid fa-floppy-disk"></i> Save Account Details</button>
                </div>
            </form>
        `;

        const form = $("#sellerAccountDetailsForm", content);
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();
            const data = new FormData(form);
            const sellers = read(KEYS.sellers, []);
            const currentId = String(seller.id || "");
            const currentEmail = String(seller.email || "").toLowerCase();
            const index = sellers.findIndex(s => String(s.id || "") === currentId || String(s.email || "").toLowerCase() === currentEmail);

            if (index < 0) {
                toast("Seller account nahi mila.");
                return;
            }

            const next = {
                ...sellers[index],
                fullName: String(data.get("fullName") || "").trim(),
                shopName: String(data.get("shopName") || "").trim(),
                businessType: String(data.get("businessType") || "").trim(),
                businessRegistrationNo: String(data.get("businessRegistrationNo") || "").trim(),
                pan: String(data.get("pan") || "").trim().toUpperCase(),
                gstin: String(data.get("gstin") || "").trim().toUpperCase(),
                email: String(data.get("email") || "").trim().toLowerCase(),
                phone: String(data.get("phone") || "").trim(),
                contactAddress: String(data.get("contactAddress") || "").trim(),
                address: String(data.get("address") || "").trim(),
                pickupAddress: String(data.get("address") || "").trim(),
                city: String(data.get("city") || "").trim(),
                state: String(data.get("state") || "").trim(),
                pincode: String(data.get("pincode") || "").trim(),
                returnAddress: String(data.get("returnAddress") || "").trim(),
                accountHolderName: String(data.get("accountHolderName") || "").trim(),
                bankName: String(data.get("bankName") || "").trim(),
                accountNumber: String(data.get("accountNumber") || "").trim(),
                ifsc: String(data.get("ifsc") || "").trim().toUpperCase(),
                upiId: String(data.get("upiId") || "").trim(),
                updatedAt: new Date().toISOString()
            };

            if (!next.fullName || !next.shopName || !next.email || !next.phone || !next.contactAddress || !next.address || !next.city || !next.state || !next.pincode || !next.returnAddress || !next.accountHolderName || !next.bankName || !next.accountNumber || !next.ifsc || !next.upiId || !next.pan) {
                toast("Saare mandatory account, contact, PAN aur payout details complete karein.");
                return;
            }

            if (!/^[0-9]{10}$/.test(next.phone)) {
                toast("Valid 10-digit mobile number enter karein.");
                form.querySelector('[name="phone"]')?.focus();
                return;
            }
            if (!/^[0-9]{6}$/.test(next.pincode)) {
                toast("Valid 6-digit PIN code enter karein.");
                form.querySelector('[name="pincode"]')?.focus();
                return;
            }
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(next.pan)) {
                toast("Valid PAN number enter karein.");
                form.querySelector('[name="pan"]')?.focus();
                return;
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(next.ifsc)) {
                toast("Valid IFSC code enter karein.");
                form.querySelector('[name="ifsc"]')?.focus();
                return;
            }
            if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(next.upiId)) {
                toast("Valid UPI ID enter karein.");
                form.querySelector('[name="upiId"]')?.focus();
                return;
            }

            const duplicate = sellers.find((s, i) => i !== index && String(s.email || "").toLowerCase() === next.email);
            if (duplicate) {
                toast("Ye email kisi aur seller account mein already registered hai.");
                return;
            }

            const oldEmail = String(sellers[index].email || "").toLowerCase();
            sellers[index] = next;
            write(KEYS.sellers, sellers);
            const user = read(KEYS.user, null);
            if (user && String(user.email || "").toLowerCase() === oldEmail) {
                write(KEYS.user, { ...user, email: next.email, name: next.fullName });
            }
            if (oldEmail !== next.email) {
                const products = read(KEYS.products, []);
                let changed = false;
                products.forEach(product => {
                    if (String(product.sellerEmail || "").toLowerCase() === oldEmail) {
                        product.sellerEmail = next.email;
                        product.sellerId = next.id || product.sellerId;
                        changed = true;
                    }
                });
                if (changed) write(KEYS.products, products);
            }

            const message = $("#sellerAccountDetailsMessage", content);
            if (message) message.textContent = "Account details successfully updated.";
            toast("Seller account details updated successfully.");
            setTimeout(() => showSellerPage("profile"), 250);
        });

        $("#sellerAccountResetBtn", content)?.addEventListener("click", () => {
            setTimeout(() => {
                const message = $("#sellerAccountDetailsMessage", content);
                if (message) message.textContent = "Changes reset ho gaye.";
            }, 0);
        });
    }
    window.initSellerCenter =
        initSellerCenter;

    window.showSellerPage =
        showSellerPage;

    window.showSellerSection =
        showSellerPage;
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initSellerCenter
        );

    } else {

        initSellerCenter();

    }

})();