(function () {
    "use strict";

    const STORAGE = {
        cart: "shopmax99_cart",
        wishlist: "shopmax99_wishlist",
        user: "shopmax99_user",
        orders: "shopmax99_orders",
        sellers: "shopmax99_sellers",
        products: "shopmax99_products",
        transactions: "shopmax99_transactions",
        customerAccount: "shopmax99_customer_account",
        customerSession: "shopmax99_customer_session"
    };

    window.ShopMax99 = window.ShopMax99 || {};
    function getData(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (error) {
            console.error("Storage read error:", error);
            return fallback;
        }
    }

    function setData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            if (key === "shopmax99_products") {
                try { window.dispatchEvent(new Event("shopmax99-products-updated")); } catch (e) {}
            }
            return true;
        } catch (error) {
            console.error("Storage save error:", error);
            return false;
        }
    }

    function generateUniqueOrderId(existingOrders) {
        const used = new Set((Array.isArray(existingOrders) ? existingOrders : []).map(order => String(order?.id || order?.orderId || "")));
        let id = "";
        do {
            const time = Date.now();
            const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()
                : Math.random().toString(36).slice(2, 12).toUpperCase();
            id = `ORD-${time}-${random}`;
        } while (used.has(id));
        return id;
    }

    window.ShopMax99.storage = {
        get: getData,
        set: setData,
        keys: STORAGE
    };
    const PRICING_CATEGORIES = [19,29,39,49,59,69,79,89,99];
    const PRICE_CATEGORY_OPTIONS = PRICING_CATEGORIES.map(price => ({ id:`price_${price}`, price, label:`₹${price}` }));
    function getPriceCategory(customerPrice) {
        const value=Number(customerPrice)||0;
        const match=PRICING_CATEGORIES.find(price=>value<=price) || 99;
        const lower = match === 19 ? 1 : match - 9;
        return {id:`price_${match}`,price:match,label:`₹${lower}–₹${match}`};
    }
    function calculateShopMax99Price(sellerPrice) {
        const value=Number(sellerPrice)||0;
        if(value<=0 || value>70) return {customerPrice:0,fee:0,rate:0,priceAdjustment:0};
        const fee = value === 70 ? 29 : Number((value * 0.15).toFixed(2));
        const baseCustomer = Number((value + fee).toFixed(2));
        const customer = Math.max(value, Math.ceil((baseCustomer - 9) / 10) * 10 + 9);
        const adjustment = Number((customer - baseCustomer).toFixed(2));
        return {customerPrice:customer,fee,rate:value?fee/value*100:0,priceAdjustment:adjustment};
    }
    function getPlatformFee(sellerPrice){ return calculateShopMax99Price(sellerPrice).fee; }
    function getSellerPriceCap(){ return 70; }
    window.ShopMax99.pricing={categories:PRICE_CATEGORY_OPTIONS,getCategory:getPriceCategory,getFee:getPlatformFee,getSellerCap:getSellerPriceCap,calculate:calculateShopMax99Price};
    function makeUniqueProductId(used = new Set()) {
        let id;
        do {
            const stamp = new Date().toISOString().slice(0,10).replace(/-/g, "");
            const random = Math.random().toString(36).slice(2, 9).toUpperCase();
            id = `SM99-P-${stamp}-${random}`;
        } while (used.has(id));
        used.add(id);
        return id;
    }

    function ensureAllProductIds() {
        let products = getData(STORAGE.products, []);
        let sellerProducts = getData("shopmax99SellerProducts", []);
        products = Array.isArray(products) ? products : [];
        sellerProducts = Array.isArray(sellerProducts) ? sellerProducts : [];
        const used = new Set();
        let productsChanged = false;
        let sellerProductsChanged = false;

        products = products.map(product => {
            let id = String(product?.id || "").trim();
            if (!id || used.has(id)) {
                id = makeUniqueProductId(used);
                productsChanged = true;
                return { ...product, id };
            }
            used.add(id);
            if (!product.productId) productsChanged = true;
            return product.productId ? product : { ...product, productId: id };
        });

        const findMainMatch = item => products.find(product =>
            String(product.id || "") &&
            String(product.sellerEmail || "").toLowerCase() === String(item.sellerEmail || "").toLowerCase() &&
            String(product.name || "").trim().toLowerCase() === String(item.name || "").trim().toLowerCase() &&
            (!item.createdAt || !product.createdAt || String(item.createdAt) === String(product.createdAt))
        );

        const sellerUsed = new Set();
        sellerProducts = sellerProducts.map(item => {
            let id = String(item?.id || "").trim();
            if (!id || sellerUsed.has(id)) {
                const match = findMainMatch(item);
                if (match) id = String(match.id);
                else id = makeUniqueProductId(used);
                sellerProductsChanged = true;
            }
            sellerUsed.add(id);
            if (item.productId !== id) sellerProductsChanged = true;
            return item.productId === id ? { ...item, id } : { ...item, id, productId: id };
        });

        if (productsChanged) setData(STORAGE.products, products);
        if (sellerProductsChanged) setData("shopmax99SellerProducts", sellerProducts);
        return products;
    }

    window.ShopMax99.makeUniqueProductId = makeUniqueProductId;
    window.ShopMax99.ensureAllProductIds = ensureAllProductIds;
    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];
    function showToast(message, type = "success") {

        const container = $("#toastContainer");

        if (!container) return;

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;

        let icon = "fa-circle-check";

        if (type === "error") {
            icon = "fa-circle-xmark";
        }

        if (type === "warning") {
            icon = "fa-triangle-exclamation";
        }

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(15px)";

            setTimeout(() => toast.remove(), 200);
        }, 2800);
    }

    window.ShopMax99.showToast = showToast;
    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.ShopMax99.escapeHTML = escapeHTML;
    try { ensureAllProductIds(); } catch (error) { console.warn("Product ID migration skipped:", error); }
    function openModal(id) {

        const modal = document.getElementById(id);

        if (!modal) return;

        modal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeModal(id) {

        const modal = document.getElementById(id);

        if (!modal) return;

        modal.hidden = true;

        const anyOpen = $$(".modal-overlay").some(modal => !modal.hidden);

        if (!anyOpen) {
            document.body.style.overflow = "";
        }
    }

    window.ShopMax99.openModal = openModal;
    window.ShopMax99.closeModal = closeModal;
    function enterAdminSitePreview() {
        if (window.ShopMax99.sitePreview?.active) return;

        const snapshot = {
            customerSession: localStorage.getItem(STORAGE.customerSession),
            legacyUser: localStorage.getItem(STORAGE.user),
            customerAccount: localStorage.getItem(STORAGE.customerAccount)
        };

        window.ShopMax99.sitePreview = { active: true, type: "admin", snapshot };
        localStorage.removeItem(STORAGE.customerSession);
        localStorage.removeItem(STORAGE.user);
        localStorage.removeItem(STORAGE.customerAccount);

        const accountDropdown = document.getElementById("accountDropdown");
        if (accountDropdown) accountDropdown.hidden = true;

        const customerApp = document.getElementById("customerApp");
        const adminApp = document.getElementById("adminApp");
        if (adminApp) { adminApp.hidden = true; adminApp.style.display = "none"; }
        if (customerApp) { customerApp.hidden = false; customerApp.style.display = ""; }

        window.ShopMax99.currentRole = "admin-site-preview";
        document.body.dataset.activeRole = "admin-site-preview";
        document.body.classList.add("shopmax99-admin-site-preview");
        document.body.classList.remove("shopmax99-seller-site-preview");

        if (typeof window.showCustomerPage === "function") window.showCustomerPage("home");
        if (typeof window.updateCustomerHeader === "function") window.updateCustomerHeader();
        if (typeof window.ShopMax99.updateUserUI === "function") window.ShopMax99.updateUserUI();
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    function enterSellerSitePreview() {
        if (window.ShopMax99.sitePreview?.active) return;

        const sellerUser = getData(STORAGE.user, null);
        if (!sellerUser || String(sellerUser.role || "").toLowerCase() !== "seller") {
            window.ShopMax99.showToast?.("Seller account context is not available.");
            return;
        }

        window.ShopMax99.sitePreview = {
            active: true,
            type: "seller",
            snapshot: {
                customerSession: localStorage.getItem(STORAGE.customerSession),
                legacyUser: localStorage.getItem(STORAGE.user),
                customerAccount: localStorage.getItem(STORAGE.customerAccount)
            }
        };
        localStorage.removeItem(STORAGE.customerSession);
        localStorage.removeItem(STORAGE.customerAccount);

        const sellerApp = document.getElementById("sellerApp");
        const customerApp = document.getElementById("customerApp");
        const adminApp = document.getElementById("adminApp");
        if (sellerApp) { sellerApp.hidden = true; sellerApp.style.display = "none"; }
        if (adminApp) { adminApp.hidden = true; adminApp.style.display = "none"; }
        if (customerApp) { customerApp.hidden = false; customerApp.style.display = ""; }

        window.ShopMax99.currentRole = "seller-site-preview";
        document.body.dataset.activeRole = "seller-site-preview";
        document.body.classList.remove("shopmax99-admin-site-preview");
        document.body.classList.add("shopmax99-seller-site-preview");

        if (typeof window.showCustomerPage === "function") window.showCustomerPage("home");
        if (typeof window.updateCustomerHeader === "function") window.updateCustomerHeader();
        if (typeof window.ShopMax99.updateUserUI === "function") window.ShopMax99.updateUserUI();
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    function exitSitePreview() {
        const preview = window.ShopMax99.sitePreview;
        if (!preview?.active) return;

        const snap = preview.snapshot || {};
        if (snap.customerSession === null) localStorage.removeItem(STORAGE.customerSession);
        else if (snap.customerSession != null) localStorage.setItem(STORAGE.customerSession, snap.customerSession);
        if (snap.legacyUser === null) localStorage.removeItem(STORAGE.user);
        else if (snap.legacyUser != null) localStorage.setItem(STORAGE.user, snap.legacyUser);
        if (snap.customerAccount === null) localStorage.removeItem(STORAGE.customerAccount);
        else if (snap.customerAccount != null) localStorage.setItem(STORAGE.customerAccount, snap.customerAccount);

        const role = preview.type === "seller" ? "seller" : "admin";
        window.ShopMax99.sitePreview = null;
        document.body.classList.remove("shopmax99-admin-site-preview", "shopmax99-seller-site-preview");
        window.ShopMax99.showRole(role);
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    window.ShopMax99.enterAdminSitePreview = enterAdminSitePreview;
    window.ShopMax99.enterSellerSitePreview = enterSellerSitePreview;
    window.ShopMax99.exitAdminSitePreview = exitSitePreview;
    window.ShopMax99.exitSellerSitePreview = exitSitePreview;
    window.ShopMax99.exitSitePreview = exitSitePreview;
    function showRole(role) {
    const customer = document.getElementById("customerApp");
    const seller = document.getElementById("sellerApp");
    const admin = document.getElementById("adminApp");
    const sellerSupport = document.getElementById("sellerSupportApp");
    const customerSupport = document.getElementById("customerSupportApp");
    [customer, seller, admin, sellerSupport, customerSupport].forEach(panel => {
        if (!panel) return;

        panel.hidden = true;
        panel.style.display = "none";
    });
    let target = null;

    if (role === "customer") {
        target = customer;
    }

    if (role === "seller") {
        target = seller;
    }

    if (role === "admin") {
        target = admin;
    }

    if (!target) return;

    target.hidden = false;
    target.style.display = "";

    window.ShopMax99.currentRole = role;
    document.body.dataset.activeRole = role;
    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
    if (
        role === "seller" &&
        typeof window.initSellerCenter === "function"
    ) {
        window.initSellerCenter();

        if (typeof window.showSellerPage === "function") {
            window.showSellerPage("dashboard");
        }
    }
    if (
        role === "admin" &&
        typeof window.initAdminCenter === "function"
    ) {
        window.initAdminCenter();

        if (typeof window.showAdminPage === "function") {
            window.showAdminPage("dashboard");
        }
    }
    if (
        role === "customer" &&
        typeof window.showCustomerPage === "function"
    ) {
        window.showCustomerPage("home");
    }
}
window.ShopMax99.showRole = showRole;
window.showRole = showRole;
    function showCustomerPage(page) {

        const pages = $$(".customer-page");

        pages.forEach(section => {
            const isTarget = section.dataset.page === page;

            section.hidden = !isTarget;
            section.classList.toggle("active-page", isTarget);
        });

        $$(".customer-nav-item[data-customer-page]").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.customerPage === page
            );
        });

        window.ShopMax99.currentCustomerPage = page;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (page === "categories" && typeof window.renderShopMax99CategoryBrowser === "function") {
            window.renderShopMax99CategoryBrowser("all");
        }

        if (page === "cart" && typeof window.renderCart === "function") {
            window.renderCart();
        }

        if (
            page === "wishlist" &&
            typeof window.renderWishlist === "function"
        ) {
            window.renderWishlist();
        }

        if (
            page === "orders" &&
            typeof window.renderOrders === "function"
        ) {
            window.renderOrders();
        }
        if (page === "profile") renderCustomerProfile();
    }

    window.ShopMax99.showCustomerPage = showCustomerPage;
    window.showCustomerSection = function(section) {
        const map = { home: "home", products: "home", cart: "cart", orders: "orders", wishlist: "wishlist", profile: "profile", categories: "categories" };
        const page = map[section] || "home";
        showRole("customer");
        showCustomerPage(page);
        if (section === "products") {
            requestAnimationFrame(() => {
                const target = document.getElementById("productGrid");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        } else if (section === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };
    window.ShopMax99.showCustomerSection = window.showCustomerSection;
    function getCart() {
        return getData(STORAGE.cart, []);
    }

    function saveCart(cart) {
        const clean = Array.isArray(cart) ? cart.filter(Boolean).map(item => {
            const rawImage = String(item.image || item.imageUrl || item.photo || "");
            const safeImage = /^(https?:\/\/|data:image\/(?:png|jpe?g|webp);base64,)/i.test(rawImage) ? rawImage : "";
            return {
                id: String(item.id || item.productId || ""),
                productId: String(item.productId || item.id || ""),
                name: String(item.name || "ShopMax99 Product"),
                price: Number(item.price ?? item.customerPrice ?? 0) || 0,
                customerPrice: Number(item.customerPrice ?? item.price ?? 0) || 0,
                image: safeImage,
                category: String(item.category || item.productCategory || "others"),
                quantity: Math.max(1, Number(item.quantity || 1)),
                sellerPrice: Number(item.sellerPrice || 0) || 0,
                sellerEmail: String(item.sellerEmail || ""),
                productWeight: Number(item.productWeight || 0) || 0,
                productWeightUnit: String(item.productWeightUnit || "gm"),
                productWeightKg: Number(item.productWeightKg || 0) || 0
            };
        }).filter(item => item.id) : [];
        let saved = setData(STORAGE.cart, clean);
        let persisted = getData(STORAGE.cart, []);
        if (!saved) {
            const compact = clean.map(({ image, ...item }) => item);
            saved = setData(STORAGE.cart, compact);
            persisted = getData(STORAGE.cart, []);
        }
        if (!saved || !Array.isArray(persisted) || persisted.length !== clean.length) {
            showToast("Cart save nahi hua. Browser storage full hai; cart ke bade image data ko hata kar bhi save nahi ho saka. Products ya orders delete nahi kiye gaye.", "warning");
            return [];
        }
        updateCartCount();
        if (typeof window.renderCart === "function") {
            try { window.renderCart(); } catch (e) { console.error("ShopMax99 cart render error", e); }
        }
        return persisted;
    }

    function getProductImage(product) {
        if (!product) return "";
        const candidates = [product.image, product.imageUrl, product.photo, product.thumbnail, product.images?.[0], product.photos?.[0], product.gallery?.[0], product.productImages?.[0], product.productImage, product.mainImage];
        for (const candidate of candidates) {
            const value = typeof candidate === "string" ? candidate : candidate?.url || candidate?.src || candidate?.dataUrl || candidate?.data || candidate?.base64 || "";
            if (/^(https?:\/\/|data:image\/(?:png|jpe?g|webp|gif|avif|svg\+xml);base64,|blob:)/i.test(String(value))) return String(value);
        }
        return "";
    }

    function addToCart(product) {
        if (!product || !(product.id || product.productId)) return [];
        const id = String(product.id || product.productId);
        const available = Number(product.stock);
        if (Number.isFinite(available) && available <= 0) {
            showToast("This product is out of stock.", "warning");
            return getCart();
        }
        const price = Number(product.customerPrice ?? product.price ?? product.sellingPrice ?? 0) || 0;
        const cart = getCart();
        const existing = cart.find(item => String(item.id || item.productId) === id);
        if (existing) {
            const nextQty = Math.max(1, Number(existing.quantity || 1) + 1);
            if (Number.isFinite(available) && nextQty > available) {
                showToast(`Only ${available} item${available === 1 ? "" : "s"} available.`, "warning");
                return cart;
            }
            existing.quantity = nextQty;
        } else {
            cart.push({
                id,
                productId: id,
                name: product.name || "ShopMax99 Product",
                price,
                customerPrice: price,
                image: getProductImage(product),
                category: product.category || product.productCategory || "others",
                quantity: 1,
                sellerPrice: Number(product.sellerPrice || 0) || 0,
                sellerEmail: product.sellerEmail || "",
                productWeight: Number(product.productWeight || 0) || 0,
                productWeightUnit: product.productWeightUnit || "gm",
                productWeightKg: Number(product.productWeightKg || 0) || 0
            });
        }
        const saved = saveCart(cart);
        if (saved.some(item => String(item.id || item.productId) === id)) showToast("Product added to cart.");
        return saved;
    }

    function removeFromCart(productId) {

        let cart = getCart();

        cart = cart.filter(
            item => String(item.id) !== String(productId)
        );

        saveCart(cart);

        showToast("Product removed from cart.", "warning");
    }

    function changeCartQuantity(productId, amount) {

        const cart = getCart();

        const item = cart.find(
            product => String(product.id) === String(productId)
        );

        if (!item) return;

        item.quantity += amount;

        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        saveCart(cart);
    }

    function updateCartCount() {

        const cart = getCart();

        const count = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        const ids = [
            "cartCount",
            "sidebarCartCount"
        ];

        ids.forEach(id => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = count;
            }
        });
    }

    window.ShopMax99.getProductImage = getProductImage;
    window.ShopMax99.cart = {
        get: getCart,
        add: addToCart,
        remove: removeFromCart,
        changeQuantity: changeCartQuantity,
        save: saveCart
    };

    window.ShopMax99.user = {
        get: getUser
    };

    window.ShopMax99.checkout = checkout;
    window.ShopMax99.updateCartCount = updateCartCount;
    function getWishlist() {
        return getData(STORAGE.wishlist, []);
    }

    function updateWishlistCount() {

        const count = getWishlist().length;

        [
            "wishlistCount",
            "sidebarWishlistCount"
        ].forEach(id => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = count;
            }
        });
    }

    window.ShopMax99.wishlist = {
        get: getWishlist,
        save: function (items) {
            const compact = (Array.isArray(items) ? items : []).map(item => {
                const image = typeof item?.image === "string" && /^https?:\/\//i.test(item.image) ? item.image : "";
                return {
                    id: item?.id,
                    name: item?.name || "ShopMax99 Product",
                    category: item?.category || item?.productCategory || "",
                    productCategory: item?.productCategory || item?.category || "",
                    subcategory: item?.subcategory || item?.subCategory || "",
                    description: item?.description || "",
                    price: Number(item?.customerPrice ?? item?.price) || 0,
                    customerPrice: Number(item?.customerPrice ?? item?.price) || 0,
                    sellerPrice: Number(item?.sellerPrice) || 0,
                    rating: item?.rating || 0,
                    stock: Number(item?.stock),
                    image,
                    brand: item?.brand || item?.brandName || "",
                    discount: item?.discount || item?.discountPercent || 0
                };
            });
            const saved = setData(STORAGE.wishlist, compact);
            if (saved) {
                updateWishlistCount();
                return true;
            }
            try {
                const minimal = compact.map(item => ({ id: item.id, name: item.name, category: item.category, price: item.price, customerPrice: item.customerPrice, image: item.image }));
                localStorage.setItem(STORAGE.wishlist, JSON.stringify(minimal));
                updateWishlistCount();
                return true;
            } catch (error) {
                return false;
            }
        }
    };
    function getUser() {
        return getData(STORAGE.user, null);
    }

    function updateUserUI() {
        const customerSession = getData(STORAGE.customerSession, null);
        const customerAccount = getData(STORAGE.customerAccount, null);
        const legacyUser = getUser();
        const loggedCustomer = customerSession?.loggedIn && customerAccount ? customerAccount : legacyUser;

        const name = loggedCustomer?.name ? loggedCustomer.name : "Sign in";
        const sidebarName = loggedCustomer?.name ? loggedCustomer.name : "ShopMax User";
        const profileName = loggedCustomer?.name ? loggedCustomer.name : "ShopMax User";
        const email = loggedCustomer?.email ? loggedCustomer.email : "Not logged in";

        const accountName = $("#accountName");
        const sidebarUserName = $("#sidebarUserName");
        const profileNameElement = $("#profileName");
        const profileEmail = $("#profileEmail");

        if (accountName) accountName.textContent = name;
        if (sidebarUserName) sidebarUserName.textContent = sidebarName;
        if (profileNameElement) profileNameElement.textContent = profileName;
        if (profileEmail) profileEmail.textContent = email;
        const picture = customerAccount?.profilePicture || loggedCustomer?.profilePicture || "";
        const avatarTargets = [$("#profileAvatarPreview"), $("#sidebarAvatar")];
        avatarTargets.forEach(avatar => {
            if (!avatar) return;
            if (picture) {
                avatar.innerHTML = `<img src="${escapeHTML(picture)}" alt="Profile picture">`;
                avatar.classList.add("has-profile-photo");
            } else {
                avatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
                avatar.classList.remove("has-profile-photo");
            }
        });
    }
    function handleAuthSubmit(event) {

        event.preventDefault();

        const nameInput = $("#authName");
        const emailInput = $("#authEmail");

        const email = emailInput ? emailInput.value.trim() : "";
        const name =
            nameInput && nameInput.value.trim()
                ? nameInput.value.trim()
                : email.split("@")[0] || "ShopMax User";

        if (!email) {
            showToast("Please enter your email.", "error");
            return;
        }

        const user = {
            id: "CUS-" + Date.now(),
            name,
            email,
            createdAt: new Date().toISOString()
        };

        setData(STORAGE.user, user);

        updateUserUI();

        closeModal("authModal");

        showToast("Welcome to ShopMax99!");

        const form = $("#authForm");

        if (form) form.reset();
    }
    function handleSellerRegistration(event) {

        event.preventDefault();

        const form = event.currentTarget;

        const formData = new FormData(form);

        const seller = {
            id: "SEL-" + Date.now(),

            fullName:
                formData.get("fullName")?.toString().trim(),

            shopName:
                formData.get("shopName")?.toString().trim(),

            email:
                formData.get("email")?.toString().trim(),

            phone:
                formData.get("phone")?.toString().trim(),

            address: formData.get("address")?.toString().trim(),
            city: formData.get("city")?.toString().trim(),
            state: formData.get("state")?.toString().trim(),
            pincode: formData.get("pincode")?.toString().trim(),
            returnAddress: formData.get("returnAddress")?.toString().trim(),
            businessType: formData.get("businessType")?.toString().trim(),
            pan: formData.get("pan")?.toString().trim().toUpperCase(),
            gstin: formData.get("gstin")?.toString().trim().toUpperCase(),
            businessRegistrationNo: formData.get("businessRegistrationNo")?.toString().trim(),
            accountHolderName: formData.get("accountHolderName")?.toString().trim(),
            bankName: formData.get("bankName")?.toString().trim(),
            accountNumber: formData.get("accountNumber")?.toString().trim(),
            ifsc: formData.get("ifsc")?.toString().trim().toUpperCase(),
            upiId: formData.get("upiId")?.toString().trim(),

            status: "active",
            accountStatus: "active",
            password:
                formData.get("password")?.toString() || "",

            createdAt: new Date().toISOString()
        };

        if (
            !seller.fullName ||
            !seller.shopName ||
            !seller.email ||
            !seller.phone || !seller.address || !seller.city || !seller.state || !seller.pincode ||
            !seller.returnAddress || !seller.businessType || !seller.pan || !seller.accountHolderName ||
            !seller.bankName || !seller.accountNumber || !seller.ifsc ||
            formData.get("password") !== formData.get("passwordConfirm") || !formData.get("termsAccepted")
        ) {
            showToast(
                "Please fill all seller registration fields.",
                "error"
            );

            return;
        }

        const sellers = getData(STORAGE.sellers, []);

        sellers.push(seller);

        setData(STORAGE.sellers, sellers);

        closeModal("sellerRegisterModal");

        form.reset();

        showToast(
            "Seller account created successfully. You can login now."
        );

        if (typeof window.refreshAdminData === "function") {
            window.refreshAdminData();
        }
    }
    function performSearch() {

        const input = $("#productSearch");

        const query = input
            ? input.value.trim()
            : "";

        if (typeof window.searchProducts === "function") {
            window.searchProducts(query);
        }

        showCustomerPage("home");
    }
    function selectCategory(category) {

        if (!category) return;

        $$(".category-link").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.category === category
            );
        });

        if (window.ShopMax99.currentCustomerPage === "categories" && typeof window.openShopMax99CategoryBrowser === "function") {
            window.openShopMax99CategoryBrowser(category);
            return;
        }
        if (typeof window.filterProducts === "function") {
            window.filterProducts(category);
        }

        showCustomerPage("home");
    }
    function checkout() {
        const cart = getCart();
        if (!cart.length) { showToast("Your cart is empty.", "warning"); return; }
        $$(".modal-overlay").forEach(modal => { modal.hidden = true; modal.style.display = ""; });
        document.body.style.overflow = "";
        const session = getData(STORAGE.customerSession, null);
        const customer = getData(STORAGE.customerAccount, null);
        if (session?.loggedIn && customer) {
            const required = [customer.name, customer.mobile, customer.address, customer.city, customer.district, customer.state, customer.pincode];
            if (required.some(value => !String(value || "").trim())) {
                showToast("Checkout se pehle My Profile mein delivery details complete karein.", "warning");
                showCustomerPage("profile"); return;
            }
        }
        renderCheckoutSummary();
        applyCustomerProfileToCheckout();
        showCustomerPage("checkout");
    }

    function applyCustomerProfileToCheckout() {
        const session = getData(STORAGE.customerSession, null);
        const customer = getData(STORAGE.customerAccount, null);
        if (!session?.loggedIn || !customer) return;
        const values = { checkoutFullName: customer.name || "", checkoutPhone: customer.mobile || "", checkoutAddress: customer.address || "", checkoutCity: customer.city || "", checkoutDistrict: customer.district || "", checkoutState: customer.state || "", checkoutPincode: customer.pincode || "" };
        Object.entries(values).forEach(([id,value]) => { const input=document.getElementById(id); if(!input)return; input.value=value; input.readOnly=true; input.setAttribute("aria-readonly","true"); input.classList.add("profile-locked-field"); });
        const fields=document.querySelector("#checkoutForm .checkout-fields");
        if(fields && !fields.querySelector(".checkout-profile-lock-note")){ const note=document.createElement("div"); note.className="checkout-profile-lock-note full-field"; note.innerHTML='<i class="fa-solid fa-lock"></i><span>Delivery details profile se saved hain. Update karne ke liye <strong>My Profile</strong> par jayein.</span><button type="button" class="text-btn" data-customer-page="profile">Edit Profile</button>'; fields.prepend(note); }
    }
    function handleBuyNowCheckout() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get("shopmax99_buy_now") === "1";
        const fromStorage = localStorage.getItem("shopmax99_buy_now") === "1";
        if (!fromQuery && !fromStorage) return;
        localStorage.removeItem("shopmax99_buy_now");
        if (fromQuery) {
            try {
                const cleanUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {}
        }
        setTimeout(function () {
            const cart = getCart();
            if (!cart.length) return;
            checkout();
        }, 100);
    }

    window.ShopMax99.applyCustomerProfileToCheckout=applyCustomerProfileToCheckout;

    function getStoreSettings() {
        try { return JSON.parse(localStorage.getItem("shopmax99_settings") || "{}"); }
        catch (e) { return {}; }
    }

    function renderCheckoutPaymentControls(settings) {
        const options = document.querySelectorAll('#checkoutForm .payment-option');
        const enabled = {
            "UPI": settings.upiEnabled !== false,
            "COD": settings.codEnabled !== false,
            "Net Banking": settings.netBankingEnabled !== false,
            "Credit/Debit Card": settings.cardEnabled !== false
        };
        let firstEnabled = null;
        options.forEach(option => {
            const input = option.querySelector('input[name="paymentMethod"]');
            const isEnabled = !!input && enabled[input.value] !== false;
            option.hidden = !isEnabled;
            if (input) {
                input.disabled = !isEnabled;
                if (isEnabled && !firstEnabled) firstEnabled = input;
                if (!isEnabled) input.checked = false;
            }
        });
        if (firstEnabled && ![...options].some(o => o.querySelector('input[name="paymentMethod"]:checked')?.disabled === false)) {
            firstEnabled.checked = true;
        }
        const notice = document.querySelector('.payment-notice');
        if (notice) notice.innerHTML = `<i class="fa-solid fa-sliders"></i><span>Payment methods are controlled by Admin Settings.</span>`;
        return enabled;
    }

    function getAppliedPromo() {
        try { return JSON.parse(localStorage.getItem("shopmax99_applied_promo") || "null"); } catch { return null; }
    }
    function calculatePromoDiscount(subtotal, delivery, promo) {
        if (!promo || !promo.code || promo.used) return { discount:0, freeDelivery:false };
        const type=String(promo.type||"");
        if(type==="2") return { discount:Number((subtotal*0.02).toFixed(2)), freeDelivery:false };
        if(type==="5") return { discount:Number((subtotal*0.05).toFixed(2)), freeDelivery:false };
        if(type==="reward99") return { discount:Number(Math.min(99,subtotal).toFixed(2)), freeDelivery:false };
        if(type==="free_delivery") return { discount:delivery, freeDelivery:true };
        return { discount:0, freeDelivery:false };
    }
    function calculateCheckoutCharges(subtotal, paymentMethod) {
        const settings = getStoreSettings();
        const configuredFee = Math.max(0, Number(settings.deliveryFee || 0));
        const baseDelivery = subtotal > 199 ? 0 : configuredFee;
        const codFee = paymentMethod === "COD" && settings.codEnabled !== false ? 5 : 0;
        const promo = getAppliedPromo();
        const promoCalc = calculatePromoDiscount(subtotal, baseDelivery, promo);
        const delivery = promoCalc.freeDelivery ? 0 : baseDelivery;
        const discount = promoCalc.discount;
        return { delivery, codFee, discount, promo: promo && discount>0 ? promo : null, total: Math.max(0, subtotal + delivery + codFee - discount) };
    }

    function renderCheckoutSummary() {
        const cart = getCart();
        const items = $("#checkoutItems");
        const subtotalEl = $("#checkoutSubtotal");
        const totalEl = $("#checkoutTotal");
        const deliveryEl = $("#checkoutDelivery");
        const codFeeEl = $("#checkoutCodFee");
        const codFeeRow = $("#checkoutCodFeeRow");
        let promoRow = document.getElementById("checkoutPromoDiscountRow");
        let total = 0;

        if (items) {
            items.innerHTML = cart.map(item => {
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 99);
                total += price * qty;
                return `<div class="checkout-item">
                    <div class="checkout-item-image">${item.image ? `<img src="${escapeHTML(item.image)}" alt="">` : `<i class="fa-solid fa-box"></i>`}</div>
                    <div class="checkout-item-info"><strong>${escapeHTML(item.name)}</strong><span>Qty: ${qty}</span></div>
                    <strong>₹${price * qty}</strong>
                </div>`;
            }).join("");
        } else {
            total = cart.reduce((sum, item) => sum + Number(item.price || 99) * Number(item.quantity || 1), 0);
        }

        const paymentSettings = getStoreSettings();
        renderCheckoutPaymentControls(paymentSettings);
        const selectedMethod = document.querySelector('#checkoutForm input[name="paymentMethod"]:checked')?.value || (paymentSettings.codEnabled !== false ? "COD" : "");
        const charges = calculateCheckoutCharges(total, selectedMethod);
        if (subtotalEl) subtotalEl.textContent = `₹${total}`;
        if (!promoRow) {
            const totalRow=document.querySelector(".checkout-summary-total");
            promoRow=document.createElement("div"); promoRow.className="checkout-summary-row"; promoRow.id="checkoutPromoDiscountRow";
            totalRow?.parentNode?.insertBefore(promoRow,totalRow);
        }
        if (promoRow) { promoRow.hidden=charges.discount<=0; promoRow.innerHTML=`<span>Promo Discount</span><strong>-₹${charges.discount.toFixed(2)}</strong>`; }
        if (deliveryEl) deliveryEl.textContent = charges.delivery ? `₹${charges.delivery}` : "FREE";
        if (codFeeEl) codFeeEl.textContent = `₹${charges.codFee}`;
        if (codFeeRow) codFeeRow.hidden = charges.codFee <= 0;
        if (totalEl) totalEl.textContent = `₹${charges.total}`;
        if (typeof window.ShopMax99?.renderPromoBox === "function") window.ShopMax99.renderPromoBox();
    }

    window.ShopMax99.checkoutSummaryRefresh = renderCheckoutSummary;
    document.addEventListener("change", function(event) {
        if (event.target.matches('#checkoutForm input[name="paymentMethod"]')) renderCheckoutSummary();
    });

    function placeOrder(event) {
        event.preventDefault();

        const cart = getCart();
        if (!cart.length) {
            showToast("Your cart is empty.", "warning");
            showCustomerPage("cart");
            return;
        }

        const form = event.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const paymentMethod = form.elements.paymentMethod?.value;
        if (!paymentMethod) {
            showToast("Please select a payment method.", "warning");
            return;
        }

        const subtotal = cart.reduce(
            (sum, item) => sum + Number(item.price || 99) * Number(item.quantity || 1),
            0
        );
        const charges = calculateCheckoutCharges(subtotal, paymentMethod);
        const total = charges.total;
        const liveProducts = getData("shopmax99_products", []);
        for (const item of cart) {
            const live = liveProducts.find(p => String(p.id || p.productId) === String(item.id || item.productId));
            const available = Number(live?.stock);
            if (live && Number.isFinite(available) && (available <= 0 || Number(item.quantity || 1) > available)) {
                showToast(`${item.name || "This product"} is out of stock or has insufficient stock.`, "warning");
                if (available <= 0) {
                    saveCart(cart.filter(x => String(x.id) !== String(item.id)));
                }
                renderCheckoutSummary();
                return;
            }
        }
        const stockChanged = liveProducts.map(p => {
            const item = cart.find(x => String(x.id || x.productId) === String(p.id || p.productId));
            if (!item || !Number.isFinite(Number(p.stock))) return p;
            return { ...p, stock: Math.max(0, Number(p.stock) - Number(item.quantity || 1)), updatedAt: new Date().toISOString() };
        });
        setData("shopmax99_products", stockChanged);

        const appliedPromo = getAppliedPromo();
        if (appliedPromo && charges.discount > 0) {
            try {
                const promos=JSON.parse(localStorage.getItem("shopmax99_promocodes")||"[]");
                const idx=promos.findIndex(p=>String(p.code).toUpperCase()===String(appliedPromo.code).toUpperCase());
                if(idx>=0) { promos[idx].used=true; promos[idx].usedAt=new Date().toISOString(); localStorage.setItem("shopmax99_promocodes",JSON.stringify(promos)); }
            } catch {}
            localStorage.removeItem("shopmax99_applied_promo");
        }

        const orders = getData(STORAGE.orders, []);
        const sellers = getData(STORAGE.sellers, []);
        const customer = getCustomerAccount() || {};
        const order = {
            id: generateUniqueOrderId(orders),
            customerId: customer.id || getData(STORAGE.customerSession, null)?.customerId || "",
            customerName: customer.name || form.elements.fullName.value.trim(),
            customerEmail: customer.email || "",
            customerMobile: customer.mobile || form.elements.phone.value.trim(),
            items: cart.map(item => {
                const seller = sellers.find(s => String(s.email || "").toLowerCase() === String(item.sellerEmail || "").toLowerCase());
                const weightKg = Number(item.productWeightKg || (item.productWeightUnit === "kg" ? item.productWeight : Number(item.productWeight || 0) / 1000) || 0);
                return {
                    ...item,
                    productId: item.productId || item.id || "",
                    productWeightKg: Number(weightKg.toFixed(6)),
                    sellerPickup: seller ? {
                        sellerId: seller.id || "",
                        sellerEmail: seller.email || "",
                        shopName: seller.shopName || seller.fullName || "",
                        address: seller.address || "",
                        city: seller.city || "",
                        state: seller.state || "",
                        pincode: seller.pincode || "",
                        phone: seller.phone || ""
                    } : null
                };
            }),
            subtotal,
            deliveryCharge: charges.delivery,
            codHandlingFee: charges.codFee,
            total,
            promoCode: appliedPromo?.code || "",
            promoReward: appliedPromo?.type || "",
            promoDiscount: charges.discount || 0,
            orderValue: total,
            sellerCost: cart.reduce((sum, item) => sum + Number(item.sellerPrice || 0) * Number(item.quantity || 1), 0),
            courierCost: 0,
            courierName: "",
            origin: "Seller pickup location (per courier shipment)",
            destination: [form.elements.address.value.trim(), form.elements.city.value.trim(), form.elements.district.value.trim(), form.elements.state.value.trim(), form.elements.pincode.value.trim()].filter(Boolean).join(", "),
            deliveryBlocked: false,
            internalTrackingId: "",
            trackingNumber: "",
            trackingStatus: "Order Placed",
            trackingHistory: [{ status: "Order Placed", at: new Date().toISOString(), note: "Order created" }],
            status: paymentMethod === "COD" ? "Placed" : "Payment Pending",
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "Cash on Delivery" : "Pending - gateway required",
            deliveryDetails: {
                fullName: form.elements.fullName.value.trim(),
                phone: form.elements.phone.value.trim(),
                address: form.elements.address.value.trim(),
                city: form.elements.city.value.trim(),
                district: form.elements.district.value.trim(),
                state: form.elements.state.value.trim(),
                pincode: form.elements.pincode.value.trim()
            },
            date: new Date().toISOString()
        };
        const shipmentGroups = {};
        (order.items || []).forEach(item => {
            const key = String(item.sellerId || item.sellerEmail || "UNKNOWN");
            if (!shipmentGroups[key]) {
                shipmentGroups[key] = {
                    shipmentId: "",
                    orderId: order.id,
                    pickup: item.sellerPickup || { name: "ShopMax99 Warehouse", address: order.origin },
                    delivery: order.deliveryDetails,
                    paymentMode: paymentMethod === "COD" ? "COD" : "PREPAID",
                    codAmount: paymentMethod === "COD" ? Number(order.total || 0) : 0,
                    items: [],
                    totalWeightKg: 0
                };
            }
            const qty = Number(item.quantity || 1);
            const weightKg = Number(item.productWeightKg || 0);
            shipmentGroups[key].items.push({
                productId: item.productId || item.id || "",
                name: item.name || "",
                sku: item.productId || item.id || "",
                quantity: qty,
                unitPrice: Number(item.price || 0),
                weightKg
            });
            shipmentGroups[key].totalWeightKg += weightKg * qty;
        });
        order.courierShipments = Object.values(shipmentGroups).map(shipment => ({
            ...shipment,
            totalWeightKg: Number(Math.max(shipment.totalWeightKg, 0.001).toFixed(6))
        }));

        orders.unshift(order);
        setData(STORAGE.orders, orders);


        setData(STORAGE.cart, []);
        updateCartCount();

        if (typeof window.renderCart === "function") window.renderCart();
        if (typeof window.renderOrders === "function") window.renderOrders();

        showCustomerPage("orders");

        if (paymentMethod === "COD") {
            showToast("Order placed successfully with Cash on Delivery!");
        } else {
            showToast("Order recorded. Connect a payment gateway to collect online payment.", "warning");
        }
    }
    function getCustomerAccount(){return getData(STORAGE.customerAccount,null);}
    function saveCustomerAccount(c){
        setData(STORAGE.customerAccount,c);
        const session=getData(STORAGE.customerSession,null);
        if(session?.loggedIn){
            setData(STORAGE.customerSession,{...session,name:c.name||"Customer",mobile:c.mobile||""});
            setData(STORAGE.user,{id:c.id,name:c.name||"Customer",email:c.email||"",mobile:c.mobile||"",profilePicture:c.profilePicture||"",createdAt:c.createdAt||new Date().toISOString()});
        }
        try {
            const raw = JSON.parse(localStorage.getItem("shopmax99_users") || "[]");
            const users = Array.isArray(raw) ? raw : [];
            const index = users.findIndex(u => String(u.id || u.customerId || "") === String(c.id || ""));
            const record = { ...(index >= 0 ? users[index] : {}), ...c, id: c.id, customerId: c.id, role: "customer", updatedAt: new Date().toISOString() };
            if (index >= 0) users[index] = record; else users.unshift(record);
            localStorage.setItem("shopmax99_users", JSON.stringify(users));
        } catch (error) { console.warn("Customer directory update failed", error); }
        updateUserUI();
        if(typeof window.updateCustomerHeader==="function")window.updateCustomerHeader();
    }
    function setProfileFormEditable(type,editable){
        const card=document.querySelector(`[data-profile-card="${type}"]`);if(!card)return;
        card.querySelectorAll("input,textarea,select").forEach(el=>el.disabled=!editable);
        const actions=card.querySelector(`[data-profile-actions="${type}"]`);if(actions)actions.hidden=!editable;
        card.classList.toggle("is-editing",editable);
    }
    function clearProfileOtp(type){
        window.__shopmax99ProfileOtp=null;
        const box=document.getElementById(type==="address"?"profileAddressOtpBox":"profileContactOtpBox");
        if(box)box.hidden=true;
        const input=document.getElementById(type==="address"?"profileAddressOtp":"profileContactOtp");
        if(input)input.value="";
    }
    function populateCustomerProfile(){
        let c=getCustomerAccount();
        const session=getData(STORAGE.customerSession,null);
        const legacy=getUser();
        if(!c && session?.loggedIn){
            c={id:session.customerId||legacy?.id||("CUS_"+Date.now()),name:session.name||legacy?.name||"Customer",mobile:session.mobile||legacy?.mobile||"",email:legacy?.email||"",profilePicture:legacy?.profilePicture||"",createdAt:legacy?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
            saveCustomerAccount(c);
        }
        if(!c)return;
        const map={profileFullName:c.name||"",profileDob:c.dob||"",profileGender:c.gender||"",profileEmailInput:c.email||"",profileContactEmail:c.email||"",profileMobile:c.mobile||"",profileAddress:c.address||"",profileCity:c.city||"",profileDistrict:c.district||"",profileState:c.state||"",profilePincode:c.pincode||""};
        Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v;});
        const n=$("#profileName"),e=$("#profileEmail"),m=$("#profileMobileDisplay"),id=$("#profileCustomerId");
        if(n)n.textContent=c.name||"Customer"; if(e)e.textContent=c.email||"Email not added"; if(m)m.textContent=c.mobile?`+91 ${c.mobile}`:"Mobile not added"; if(id)id.textContent=c.id||"—";
        const avatar=$("#profileAvatarPreview"); if(avatar){if(c.profilePicture){avatar.innerHTML=`<img src="${escapeHTML(c.profilePicture)}" alt="Profile picture">`;avatar.classList.add("has-profile-photo");}else{avatar.innerHTML='<i class="fa-solid fa-user"></i>';avatar.classList.remove("has-profile-photo");}}
        const side=$("#sidebarAvatar"); if(side){if(c.profilePicture){side.innerHTML=`<img src="${escapeHTML(c.profilePicture)}" alt="Profile picture">`;side.classList.add("has-profile-photo");}else{side.innerHTML='<i class="fa-solid fa-user"></i>';side.classList.remove("has-profile-photo");}}
        const vals=[c.name,c.dob,c.mobile,c.email,c.address,c.city,c.district,c.state,c.pincode,c.profilePicture],percent=Math.round(vals.filter(v=>String(v||"").trim()).length/vals.length*100);const pill=$("#profileCompletionPill");if(pill)pill.innerHTML=`<i class="fa-solid fa-shield-heart"></i> Profile ${percent}% Complete`;
    }
    function renderCustomerProfile(){
        const session=getData(STORAGE.customerSession,null),guest=$("#profileGuestState"),content=$("#profileLoggedInContent");if(!guest||!content)return;
        if(session?.loggedIn)populateCustomerProfile();
        const c=getCustomerAccount(),loggedIn=Boolean(session?.loggedIn&&c);guest.hidden=loggedIn;content.hidden=!loggedIn;if(!loggedIn)return;
        populateCustomerProfile();["personal","contact","address"].forEach(t=>setProfileFormEditable(t,false));clearProfileOtp("contact");clearProfileOtp("address");
    }
    function createProfileOtp(type){
        const mobile=document.getElementById("profileMobile")?.value.trim()||getCustomerAccount()?.mobile||"";
        if(!/^[6-9]\d{9}$/.test(mobile)){showToast("Valid 10-digit Indian mobile number enter karein.","error");return false;}
        const otp=String(Math.floor(100000+Math.random()*900000));
        window.__shopmax99ProfileOtp={otp,mobile,createdAt:Date.now(),type};
        const box=document.getElementById(type==="address"?"profileAddressOtpBox":"profileContactOtpBox");
        const demo=document.getElementById(type==="address"?"profileAddressDemoOtp":"profileContactDemoOtp");
        if(box)box.hidden=false;if(demo)demo.textContent=`Demo OTP: ${otp}`;
        showToast("OTP generated. Verify karke change save karein.");return true;
    }
    function startContactOTP(){return createProfileOtp("contact");}
    function verifyContactOTP(){
        const q=window.__shopmax99ProfileOtp,otp=$("#profileContactOtp")?.value.trim()||"";
        if(!q||q.type!=="contact"||Date.now()-q.createdAt>300000){showToast("OTP expired. Dobara OTP request karein.","error");return;}
        if(otp!==q.otp){showToast("Incorrect OTP.","error");return;}
        const c=getCustomerAccount();if(!c)return;
        c.mobile=q.mobile;c.mobileVerified=true;c.email=$("#profileContactEmail")?.value.trim()||c.email||"";c.updatedAt=new Date().toISOString();saveCustomerAccount(c);clearProfileOtp("contact");populateCustomerProfile();setProfileFormEditable("contact",false);showToast("Contact details verified and updated successfully.");
    }
    function verifyAddressOTP(){
        const q=window.__shopmax99ProfileOtp,otp=$("#profileAddressOtp")?.value.trim()||"";
        if(!q||q.type!=="address"||Date.now()-q.createdAt>300000){showToast("OTP expired. Dobara OTP request karein.","error");return;}
        if(otp!==q.otp){showToast("Incorrect OTP.","error");return;}
        const c=getCustomerAccount();if(!c)return;
        c.address=$("#profileAddress").value.trim();c.city=$("#profileCity").value.trim();c.district=$("#profileDistrict").value.trim();c.state=$("#profileState").value.trim();c.pincode=$("#profilePincode").value.trim();c.addressVerified=true;c.updatedAt=new Date().toISOString();saveCustomerAccount(c);clearProfileOtp("address");populateCustomerProfile();setProfileFormEditable("address",false);showToast("Address verified and updated successfully.");
    }
    function bindProfileEvents(){
        document.addEventListener("click",event=>{
            const edit=event.target.closest("[data-profile-edit]");if(edit){setProfileFormEditable(edit.dataset.profileEdit,true);return;}
            const cancel=event.target.closest("[data-profile-cancel]");if(cancel){populateCustomerProfile();setProfileFormEditable(cancel.dataset.profileCancel,false);clearProfileOtp(cancel.dataset.profileCancel);return;}
        });
        $("#profileGuestLoginBtn")?.addEventListener("click",()=>openCustomerAuth());
        $("#profileVerifyContactOtp")?.addEventListener("click",verifyContactOTP);
        $("#profileVerifyAddressOtp")?.addEventListener("click",verifyAddressOTP);
        $("#profilePictureInput")?.addEventListener("change",event=>{const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/")){showToast("Sirf image file upload karein.","error");event.target.value="";return;}if(file.size>200*1024){showToast("Profile picture 200 KB se chhoti honi chahiye.","error");event.target.value="";return;}const r=new FileReader();r.onload=()=>{const c=getCustomerAccount();if(!c)return;c.profilePicture=r.result;c.updatedAt=new Date().toISOString();saveCustomerAccount(c);populateCustomerProfile();showToast("Profile picture updated.");};r.readAsDataURL(file);});
        $("#profilePersonalForm")?.addEventListener("submit",event=>{event.preventDefault();const c=getCustomerAccount();if(!c)return;c.name=$("#profileFullName").value.trim();c.dob=$("#profileDob").value;c.gender=$("#profileGender").value;c.email=$("#profileEmailInput").value.trim();c.updatedAt=new Date().toISOString();saveCustomerAccount(c);populateCustomerProfile();setProfileFormEditable("personal",false);showToast("Personal details saved.");});
        $("#profileAddressForm")?.addEventListener("submit",event=>{event.preventDefault();const c=getCustomerAccount();if(!c)return;if(!$("#profileAddress").value.trim()||!$("#profileCity").value.trim()||!$("#profileState").value.trim()||!/^[0-9]{6}$/.test($("#profilePincode").value.trim())){showToast("Complete valid address details first.","error");return;}createProfileOtp("address");});
        $("#profileContactForm")?.addEventListener("submit",event=>{event.preventDefault();const c=getCustomerAccount();if(!c)return;const mobile=$("#profileMobile").value.trim();if(!/^[6-9]\d{9}$/.test(mobile)){showToast("Valid 10-digit mobile number enter karein.","error");return;}createProfileOtp("contact");});
    }
    function bindEvents() {
        document.addEventListener("click", function (event) {

            const pageButton =
                event.target.closest("[data-customer-page]");

            if (pageButton) {

                const page =
                    pageButton.dataset.customerPage;

                showRole("customer");

                showCustomerPage(page);

                return;
            }


            const browserCategory = event.target.closest("[data-category-browser]");
            if (browserCategory && typeof window.openShopMax99CategoryBrowser === "function") {
                window.openShopMax99CategoryBrowser(browserCategory.dataset.categoryBrowser || "all");
                return;
            }
            const searchSuggestion = event.target.closest("[data-action=\"search-product\"]");
            if (searchSuggestion) {
                event.preventDefault();
                event.stopPropagation();
                const productId = searchSuggestion.dataset.productId;
                const product = (typeof window.getShopMax99Products === "function")
                    ? window.getShopMax99Products().find(p => String(p.id) === String(productId))
                    : null;
                const input = $("#productSearch");
                if (product && input) {
                    input.value = product.name || "";
                    if (typeof window.searchProducts === "function") window.searchProducts(product.name || "");
                }
                document.getElementById("sm99SearchSuggestions")?.setAttribute("hidden", "hidden");
                return;
            }
            const footerJump = event.target.closest("[data-scroll-footer]");
            if (footerJump) {
                event.preventDefault();
                document.querySelector(".shopmax99-footer")?.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
            }
            const categoryButton =
                event.target.closest("[data-category]");

            if (
                categoryButton &&
                categoryButton.dataset.category
            ) {

                selectCategory(
                    categoryButton.dataset.category
                );

                return;
            }
            const roleButton =
                event.target.closest("[data-role]");

            if (roleButton) {

                showRole(
                    roleButton.dataset.role
                );

                return;
            }
            const closeButton =
                event.target.closest("[data-close-modal]");

            if (closeButton) {

                closeModal(
                    closeButton.dataset.closeModal
                );

                return;
            }
            const accountAction =
                event.target.closest("[data-account-action]");

            if (accountAction) {

                const action =
                    accountAction.dataset.accountAction;

                const dropdown = $("#accountDropdown");

                if (dropdown) {
                    dropdown.hidden = true;
                }

                if (action === "login") {
                    openCustomerAuth("login");
                }

                if (action === "profile") {
                    showRole("customer");
                    showCustomerPage("profile");
                }

                if (action === "seller") {
                    showRole("seller");
                }

                if (action === "admin") {
                    showRole("admin");
                }

                return;
            }
            const sellerNav =
                event.target.closest("[data-seller-page]");

            if (sellerNav) {
                event.preventDefault();
                if (typeof window.showSellerPage === "function") {
                    window.showSellerPage(sellerNav.dataset.sellerPage);
                }
                return;
            }
            const adminNav =
                event.target.closest("[data-admin-page]");

            if (adminNav) {
                event.preventDefault();
                if (typeof window.showAdminPage === "function") {
                    window.showAdminPage(adminNav.dataset.adminPage);
                }
                return;
            }

        });
        const logo = $("#shopLogo");

        if (logo) {
            logo.addEventListener("click", () => {
                showRole("customer");
                showCustomerPage("home");
            });
        }
        const searchButton = $("#searchBtn");

        if (searchButton) {
            searchButton.addEventListener(
                "click",
                performSearch
            );
        }

        const searchInput = $("#productSearch");

        if (searchInput) {
            searchInput.addEventListener("input", event => {
                if (typeof window.updateShopMax99SearchSuggestions === "function") {
                    window.updateShopMax99SearchSuggestions(event.target.value);
                }
            });

            searchInput.addEventListener("focus", event => {
                if (typeof window.updateShopMax99SearchSuggestions === "function" && event.target.value.trim()) {
                    window.updateShopMax99SearchSuggestions(event.target.value);
                }
            });

            searchInput.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    performSearch();
                    document.getElementById("sm99SearchSuggestions")?.setAttribute("hidden", "hidden");
                }
                if (event.key === "Escape") {
                    document.getElementById("sm99SearchSuggestions")?.setAttribute("hidden", "hidden");
                }
            });
        }
        const accountButton = $("#accountBtn");
        const accountDropdown = $("#accountDropdown");

        if (accountButton && accountDropdown) {

            accountButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    accountDropdown.hidden =
                        !accountDropdown.hidden;
                }
            );

            document.addEventListener("click", event => {

                if (
                    !accountDropdown.contains(event.target) &&
                    !accountButton.contains(event.target)
                ) {
                    accountDropdown.hidden = true;
                }

            });
        }
        const loginSidebar = $("#loginSidebarBtn");

        if (loginSidebar) {
            loginSidebar.addEventListener(
                "click",
                () => openCustomerAuth("login")
            );
        }
        const sellerRegister =
            $("#openSellerRegister");

        if (sellerRegister) {
            sellerRegister.addEventListener(
                "click",
                () => openModal("sellerRegisterModal")
            );
        }
        const authForm = $("#authForm");

        if (authForm) {
            authForm.addEventListener(
                "submit",
                handleAuthSubmit
            );
        }

        const sellerForm =
            $("#sellerRegisterForm");

        if (sellerForm) {
            sellerForm.addEventListener(
                "submit",
                handleSellerRegistration
            );
        }
        const checkoutButton = $("#checkoutBtn");

        if (checkoutButton) {
            checkoutButton.addEventListener("click", function (event) {
                event.preventDefault();
                checkout();
            });
        }

        const checkoutForm = $("#checkoutForm");
        if (checkoutForm) {
            checkoutForm.addEventListener("submit", placeOrder);
        }

        const backToCartButton = $("#backToCartBtn");
        if (backToCartButton) {
            backToCartButton.addEventListener("click", function () {
                showCustomerPage("cart");
            });
        }
        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    $$(".modal-overlay").forEach(
                        modal => {
                            modal.hidden = true;
                        }
                    );

                    document.body.style.overflow = "";
                }
            }
        );
    }
    function initApp() {

        bindEvents();
        bindProfileEvents();

        updateCartCount();
        updateWishlistCount();
        updateUserUI();

        showRole("customer");
        showCustomerPage("home");

        if (typeof window.initCustomer === "function") {
            window.initCustomer();
        }
        handleBuyNowCheckout();
    }


    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

})();
(function () {
    "use strict";

    function logoutToCustomer() {

        if (typeof window.ShopMax99?.showRole === "function") {
            window.ShopMax99.showRole("customer");
        } else {
            const customer = document.getElementById("customerApp");
            const seller = document.getElementById("sellerApp");
            const admin = document.getElementById("adminApp");

            if (customer) {
                customer.hidden = false;
                customer.style.display = "";
            }

            if (seller) {
                seller.hidden = true;
                seller.style.display = "none";
            }

            if (admin) {
                admin.hidden = true;
                admin.style.display = "none";
            }
        }

        if (typeof window.showCustomerPage === "function") {
            window.showCustomerPage("home");
        }

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    }
    window.shopmax99CustomerLogout = function () {

        customerLogout();
    };
    window.shopmax99SellerLogout = function () {
        localStorage.removeItem("shopmax99_user");

        logoutToCustomer();

        if (typeof window.ShopMax99?.showToast === "function") {
            window.ShopMax99.showToast("Seller logout ho gaya.");
        }
    };
    window.shopmax99AdminLogout = function () {

        localStorage.removeItem("shopmax99_admin_session");

        logoutToCustomer();

        if (typeof window.ShopMax99?.showToast === "function") {
            window.ShopMax99.showToast("Admin logout ho gaya.");
        }
    };
    document.addEventListener("click", function (event) {

        const logoutButton =
            event.target.closest('[data-account-action="logout"]');

        if (!logoutButton) return;

        event.preventDefault();

        const dropdown =
            document.getElementById("accountDropdown");

        if (dropdown) {
            dropdown.hidden = true;
        }

        window.shopmax99CustomerLogout();
    });
    document.addEventListener("click", function (event) {

        const button =
            event.target.closest("#sellerLogoutBtn");

        if (!button) return;

        event.preventDefault();

        window.shopmax99SellerLogout();
    });
    document.addEventListener("click", function (event) {

        const button =
            event.target.closest("#adminLogoutBtn");

        if (!button) return;

        event.preventDefault();

        window.shopmax99AdminLogout();
    });

})();
(function () {
    "use strict";

    const CUSTOMER_KEY = "shopmax99_customer_account";
    const CUSTOMER_SESSION_KEY = "shopmax99_customer_session";

    function getCustomer() {
        try {
            return JSON.parse(
                localStorage.getItem(CUSTOMER_KEY) || "null"
            );
        } catch {
            return null;
        }
    }

    function getSession() {
        try {
            return JSON.parse(
                localStorage.getItem(CUSTOMER_SESSION_KEY) || "null"
            );
        } catch {
            return null;
        }
    }

    function saveCustomer(customer) {
        localStorage.setItem(
            CUSTOMER_KEY,
            JSON.stringify(customer)
        );
        try {
            const raw = JSON.parse(localStorage.getItem("shopmax99_users") || "[]");
            const users = Array.isArray(raw) ? raw : [];
            const index = users.findIndex(u => String(u.id || u.customerId || "") === String(customer.id || ""));
            const record = {
                ...(index >= 0 ? users[index] : {}),
                ...customer,
                customerId: customer.id,
                role: "customer",
                updatedAt: new Date().toISOString()
            };
            if (index >= 0) users[index] = record;
            else users.unshift(record);
            localStorage.setItem("shopmax99_users", JSON.stringify(users));
        } catch (error) {
            console.warn("Customer directory sync failed", error);
        }
    }

    function saveSession(customer) {
        localStorage.setItem(
            CUSTOMER_SESSION_KEY,
            JSON.stringify({
                loggedIn: true,
                customerId: customer.id,
                name: customer.name,
                mobile: customer.mobile,
                loginAt: new Date().toISOString()
            })
        );
    }

    function clearSession() {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
        localStorage.removeItem("shopmax99_user");
    }

    function customerLogout() {
        clearSession();
        window.shopmax99PendingCustomer = null;

        const modal = document.getElementById("shopmax99CustomerAuthModal");
        if (modal) {
            modal.classList.remove("active", "open", "show");
            modal.style.display = "none";
        }

        updateCustomerHeader();

        if (typeof window.showCustomerPage === "function") {
            try {
                window.showCustomerPage("home");
            } catch (e) {}
        }

        if (typeof window.showCustomerSection === "function") {
            try {
                window.showCustomerSection("home");
            } catch (e) {}
        }

        if (typeof window.ShopMax99?.showToast === "function") {
            window.ShopMax99.showToast("Customer logout ho gaya.");
        }
    }

    function makeId() {
        return (
            "CUS_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );
    }

    function showMessage(message, type = "error") {
        const box = document.getElementById(
            "shopmax99CustomerAuthMessage"
        );

        if (!box) return;

        box.textContent = message;
        box.className =
            "shopmax99-auth-message " + type;
        box.style.display = "block";
    }

    function hideMessage() {
        const box = document.getElementById(
            "shopmax99CustomerAuthMessage"
        );

        if (box) {
            box.style.display = "none";
        }
    }
    function updateCustomerHeader() {

        const accountBtn =
            document.getElementById("accountBtn");

        const accountName =
            document.getElementById("accountName");

        if (!accountBtn) return;

        const session = getSession();

        if (session && session.loggedIn) {

            accountBtn.innerHTML = `
                <i class="fa-solid fa-right-from-bracket"></i>

                <span class="account-text">
                    <small>Hello,</small>
                    <strong id="accountName">
                        ${escapeHTML(
                            session.name || "Customer"
                        )}
                    </strong>
                </span>

                <span class="account-logout-text">
                    Logout
                </span>
            `;

            accountBtn.classList.add(
                "customer-logged-in"
            );

            accountBtn.onclick = function (e) {
                e.preventDefault();
                customerLogout();
            };

        } else {

            accountBtn.innerHTML = `
                <i class="fa-regular fa-user"></i>

                <span class="account-text">
                    <small>Hello,</small>
                    <strong id="accountName">
                        Sign in
                    </strong>
                </span>

                <i class="fa-solid fa-chevron-down account-arrow"></i>
            `;

            accountBtn.classList.remove(
                "customer-logged-in"
            );

            accountBtn.onclick = function (e) {
                e.preventDefault();
                openCustomerAuth();
            };
        }
    }
    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function createAuthModal() {
        if (document.getElementById("shopmax99CustomerAuthModal")) return;
        const modal=document.createElement("div"); modal.id="shopmax99CustomerAuthModal"; modal.className="shopmax99-auth-overlay";
        modal.innerHTML=`<div class="shopmax99-auth-modal customer-auth-modern">
          <button type="button" class="shopmax99-auth-close" id="shopmax99AuthClose" aria-label="Close">×</button>
          <div class="shopmax99-auth-logo"><img src="image/logo.max99black.png" alt="ShopMax99"></div>
          <div class="customer-auth-tabs"><button type="button" class="customer-auth-tab active" id="customerLoginTab">Login</button><button type="button" class="customer-auth-tab" id="customerSignupTab">Sign Up</button></div>
          <h2 id="shopmax99AuthTitle">Login to ShopMax99</h2><p class="shopmax99-auth-subtitle" id="shopmax99AuthSubtitle">Login with your registered mobile/email and password.</p>
          <div id="shopmax99CustomerAuthMessage" class="shopmax99-auth-message"></div>
          <form id="shopmax99LoginForm" class="shopmax99-auth-step">
            <div class="shopmax99-auth-field"><label for="shopmax99LoginIdentity">Mobile Number or Email</label><input type="text" id="shopmax99LoginIdentity" placeholder="Enter mobile number or email" autocomplete="username" required></div>
            <div class="shopmax99-auth-field"><label for="shopmax99LoginPassword">Password</label><input type="password" id="shopmax99LoginPassword" placeholder="Enter your password" autocomplete="current-password" required></div>
            <button type="submit" class="shopmax99-auth-submit">Login</button>
            <p class="customer-auth-switch">Don't have account? <button type="button" id="customerSignupLink" class="customer-auth-link">Signup here</button></p>
          </form>
          <form id="shopmax99SignupForm" class="shopmax99-auth-step" style="display:none;">
            <div class="customer-auth-grid">
              <div class="shopmax99-auth-field full"><label>Full Name *</label><input type="text" id="shopmax99CustomerName" maxlength="80" placeholder="Enter your full name" required></div>
              <div class="shopmax99-auth-field"><label>Email *</label><input type="email" id="shopmax99CustomerEmail" placeholder="you@example.com" required></div>
              <div class="shopmax99-auth-field"><label>Mobile Number *</label><div class="shopmax99-mobile-input"><span>+91</span><input type="tel" id="shopmax99CustomerMobile" maxlength="10" inputmode="numeric" placeholder="10-digit mobile" required></div></div>
              <div class="shopmax99-auth-field"><label>Password *</label><input type="password" id="shopmax99CustomerPassword" minlength="6" placeholder="Minimum 6 characters" required></div>
              <div class="shopmax99-auth-field"><label>Confirm Password *</label><input type="password" id="shopmax99CustomerPassword2" minlength="6" placeholder="Re-enter password" required></div>
              <div class="shopmax99-auth-field full"><label>Address *</label><input type="text" id="shopmax99CustomerAddress" maxlength="200" placeholder="House / Street / Area" required></div>
              <div class="shopmax99-auth-field"><label>City *</label><input type="text" id="shopmax99CustomerCity" required></div>
              <div class="shopmax99-auth-field"><label>State *</label><input type="text" id="shopmax99CustomerState" required></div>
              <div class="shopmax99-auth-field"><label>PIN Code *</label><input type="text" id="shopmax99CustomerPincode" maxlength="6" inputmode="numeric" placeholder="6-digit PIN" required></div>
            </div>
            <button type="submit" class="shopmax99-auth-submit">Send OTP & Create Account</button>
            <p class="customer-auth-switch">Already have account? <button type="button" id="customerLoginLink" class="customer-auth-link">Login here</button></p>
          </form>
          <form id="shopmax99OtpForm" class="shopmax99-auth-step" style="display:none;">
            <div class="shopmax99-otp-info"><i class="fa-solid fa-mobile-screen-button"></i><p>OTP verification required</p><span id="shopmax99OtpMobile"></span></div>
            <div class="shopmax99-auth-field"><label>Enter OTP</label><input type="text" id="shopmax99Otp" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="Enter 6-digit OTP" required></div>
            <button type="submit" class="shopmax99-auth-submit">Verify OTP & Create Account</button>
            <button type="button" id="shopmax99ResendOtp" class="shopmax99-resend-btn">Resend OTP</button>
            <button type="button" id="shopmax99ChangeMobile" class="shopmax99-change-btn">Back to Signup</button>
            <div id="shopmax99DemoOtp" class="shopmax99-demo-otp"></div>
          </form>
        </div>`;
        document.body.appendChild(modal); bindAuthEvents();
    }
    function setAuthMode(mode){ createAuthModal(); const login=document.getElementById("shopmax99LoginForm"), signup=document.getElementById("shopmax99SignupForm"), otp=document.getElementById("shopmax99OtpForm"), lt=document.getElementById("customerLoginTab"), st=document.getElementById("customerSignupTab"), title=document.getElementById("shopmax99AuthTitle"), sub=document.getElementById("shopmax99AuthSubtitle"); if(otp)otp.style.display="none"; if(login)login.style.display=mode==="login"?"block":"none"; if(signup)signup.style.display=mode==="signup"?"block":"none"; lt?.classList.toggle("active",mode==="login"); st?.classList.toggle("active",mode==="signup"); if(title)title.textContent=mode==="login"?"Login to ShopMax99":"Create your ShopMax99 Account"; if(sub)sub.textContent=mode==="login"?"Login with your registered mobile/email and password.":"Enter your details and verify your mobile number with OTP."; hideMessage(); }
    function openCustomerAuth(mode="login"){ createAuthModal(); const modal=document.getElementById("shopmax99CustomerAuthModal"); if(!modal)return; modal.style.display="flex"; setAuthMode(mode); }
    function closeCustomerAuth(){ document.getElementById("shopmax99CustomerAuthModal")?.style && (document.getElementById("shopmax99CustomerAuthModal").style.display="none"); window.shopmax99PendingCustomer=null; }
    function showMobileStep(){ setAuthMode("signup"); }
    function allCustomerAccounts(){ let users=[]; try{const v=JSON.parse(localStorage.getItem("shopmax99_users")||"[]"); if(Array.isArray(v))users=v;}catch{} const current=getCustomer(); if(current && !users.some(u=>String(u.id)===String(current.id)))users.push(current); return users; }
    function findCustomerByIdentity(identity){ const v=String(identity||"").trim().toLowerCase().replace(/^\+91/,''); return allCustomerAccounts().find(u=>String(u.email||"").toLowerCase()===v || String(u.mobile||"")===v)||null; }
    function handleCustomerLogin(e){ e.preventDefault(); const identity=document.getElementById("shopmax99LoginIdentity")?.value.trim()||"", password=document.getElementById("shopmax99LoginPassword")?.value||"", user=findCustomerByIdentity(identity); if(!user)return showMessage("Account not found. Please signup first."); if(String(user.password||"")!==password)return showMessage("Incorrect password. Please try again."); if(!user.mobileVerified)return showMessage("Mobile number is not verified. Please complete OTP verification."); saveCustomer(user); saveSession(user); setData(STORAGE.user,{id:user.id,name:user.name||"Customer",email:user.email||"",mobile:user.mobile||"",profilePicture:user.profilePicture||"",createdAt:user.createdAt||new Date().toISOString()}); closeCustomerAuth(); updateCustomerHeader(); showCustomerLoginSuccess(); }
    function sendCustomerOTP(){ const name=document.getElementById("shopmax99CustomerName")?.value.trim()||"",email=document.getElementById("shopmax99CustomerEmail")?.value.trim().toLowerCase()||"",mobile=document.getElementById("shopmax99CustomerMobile")?.value.trim()||"",password=document.getElementById("shopmax99CustomerPassword")?.value||"",password2=document.getElementById("shopmax99CustomerPassword2")?.value||"",address=document.getElementById("shopmax99CustomerAddress")?.value.trim()||"",city=document.getElementById("shopmax99CustomerCity")?.value.trim()||"",state=document.getElementById("shopmax99CustomerState")?.value.trim()||"",pincode=document.getElementById("shopmax99CustomerPincode")?.value.trim()||""; if(!name)return showMessage("Please enter your full name."); if(!/^\S+@\S+\.\S+$/.test(email))return showMessage("Please enter a valid email address."); if(!/^[6-9]\d{9}$/.test(mobile))return showMessage("Please enter a valid 10-digit Indian mobile number."); if(password.length<6)return showMessage("Password must contain at least 6 characters."); if(password!==password2)return showMessage("Passwords do not match."); if(!address||!city||!state||!/^[0-9]{6}$/.test(pincode))return showMessage("Please complete your address and valid 6-digit PIN code."); if(findCustomerByIdentity(mobile)||findCustomerByIdentity(email))return showMessage("An account already exists with this mobile number or email. Please login."); const otp=String(Math.floor(100000+Math.random()*900000)); window.shopmax99PendingCustomer={mode:"signup",name,email,mobile,password,address,city,state,pincode,otp,createdAt:Date.now()}; document.getElementById("shopmax99OtpMobile").textContent="+91 "+mobile.slice(0,5)+" "+mobile.slice(5); document.getElementById("shopmax99DemoOtp").innerHTML=`Demo OTP: <strong>${otp}</strong>`; document.getElementById("shopmax99SignupForm").style.display="none"; document.getElementById("shopmax99LoginForm").style.display="none"; document.getElementById("shopmax99OtpForm").style.display="block"; document.getElementById("shopmax99AuthTitle").textContent="Verify Mobile Number"; document.getElementById("shopmax99AuthSubtitle").textContent="Enter the OTP sent to your registered mobile number."; hideMessage(); document.getElementById("shopmax99Otp")?.focus(); }
    function verifyCustomerOTP(){ const entered=document.getElementById("shopmax99Otp")?.value.trim()||"",pending=window.shopmax99PendingCustomer; if(!pending||pending.mode!=="signup")return showMessage("OTP session expired. Please signup again."); if(Date.now()-pending.createdAt>300000)return showMessage("OTP expired. Please request a new OTP."); if(entered!==pending.otp)return showMessage("Incorrect OTP. Please enter the correct OTP."); const customer={id:makeId(),name:pending.name,email:pending.email,mobile:pending.mobile,password:pending.password,address:pending.address,city:pending.city,state:pending.state,pincode:pending.pincode,mobileVerified:true,emailVerified:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; saveCustomer(customer); saveSession(customer); setData(STORAGE.user,{id:customer.id,name:customer.name,email:customer.email,mobile:customer.mobile,profilePicture:"",createdAt:customer.createdAt}); window.shopmax99PendingCustomer=null; closeCustomerAuth(); updateCustomerHeader(); showCustomerLoginSuccess(); }
    function resendOTP(){ const p=window.shopmax99PendingCustomer; if(!p)return showMobileStep(); p.otp=String(Math.floor(100000+Math.random()*900000)); p.createdAt=Date.now(); const box=document.getElementById("shopmax99DemoOtp"); if(box)box.innerHTML=`Demo OTP: <strong>${p.otp}</strong>`; showMessage("A new OTP has been generated.","success"); }
    (function initMaintenanceControl() {
        const SETTINGS_KEY = "shopmax99_settings";
        const MASTER_PASSKEY = "9007102062";

        function getSettings() {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                const value = JSON.parse(raw || "{}");
                return value && typeof value === "object" ? value : {};
            } catch (error) {
                return {};
            }
        }

        function saveSettings(settings) {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                window.dispatchEvent(new StorageEvent("storage", {
                    key: SETTINGS_KEY,
                    newValue: JSON.stringify(settings)
                }));
            } catch (error) {
                console.error("Maintenance settings save error:", error);
            }
        }

        function isActive() {
            return String(getSettings().storeStatus || "open") === "maintenance";
        }

        function showMaintenanceScreen() {
            const screen = document.getElementById("shopmax99MaintenanceScreen");
            if (!screen) return;
            screen.hidden = false;
            document.body.classList.add("shopmax99-maintenance-active");
        }

        function hideMaintenanceScreen() {
            const screen = document.getElementById("shopmax99MaintenanceScreen");
            if (!screen) return;
            screen.hidden = true;
            document.body.classList.remove("shopmax99-maintenance-active");
        }

        function apply(role) {
            const normalized = String(role || "customer").toLowerCase();
            if (isActive() && normalized !== "admin" && normalized !== "staff" && normalized !== "support") {
                showMaintenanceScreen();
                return true;
            }
            hideMaintenanceScreen();
            return false;
        }

        function openControl() {
            const modal = document.getElementById("maintenancePasskeyModal");
            const form = document.getElementById("maintenancePasskeyForm");
            const input = document.getElementById("maintenancePasskeyInput");
            const title = document.getElementById("maintenancePasskeyTitle");
            const text = document.getElementById("maintenancePasskeyText");
            if (!modal || !form || !input) {
                alert("Maintenance control is currently unavailable.");
                return;
            }
            const active = isActive();
            if (title) title.textContent = active ? "Take Site Live" : "Put Site Under Maintenance";
            if (text) text.textContent = active
                ? "Enter the master passkey to enable customer and seller access again."
                : "Enter the master passkey to disable customer and seller access.";
            input.value = "";
            modal.hidden = false;
            modal.style.zIndex = "4000000";
            document.body.style.overflow = "hidden";
            setTimeout(() => input.focus(), 30);
        }

        function bind() {
            const form = document.getElementById("maintenancePasskeyForm");
            if (!form || form.dataset.maintenanceBound === "1") return;
            form.dataset.maintenanceBound = "1";
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = document.getElementById("maintenancePasskeyInput");
                const value = String(input?.value || "").trim();
                if (value !== MASTER_PASSKEY) {
                    if (input) { input.value = ""; input.focus(); }
                    alert("Incorrect master passkey.");
                    return;
                }

                const settings = getSettings();
                const nextActive = !isActive();
                settings.storeStatus = nextActive ? "maintenance" : "open";
                settings.maintenanceUpdatedAt = new Date().toISOString();
                saveSettings(settings);

                const modal = document.getElementById("maintenancePasskeyModal");
                if (modal) modal.hidden = true;
                document.body.style.overflow = "";
                if (input) input.value = "";

                apply("admin");
                if (typeof window.refreshMaintenanceControlUI === "function") {
                    window.refreshMaintenanceControlUI();
                }
                if (typeof window.ShopMax99.showToast === "function") {
                    window.ShopMax99.showToast(nextActive
                        ? "Site is now under maintenance. Customer and Seller access is disabled."
                        : "Site is live again. Customer and Seller access is enabled.");
                }
            });
        }

        window.ShopMax99.maintenance = {
            isActive,
            apply,
            openControl,
            show: showMaintenanceScreen,
            hide: hideMaintenanceScreen
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
                bind();
                apply("customer");
            }, { once: true });
        } else {
            bind();
            apply("customer");
        }
    })();
    function bindAuthEvents() {
        document.getElementById("shopmax99AuthClose")?.addEventListener("click", closeCustomerAuth);
        document.getElementById("customerLoginTab")?.addEventListener("click", () => setAuthMode("login"));
        document.getElementById("customerSignupTab")?.addEventListener("click", () => setAuthMode("signup"));
        document.getElementById("customerSignupLink")?.addEventListener("click", () => setAuthMode("signup"));
        document.getElementById("customerLoginLink")?.addEventListener("click", () => setAuthMode("login"));
        document.getElementById("shopmax99LoginForm")?.addEventListener("submit", handleCustomerLogin);
        document.getElementById("shopmax99SignupForm")?.addEventListener("submit", e => { e.preventDefault(); sendCustomerOTP(); });
        document.getElementById("shopmax99OtpForm")?.addEventListener("submit", e => { e.preventDefault(); verifyCustomerOTP(); });
        document.getElementById("shopmax99ResendOtp")?.addEventListener("click", resendOTP);
        document.getElementById("shopmax99ChangeMobile")?.addEventListener("click", () => { window.shopmax99PendingCustomer=null; setAuthMode("signup"); });
    }
    function initCustomerAuth() {

        createAuthModal();

        updateCustomerHeader();
        const mobileInput =
            document.getElementById(
                "shopmax99CustomerMobile"
            );

        if (mobileInput) {

            mobileInput.addEventListener(
                "input",
                function () {
                    this.value =
                        this.value
                            .replace(/\D/g, "")
                            .substring(0, 10);
                }
            );
        }

        const otpInput =
            document.getElementById(
                "shopmax99Otp"
            );

        if (otpInput) {

            otpInput.addEventListener(
                "input",
                function () {
                    this.value =
                        this.value
                            .replace(/\D/g, "")
                            .substring(0, 6);
                }
            );
        }
    }
    window.openCustomerAuth =
        openCustomerAuth;

    window.customerLogout =
        customerLogout;

    window.updateCustomerHeader =
        updateCustomerHeader;

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initCustomerAuth
        );
    } else {
        initCustomerAuth();
    }

})();
(function () {
    "use strict";

    function ensurePreviewBackButton() {
        if (document.getElementById("adminPreviewBackBtn")) return;
        const header = document.querySelector("#customerApp .customer-header");
        if (!header) return;
        const button = document.createElement("button");
        button.type = "button";
        button.id = "adminPreviewBackBtn";
        button.className = "admin-preview-back-btn";
        button.innerHTML = '<i class="fa-solid fa-arrow-left"></i><span>Back to Admin</span>';
        button.hidden = true;
        header.appendChild(button);
    }

    document.addEventListener("click", function (event) {
        const viewSite = event.target.closest("#adminViewSiteBtn");
        if (viewSite) {
            event.preventDefault();
            ensurePreviewBackButton();
            window.ShopMax99?.enterAdminSitePreview?.();
            const back = document.getElementById("adminPreviewBackBtn");
            if (back) {
                back.hidden = false;
                back.querySelector("span")?.replaceChildren(document.createTextNode("Back to Admin"));
            }
            return;
        }

        const sellerViewSite = event.target.closest("#sellerViewSiteBtn");
        if (sellerViewSite) {
            event.preventDefault();
            window.ShopMax99?.enterSellerSitePreview?.();
            ensurePreviewBackButton();
            const back = document.getElementById("adminPreviewBackBtn");
            if (back) {
                back.hidden = false;
                back.querySelector("span")?.replaceChildren(document.createTextNode("Back to Seller"));
            }
            return;
        }

        const backToAdmin = event.target.closest("#adminPreviewBackBtn");
        if (backToAdmin) {
            event.preventDefault();
            window.ShopMax99?.exitSitePreview?.();
            backToAdmin.hidden = true;
        }
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensurePreviewBackButton, { once: true });
    else ensurePreviewBackButton();
})();
