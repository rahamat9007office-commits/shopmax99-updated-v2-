(function () {
  "use strict";

  const ORDER_KEY = "shopmax99_orders";
  const SELLERS_KEY = "shopmax99_sellers";
  const PARTNERS_KEY = "shopmax99_courier_partners";
  const SETTINGS_KEY = "shopmax99_courier_settings";
  const STYLE_ID = "sm99-invoice-shipping-style";
  const LOGO_URL = new URL("image/logo.max99black.png", window.location.href).href;
  const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
  const text = value => String(value == null ? "" : value).trim();
  const esc = value => text(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const currentSeller = () => {
    const raw = read("shopmax99CurrentSeller", null) || read("currentSeller", null) || read("shopmax99_user", null) || {};
    return {
      ...raw,
      id: text(raw.id || raw.sellerId),
      email: text(raw.email || raw.sellerEmail || raw.loginEmail).toLowerCase(),
      shopName: text(raw.shopName || raw.businessName || raw.fullName || raw.name),
      fullName: text(raw.fullName || raw.name || raw.shopName),
      phone: text(raw.phone || raw.mobile),
      gstin: text(raw.gstin || raw.GSTIN).toUpperCase()
    };
  };
  const orderItemsForSeller = (order, seller) => (Array.isArray(order.items) ? order.items : []).filter(item => {
    const email = text(item.sellerEmail || item.sellerPickup?.sellerEmail).toLowerCase();
    const sellerId = text(item.sellerId || item.sellerPickup?.sellerId);
    return (seller.email && email === seller.email) || (seller.id && sellerId === seller.id);
  });
  const sellerWorkflow = (order, seller) => {
    const workflows = order?.sellerWorkflows && typeof order.sellerWorkflows === "object" ? order.sellerWorkflows : {};
    const key = Object.keys(workflows).find(email => text(email).toLowerCase() === text(seller.email).toLowerCase());
    return key ? workflows[key] : null;
  };
  const sellerDecision = (order, seller) => {
    const workflow = sellerWorkflow(order, seller);
    const status = text(workflow?.status || workflow?.sellerStatus || "").toLowerCase();
    if (/reject|declin|cancel/.test(status)) return "rejected";
    if (/accept|approved|confirmed/.test(status)) return "accepted";
    return "pending";
  };
  const makeUniqueInternalReference = (order, seller, shipment) => {
    const existing = text(shipment?.shipmentId || order.internalTrackingId || "");
    if (existing) return existing;
    const sellerKey = text(seller.id || seller.email || "SELLER").replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
    return `SM99-${text(order.id).replace(/[^a-z0-9]/gi, "").toUpperCase()}-${sellerKey}`;
  };
  const getSellerRecord = seller => {
    const records = read(SELLERS_KEY, []);
    return (Array.isArray(records) ? records : []).find(item => {
      const email = text(item.email || item.sellerEmail || item.loginEmail).toLowerCase();
      return (seller.email && email === seller.email) || (seller.id && text(item.id) === seller.id);
    }) || seller;
  };
  const sellerPickup = (order, items, seller) => {
    const first = items[0] || {};
    const shipment = (order.courierShipments || []).find(item => {
      const pickup = item.pickup || {};
      return (seller.email && text(pickup.sellerEmail).toLowerCase() === seller.email) || (seller.id && text(pickup.sellerId) === seller.id) || (item.items || []).some(line => items.some(own => text(line.productId || line.id) === text(own.productId || own.id)));
    });
    const pickup = shipment?.pickup || first.sellerPickup || {};
    return {
      shipment,
      pickup: {
        shopName: text(pickup.shopName || pickup.name || seller.shopName || seller.fullName),
        address: text(pickup.address || seller.address),
        city: text(pickup.city || seller.city),
        state: text(pickup.state || seller.state),
        pincode: text(pickup.pincode || seller.pincode),
        phone: text(pickup.phone || seller.phone),
        gstin: text(pickup.gstin || seller.gstin).toUpperCase()
      }
    };
  };
  const address = item => [item.address, item.address2, item.city, item.state, item.pincode].map(text).filter(Boolean).join(", ");
  const orderDate = order => {
    const value = order.date || order.createdAt;
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .sm99-docs{margin:24px 0;padding:22px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;color:#172033;font-family:Inter,Arial,sans-serif}
      .sm99-docs-head{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:18px}
      .sm99-docs-head h2{margin:0 0 7px;font-size:22px}.sm99-docs-head p{margin:0;color:#64748b;line-height:1.5;font-size:13px}
      .sm99-docs-count{border-radius:999px;padding:8px 12px;background:#eef2ff;color:#4338ca;font-weight:700;font-size:12px}
      .sm99-docs-notice{padding:12px 14px;border-radius:10px;background:#fff7ed;color:#9a3412;font-size:12px;line-height:1.55;margin:12px 0 18px}
      .sm99-docs-table-wrap{width:100%;overflow-x:auto}.sm99-docs-table{border-collapse:collapse;width:100%;min-width:760px;font-size:12px}.sm99-docs-table th,.sm99-docs-table td{text-align:left;padding:12px;border-bottom:1px solid #e5e7eb;vertical-align:top}.sm99-docs-table th{background:#f8fafc;color:#475569;font-weight:700}.sm99-docs-table td strong{font-size:13px}.sm99-docs-actions{display:flex;gap:7px;flex-wrap:wrap;min-width:210px}.sm99-doc-btn{border:0;border-radius:8px;padding:9px 11px;font-size:11px;font-weight:700;cursor:pointer;background:#4f46e5;color:#fff}.sm99-doc-btn.alt{background:#0f766e}.sm99-doc-btn:disabled{opacity:.45;cursor:not-allowed}.sm99-reject-action{background:#dc2626!important;color:#fff!important;border:1px solid #b91c1c!important;border-radius:8px!important;box-shadow:0 2px 0 #991b1b!important;font-weight:800!important}.sm99-reject-action:hover{background:#b91c1c!important}.sm99-docs-pending{font-size:11px;font-weight:700;color:#92400e;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 10px;display:inline-block}.sm99-docs-rejected{font-size:11px;font-weight:800;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 10px;display:inline-block}.sm99-docs-empty{padding:22px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;text-align:center;font-size:13px}
      @media(max-width:640px){.sm99-docs{padding:14px;margin:16px 0}.sm99-docs-head h2{font-size:19px}}
      @media print{body *{visibility:hidden!important}#sm99-print-root,#sm99-print-root *{visibility:visible!important}#sm99-print-root{position:absolute;inset:0;width:100%;background:#fff}}
    `;
    document.head.appendChild(style);
  }

  function invoiceHtml(order, items, seller) {
    const sellerData = getSellerRecord(seller);
    const sellerName = text(sellerData.shopName || sellerData.businessName || sellerData.fullName || seller.shopName || "Seller");
    const invoiceNumber = `SM99-${text(order.id).replace(/[^a-z0-9-]/gi, "")}-${text(sellerData.id || seller.id || seller.email.split("@")[0]).replace(/[^a-z0-9-]/gi, "")}`.slice(0, 70).toUpperCase();
    let grossTotal = 0;
    let taxableTotal = 0;
    let taxTotal = 0;
    let taxMissing = false;
    const rows = items.map(item => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Number(item.price ?? item.customerPrice ?? item.sellerPrice ?? 0);
      const gross = unitPrice * quantity;
      const rateRaw = item.gstRate ?? item.taxRate ?? item.gst_rate;
      const rate = rateRaw === "" || rateRaw == null ? null : Number(rateRaw);
      const validRate = rate !== null && Number.isFinite(rate) && rate >= 0 && rate <= 100;
      const tax = validRate ? gross - gross / (1 + rate / 100) : 0;
      const taxable = validRate ? gross - tax : gross;
      if (!validRate) taxMissing = true;
      grossTotal += gross;
      taxableTotal += taxable;
      taxTotal += tax;
      return `<tr><td>${esc(item.name || item.title || "Product")}<br><small>Product ID: ${esc(item.productId || item.id || "—")} · HSN: ${esc(item.hsn || item.hsnCode || "Not provided")}</small></td><td>${quantity}</td><td>${money(unitPrice)}</td><td>${validRate ? `${rate}%` : "Not configured"}</td><td>${money(taxable)}</td><td>${money(tax)}</td><td>${money(gross)}</td></tr>`;
    }).join("");
    const totalPaid = Number(order.total || order.orderValue || grossTotal);
    const sellerAddress = [sellerData.address, sellerData.city, sellerData.state, sellerData.pincode].map(text).filter(Boolean).join(", ");
    const customer = order.deliveryDetails || {};
    const customerAddress = [customer.address, customer.city, customer.state, customer.pincode].map(text).filter(Boolean).join(", ");
    const note = taxMissing ? `<div class="warning">GST/HSN details kuch items ke liye configured nahi hain. Is document ko final tax invoice ke roop mein issue karne se pehle applicable tax details verify karein.</div>` : "";
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(invoiceNumber)}</title><style>
      @page{size:A4;margin:11mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#172033;margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.invoice-shell{border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}.invoice-banner{background:linear-gradient(120deg,#101a46,#4338ca 62%,#0e7490);color:#fff;padding:20px 22px;display:flex;justify-content:space-between;align-items:center;gap:18px}.brand-lockup{display:flex;align-items:center;gap:13px;min-width:0}.brand-logo{display:block;width:150px;max-height:58px;object-fit:contain;object-position:left center;background:#fff;border-radius:9px;padding:7px}.brand-caption{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#dbeafe;margin-top:7px}.invoice-no{text-align:right;min-width:185px}.invoice-no h1{font-size:24px;letter-spacing:1.4px;margin:0 0 8px;color:#fff}.invoice-no p{margin:4px 0;color:#e0e7ff}.invoice-no b{color:#fff}.seller-line{padding:15px 22px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.seller-line h2{font-size:16px;margin:0 0 6px;color:#172554}.seller-line p{margin:4px 0;line-height:1.45;color:#475569}.section{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.panel{border:1px solid #dbe3f0;border-radius:12px;padding:14px;background:#fff;break-inside:avoid}.panel h2{font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 10px;color:#4338ca}.panel p{margin:5px 0;line-height:1.45;overflow-wrap:anywhere}.items{width:100%;border-collapse:separate;border-spacing:0;margin-top:16px;font-size:10px;overflow:hidden;border:1px solid #dbe3f0;border-radius:10px}.items th,.items td{border-bottom:1px solid #e2e8f0;padding:9px 7px;text-align:left;vertical-align:top}.items th{background:#172554;color:#fff;font-size:9px;text-transform:uppercase;letter-spacing:.35px}.items tr:last-child td{border-bottom:0}.items tbody tr:nth-child(even){background:#f8fafc}.items td:not(:first-child),.items th:not(:first-child){text-align:right}.items small{color:#64748b}.totals{margin:16px 0 0 auto;width:290px;border:1px solid #dbe3f0;border-radius:12px;padding:10px 14px;background:#f8fafc}.totals div{display:flex;justify-content:space-between;gap:12px;padding:6px 0}.totals .grand{font-weight:800;font-size:15px;color:#312e81;border-top:2px solid #c7d2fe;margin-top:5px;padding-top:10px}.warning{margin-top:14px;padding:11px 13px;background:#fff7ed;border:1px solid #fdba74;border-radius:9px;color:#9a3412;font-size:10px;line-height:1.5}.footer{margin-top:22px;border-top:1px solid #dbe3f0;padding-top:12px;color:#64748b;font-size:9px;line-height:1.5}.sign{margin:30px 0 0 auto;width:200px;text-align:center;border-top:1px solid #94a3b8;padding-top:8px;color:#475569}.invoice-bottom{margin-top:18px;background:#eef2ff;padding:10px 14px;border-radius:9px;color:#3730a3;font-size:9px;display:flex;justify-content:space-between;gap:10px}@media(max-width:620px){.invoice-banner{padding:14px;align-items:flex-start}.brand-logo{width:110px}.invoice-no h1{font-size:17px}.invoice-no{min-width:130px}.section{gap:8px}.panel{padding:9px}.items th,.items td{padding:5px;font-size:9px}}@media print{button{display:none}.invoice-shell{border:0;border-radius:0}.panel,.items,.totals{break-inside:avoid}}
      </style></head><body><main class="invoice-shell"><header class="invoice-banner"><div class="brand-lockup"><div><img class="brand-logo" src="${esc(LOGO_URL)}" alt="ShopMax99 logo"><div class="brand-caption">Marketplace Seller Document</div></div></div><div class="invoice-no"><h1>TAX INVOICE</h1><p><b>Invoice No.</b> ${esc(invoiceNumber)}</p><p><b>Invoice Date:</b> ${esc(orderDate(order))}</p><p><b>Order ID:</b> ${esc(order.id || "—")}</p><p><b>Payment:</b> ${esc(order.paymentMethod || "—")} · ${esc(order.paymentStatus || order.status || "—")}</p></div></header><div class="seller-line"><div><h2>${esc(sellerName)}</h2><p>${esc(sellerAddress || "Seller address not provided")}</p><p>Phone: ${esc(sellerData.phone || seller.phone || "—")} · Email: ${esc(sellerData.email || seller.email || "—")}</p></div><div><p><b>GSTIN:</b> ${esc(sellerData.gstin || "Not provided")}</p><p><b>PAN:</b> ${esc(sellerData.pan || "Not provided")}</p></div></div><div style="padding:0 18px 18px"><div class="section"><div class="panel"><h2>Bill To / Ship To</h2><p><b>${esc(customer.fullName || order.customerName || "Customer")}</b></p><p>${esc(customerAddress || order.destination || "Delivery address not provided")}</p><p>Phone: ${esc(customer.phone || order.customerMobile || "—")}</p><p>Email: ${esc(order.customerEmail || "—")}</p></div><div class="panel"><h2>Seller / Fulfilment Details</h2><p><b>Seller:</b> ${esc(sellerName)}</p><p><b>Seller ID:</b> ${esc(sellerData.id || seller.id || "—")}</p><p><b>Order Date:</b> ${esc(orderDate(order))}</p><p><b>Courier:</b> ${esc(order.courierName || order.courierPartner || "Not assigned")}</p><p><b>Tracking / AWB:</b> ${esc(order.trackingNumber || order.awbNumber || "Not assigned")}</p></div></div><table class="items"><thead><tr><th>Product / HSN</th><th>Qty</th><th>Unit Price</th><th>GST</th><th>Taxable Value</th><th>Tax</th><th>Line Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Taxable Value</span><b>${money(taxableTotal)}</b></div><div><span>Tax Total</span><b>${money(taxTotal)}</b></div><div><span>Items Total</span><b>${money(grossTotal)}</b></div><div><span>Order Delivery / Other Charges</span><b>${money(Math.max(0, Number(order.deliveryCharge || 0) + Number(order.codHandlingFee || 0) - Number(order.promoDiscount || 0)))}</b></div><div class="grand"><span>Invoice Reference Total</span><span>${money(grossTotal)}</span></div><div><span>Order Grand Total</span><b>${money(totalPaid)}</b></div></div>${note}<div class="footer"><p>Generated from ShopMax99 order records. Seller must verify GST applicability, HSN, invoice sequence, tax treatment and legal invoice requirements before issuing.</p><p>This invoice includes only products supplied by this seller for this order.</p></div><div class="sign">Authorised Signatory<br>${esc(sellerName)}</div><div class="invoice-bottom"><span>SHOPMAX99 · Seller Invoice</span><span>Order ${esc(order.id || "—")}</span></div></div></main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),450))</script></body></html>`;
  }

  function shippingLabelHtml(order, items, seller, shipment, pickup) {
    const delivery = shipment?.delivery || order.deliveryDetails || {};
    const settings = read(SETTINGS_KEY, {});
    const partners = read(PARTNERS_KEY, []);
    const partnerId = text(shipment?.courierPartnerId || order.courierPartnerId || settings.defaultPartnerId);
    const partner = (Array.isArray(partners) ? partners : []).find(item => text(item.id) === partnerId);
    const partnerName = text(shipment?.courierName || order.courierName || order.courierPartner || partner?.name || settings.defaultPartnerName || "Courier not assigned");
    const awb = text(shipment?.awbNumber || shipment?.trackingNumber || order.awbNumber || order.trackingNumber || makeUniqueInternalReference(order, seller, shipment) || "AWB pending");
    const totalWeight = Number(shipment?.totalWeightKg || items.reduce((sum, item) => sum + Number(item.productWeightKg || (item.productWeightUnit === "kg" ? item.productWeight : Number(item.productWeight || 0) / 1000) || 0) * Number(item.quantity || 1), 0));
    const count = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0);
    const pickupAddress = [pickup.address, pickup.city, pickup.state, pickup.pincode].map(text).filter(Boolean).join(", ");
    const deliveryAddress = [delivery.address, delivery.address2, delivery.city, delivery.state, delivery.pincode].map(text).filter(Boolean).join(", ");
    const shopName = text(pickup.shopName || seller.shopName || seller.businessName || seller.fullName || "ShopMax99 Seller");
    const missing = [];
    if (!pickup.pincode) missing.push("Seller pickup PIN code");
    if (!delivery.pincode) missing.push("Customer delivery PIN code");
    if (!(totalWeight > 0)) missing.push("Package weight");
    const codeText = text(shipment?.shipmentId || awb || order.id || "SM99-DEMO").replace(/[^A-Z0-9]/gi, "").toUpperCase() || "SM99DEMO";
    let barcodeX = 4;
    const barcodeBars = Array.from(codeText).map((character, index) => {
      const bits = character.charCodeAt(0).toString(2).padStart(7, "0");
      return bits.split("").map((bit, bitIndex) => {
        const width = bit === "1" ? 1.35 : 0.55;
        const node = `<rect x="${barcodeX.toFixed(2)}" y="1" width="${width}" height="28"/>`;
        barcodeX += width + (bitIndex % 2 ? 0.42 : 0.25);
        return node;
      }).join("") + (index < codeText.length - 1 ? `<rect x="${(barcodeX += 0.6).toFixed(2)}" y="1" width="0.8" height="28"/>` : "");
    }).join("");
    const qrSize = 25;
    const finder = (x, y, col, row) => (col < 7 && row < 7 && (col === 0 || col === 6 || row === 0 || row === 6 || (col >= 2 && col <= 4 && row >= 2 && row <= 4))) || (col >= x && col < x + 7 && row >= y && row < y + 7 && (col === x || col === x + 6 || row === y || row === y + 6 || (col >= x + 2 && col <= x + 4 && row >= y + 2 && row <= y + 4)));
    const qrRects = Array.from({ length: qrSize * qrSize }, (_, index) => {
      const col = index % qrSize;
      const row = Math.floor(index / qrSize);
      const seed = codeText.charCodeAt((col * 7 + row * 11) % codeText.length);
      const dark = finder(18, 0, col, row) || finder(0, 18, col, row) || ((seed + col * 3 + row * 5 + col * row) % 7 < 3);
      return dark ? `<rect x="${col}" y="${row}" width="1" height="1"/>` : "";
    }).join("");
    const contents = items.map(item => `${esc(item.name || item.title || "Product")} × ${Math.max(1, Number(item.quantity || 1))}`).join("; ");
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shipping Label ${esc(awb)}</title><style>
      @page{size:100mm 150mm;margin:2mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.toolbar{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;padding:12px;background:#eef2ff;font:13px Arial,sans-serif}.toolbar button{border:0;border-radius:6px;background:#312e81;color:#fff;padding:10px 14px;font-weight:700;cursor:pointer}.toolbar .thermal-btn{background:#0f766e}.hint{width:100%;text-align:center;color:#475569;font-size:11px}.label{width:96mm;max-width:100%;margin:0 auto;border:1.2px solid #111;padding:0 3mm 2.5mm;overflow:hidden;background:#fff}.top{display:flex;justify-content:space-between;align-items:center;gap:2mm;margin:0 -3mm 2mm;padding:2.5mm 3mm;background:#172554;color:#fff}.brand{display:flex;align-items:center;gap:2mm;min-width:0}.brand-logo{display:block;width:25mm;max-height:10mm;object-fit:contain;background:#fff;border-radius:2px;padding:1mm}.brand-name{font-size:12px;font-weight:900;letter-spacing:.5px;white-space:nowrap}.brand-caption{font-size:7px;margin-top:1mm;letter-spacing:.8px;text-transform:uppercase;color:#dbeafe}.pill{font-size:8px;font-weight:700;text-align:center;max-width:25mm;overflow-wrap:anywhere}.route{font-size:17px;font-weight:900;text-align:center;letter-spacing:1px;padding:2mm 0;color:#111;background:#f1f5f9;border:1px solid #111}.block{padding:2mm 0;border-bottom:1px solid #777}.block h2{font-size:8px;letter-spacing:.6px;margin:0 0 1mm;color:#111}.name{font-size:12px;font-weight:800;margin-bottom:1mm;overflow-wrap:anywhere}.address{font-size:9px;line-height:1.25;overflow-wrap:anywhere}.customer-phone{font-size:10px;font-weight:700;margin-top:1mm}.meta{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm;margin-top:2mm}.meta div{border:1px solid #aaa;padding:1.5mm}.meta small{display:block;color:#444;font-size:7px;text-transform:uppercase;margin-bottom:.7mm}.meta strong{font-size:9px;overflow-wrap:anywhere}.awb{margin-top:2mm;border:1px solid #111;padding:1.5mm;text-align:center}.awb small{display:block;font-size:7px;letter-spacing:.4px}.awb strong{display:block;font-size:11px;overflow-wrap:anywhere;margin-top:1mm}.codes{display:grid;grid-template-columns:1fr 22mm;gap:2mm;align-items:center;margin-top:2mm;padding-top:1.5mm;border-top:1px solid #999}.barcode-wrap{text-align:center;min-width:0}.barcode{display:block;width:100%;height:11mm;fill:#000}.code-value{font-size:7px;letter-spacing:.7px;overflow-wrap:anywhere;margin-top:.5mm}.qr-wrap{text-align:center;font-size:6px;font-weight:700}.qr{width:20mm;height:20mm;display:block;fill:#000;margin:auto}.products{margin-top:2mm;font-size:8px;line-height:1.25;overflow-wrap:anywhere}.warning{margin-top:1.5mm;font-size:7px;line-height:1.2;color:#333}.foot{margin-top:1.5mm;padding-top:1mm;border-top:1px solid #999;font-size:7px;text-align:center}.thermal .label{width:54mm;padding:0 2mm 2mm;border-width:1px}.thermal .top{margin:0 -2mm 1.5mm;padding:2mm}.thermal .brand-logo{width:17mm;max-height:7mm}.thermal .brand-name{font-size:9px;letter-spacing:0}.thermal .brand-caption{font-size:5px;letter-spacing:.3px}.thermal .pill{font-size:6px;max-width:16mm}.thermal .route{font-size:12px;padding:1.5mm 0}.thermal .block{padding:1.5mm 0}.thermal .block h2{font-size:6.5px;margin-bottom:.6mm}.thermal .name{font-size:9px;margin-bottom:.5mm}.thermal .address{font-size:7px;line-height:1.2}.thermal .customer-phone{font-size:7px;margin-top:.5mm}.thermal .meta{gap:1mm;margin-top:1.5mm}.thermal .meta div{padding:1mm}.thermal .meta small{font-size:5.5px;margin-bottom:.4mm}.thermal .meta strong{font-size:7px}.thermal .awb{margin-top:1.5mm;padding:1mm}.thermal .awb small{font-size:5.5px}.thermal .awb strong{font-size:8px;margin-top:.5mm}.thermal .codes{grid-template-columns:1fr 15mm;gap:1mm;margin-top:1.5mm;padding-top:1mm}.thermal .barcode{height:7mm}.thermal .code-value{font-size:5px;letter-spacing:.2px}.thermal .qr{width:14mm;height:14mm}.thermal .qr-wrap{font-size:5px}.thermal .products{font-size:6.5px;line-height:1.2;margin-top:1.5mm}.thermal .warning{font-size:5.5px;margin-top:1mm}.thermal .foot{font-size:5.5px;margin-top:1mm;padding-top:.7mm}@media print{.toolbar{display:none!important}body{margin:0}.label{margin:0 auto;border-radius:0;break-inside:avoid;page-break-inside:avoid}}
      </style></head><body><div class="toolbar"><button type="button" onclick="document.body.classList.remove('thermal');var p=document.getElementById('sm99-page-size');if(!p){p=document.createElement('style');p.id='sm99-page-size';document.head.appendChild(p)}p.textContent='@page{size:100mm 150mm;margin:2mm}';window.print()">Print standard 100 mm</button><button type="button" class="thermal-btn" onclick="document.body.classList.add('thermal');var p=document.getElementById('sm99-page-size');if(!p){p=document.createElement('style');p.id='sm99-page-size';document.head.appendChild(p)}p.textContent='@page{size:58mm 120mm;margin:1mm}';window.print()">Print thermal 58 mm</button><div class="hint">Demo barcode/QR are placeholders, not scannable courier codes. Choose paper size before printing.</div></div><main class="label"><div class="top"><div class="brand"><img class="brand-logo" src="${esc(LOGO_URL)}" alt="ShopMax99 logo"><div><div class="brand-name">ShopMax99</div><div class="brand-caption">Shipping Label</div></div></div><div class="pill">${esc(partnerName)}</div></div><div class="route">${esc(text(delivery.state).slice(0,3).toUpperCase() || "SHIP")} → ${esc(text(pickup.state).slice(0,3).toUpperCase() || "PICK")}</div><section class="block"><h2>SHIP FROM / PICKUP</h2><div class="name">${esc(shopName)}</div><div class="address">${esc(pickupAddress || "Pickup address not provided")}</div></section><section class="block"><h2>SHIP TO / DELIVER</h2><div class="name">${esc(delivery.fullName || order.customerName || "Customer")}</div><div class="address">${esc(deliveryAddress || order.destination || "Delivery address not provided")}</div>${delivery.phone || order.customerMobile ? `<div class="customer-phone">Customer Phone: ${esc(delivery.phone || order.customerMobile)}</div>` : ""}</section><div class="meta"><div><small>Order ID</small><strong>${esc(order.id || "—")}</strong></div><div><small>Payment</small><strong>${esc(shipment?.paymentMode || (order.paymentMethod === "COD" ? "COD" : "PREPAID"))}</strong></div><div><small>Weight</small><strong>${totalWeight > 0 ? `${totalWeight.toFixed(3)} kg` : "Not provided"}</strong></div><div><small>Qty</small><strong>${count}</strong></div><div><small>COD Amount</small><strong>${money(shipment?.codAmount ?? (order.paymentMethod === "COD" ? order.total : 0))}</strong></div><div><small>Ship Status</small><strong>${esc(shipment?.status || order.trackingStatus || "Awaiting booking")}</strong></div></div><div class="awb"><small>AWB / TRACKING REFERENCE</small><strong>${esc(awb)}</strong></div><div class="codes"><div class="barcode-wrap"><svg class="barcode" viewBox="0 0 ${Math.max(30, barcodeX + 4)} 30" preserveAspectRatio="none" role="img" aria-label="Demo barcode">${barcodeBars}</svg><div class="code-value">${esc(codeText)} · DEMO BARCODE</div></div><div class="qr-wrap"><svg class="qr" viewBox="-1 -1 27 27" role="img" aria-label="Demo QR code"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/>${qrRects}</svg>DEMO QR</div></div><div class="products"><b>Contents:</b> ${esc(contents)}</div>${missing.length ? `<div class="warning">Pending details: ${esc(missing.join(", "))}. Live courier AWB/barcode will be added after API booking.</div>` : `<div class="warning">Demo barcode and QR only. Live courier codes require a successful courier API booking.</div>`}<div class="foot">ShopMax99 · ${esc(orderDate(order))}</div></main></body></html>`;
  }

  function printDocument(html, title) {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      alert("Print window blocked. Browser mein pop-ups allow karke dobara try karein.");
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    try { popup.document.title = title; } catch (_) {}
  }

  function renderPanel() {
    const pages = document.getElementById("sellerPages");
    const activeNav = document.querySelector('[data-seller-page="orders"].active, [data-seller-page="orders"][aria-current="page"]');
    if (!pages || !activeNav) return;
    const seller = currentSeller();
    const sellerRole = text(seller.role).toLowerCase();
    if (!seller.email && !seller.id) return;
    if (sellerRole && sellerRole !== "seller") return;
    let panel = document.getElementById("sm99SellerDocs");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "sm99SellerDocs";
      panel.className = "sm99-docs";
      pages.appendChild(panel);
    }
    const allOrders = read(ORDER_KEY, []);
    let referencesChanged = false;
    const usedShipmentReferences = new Set((Array.isArray(allOrders) ? allOrders : []).flatMap(order => (order.courierShipments || []).map(shipment => text(shipment.shipmentId)).filter(Boolean)));
    (Array.isArray(allOrders) ? allOrders : []).forEach(order => {
      if (sellerDecision(order, seller) !== "accepted") return;
      const ownItems = orderItemsForSeller(order, seller);
      if (!ownItems.length) return;
      const { shipment } = sellerPickup(order, ownItems, seller);
      if (!shipment || text(shipment.shipmentId)) return;
      const sellerToken = text(seller.id || seller.email || "SELLER").replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase() || "SELLER";
      let reference = `SM99-SHP-${text(order.id).replace(/[^a-z0-9]/gi, "").toUpperCase()}-${sellerToken}`;
      let suffix = 1;
      while (usedShipmentReferences.has(reference)) reference = `SM99-SHP-${text(order.id).replace(/[^a-z0-9]/gi, "").toUpperCase()}-${sellerToken}-${suffix++}`;
      shipment.shipmentId = reference;
      usedShipmentReferences.add(reference);
      referencesChanged = true;
    });
    if (referencesChanged) write(ORDER_KEY, allOrders);
    const orders = (Array.isArray(allOrders) ? allOrders : []).map(order => ({ order, items: orderItemsForSeller(order, seller) })).filter(entry => entry.items.length);
    panel.innerHTML = `<div class="sm99-docs-head"><div><h2>Invoices & Shipping Labels</h2><p>Har seller ke apne order items ke liye alag invoice aur shipment label print karein. Print dialog mein “Save as PDF” select karke PDF save kar sakte hain.</p></div><span class="sm99-docs-count">${orders.length} order${orders.length === 1 ? "" : "s"}</span></div><div class="sm99-docs-notice">Tax invoice mein GST/HSN wahi use hoga jo product/seller record mein configured hai. Missing GST/HSN ko system guess nahi karega. Shipping label print ho sakta hai, lekin actual courier AWB/barcode tabhi valid hoga jab courier provider API shipment create karke response de.</div>${orders.length ? `<div class="sm99-docs-table-wrap"><table class="sm99-docs-table"><thead><tr><th>Order</th><th>Products</th><th>Order Status</th><th>Courier / Tracking</th><th>PDF / Print</th></tr></thead><tbody>${orders.map(({ order, items }) => { const { shipment } = sellerPickup(order, items, seller); const decision = sellerDecision(order, seller); const labelId = shipment?.shipmentId || "Awaiting acceptance"; const actions = decision === "accepted" ? `<div class="sm99-docs-actions"><button type="button" class="sm99-doc-btn" data-sm99-invoice="${esc(order.id)}">Seller Invoice PDF</button><button type="button" class="sm99-doc-btn alt" data-sm99-label="${esc(order.id)}">Shipping Label PDF</button></div>` : decision === "rejected" ? `<span class="sm99-docs-rejected">Rejected · No documents</span>` : `<span class="sm99-docs-pending">Available after order acceptance</span>`; return `<tr><td><strong>${esc(order.id || "—")}</strong><br><span>${esc(orderDate(order))}</span></td><td>${items.map(item => `${esc(item.name || item.title || "Product")} × ${Math.max(1, Number(item.quantity || 1))}`).join("<br>")}</td><td>${esc(sellerWorkflow(order, seller)?.status || order.status || order.trackingStatus || "Pending")}</td><td>${esc(shipment?.courierName || order.courierName || order.courierPartner || "Not assigned")}<br><small>${esc(shipment?.awbNumber || shipment?.trackingNumber || order.awbNumber || order.trackingNumber || labelId)}</small></td><td>${actions}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="sm99-docs-empty">Is seller account ke liye abhi koi order nahi mila. Customer order place karega aur us product par seller email/ID attached hoga to yahan document buttons dikhenge.</div>`}`;
    panel.querySelectorAll("[data-sm99-invoice]").forEach(button => button.addEventListener("click", () => {
      const order = (Array.isArray(read(ORDER_KEY, [])) ? read(ORDER_KEY, []) : []).find(item => text(item.id) === button.dataset.sm99Invoice);
      if (!order) return alert("Order record nahi mila. Orders refresh karke try karein.");
      const activeSeller = currentSeller();
      if (sellerDecision(order, activeSeller) !== "accepted") return alert("Invoice sirf order accept karne ke baad available hoga.");
      const items = orderItemsForSeller(order, activeSeller);
      if (!items.length) return alert("Is order mein current seller ka product nahi mila.");
      printDocument(invoiceHtml(order, items, activeSeller), `Invoice-${order.id}`);
    }));
    panel.querySelectorAll("[data-sm99-label]").forEach(button => button.addEventListener("click", () => {
      const order = (Array.isArray(read(ORDER_KEY, [])) ? read(ORDER_KEY, []) : []).find(item => text(item.id) === button.dataset.sm99Label);
      if (!order) return alert("Order record nahi mila. Orders refresh karke try karein.");
      const seller = currentSeller();
      if (sellerDecision(order, seller) !== "accepted") return alert("Shipping label sirf order accept karne ke baad available hoga.");
      const items = orderItemsForSeller(order, seller);
      if (!items.length) return alert("Is order mein current seller ka product nahi mila.");
      const { shipment, pickup } = sellerPickup(order, items, seller);
      printDocument(shippingLabelHtml(order, items, seller, shipment, pickup), `Shipping-Label-${order.id}`);
    }));
  }

  function styleSellerRejectButtons() {
    const root = document.getElementById("sellerPages");
    if (!root) return;
    root.querySelectorAll("button, input[type=button], input[type=submit]").forEach(button => {
      const label = text(button.innerText || button.value || button.getAttribute("aria-label")).toLowerCase();
      if (/\breject\b|\bdecline\b/.test(label)) {
        button.classList.add("sm99-reject-action");
        button.style.borderRadius = "8px";
        button.style.fontWeight = "800";
      }
    });
  }

  function install() {
    ensureStyles();
    document.addEventListener("click", event => {
      if (event.target.closest('[data-seller-page="orders"]')) setTimeout(() => { renderPanel(); styleSellerRejectButtons(); }, 120);
    });
    const host = document.getElementById("sellerPages");
    if (host && typeof MutationObserver !== "undefined") new MutationObserver(records => { const panel = document.getElementById("sm99SellerDocs"); if (records.some(record => !panel || (record.target !== panel && !panel.contains(record.target)))) setTimeout(() => { renderPanel(); styleSellerRejectButtons(); }, 80); }).observe(host, { childList: true, subtree: true });
    window.addEventListener("storage", event => { if ([ORDER_KEY, SELLERS_KEY, PARTNERS_KEY, SETTINGS_KEY].includes(event.key)) setTimeout(renderPanel, 80); });
    setTimeout(() => { renderPanel(); styleSellerRejectButtons(); }, 500);
    setTimeout(() => { renderPanel(); styleSellerRejectButtons(); }, 1500);
  }

  window.ShopMax99 = window.ShopMax99 || {};
  window.ShopMax99.documents = { render: renderPanel, printInvoice: invoiceHtml, printShippingLabel: shippingLabelHtml };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
})();
