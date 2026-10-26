(function () {
    "use strict";

    const STORAGE = window.ShopMax99.storage.keys;

    const $ = selector =>
        document.querySelector(selector);

    const $$ = selector =>
        [...document.querySelectorAll(selector)];
    const PRICE_CATEGORY_LABELS = {
        price_19: "₹1–₹19",
        price_29: "₹20–₹29",
        price_39: "₹30–₹39",
        price_49: "₹40–₹49",
        price_59: "₹50–₹59",
        price_69: "₹60–₹69",
        price_79: "₹70–₹79",
        price_89: "₹80–₹89",
        price_99: "₹90–₹99"
    };
        const DEFAULT_PRODUCTS = [
{"id":"SM99-CAT-MEN-001","name":"Oxford Casual Shirt","category":"men","productCategory":"men","subcategory":"Cloths","subCategory":"Cloths","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://quyastyle.com/cdn/shop/files/NavyBlue_640x.jpg?v=1761763707","description":"Oxford Casual Shirt — Cloths product in Men category.","tags":["Cloths","men"],"attributes":{"subcategory":"Cloths","category":"men"}},
{"id":"SM99-CAT-MEN-002","name":"Slim Fit Chino Pants","category":"men","productCategory":"men","subcategory":"Cloths","subCategory":"Cloths","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://nilestock.com/cdn/shop/files/1692e2af-d3d7-47f9-a7f2-31e9dd13675d.png?v=1774853538&width=1445","description":"Slim Fit Chino Pants — Cloths product in Men category.","tags":["Cloths","men"],"attributes":{"subcategory":"Cloths","category":"men"}},
{"id":"SM99-CAT-MEN-003","name":"Leather Wallet","category":"men","productCategory":"men","subcategory":"Wallet","subCategory":"Wallet","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://www.stanleather.in/cdn/shop/files/STAN_Striker_Mens_RFID_Leather_Wallet_Flatlay_Chestnut_Brown.jpg?v=1769435791&width=1946","description":"Leather Wallet — Wallet product in Men category.","tags":["Wallet","men"],"attributes":{"subcategory":"Wallet","category":"men"}},
{"id":"SM99-CAT-MEN-004","name":"Analog Wrist Watch","category":"men","productCategory":"men","subcategory":"Watch","subCategory":"Watch","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85","description":"Analog Wrist Watch — Watch product in Men category.","tags":["Watch","men"],"attributes":{"subcategory":"Watch","category":"men"}},
{"id":"SM99-CAT-MEN-005","name":"Running Sneakers","category":"men","productCategory":"men","subcategory":"Shoes","subCategory":"Shoes","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85","description":"Running Sneakers — Shoes product in Men category.","tags":["Shoes","men"],"attributes":{"subcategory":"Shoes","category":"men"}},
{"id":"SM99-CAT-MEN-006","name":"Polarized Sunglasses","category":"men","productCategory":"men","subcategory":"Accessories","subCategory":"Accessories","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://www.100percent.com/cdn/shop/files/SP26_HUDSON_60027-10022_FRONT.jpg?v=1773691772","description":"Polarized Sunglasses — Accessories product in Men category.","tags":["Accessories","men"],"attributes":{"subcategory":"Accessories","category":"men"}},
{"id":"SM99-CAT-WOMEN-007","name":"Floral Cotton Kurti","category":"women","productCategory":"women","subcategory":"Cloths","subCategory":"Cloths","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://ethnictreasures.in/cdn/shop/files/IMG_7209.jpg?v=1741757681&width=1946","description":"Floral Cotton Kurti — Cloths product in Women category.","tags":["Cloths","women"],"attributes":{"subcategory":"Cloths","category":"women"}},
{"id":"SM99-CAT-WOMEN-008","name":"Ribbed Crop Top","category":"women","productCategory":"women","subcategory":"Cloths","subCategory":"Cloths","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://fashionrazor.com/cdn/shop/products/61i5KJoDZxL._UL1500.jpg?v=1609144915","description":"Ribbed Crop Top — Cloths product in Women category.","tags":["Cloths","women"],"attributes":{"subcategory":"Cloths","category":"women"}},
{"id":"SM99-CAT-WOMEN-009","name":"Mini Shoulder Handbag","category":"women","productCategory":"women","subcategory":"Bags","subCategory":"Bags","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://static.tildacdn.com/tild3035-3363-4663-a338-666538373038/_MG_8815_w.jpg","description":"Mini Shoulder Handbag — Bags product in Women category.","tags":["Bags","women"],"attributes":{"subcategory":"Bags","category":"women"}},
{"id":"SM99-CAT-WOMEN-010","name":"Minimalist Wrist Watch","category":"women","productCategory":"women","subcategory":"Watch","subCategory":"Watch","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85","description":"Minimalist Wrist Watch — Watch product in Women category.","tags":["Watch","women"],"attributes":{"subcategory":"Watch","category":"women"}},
{"id":"SM99-CAT-WOMEN-011","name":"Comfort Flat Sandals","category":"women","productCategory":"women","subcategory":"Shoes","subCategory":"Shoes","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://product.hstatic.net/200000621387/product/5_3c923ccc553440e5adf22fe326529850.jpg","description":"Comfort Flat Sandals — Shoes product in Women category.","tags":["Shoes","women"],"attributes":{"subcategory":"Shoes","category":"women"}},
{"id":"SM99-CAT-WOMEN-012","name":"Pearl Stud Earrings","category":"women","productCategory":"women","subcategory":"Accessories","subCategory":"Accessories","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://ollijewelry.com/cdn/shop/files/E94CF91D-30F7-4D5F-AE3E-D7A6E653484D.png?v=1769349148&width=533","description":"Pearl Stud Earrings — Accessories product in Women category.","tags":["Accessories","women"],"attributes":{"subcategory":"Accessories","category":"women"}},
{"id":"SM99-CAT-KIDS-013","name":"Cartoon Print T-Shirt","category":"kids","productCategory":"kids","subcategory":"Cloths","subCategory":"Cloths","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://funsies.pk/cdn/shop/files/T_J_Babies_Graphic_Tee_F_New.jpg?v=1778063356","description":"Cartoon Print T-Shirt — Cloths product in Kids category.","tags":["Cloths","kids"],"attributes":{"subcategory":"Cloths","category":"kids"}},
{"id":"SM99-CAT-KIDS-014","name":"Denim Shorts","category":"kids","productCategory":"kids","subcategory":"Cloths","subCategory":"Cloths","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://cdn.media.amplience.net/i/frasersdev/64176518_o.jpg?v=20250810083437","description":"Denim Shorts — Cloths product in Kids category.","tags":["Cloths","kids"],"attributes":{"subcategory":"Cloths","category":"kids"}},
{"id":"SM99-CAT-KIDS-015","name":"Kids School Backpack","category":"kids","productCategory":"kids","subcategory":"Bags","subCategory":"Bags","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://i5.walmartimages.com/seo/MOSEYEYOO-Kids-Backpack-Boys-3-9-Toddler-Boys-Backpack-Fits-3-9-years-Elementary-School-Bag-Chest-Buckle-Reflective-Strip-16-inch-Large_0ad97d94-9dd8-4f7e-b586-4a561a7bab74.b7b040ef33b7f0eca1b05aad96773aee.jpeg?odnBg=FFFFFF&odnHeight=768&odnWidth=768","description":"Kids School Backpack — Bags product in Kids category.","tags":["Bags","kids"],"attributes":{"subcategory":"Bags","category":"kids"}},
{"id":"SM99-CAT-KIDS-016","name":"Building Blocks Set","category":"kids","productCategory":"kids","subcategory":"Toys","subCategory":"Toys","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://www.cdiscount.com/pdt2/9/2/3/3/700x700/eco1721205917923/rw/sac-tube-briques-abrick-ecoiffier-50-pieces.jpg","description":"Building Blocks Set — Toys product in Kids category.","tags":["Toys","kids"],"attributes":{"subcategory":"Toys","category":"kids"}},
{"id":"SM99-CAT-KIDS-017","name":"Digital Kids Watch","category":"kids","productCategory":"kids","subcategory":"Watch","subCategory":"Watch","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://img.tatacliq.com/images/i19/437Wx649H/MP000000022725931_437Wx649H_202407281848565.jpeg","description":"Digital Kids Watch — Watch product in Kids category.","tags":["Watch","kids"],"attributes":{"subcategory":"Watch","category":"kids"}},
{"id":"SM99-CAT-KIDS-018","name":"Teddy Bear Plush","category":"kids","productCategory":"kids","subcategory":"Toys","subCategory":"Toys","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://www.theentertainer.pk/cdn/shop/files/Snuggle_Buddies_10_My_First_Bear_a0c59d77-02ef-4189-ab56-ac2f3e827941.jpg?v=1767726818&width=940","description":"Teddy Bear Plush — Toys product in Kids category.","tags":["Toys","kids"],"attributes":{"subcategory":"Toys","category":"kids"}},
{"id":"SM99-CAT-HOME-019","name":"Ceramic Table Lamp","category":"home","productCategory":"home","subcategory":"Lighting","subCategory":"Lighting","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://media.homeboxstores.com/i/homebox/168127741-168127741-HMBX21082025N_01-2100.jpg?fmt=auto","description":"Ceramic Table Lamp — Lighting product in Home category.","tags":["Lighting","home"],"attributes":{"subcategory":"Lighting","category":"home"}},
{"id":"SM99-CAT-HOME-020","name":"Printed Cushion Cover Set","category":"home","productCategory":"home","subcategory":"Furnishing","subCategory":"Furnishing","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://m.media-amazon.com/images/I/51scdE%2B0HDL._AC_SR480%2C480_.jpg","description":"Printed Cushion Cover Set — Furnishing product in Home category.","tags":["Furnishing","home"],"attributes":{"subcategory":"Furnishing","category":"home"}},
{"id":"SM99-CAT-HOME-021","name":"Airtight Storage Jar Set","category":"home","productCategory":"home","subcategory":"Kitchen","subCategory":"Kitchen","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://image.made-in-china.com/2f0j00qVOutFbCnSpY/550ml-900ml-Lock-Clamp-Lid-Borosilicate-Crystal-Straight-Sided-Candy-Sugar-Cookies-Kitchen-Food-Glass-Jars-and-Containers.jpg","description":"Airtight Storage Jar Set — Kitchen product in Home category.","tags":["Kitchen","home"],"attributes":{"subcategory":"Kitchen","category":"home"}},
{"id":"SM99-CAT-HOME-022","name":"Bamboo Desk Organizer","category":"home","productCategory":"home","subcategory":"Storage","subCategory":"Storage","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://www.quill.com/is/image/Quill/9A7CC9D6-DBA9-4EE9-A2AE59DEFB7EDF31_s7?hei=1536&wid=1536","description":"Bamboo Desk Organizer — Storage product in Home category.","tags":["Storage","home"],"attributes":{"subcategory":"Storage","category":"home"}},
{"id":"SM99-CAT-HOME-023","name":"Non-Slip Door Mat","category":"home","productCategory":"home","subcategory":"Furnishing","subCategory":"Furnishing","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://www.therange.co.uk/media/5/7/1736857705_11_6928.jpg","description":"Non-Slip Door Mat — Furnishing product in Home category.","tags":["Furnishing","home"],"attributes":{"subcategory":"Furnishing","category":"home"}},
{"id":"SM99-CAT-HOME-024","name":"Stainless Steel Water Bottle","category":"home","productCategory":"home","subcategory":"Kitchen","subCategory":"Kitchen","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://juliancharles.co.uk/cdn/shop/files/W7588B.jpg?v=1701254056&width=1445","description":"Stainless Steel Water Bottle — Kitchen product in Home category.","tags":["Kitchen","home"],"attributes":{"subcategory":"Kitchen","category":"home"}},
{"id":"SM99-CAT-BEAUTY-025","name":"Aloe Vera Face Gel","category":"beauty","productCategory":"beauty","subcategory":"Skincare","subCategory":"Skincare","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://unisaifkuwait.com/cdn/shop/files/AloeVeraFaceGel.jpg?v=1694762451&width=720","description":"Aloe Vera Face Gel — Skincare product in Beauty category.","tags":["Skincare","beauty"],"attributes":{"subcategory":"Skincare","category":"beauty"}},
{"id":"SM99-CAT-BEAUTY-026","name":"Vitamin C Face Serum","category":"beauty","productCategory":"beauty","subcategory":"Skincare","subCategory":"Skincare","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://helensbioline.com/wp-content/uploads/2023/04/KAT_4985.jpg","description":"Vitamin C Face Serum — Skincare product in Beauty category.","tags":["Skincare","beauty"],"attributes":{"subcategory":"Skincare","category":"beauty"}},
{"id":"SM99-CAT-BEAUTY-027","name":"Matte Lipstick","category":"beauty","productCategory":"beauty","subcategory":"Makeup","subCategory":"Makeup","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85","description":"Matte Lipstick — Makeup product in Beauty category.","tags":["Makeup","beauty"],"attributes":{"subcategory":"Makeup","category":"beauty"}},
{"id":"SM99-CAT-BEAUTY-028","name":"Makeup Brush Set","category":"beauty","productCategory":"beauty","subcategory":"Makeup","subCategory":"Makeup","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://cdn.a2a-mcp.org/blog/VSV8j7YpYxnImuYuWAefy.webp","description":"Makeup Brush Set — Makeup product in Beauty category.","tags":["Makeup","beauty"],"attributes":{"subcategory":"Makeup","category":"beauty"}},
{"id":"SM99-CAT-BEAUTY-029","name":"Hair Claw Clip Set","category":"beauty","productCategory":"beauty","subcategory":"Hair Care","subCategory":"Hair Care","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://www.antoshkabeauty.com/cdn/shop/files/489_October_Brush_Collections_GetThingsStarted_PDP_set_and_bag_1400x_2x_4a7360df-1dfb-4090-a91c-0bbf6038a070_1445x.jpg?v=1693159919","description":"Hair Claw Clip Set — Hair Care product in Beauty category.","tags":["Hair Care","beauty"],"attributes":{"subcategory":"Hair Care","category":"beauty"}},
{"id":"SM99-CAT-BEAUTY-030","name":"Body Mist Spray","category":"beauty","productCategory":"beauty","subcategory":"Fragrance","subCategory":"Fragrance","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://smytten-image.gumlet.io/storefront/1776186049381_DBRI0029BB5_1.jpg","description":"Body Mist Spray — Fragrance product in Beauty category.","tags":["Fragrance","beauty"],"attributes":{"subcategory":"Fragrance","category":"beauty"}},
{"id":"SM99-CAT-MOBILE-031","name":"USB-C Fast Charging Cable","category":"mobile","productCategory":"mobile","subcategory":"Mobile Accessories","subCategory":"Mobile Accessories","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://pbs.twimg.com/media/E9CUELvWUA06Y2h.jpg","description":"USB-C Fast Charging Cable — Mobile Accessories product in Mobile category.","tags":["Mobile Accessories","mobile"],"attributes":{"subcategory":"Mobile Accessories","category":"mobile"}},
{"id":"SM99-CAT-MOBILE-032","name":"20W Fast Charger","category":"mobile","productCategory":"mobile","subcategory":"Mobile Accessories","subCategory":"Mobile Accessories","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://cdn.prod.website-files.com/621b7efdcf819768ca29963b/664f609f61f0bd4fcc68e39f_WHITE%20BACKGROUND%20PRODUCT%20AMAZON%20MAIN%20IMAGE%20PHOTOGRAPHY00015.jpg","description":"20W Fast Charger — Mobile Accessories product in Mobile category.","tags":["Mobile Accessories","mobile"],"attributes":{"subcategory":"Mobile Accessories","category":"mobile"}},
{"id":"SM99-CAT-MOBILE-033","name":"Clear Shockproof Phone Case","category":"mobile","productCategory":"mobile","subcategory":"Mobile Accessories","subCategory":"Mobile Accessories","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://img.pchome.com.tw/cs/items/DSBC3NA900HTBZY/l000003_1726635532.jpg?width=640","description":"Clear Shockproof Phone Case — Mobile Accessories product in Mobile category.","tags":["Mobile Accessories","mobile"],"attributes":{"subcategory":"Mobile Accessories","category":"mobile"}},
{"id":"SM99-CAT-MOBILE-034","name":"Magnetic Phone Stand","category":"mobile","productCategory":"mobile","subcategory":"Mobile Accessories","subCategory":"Mobile Accessories","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://www.tangled.co.za/cdn/shop/products/USB-C_Charge_Cable_580x.jpg?v=1571262650","description":"Magnetic Phone Stand — Mobile Accessories product in Mobile category.","tags":["Mobile Accessories","mobile"],"attributes":{"subcategory":"Mobile Accessories","category":"mobile"}},
{"id":"SM99-CAT-MOBILE-035","name":"Universal Screen Protector","category":"mobile","productCategory":"mobile","subcategory":"Mobile Accessories","subCategory":"Mobile Accessories","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=85","description":"Universal Screen Protector — Mobile Accessories product in Mobile category.","tags":["Mobile Accessories","mobile"],"attributes":{"subcategory":"Mobile Accessories","category":"mobile"}},
{"id":"SM99-CAT-MOBILE-036","name":"Wireless Neckband","category":"mobile","productCategory":"mobile","subcategory":"Audio","subCategory":"Audio","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://www.progressivedesk.com/cdn/shop/products/DA-19_1.jpg?v=1670970917","description":"Wireless Neckband — Audio product in Mobile category.","tags":["Audio","mobile"],"attributes":{"subcategory":"Audio","category":"mobile"}},
{"id":"SM99-CAT-FITNESS-037","name":"Resistance Band Set","category":"fitness","productCategory":"fitness","subcategory":"Workout","subCategory":"Workout","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://www.gaiam.com/cdn/shop/products/05-64061_6MM-GAIAM-ESSENTIALS-YOGA-MAT-TEAL_C_600x.jpg?v=1668557105","description":"Resistance Band Set — Workout product in Fitness category.","tags":["Workout","fitness"],"attributes":{"subcategory":"Workout","category":"fitness"}},
{"id":"SM99-CAT-FITNESS-038","name":"Skipping Rope","category":"fitness","productCategory":"fitness","subcategory":"Workout","subCategory":"Workout","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://ukstore.everlast.com/images/imgzoom/76/76004570_xxl.jpg","description":"Skipping Rope — Workout product in Fitness category.","tags":["Workout","fitness"],"attributes":{"subcategory":"Workout","category":"fitness"}},
{"id":"SM99-CAT-FITNESS-039","name":"Gym Gloves","category":"fitness","productCategory":"fitness","subcategory":"Accessories","subCategory":"Accessories","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://made4fitness.com/cdn/shop/products/img_proxy_76d4506c-82a4-4e04-861c-bb9e92c15035.jpg?crop=center&height=1200&v=1683297558&width=1200","description":"Gym Gloves — Accessories product in Fitness category.","tags":["Accessories","fitness"],"attributes":{"subcategory":"Accessories","category":"fitness"}},
{"id":"SM99-CAT-FITNESS-040","name":"Yoga Mat","category":"fitness","productCategory":"fitness","subcategory":"Yoga","subCategory":"Yoga","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://i5.walmartimages.com/seo/Tone-Fitness-Resistance-Training-Band_eb12c6db-d411-4b8f-8762-e1449a801542_1.a19f831223dca8cc2d92417072538fcc.jpeg?odnBg=FFFFFF&odnHeight=768&odnWidth=768","description":"Yoga Mat — Yoga product in Fitness category.","tags":["Yoga","fitness"],"attributes":{"subcategory":"Yoga","category":"fitness"}},
{"id":"SM99-CAT-FITNESS-041","name":"Steel Shaker Bottle","category":"fitness","productCategory":"fitness","subcategory":"Accessories","subCategory":"Accessories","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://greenbeans.com/images-v3/89edeb69-fe10-49ca-baab-5c51900239b9/2c3cbe47-788e-4028-b482-148e176db395/500x500.jpg","description":"Steel Shaker Bottle — Accessories product in Fitness category.","tags":["Accessories","fitness"],"attributes":{"subcategory":"Accessories","category":"fitness"}},
{"id":"SM99-CAT-FITNESS-042","name":"Hand Grip Strengthener","category":"fitness","productCategory":"fitness","subcategory":"Workout","subCategory":"Workout","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://contents.mediadecathlon.com/m15681461/k%245625368875fce5c4e485497ce73f85ef/essential-adjustable-training-glove-adgb-1242-adidas-51c8cb4e-8dd4-47d7-98af-5bc98a386919.jpg","description":"Hand Grip Strengthener — Workout product in Fitness category.","tags":["Workout","fitness"],"attributes":{"subcategory":"Workout","category":"fitness"}},
{"id":"SM99-CAT-ELECTRONICS-043","name":"Bluetooth Mini Speaker","category":"electronics","productCategory":"electronics","subcategory":"Audio","subCategory":"Audio","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85","description":"Bluetooth Mini Speaker — Audio product in Electronics category.","tags":["Audio","electronics"],"attributes":{"subcategory":"Audio","category":"electronics"}},
{"id":"SM99-CAT-ELECTRONICS-044","name":"Wireless Mouse","category":"electronics","productCategory":"electronics","subcategory":"Computer","subCategory":"Computer","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85","description":"Wireless Mouse — Computer product in Electronics category.","tags":["Computer","electronics"],"attributes":{"subcategory":"Computer","category":"electronics"}},
{"id":"SM99-CAT-ELECTRONICS-045","name":"USB Desk Fan","category":"electronics","productCategory":"electronics","subcategory":"Cooling","subCategory":"Cooling","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=85","description":"USB Desk Fan — Cooling product in Electronics category.","tags":["Cooling","electronics"],"attributes":{"subcategory":"Cooling","category":"electronics"}},
{"id":"SM99-CAT-ELECTRONICS-046","name":"LED Night Light","category":"electronics","productCategory":"electronics","subcategory":"Lighting","subCategory":"Lighting","price":19,"customerPrice":19,"sellerPrice":14,"rating":4.5,"image":"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=85","description":"LED Night Light — Lighting product in Electronics category.","tags":["Lighting","electronics"],"attributes":{"subcategory":"Lighting","category":"electronics"}},
{"id":"SM99-CAT-ELECTRONICS-047","name":"3.5mm Wired Earphones","category":"electronics","productCategory":"electronics","subcategory":"Audio","subCategory":"Audio","price":29,"customerPrice":29,"sellerPrice":24,"rating":4.5,"image":"https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=85","description":"3.5mm Wired Earphones — Audio product in Electronics category.","tags":["Audio","electronics"],"attributes":{"subcategory":"Audio","category":"electronics"}},
{"id":"SM99-CAT-ELECTRONICS-048","name":"USB LED Strip Light","category":"electronics","productCategory":"electronics","subcategory":"Lighting","subCategory":"Lighting","price":39,"customerPrice":39,"sellerPrice":34,"rating":4.5,"image":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85","description":"USB LED Strip Light — Lighting product in Electronics category.","tags":["Lighting","electronics"],"attributes":{"subcategory":"Lighting","category":"electronics"}},
{"id":"SM99-CAT-OTHERS-049","name":"Reusable Shopping Bag","category":"others","productCategory":"others","subcategory":"Utility","subCategory":"Utility","price":49,"customerPrice":49,"sellerPrice":44,"rating":4.5,"image":"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=85","description":"Reusable Shopping Bag — Utility product in Others category.","tags":["Utility","others"],"attributes":{"subcategory":"Utility","category":"others"}},
{"id":"SM99-CAT-OTHERS-050","name":"Compact Sewing Kit","category":"others","productCategory":"others","subcategory":"Utility","subCategory":"Utility","price":59,"customerPrice":59,"sellerPrice":54,"rating":4.5,"image":"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85","description":"Compact Sewing Kit — Utility product in Others category.","tags":["Utility","others"],"attributes":{"subcategory":"Utility","category":"others"}},
{"id":"SM99-CAT-OTHERS-051","name":"Microfiber Cleaning Cloth Set","category":"others","productCategory":"others","subcategory":"Cleaning","subCategory":"Cleaning","price":69,"customerPrice":69,"sellerPrice":64,"rating":4.5,"image":"https://down-my.img.susercontent.com/file/my-11134207-7r98o-ln8d1abja0n209","description":"Microfiber Cleaning Cloth Set — Cleaning product in Others category.","tags":["Cleaning","others"],"attributes":{"subcategory":"Cleaning","category":"others"}},
{"id":"SM99-CAT-OTHERS-052","name":"Travel Bottle Set","category":"others","productCategory":"others","subcategory":"Travel","subCategory":"Travel","price":79,"customerPrice":79,"sellerPrice":74,"rating":4.5,"image":"https://images.unsplash.com/photo-1584633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85","description":"Travel Bottle Set — Travel product in Others category.","tags":["Travel","others"],"attributes":{"subcategory":"Travel","category":"others"}},
{"id":"SM99-CAT-OTHERS-053","name":"Keychain Flashlight","category":"others","productCategory":"others","subcategory":"Utility","subCategory":"Utility","price":89,"customerPrice":89,"sellerPrice":84,"rating":4.5,"image":"https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85","description":"Keychain Flashlight — Utility product in Others category.","tags":["Utility","others"],"attributes":{"subcategory":"Utility","category":"others"}},
{"id":"SM99-CAT-OTHERS-054","name":"Foldable Storage Pouch","category":"others","productCategory":"others","subcategory":"Storage","subCategory":"Storage","price":99,"customerPrice":99,"sellerPrice":94,"rating":4.5,"image":"https://fashionpyramid.co/cdn/shop/files/53a5bfc8c3f83b7863cc7e9800976150.jpg?v=1730559762&width=600","description":"Foldable Storage Pouch — Storage product in Others category.","tags":["Storage","others"],"attributes":{"subcategory":"Storage","category":"others"}},
    ];

    const PRODUCT_CATEGORIES = ["men","women","kids","home","beauty","mobile","fitness","electronics","others"];
    const PRICE_SAMPLE_IMAGES = [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
    ];
    const PRICING_SAMPLE_PRODUCTS = [];
    function initializeProducts() {
        const existing = window.ShopMax99.storage.get(STORAGE.products, null);
        const list = Array.isArray(existing) ? existing : [];
        const sellerProducts = list.filter(item =>
            Boolean(String(item?.sellerEmail || item?.sellerId || item?.shopName || "").trim())
        );
        const normalizedSeller = sellerProducts.map(item => {
            const selling = Number(item.customerPrice ?? item.price ?? item.sellingPrice);
            const out = { ...item };
            if (Number.isFinite(selling) && selling > 0) {
                out.customerPrice = selling;
                out.price = selling;
                const pc = window.ShopMax99.pricing?.getCategory?.(selling);
                if (pc) { out.pricingCategoryId = pc.id; out.pricingCategory = pc.label; }
            }
            return out;
        });
        const merged = [...normalizedSeller, ...DEFAULT_PRODUCTS];
        window.ShopMax99.storage.set(STORAGE.products, merged);
        return merged;
    }
    function getProducts() {

        const products = window.ShopMax99.storage.get(
            STORAGE.products,
            DEFAULT_PRODUCTS
        );

        if (!Array.isArray(products) || !products.length) {
            const fresh = initializeProducts();
            return fresh.filter(product => !product.sellerEmail || String(product.status || "approved").toLowerCase() === "approved");
        }
        return products.filter(product => {
            const status = String(product.status || "approved").toLowerCase();
            return !product.sellerEmail || status === "approved";
        });
    }


    window.getShopMax99Products = getProducts;
    function categoryName(category) {

        const names = {
            all: "All Categories",
            men: "Men", women: "Women", kids: "Kids", home: "Home & Living", beauty: "Beauty", mobile: "Mobile", fitness: "Fitness", more: "More", electronics: "Electronics", toys: "Toys & Games", groceries: "Groceries", sports: "Sports",
            ...PRICE_CATEGORY_LABELS
        };
        return names[category] || category;
    }



    function customerPrice(product) {
        const direct = Number(product?.customerPrice);
        if (Number.isFinite(direct) && direct > 0) return direct;
        const settings = window.ShopMax99.storage.get("shopmax99_settings", {});
        const configured = Number(settings?.customerPrice);
        return Number.isFinite(configured) && configured > 0 ? configured : 99;
    }
    function productCard(product) {
        const wishlist = window.ShopMax99.wishlist.get();
        const isWishlisted = wishlist.some(item => String(item.id) === String(product.id));
        const current = customerPrice(product);
        const old = Number(product.mrp || product.originalPrice || product.sellerPrice || 0);
        const discount = old > current ? Math.round(((old-current)/old)*100) : Number(product.discountPercent || product.discount || 0);
        const rating = Number(product.rating || product.averageRating || 0);
        const reviewCount = Number(product.reviewCount || product.reviewsCount || product.ratingCount || 0);
        const brand = product.brand || product.brandName || 'ShopMax99';
        const mainImage = window.ShopMax99.getProductImage?.(product) || product.image || product.imageUrl || product.photo || product.thumbnail || product.images?.[0]?.url || product.images?.[0]?.src || product.images?.[0]?.dataUrl || product.photos?.[0]?.url || product.photos?.[0]?.src || product.photos?.[0] || "";
        const imageList = Array.isArray(product.images) ? product.images.map(item => typeof item === "string" ? item : item?.url || item?.src || item?.dataUrl || item?.data || "").filter(Boolean) : [];
        const secondImage = imageList.find(img => img !== mainImage);
        const safeMainImage = typeof mainImage === "string" ? mainImage : "";
        const image = safeMainImage ? `<img class="product-main-image" src="${window.ShopMax99.escapeHTML(safeMainImage)}" alt="${window.ShopMax99.escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null;this.closest('.product-image-wrap')?.classList.add('sm99-image-missing');this.remove()">${secondImage ? `<img class="product-hover-image" src="${window.ShopMax99.escapeHTML(secondImage)}" alt="" loading="lazy">` : ''}` : `<div class="product-placeholder"><i class="fa-solid fa-box"></i></div>`;
        const badge = product.badge || (rating >= 4.6 ? 'Best Seller' : discount >= 35 ? 'Trending' : '');
        const stock = Number(product.stock);
        const outOfStock = Number.isFinite(stock) && stock <= 0;
        return `<article class="product-card sm99-premium-product-card ${outOfStock?'sm99-out-of-stock-card':''}" data-product-id="${product.id}">
          <div class="product-image-wrap sm99-card-image">${image}
            ${outOfStock ? `<span class="sm99-out-of-stock-badge">OUT OF STOCK</span>` : ''}
            ${!outOfStock && badge ? `<span class="sm99-product-badge">${window.ShopMax99.escapeHTML(badge)}</span>` : ''}
            ${!outOfStock && discount > 0 ? `<span class="sm99-discount-badge">${discount}% OFF</span>` : ''}
            <button type="button" class="product-wishlist-btn ${isWishlisted?'active':''}" data-action="wishlist" data-product-id="${product.id}" aria-label="Add to wishlist"><i class="${isWishlisted?'fa-solid':'fa-regular'} fa-heart"></i></button>
            ${!outOfStock ? `<button type="button" class="sm99-quick-add" data-action="add-cart" data-product-id="${product.id}"><i class="fa-solid fa-plus"></i><span>Add to Cart</span></button>` : ''}
          </div>
          <div class="product-info sm99-card-info">
            <span class="sm99-brand-name">${window.ShopMax99.escapeHTML(brand)}</span>
            <h3>${window.ShopMax99.escapeHTML(product.name)}</h3>
            <div class="sm99-rating-chip"><i class="fa-solid fa-star"></i> ${rating ? rating.toFixed(1) : 'New'} ${reviewCount ? `<span>(${reviewCount.toLocaleString('en-IN')})</span>` : ''}</div>
            <div class="product-price-row"><div><span class="product-price">₹${current}</span>${old>current?`<span class="product-old-price">₹${old}</span>`:''}</div></div>
            <div class="sm99-delivery-line"><i class="fa-solid fa-truck-fast"></i> Free delivery on eligible orders</div>
            <div class="product-actions">${outOfStock ? `<div class="sm99-card-out-stock-text">Out of Stock</div>` : `<button type="button" class="product-add-btn" data-action="add-cart" data-product-id="${product.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button><button type="button" class="product-buy-btn" data-action="buy-now" data-product-id="${product.id}">Buy Now</button>`}</div>
          </div>
        </article>`;
    }
    let homeProductsExpanded = false;
    let lastHomeProducts = [];

    function wireRenderedProductInteractions() {
        const grid = document.getElementById("productGrid");
        if (!grid) return;
        grid.querySelectorAll('.view-more-product-card').forEach(card => {
            card.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                homeProductsExpanded = true;
                renderProducts(lastHomeProducts.length ? lastHomeProducts : getProducts());
            };
            card.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
            };
        });
        grid.querySelectorAll('.product-card[data-product-id]').forEach(card => {
            const id = card.dataset.productId;
            card.onclick = (e) => {
                if (e.target.closest('button,a,input,textarea,select,label')) return;
                e.preventDefault();
                e.stopPropagation();
                openProduct(id);
            };
            card.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const product = getProducts().find(x => String(x.id) === String(id));
                    if (product) window.ShopMax99.cart.add(product);
                };
            });
            card.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const product = getProducts().find(x => String(x.id) === String(id));
                    if (!product) return;
                    window.ShopMax99.cart.save([{id:product.id,name:product.name,price:customerPrice(product),image:window.ShopMax99.getProductImage?.(product)||product.image||product.imageUrl||product.images?.[0]||product.photos?.[0]||"",category:product.category||"",quantity:1,sellerPrice:product.sellerPrice||0,sellerEmail:product.sellerEmail||"",productWeight:product.productWeight||0,productWeightUnit:product.productWeightUnit||"gm",productWeightKg:Number(product.productWeightKg||0)}]);
                    window.ShopMax99.updateCartCount?.();
                    window.ShopMax99.closeModal?.("productModal");
                    setTimeout(() => window.ShopMax99.checkout?.(), 0);
                };
            });
            card.querySelectorAll('[data-action="wishlist"]').forEach(btn => {
                btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(id); };
            });
        });
    }

    function renderProducts(products = getProducts()) {

        const grid = $("#productGrid");

        const emptyState = $("#productEmptyState");

        const resultText = $("#productResultText");

        if (!grid) return;

        if (!products.length) {

            grid.innerHTML = "";

            if (emptyState) {
                emptyState.hidden = false;
            }

            if (resultText) {
                resultText.textContent =
                    "No products found";
            }

            return;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }
        const sponsorApi = window.ShopMax99?.sponsorship;
        sponsorApi?.cleanup?.();
        const sponsoredIds = new Set((sponsorApi?.getActive?.() || []).map(s => String(s.productId)));
        products = products.filter(p => !sponsoredIds.has(String(p.id)));
        if (!products.length) {
            grid.innerHTML = "";
            if (emptyState) emptyState.hidden = false;
            if (resultText) resultText.textContent = "No products found";
            return;
        }
        lastHomeProducts = Array.isArray(products) ? products.slice() : [];
        const isDefaultHomepage = currentCategory === "all" && !currentSearch && !homeProductsExpanded;
        if (isDefaultHomepage && products.length > 15) {
            const visible = products.slice(0, 15);
            grid.innerHTML = visible.map(productCard).join("") + `
                <article class="view-more-product-card" data-action="view-more-products" tabindex="0" role="button" aria-label="View more products">
                    <div class="view-more-icon"><i class="fa-solid fa-plus"></i></div>
                    <strong>View More</strong>
                    <small>See all ${products.length} available products</small>
                </article>`;
        } else {
            grid.innerHTML = products.map(productCard).join("");
        }
        if (resultText) {
            resultText.textContent = isDefaultHomepage && products.length > 15
                ? `Showing 15 of ${products.length} products`
                : `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
        }
        wireRenderedProductInteractions();
    }


    const PRODUCT_CATEGORY_OPTIONS = [
        ["all","All Categories"],["men","Men"],["women","Women"],["kids","Kids"],["home","Home & Living"],["beauty","Beauty"],["mobile","Mobile"],["fitness","Fitness"],["electronics","Electronics"],["others","Others"]
    ];

    function renderCategoryBrowser(category = "all") {
        const grid = $("#categoryProductGrid");
        const title = $("#categoryProductsTitle");
        const result = $("#categoryProductResultText");
        const empty = $("#categoryProductEmptyState");
        const pills = $("#categoryFilterPills");
        const filterBox = $("#sm99CategoryProductFilters");
        if (!grid) return;
        if (pills && !pills.children.length) {
            pills.innerHTML = PRODUCT_CATEGORY_OPTIONS.map(([id,label]) => `<button type="button" class="category-filter-pill ${id===category?"active":""}" data-category-browser="${id}">${label}</button>`).join("");
        } else if (pills) {
            [...pills.children].forEach(btn=>btn.classList.toggle("active",btn.dataset.categoryBrowser===category));
        }
        let products = getProducts();
        const sponsorApi = window.ShopMax99?.sponsorship;
        sponsorApi?.cleanup?.();
        const sponsoredIds = new Set((sponsorApi?.getActive?.() || []).map(s => String(s.productId)));
        products = products.filter(p => !sponsoredIds.has(String(p.id)));
        if (category !== "all") products = products.filter(p => String(p.category||p.productCategory||"").toLowerCase()===category);

        const renderFiltered = (state) => {
            const filtered = window.ShopMax99.productFilters?.apply(products, state) || products;
            grid.innerHTML = filtered.map(productCard).join("");
            if (empty) empty.hidden = filtered.length > 0;
            if (result) result.textContent = `${filtered.length} product${filtered.length===1?"":"s"} found${window.ShopMax99.productFilters?.hasActive(state) ? " after filters" : ""}`;
        };

        if (filterBox && window.ShopMax99.productFilters) {
            if (filterBox.__sm99FilterCategory !== category) {
                filterBox.__sm99FilterState = window.ShopMax99.productFilters.defaultState();
                filterBox.__sm99FilterCategory = category;
            }
            window.ShopMax99.productFilters.render(filterBox, products, renderFiltered);
            window.ShopMax99.productFilters.renderToolbar(document.getElementById("sm99CategoryFilterToolbar"), filterBox);
            renderFiltered(filterBox.__sm99FilterState || window.ShopMax99.productFilters.defaultState());
        } else {
            grid.innerHTML = products.map(productCard).join("");
            if (empty) empty.hidden = products.length > 0;
            if (result) result.textContent = `${products.length} product${products.length===1?"":"s"} found`;
        }
        if (title) title.textContent = categoryName(category);
        const categoryGrid = document.getElementById("categoryProductGrid");
        if (categoryGrid && !categoryGrid.dataset.sm99CategoryClickBound) {
            categoryGrid.dataset.sm99CategoryClickBound = "1";
            categoryGrid.addEventListener("click", event => {
                const card = event.target.closest('.product-card[data-product-id]');
                if (!card || event.target.closest('button,a,input,textarea,select,label')) return;
                openProduct(card.dataset.productId);
            });
        }
    }

    function openCategoryBrowser(category = "all") {
        if (typeof window.ShopMax99?.showCustomerPage === "function") window.ShopMax99.showCustomerPage("categories");
        renderCategoryBrowser(category);
    }
    window.renderShopMax99CategoryBrowser = renderCategoryBrowser;
    window.openShopMax99CategoryBrowser = openCategoryBrowser;
    let currentCategory = "all";
    let currentSearch = "";
    let currentSort = "relevance";

    function sortProducts(list, sort = currentSort) {
        const items = Array.isArray(list) ? list.slice() : [];
        const value = String(sort || "relevance");
        const priceOf = p => Number(customerPrice(p)) || 0;
        if (value === "low") items.sort((a,b) => priceOf(a) - priceOf(b));
        else if (value === "high") items.sort((a,b) => priceOf(b) - priceOf(a));
        else if (value === "rating") items.sort((a,b) => Number(b.rating || b.averageRating || 0) - Number(a.rating || a.averageRating || 0));
        else if (value === "new") items.sort((a,b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        return items;
    }

    function setHomeProductSort(value) {
        currentSort = String(value || "relevance");
        window.__shopmax99CurrentSort = currentSort;
        filterProducts(currentCategory);
    }
    window.setShopMax99Sort = setHomeProductSort;


    function filterProducts(category = "all") {

        const nextCategory = String(category || "all");
        const categoryChanged = currentCategory !== nextCategory;
        currentCategory = nextCategory;
        homeProductsExpanded = false;

        const products = getProducts();

        if (categoryChanged) {
            const filterBox = $("#sm99HomeProductFilters");
            if (filterBox && window.ShopMax99.productFilters) {
                filterBox.__sm99FilterState = window.ShopMax99.productFilters.defaultState();
                filterBox.__sm99FilterCategory = currentCategory;
            }
        }

        const sponsorApi = window.ShopMax99?.sponsorship;
        sponsorApi?.cleanup?.();
        let baseProducts = products.filter(product => !sponsorApi?.activeForProduct?.(product.id));
        if (!baseProducts.length && products.length) {
            baseProducts = products.slice();
        }

        if (category && category !== "all" && category !== "more") {
            if (String(category).startsWith("price_")) {
                const ceiling = Number(String(category).replace("price_", ""));
                const lower = ceiling === 19 ? 1 : ceiling - 9;
                baseProducts = Number.isFinite(ceiling)
                    ? baseProducts.filter(product => {
                        const price = Number(product.customerPrice ?? product.price ?? product.sellingPrice ?? 0);
                        return Number.isFinite(price) && price >= lower && price <= ceiling;
                    })
                    : baseProducts;
            } else {
                const wanted = String(category).trim().toLowerCase();
                baseProducts = baseProducts.filter(product => {
                    const values = [product.category, product.productCategory, product.gender]
                        .filter(v => v != null && String(v).trim() !== "")
                        .map(v => String(v).trim().toLowerCase());
                    return values.includes(wanted);
                });
            }
        }

        if (currentSearch) {
            baseProducts = baseProducts.filter(product => productSearchMatches(product, currentSearch));
        }

        const filterBox = $("#sm99HomeProductFilters");
        const state = filterBox?.__sm99FilterState || window.ShopMax99.productFilters?.defaultState?.();
        if (filterBox && window.ShopMax99.productFilters) {
            window.ShopMax99.productFilters.render(filterBox, baseProducts, nextState => {
                const filteredNow = window.ShopMax99.productFilters.apply(baseProducts, nextState);
                renderProducts(filteredNow);
            });
            window.ShopMax99.productFilters.renderToolbar(document.getElementById("sm99CategoryFilterToolbar"), filterBox);
        }

        const filtered = window.ShopMax99.productFilters?.apply(baseProducts, state) || baseProducts;
        renderProducts(sortProducts(filtered));
    }

    window.filterProducts = filterProducts;
    function updateSearchSuggestions(query) {
        const input = $("#productSearch");
        if (!input) return;
        let box = document.getElementById("sm99SearchSuggestions");
        if (!box) { box = document.createElement("div"); box.id = "sm99SearchSuggestions"; box.className = "sm99-search-suggestions"; input.closest(".search-wrapper")?.appendChild(box); }
        const q = String(query || "").trim().toLowerCase();
        const siteSettings = window.ShopMax99.storage.get("shopmax99_settings", {});
        if (siteSettings.searchSuggestionsEnabled === false || !q) { box.hidden = true; box.innerHTML = ""; return; }
        const limit = Math.max(3, Math.min(15, Number(siteSettings.searchSuggestionLimit || 7)));
        const matches = getPublicCatalogProducts().filter(product => productSearchMatches(product, q)).slice(0, limit);
        box.innerHTML = matches.length ? matches.map(product => `<button type="button" class="sm99-search-suggestion" data-action="search-product" data-product-id="${product.id}"><span class="sm99-search-suggestion-image">${product.image ? `<img src="${product.image}" alt="">` : '<i class="fa-solid fa-box"></i>'}</span><span><strong>${window.ShopMax99.escapeHTML(product.name)}</strong><small>${window.ShopMax99.escapeHTML(categoryName(product.category))}</small></span><b>₹${customerPrice(product)}</b></button>`).join("") : '<div class="sm99-search-empty">No matching products found</div>';
        box.hidden = false;
    }

    function recordSearchHistory(query) {
        const q = String(query || "").trim().toLowerCase();
        if (q.length < 2) return;
        try {
            const key = "shopmax99_search_history";
            const old = JSON.parse(localStorage.getItem(key) || "[]");
            const list = Array.isArray(old) ? old : [];
            const next = [{ query: q, at: Date.now() }, ...list.filter(x => String(x?.query || "") !== q)].slice(0, 30);
            localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {}
    }

    function normalizeSearchText(value) {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\u0900-\u097f]+/gi, " ")
            .trim();
    }

    function collectProductSearchText(product) {
        const parts = [];
        const add = value => {
            if (value == null) return;
            if (Array.isArray(value)) value.forEach(add);
            else if (typeof value === "object") Object.values(value).forEach(add);
            else parts.push(String(value));
        };
        [
            product.name, product.title, product.brand, product.brandName,
            product.category, product.productCategory, product.subcategory, product.subCategory,
            product.description, product.shortDescription, product.tags, product.keywords,
            product.gender, product.color, product.fabric, product.material, product.size,
            product.occasion, product.pattern, product.fit, product.style, product.type,
            product.productType, product.categoryName, product.searchKeywords, product.attributes,
            product.productAttributes
        ].forEach(add);
        try { parts.push(categoryName(product.category)); } catch(e) {}
        return normalizeSearchText(parts.join(" "));
    }

    function searchTokenMatches(token, haystack) {
        if (!token) return true;
        if (haystack.includes(token)) return true;
        if (token.length >= 3) {
            const words = haystack.split(/\s+/);
            return words.some(word => word.startsWith(token) || token.startsWith(word) && word.length >= 3);
        }
        return false;
    }

    function productSearchMatches(product, query) {
        const q = normalizeSearchText(query);
        if (!q) return true;
        const haystack = collectProductSearchText(product);
        if (haystack.includes(q)) return true;
        const tokens = q.split(/\s+/).filter(Boolean);
        return tokens.every(token => searchTokenMatches(token, haystack));
    }

    function searchProducts(query, notify = true) {
        currentSearch = String(query || "").trim();
        if (currentSearch) recordSearchHistory(currentSearch);
        filterProducts(currentCategory);
        if (notify && currentSearch) {
            window.ShopMax99.showToast(`Searching for "${currentSearch}"`);
        }
    }

    window.searchProducts = searchProducts;
    window.updateShopMax99SearchSuggestions = updateSearchSuggestions;
    function toggleWishlist(productId) {

        const products = getProducts();

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );

        if (!product) return;

        let wishlist =
            window.ShopMax99.wishlist.get();

        const index =
            wishlist.findIndex(
                item =>
                    String(item.id) ===
                    String(productId)
            );

        if (index >= 0) {

            wishlist.splice(index, 1);

            window.ShopMax99.wishlist.save(
                wishlist
            );

            window.ShopMax99.showToast(
                "Removed from wishlist.",
                "warning"
            );

        } else {

            const image = window.ShopMax99.getProductImage?.(product) || product.image || product.imageUrl || product.photo || product.thumbnail || product.images?.[0]?.url || product.images?.[0]?.src || product.images?.[0]?.dataUrl || product.images?.[0] || product.photos?.[0]?.url || product.photos?.[0]?.src || product.photos?.[0]?.dataUrl || product.photos?.[0] || "";
            wishlist.push({
                id: product.id,
                name: product.name || "ShopMax99 Product",
                category: product.category || product.productCategory || "",
                productCategory: product.productCategory || product.category || "",
                subcategory: product.subcategory || product.subCategory || "",
                description: product.description || "",
                price: Number(product.customerPrice ?? product.price) || 0,
                customerPrice: Number(product.customerPrice ?? product.price) || 0,
                sellerPrice: Number(product.sellerPrice) || 0,
                rating: product.rating || 0,
                stock: Number(product.stock),
                image,
                brand: product.brand || product.brandName || "",
                discount: product.discount || product.discountPercent || 0
            });

            const saved = window.ShopMax99.wishlist.save(wishlist);
            if (!saved) {
                window.ShopMax99.showToast("Browser storage full hai; wishlist save nahi ho saki.", "warning");
                return;
            }

            window.ShopMax99.showToast("Added to wishlist.");
        }

        const wishedNow = window.ShopMax99.wishlist.get().some(item => String(item.id) === String(productId));
        document.querySelectorAll(`.product-wishlist-btn[data-product-id="${CSS.escape(String(productId))}"]`).forEach(btn => {
            btn.classList.toggle("active", wishedNow);
            btn.setAttribute("aria-pressed", String(wishedNow));
            btn.setAttribute("aria-label", wishedNow ? "Remove from wishlist" : "Add to wishlist");
            const icon = btn.querySelector("i");
            if (icon) icon.className = wishedNow ? "fa-solid fa-heart" : "fa-regular fa-heart";
        });

        renderProducts(getFilteredProducts());
        document.querySelectorAll(`.product-wishlist-btn[data-product-id="${CSS.escape(String(productId))}"]`).forEach(btn => {
            btn.classList.toggle("active", wishedNow);
            btn.setAttribute("aria-pressed", String(wishedNow));
            const icon = btn.querySelector("i");
            if (icon) icon.className = wishedNow ? "fa-solid fa-heart" : "fa-regular fa-heart";
        });

        renderWishlist();
    }
    function getFilteredProducts() {

        let products = getProducts();

        if (
            currentCategory &&
            currentCategory !== "all" &&
            currentCategory !== "more"
        ) {
            if (String(currentCategory).startsWith("price_")) {
                const ceiling = Number(String(currentCategory).replace("price_", ""));
                const lower = ceiling === 19 ? 1 : ceiling - 9;
                if (Number.isFinite(ceiling)) {
                    products = products.filter(product => {
                        const price = Number(product.customerPrice ?? product.price ?? product.sellingPrice ?? 0);
                        return Number.isFinite(price) && price >= lower && price <= ceiling;
                    });
                }
            } else {
                const wanted = String(currentCategory).trim().toLowerCase();
                products = products.filter(product =>
                    [product.category, product.productCategory, product.gender]
                        .filter(v => v != null && String(v).trim() !== "")
                        .map(v => String(v).trim().toLowerCase())
                        .includes(wanted)
                );
            }
        }

        if (currentSearch) {

            const query =
                currentSearch.toLowerCase();

            products =
                products.filter(product =>
                    product.name
                        .toLowerCase()
                        .includes(query) ||

                    product.category
                        .toLowerCase()
                        .includes(query) ||

                    (product.description || "")
                        .toLowerCase()
                        .includes(query)
                );
        }

        return products;
    }
    function renderWishlist() {

        const grid = $("#wishlistGrid");

        const empty = $("#wishlistEmptyState");

        if (!grid) return;

        const wishlist = window.ShopMax99.wishlist.get();
        const liveProducts = getProducts();
        const hydratedWishlist = wishlist.map(savedProduct => {
            const liveProduct = liveProducts.find(item => String(item.id || item.productId) === String(savedProduct.id || savedProduct.productId));
            if (!liveProduct) return savedProduct;
            const savedImage = window.ShopMax99.getProductImage?.(savedProduct) || "";
            const liveImage = window.ShopMax99.getProductImage?.(liveProduct) || liveProduct.image || liveProduct.imageUrl || liveProduct.photo || liveProduct.thumbnail || liveProduct.images?.[0]?.url || liveProduct.images?.[0]?.src || liveProduct.images?.[0]?.dataUrl || liveProduct.images?.[0] || liveProduct.photos?.[0]?.url || liveProduct.photos?.[0]?.src || liveProduct.photos?.[0]?.dataUrl || liveProduct.photos?.[0] || "";
            return { ...liveProduct, ...savedProduct, image: savedImage || liveImage, images: liveProduct.images || savedProduct.images, photos: liveProduct.photos || savedProduct.photos };
        });

        if (!wishlist.length) {

            grid.innerHTML = "";

            if (empty) {
                empty.hidden = false;
            }

            return;
        }

        if (empty) {
            empty.hidden = true;
        }

        grid.innerHTML = hydratedWishlist.map(productCard).join("");
    }

    window.renderWishlist = renderWishlist;
    window.addEventListener("shopmax99-products-updated", () => {
        try {
            renderProducts(getProducts());
            const modal = document.getElementById("productModal");
            if (modal && modal.classList.contains("active")) {
                const id = modal.querySelector("[data-product-id]")?.dataset.productId;
                if (id) openProduct(id);
            }
        } catch (e) {}
    });
    function renderCart() {

        const container = $("#cartItems");
        const empty = $("#cartEmptyState");
        const summaryItems = $("#summaryItems");
        const summarySubtotal = $("#summarySubtotal");
        const summaryTotal = $("#summaryTotal");

        if (!container) return;

        const cart =
            window.ShopMax99.cart.get();

        if (!cart.length) {

            container.innerHTML = "";

            if (empty) {
                empty.hidden = false;
            }

            if (summaryItems) {
                summaryItems.textContent = "0";
            }

            if (summarySubtotal) {
                summarySubtotal.textContent = "₹0";
            }

            if (summaryTotal) {
                summaryTotal.textContent = "₹0";
            }
            const cartSuggestionsHost = document.getElementById("cartSuggestions");
            if (cartSuggestionsHost) cartSuggestionsHost.innerHTML = renderProductSuggestions(getPublicCatalogProducts().slice(0, 8), "You May Also Like");

            return;
        }

        if (empty) {
            empty.hidden = true;
        }

        let totalItems = 0;
        let subtotal = 0;

        container.innerHTML =
            cart.map(item => {

                const quantity =
                    Number(item.quantity || 1);

                const price =
                    Number(item.price || customerPrice(item));
                const liveProduct = getProducts().find(product => String(product.id) === String(item.id || item.productId));
                const cartImage = item.image || window.ShopMax99.getProductImage?.(liveProduct) || "";

                totalItems += quantity;

                subtotal +=
                    price * quantity;

                return `
                    <div
                        class="cart-item"
                        data-cart-id="${item.id}"
                        data-view-cart-product="${item.id}"
                        role="button"
                        tabindex="0"
                        aria-label="View ${window.ShopMax99.escapeHTML(item.name)}"
                    >

                        <div class="cart-item-image">

                            ${
                                cartImage
                                    ? `
                                        <img
                                            src="${cartImage}"
                                            alt="${window.ShopMax99.escapeHTML(item.name)}"
                                        >
                                    `
                                    : `
                                        <i class="fa-solid fa-box"></i>
                                    `
                            }

                        </div>


                        <div class="cart-item-info">

                            <h3>
                                ${window.ShopMax99.escapeHTML(item.name)}
                            </h3>

                            <p>
                                ${window.ShopMax99.escapeHTML(
                                    categoryName(item.category)
                                )}
                            </p>

                            <div class="cart-item-price">
                                ₹${price}
                            </div>

                        </div>


                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="qty-btn"
                                data-cart-action="minus"
                                data-product-id="${item.id}"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span class="qty-value">
                                ${quantity}
                            </span>

                            <button
                                type="button"
                                class="qty-btn"
                                data-cart-action="plus"
                                data-product-id="${item.id}"
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>

                        </div>


                        <button
                            type="button"
                            class="cart-remove-btn"
                            data-cart-action="remove"
                            data-product-id="${item.id}"
                            aria-label="Remove"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                `;
            }).join("");

        const cartSuggestionsHost = document.getElementById("cartSuggestions");
        if (cartSuggestionsHost) {
            const cartIds = new Set(cart.map(item => String(item.id)));
            cartSuggestionsHost.innerHTML = renderProductSuggestions(getPublicCatalogProducts().filter(p => !cartIds.has(String(p.id))).slice(0, 8), "You May Also Like");
        }

        if (summaryItems) {
            summaryItems.textContent =
                totalItems;
        }

        if (summarySubtotal) {
            summarySubtotal.textContent =
                `₹${subtotal}`;
        }

        if (summaryTotal) {
            summaryTotal.textContent =
                `₹${subtotal}`;
        }
    }

    window.renderCart = renderCart;
    function renderOrders() {

        const container =
            $("#customerOrdersList");

        const empty =
            $("#ordersEmptyState");

        if (!container) return;

        const orders =
            window.ShopMax99.storage.get(
                STORAGE.orders,
                []
            );

        if (!orders.length) {

            container.innerHTML = "";

            if (empty) {
                empty.hidden = false;
            }

            return;
        }

        if (empty) {
            empty.hidden = true;
        }

        container.innerHTML =
            orders.map(order => {

                const date =
                    new Date(order.date)
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                const itemCount =
                    order.items.reduce(
                        (sum, item) =>
                            sum +
                            Number(item.quantity || 1),
                        0
                    );

                return `
                    <div class="order-card">

                        <div class="order-header">

                            <div>
                                <div class="order-id">
                                    ${order.id}
                                </div>

                                <div class="order-date">
                                    ${date}
                                    ·
                                    ${itemCount} item${
                                        itemCount === 1
                                            ? ""
                                            : "s"
                                    }
                                </div>
                            </div>

                            <span class="order-status status-success">
                                ${window.ShopMax99.escapeHTML(
                                    order.status
                                )}
                            </span>

                        </div>

                        <div style="
                            margin-top:14px;
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:15px;
                        ">

                            <span style="
                                color:#77707f;
                                font-size:10px;
                            ">
                                Order Total
                            </span>

                            <strong style="
                                color:#6d28d9;
                                font-size:16px;
                            ">
                                ₹${order.total}
                            </strong>

                        </div>

                    </div>
                `;
            }).join("");
    }

    window.renderOrders = renderOrders;
    function getProductReviews(productId) {
        try {
            const all = JSON.parse(localStorage.getItem("shopmax99_reviews") || "[]");
            return Array.isArray(all)
                ? all.filter(r => String(r.productId) === String(productId))
                : [];
        } catch (error) {
            return [];
        }
    }

    function hasPurchasedProduct(productId) {
        try {
            const key = window.ShopMax99.storage?.keys?.orders;
            const orders = key
                ? window.ShopMax99.storage.get(key, [])
                : [];
            return Array.isArray(orders) && orders.some(order =>
                Array.isArray(order.items) && order.items.some(item =>
                    String(item.id) === String(productId)
                )
            );
        } catch (error) {
            return false;
        }
    }

    function saveProductReview(review) {
        try {
            const all = JSON.parse(localStorage.getItem("shopmax99_reviews") || "[]");
            const reviews = Array.isArray(all) ? all : [];
            reviews.unshift(review);
            localStorage.setItem("shopmax99_reviews", JSON.stringify(reviews));
            return true;
        } catch (error) {
            return false;
        }
    }

    function renderReviewStars(rating, interactive = false) {
        const value = Math.max(0, Math.min(5, Number(rating) || 0));
        return [1, 2, 3, 4, 5].map(star => {
            const active = star <= value;
            if (interactive) {
                return `
                    <button type="button" class="review-star-btn ${active ? "active" : ""}" data-review-rating="${star}" aria-label="${star} star${star > 1 ? "s" : ""}">
                        <i class="fa-${active ? "solid" : "regular"} fa-star"></i>
                    </button>`;
            }
            return `<i class="fa-${active ? "solid" : "regular"} fa-star"></i>`;
        }).join("");
    }

    function currentReviewUser() {
        try {
            const session = JSON.parse(localStorage.getItem("shopmax99_customer_session") || "null");
            if (session && session.loggedIn && session.customerId) {
                return {
                    id: session.customerId,
                    customerId: session.customerId,
                    name: session.name || "Customer",
                    mobile: session.mobile || ""
                };
            }
        } catch (error) {
            console.error("Customer review session read error:", error);
        }
        try {
            const user = window.ShopMax99.user?.get?.() || null;
            if (user && user.role !== "seller" && user.role !== "admin") {
                return {
                    id: user.id || user.customerId || user.email,
                    customerId: user.id || user.customerId || user.email,
                    name: user.name || user.email?.split("@")[0] || "Customer",
                    email: user.email || "",
                    mobile: user.mobile || ""
                };
            }
        } catch (error) {
            console.error("Legacy customer session read error:", error);
        }

        return null;
    }

    function renderProductReviews(product) {
        const reviews = getProductReviews(product.id);
        const total = reviews.length;
        const average = total
            ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / total
            : 0;

        const reviewCards = reviews.length
            ? reviews.map(review => `
                <article class="sm99-review-card">
                    <div class="sm99-review-card-head">
                        <div class="sm99-review-user">
                            <div class="sm99-review-avatar">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <strong>${window.ShopMax99.escapeHTML(review.name || "Customer")}</strong>
                                ${review.verifiedPurchase !== false
                                    ? `<span class="sm99-verified"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>`
                                    : `<span class="sm99-review-customer-badge"><i class="fa-solid fa-user"></i> Customer Review</span>`}
                            </div>
                        </div>
                        <time>${review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : ""}</time>
                    </div>
                    <div class="sm99-review-stars-static" aria-label="${Number(review.rating) || 0} out of 5 stars">
                        ${renderReviewStars(review.rating)}
                    </div>
                    <p>${window.ShopMax99.escapeHTML(review.text || "")}</p>
                    ${review.image ? `<img class="sm99-review-photo" src="${review.image}" alt="Customer review photo">` : ""}
                </article>
            `).join("")
            : `
                <div class="sm99-no-reviews-card">
                    <div class="sm99-no-reviews-icon"><i class="fa-regular fa-comment-dots"></i></div>
                    <strong>No reviews yet</strong>
                    <span>Be the first customer to review this product.</span>
                </div>
            `;

        const purchased = hasPurchasedProduct(product.id);
        const canReview = Boolean(currentReviewUser());

        return `
            <section class="sm99-reviews-section">
                <div class="sm99-reviews-header">
                    <div>
                        <span class="sm99-section-kicker">CUSTOMER FEEDBACK</span>
                        <h3>Ratings & Reviews</h3>
                    </div>
                    <div class="sm99-rating-summary">
                        <strong>${total ? average.toFixed(1) : "0.0"}</strong>
                        <div class="sm99-review-stars-static">${renderReviewStars(total ? average : 0)}</div>
                        <span>${total} review${total === 1 ? "" : "s"}</span>
                    </div>
                </div>

                ${canReview ? `
                    <form class="sm99-review-form" data-product-id="${product.id}">
                        <div class="sm99-review-form-title">
                            <div>
                                <strong>Write a review</strong>
                                <span>Share your experience with other customers.</span>
                            </div>
                            ${purchased
                                ? `<span class="sm99-review-purchase-note"><i class="fa-solid fa-circle-check"></i> Verified purchase</span>`
                                : `<span class="sm99-review-purchase-note sm99-review-unverified-note"><i class="fa-solid fa-user"></i> Customer review</span>`}
                        </div>

                        <div class="sm99-rating-picker">
                            <span>Your rating</span>
                            <div class="sm99-review-stars-picker">
                                ${renderReviewStars(0, true)}
                            </div>
                            <input type="hidden" name="rating" value="0">
                        </div>

                        <textarea name="reviewText" maxlength="800" required placeholder="What did you like or dislike about this product?"></textarea>

                        <div class="sm99-review-form-bottom">
                            <label class="sm99-photo-upload">
                                <i class="fa-regular fa-image"></i>
                                <span>Add product photo</span>
                                <input type="file" name="reviewImage" accept="image/jpeg,image/png,image/webp">
                            </label>
                            <button type="submit" class="sm99-review-submit">
                                Submit Review <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                        <small class="sm99-review-help">${purchased
                            ? "Your review is marked as Verified Purchase because this product appears in a completed order."
                            : "You can review this product while signed in. Because you have not purchased it yet, your review will not carry a Verified Purchase badge."}</small>
                    </form>
                ` : `
                    <div class="sm99-review-locked">
                        <div class="sm99-review-locked-icon"><i class="fa-solid fa-lock"></i></div>
                        <div>
                            <strong>${!canReview ? "Sign in to review this product" : "Review available after purchase"}</strong>
                            <span>${!canReview ? "Please sign in with your customer account first." : "Buy this product first. After your order is recorded, you can submit your rating, review and product photo here."}</span>
                        </div>
                    </div>
                `}

                <div class="sm99-review-list">
                    ${reviewCards}
                </div>
            </section>
        `;
    }

    function getPublicCatalogProducts() {
        const products = getProducts();
        const api = window.ShopMax99?.sponsorship;
        api?.cleanup?.();
        const sponsoredIds = new Set((api?.getActive?.() || []).map(s => String(s.productId)));
        return products.filter(p => !sponsoredIds.has(String(p.id)));
    }

    function getRelatedProducts(product) {
        const products = getPublicCatalogProducts();
        const category = String(product?.category || "").toLowerCase();
        const currentId = String(product?.id || "");
        const same = products.filter(item => String(item.id) !== currentId && String(item.category || "").toLowerCase() === category);
        const other = products.filter(item => String(item.id) !== currentId && !same.some(x => String(x.id) === String(item.id)));
        return same.concat(other);
    }
    function renderContinuousCatalog(product) {
        const products = getPublicCatalogProducts();
        const currentId = String(product?.id || "");
        const currentCategory = String(product?.category || "").toLowerCase();
        const categoryOrder = [
            "men", "women", "kids", "home", "beauty", "mobile", "fitness",
            "electronics", "toys", "groceries", "sports", "others"
        ];
        const discovered = [];
        products.forEach(item => {
            const cat = String(item.category || "others").toLowerCase();
            if (!discovered.includes(cat)) discovered.push(cat);
        });
        const ordered = [currentCategory, ...categoryOrder, ...discovered]
            .filter((cat, index, arr) => cat && arr.indexOf(cat) === index);
        const groups = ordered.map(cat => ({
            cat,
            items: products.filter(item =>
                String(item.category || "others").toLowerCase() === cat &&
                String(item.id) !== currentId
            )
        })).filter(group => group.items.length);
        if (!groups.length) return "";
        return `<section class="sm99-continuous-catalog">
            <div class="sm99-continuous-catalog-head">
                <span>CONTINUE SHOPPING</span>
                <h3>Explore More Products</h3>
                <p>Products continue category-by-category so the catalog does not stop after a small recommendation list.</p>
            </div>
            ${groups.map((group, index) => `
                <section class="sm99-continuous-category">
                    <div class="sm99-continuous-category-head">
                        <div><span>${index === 0 ? "CURRENT CATEGORY" : "NEXT CATEGORY"}</span><h4>${window.ShopMax99.escapeHTML(categoryName(group.cat))}</h4></div>
                        <small>${group.items.length} product${group.items.length === 1 ? "" : "s"}</small>
                    </div>
                    <div class="sm99-continuous-grid">${group.items.map(productCard).join("")}</div>
                </section>
            `).join("")}
        </section>`;
    }

    function renderProductSuggestions(products, title) {
        if (!products.length) return "";
        return `<section class="sm99-product-suggestions"><div class="sm99-suggestions-head"><div><span class="section-kicker">SHOPMAX99</span><h3>${title || "You May Also Like"}</h3></div><span>More products for you</span></div><div class="sm99-suggestion-grid">${products.map(productCard).join("")}</div></section>`;
    }

    function openProduct(productId) {
        const product = getProducts().find(
            item => String(item.id) === String(productId)
        );
        if (!product) return;
        const scrollPageToTop = () => {
            try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch (e) { window.scrollTo(0, 0); }
            [document.scrollingElement, document.documentElement, document.body].filter(Boolean).forEach(el => {
                el.scrollTop = 0; el.scrollLeft = 0;
            });
            document.querySelectorAll("main, .customer-main, .customer-content, .page-content, .app-content, .customer-layout, .customer-page, .main-content, .content-wrapper, .page-wrapper, .products-page, #app, #customerApp").forEach(el => {
                el.scrollTop = 0; el.scrollLeft = 0;
            });
            document.querySelectorAll("body *").forEach(el => {
                if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight + 2) {
                    const overflowY = getComputedStyle(el).overflowY;
                    if (overflowY === "auto" || overflowY === "scroll") el.scrollTop = 0;
                }
            });
        };
        scrollPageToTop();
        requestAnimationFrame(() => { scrollPageToTop(); requestAnimationFrame(scrollPageToTop); });
        setTimeout(scrollPageToTop, 60);

        const content = $("#productModalContent");
        if (!content) return;
        try {
            const key = "shopmax99_recent_views";
            const old = JSON.parse(localStorage.getItem(key) || "[]");
            const list = Array.isArray(old) ? old : [];
            const entry = {
                id: product.id,
                name: product.name || "",
                category: product.category || product.productCategory || "",
                productCategory: product.productCategory || product.category || "",
                at: Date.now()
            };
            const next = [entry, ...list.filter(x => String(x?.id) !== String(product.id))].slice(0, 30);
            localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {}

        const currentUser = currentReviewUser();
        const reviewsHtml = renderProductReviews(product);
        const productImages = Array.from(new Set(
            (Array.isArray(product.images) ? product.images : [])
                .concat(product.image ? [product.image] : [])
                .concat([product.image1, product.image2, product.image3, product.image4])
                .filter(Boolean)
        )).slice(0, 4);
        const galleryImages = productImages.length ? productImages : [""];
        const detailSkip = new Set([
            "id","productId","description","shortDescription","images","image",
            "sellerEmail","sellerId","status","createdAt","updatedAt",
            "sellerPrice","platformFee","platformFeeRate","platformPriceAdjustment",
            "pricingCategoryId","pricingCategory","customerPrice","price",
            "reviews","reviewCount","reviewCounts","rating","averageRating",
            "tags","keywords","searchKeywords"
        ]);
        const detailLabelMap = {
            productCategory:"Category", category:"Category", subcategory:"Sub Category", subCategory:"Sub Category",
            productWeight:"Product Weight", productWeightUnit:"Weight Unit",
            gender:"Gender", stitchedStatus:"Stitched / Unstitched", fabric:"Fabric", size:"Size",
            clothLength:"Cloth Length", fitShape:"Fit / Shape", occasion:"Occasion", printPattern:"Print / Pattern Type",
            brand:"Brand", brandName:"Brand", model:"Model", warranty:"Warranty",
            color:"Color", type:"Type", material:"Material", dimensions:"Dimensions", capacity:"Capacity",
            skinType:"Suitable For", shade:"Shade", quantity:"Net Quantity", compatibleModels:"Compatible Models",
            power:"Power", weightCapacity:"Weight / Capacity", dialDesign:"Dial Design", strapMaterial:"Strap Material",
            watchType:"Watch Type", waterResistance:"Water Resistance", shoeType:"Shoe Type", upperMaterial:"Upper Material",
            screenSize:"Screen Size", displayType:"Display Type", resolution:"Resolution", smartTV:"Smart TV",
            acCapacity:"Capacity", starRating:"Energy Rating", inverter:"Inverter", acType:"AC Type",
            ram:"RAM", storage:"Storage", pleaseSpecify:"Product Type"
        };
        const detailRows = [];
        const addDetail = (key, value) => {
            if (detailSkip.has(key) || value == null || value === "") return;
            if (Array.isArray(value)) value = value.filter(Boolean).join(", ");
            if (typeof value === "object") {
                Object.entries(value).forEach(([k,v]) => addDetail(k,v));
                return;
            }
            const text = String(value).trim();
            if (!text) return;
            const label = detailLabelMap[key] || key.replace(/([A-Z])/g," $1").replace(/^./,m=>m.toUpperCase());
            if (!detailRows.some(row => row.label === label && row.value === text)) detailRows.push({label,value:text});
        };
        Object.entries(product).forEach(([key,value]) => addDetail(key,value));
        if (product.attributes && typeof product.attributes === "object") Object.entries(product.attributes).forEach(([k,v])=>addDetail(k,v));
        if (product.productAttributes && typeof product.productAttributes === "object") Object.entries(product.productAttributes).forEach(([k,v])=>addDetail(k,v));
        const detailHtml = detailRows.length ? `
            <section class="sm99-product-specs">
                <div class="sm99-product-section-title"><span>PRODUCT DETAILS</span><h3>Specifications &amp; Attributes</h3></div>
                <div class="sm99-product-spec-grid">${detailRows.map(row=>`<div class="sm99-product-spec-row"><span>${window.ShopMax99.escapeHTML(row.label)}</span><strong>${window.ShopMax99.escapeHTML(row.value)}</strong></div>`).join("")}</div>
            </section>` : "";

        content.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-image sm99-product-gallery" data-gallery-index="0">
                    <div class="sm99-gallery-stage">
                        ${galleryImages[0]
                            ? `<img class="sm99-gallery-main-image" src="${galleryImages[0]}" alt="${window.ShopMax99.escapeHTML(product.name)}">`
                            : `<i class="fa-solid fa-box" aria-hidden="true"></i>`}
                        ${galleryImages.length > 1 ? `
                            <button type="button" class="sm99-gallery-btn sm99-gallery-prev" data-gallery-action="prev" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i><span>Previous</span></button>
                            <button type="button" class="sm99-gallery-btn sm99-gallery-next" data-gallery-action="next" aria-label="Next image"><span>Next</span><i class="fa-solid fa-chevron-right"></i></button>
                            <span class="sm99-gallery-counter">1 / ${galleryImages.length}</span>
                        ` : ""}
                    </div>
                    ${galleryImages.length > 1 ? `
                        <div class="sm99-gallery-thumbs">
                            ${galleryImages.map((img, i) => `<button type="button" class="sm99-gallery-thumb ${i === 0 ? "active" : ""}" data-gallery-thumb="${i}" aria-label="View image ${i + 1}"><img src="${img}" alt=""></button>`).join("")}
                        </div>
                    ` : ""}
                </div>

                <div class="product-detail-info">
                    <div class="product-detail-category">
                        ${window.ShopMax99.escapeHTML(categoryName(product.category))}
                    </div>
                    <h2>${window.ShopMax99.escapeHTML(product.name)}</h2>
                    <div class="sm99-preview-product-id sm99-preview-product-id-detail">Product ID: ${window.ShopMax99.escapeHTML(product.id || product.productId || "")}</div>
                    <div class="product-detail-rating-row">
                        <span class="product-detail-rating-stars">${renderReviewStars(product.rating || 0)}</span>
                        <span>${product.rating || "No rating"}</span>
                    </div>
                    <div class="product-detail-price">₹${customerPrice(product)}</div>
                    ${Number(product.stock) <= 0 ? `<div class="sm99-detail-out-stock">OUT OF STOCK</div>` : ""}
                    <div class="sm99-description-block">
                        <div class="sm99-product-section-title"><span>ABOUT THIS PRODUCT</span><h3>Description</h3></div>
                        <p class="product-detail-description">
                            ${window.ShopMax99.escapeHTML(product.description || "Product details will be updated soon.")}
                        </p>
                    </div>

                    ${detailHtml}

                    <div class="product-detail-actions">
                        <button type="button" class="product-detail-wishlist" data-action="modal-wishlist" data-product-id="${product.id}">
                            <i class="fa-regular fa-heart"></i> Wishlist
                        </button>
                        ${Number(product.stock) > 0 ? `<button type="button" class="primary-btn product-detail-cart" data-action="modal-add-cart" data-product-id="${product.id}">
                            <i class="fa-solid fa-cart-plus"></i> Add to Cart
                        </button>` : ""}
                        ${Number(product.stock) > 0 ? `<button type="button" class="primary-btn product-detail-buy" data-action="modal-buy-now" data-product-id="${product.id}">
                            <i class="fa-solid fa-bolt"></i> Buy Now
                        </button>` : ""}
                    </div>
                </div>
            </div>
            ${reviewsHtml}
            ${renderProductSuggestions(getRelatedProducts(product), "Related Products")}
        `;

        window.ShopMax99.openModal("productModal");
        bindProductReviewEvents(product);
    }

    function bindProductReviewEvents(product) {
        const content = $("#productModalContent");
        if (!content) return;

        content.querySelector('[data-action="modal-wishlist"]')?.addEventListener("click", () => {
            toggleWishlist(product.id);
            const icon = content.querySelector('[data-action="modal-wishlist"] i');
            const wished = window.ShopMax99.wishlist.get().some(item => String(item.id) === String(product.id));
            if (icon) icon.className = wished ? "fa-solid fa-heart" : "fa-regular fa-heart";
        });
        const gallery = content.querySelector(".sm99-product-gallery");
        if (gallery) {
            const images = Array.from(new Set(
                (Array.isArray(product.images) ? product.images : [])
                    .concat(product.image ? [product.image] : [])
                    .filter(Boolean)
            )).slice(0, 4);
            let galleryIndex = 0;
            const updateGallery = () => {
                if (!images.length) return;
                galleryIndex = (galleryIndex + images.length) % images.length;
                const main = gallery.querySelector(".sm99-gallery-main-image");
                if (main) main.src = images[galleryIndex];
                const counter = gallery.querySelector(".sm99-gallery-counter");
                if (counter) counter.textContent = `${galleryIndex + 1} / ${images.length}`;
                gallery.querySelectorAll("[data-gallery-thumb]").forEach(btn => {
                    btn.classList.toggle("active", Number(btn.dataset.galleryThumb) === galleryIndex);
                });
            };
            gallery.querySelector('[data-gallery-action="prev"]')?.addEventListener("click", () => { galleryIndex--; updateGallery(); });
            gallery.querySelector('[data-gallery-action="next"]')?.addEventListener("click", () => { galleryIndex++; updateGallery(); });
            gallery.querySelectorAll("[data-gallery-thumb]").forEach(btn => {
                btn.addEventListener("click", () => { galleryIndex = Number(btn.dataset.galleryThumb) || 0; updateGallery(); });
            });
        }

        const form = content.querySelector(".sm99-review-form");
        if (!form) return;

        let selectedRating = 0;
        form.querySelectorAll("[data-review-rating]").forEach(button => {
            button.addEventListener("click", () => {
                selectedRating = Number(button.dataset.reviewRating) || 0;
                const hidden = form.querySelector('input[name="rating"]');
                if (hidden) hidden.value = String(selectedRating);
                form.querySelectorAll("[data-review-rating]").forEach(starButton => {
                    const active = Number(starButton.dataset.reviewRating) <= selectedRating;
                    starButton.classList.toggle("active", active);
                    const icon = starButton.querySelector("i");
                    if (icon) icon.className = `fa-${active ? "solid" : "regular"} fa-star`;
                });
            });
        });

        form.addEventListener("submit", event => {
            event.preventDefault();
            const text = form.reviewText.value.trim();
            const file = form.reviewImage.files?.[0];
            const user = currentReviewUser();

            if (!selectedRating) {
                window.ShopMax99.showToast?.("Please select a star rating.", "error");
                return;
            }
            if (!text) {
                window.ShopMax99.showToast?.("Please write a review.", "error");
                return;
            }
            if (!user) {
                window.ShopMax99.showToast?.("Please sign in before writing a review.", "error");
                return;
            }
            if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                window.ShopMax99.showToast?.("Only JPG, PNG or WebP images are allowed.", "error");
                return;
            }

            const save = image => {
                const ok = saveProductReview({
                    id: `REV-${Date.now()}`,
                    productId: product.id,
                    name: user.name || user.email?.split("@")[0] || "Customer",
                    rating: selectedRating,
                    text,
                    image: image || "",
                    verifiedPurchase: hasPurchasedProduct(product.id),
                    createdAt: new Date().toISOString()
                });
                if (!ok) {
                    window.ShopMax99.showToast?.("Could not save the review.", "error");
                    return;
                }
                window.ShopMax99.showToast?.("Review submitted successfully.", "success");
                openProduct(product.id);
            };

            if (!file) {
                save("");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => save(reader.result);
            reader.readAsDataURL(file);
        });
    }


    window.addEventListener("shopmax99-sponsorship-refresh", () => {
        try { filterProducts(currentCategory); } catch (e) {}
    });
    function bindCustomerEvents() {
        const searchInput = $("#productSearch");
        const searchButton = $("#searchBtn");
        if (searchInput && !searchInput.dataset.liveSearchBound) {
            searchInput.dataset.liveSearchBound = "1";
            searchInput.addEventListener("input", () => {
                updateSearchSuggestions(searchInput.value);
                searchProducts(searchInput.value, false);
            });
            searchInput.addEventListener("focus", () => { if (searchInput.value.trim()) updateSearchSuggestions(searchInput.value); });
            searchInput.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    searchProducts(searchInput.value);
                    const box = document.getElementById("sm99SearchSuggestions");
                    if (box) box.hidden = true;
                }
                if (event.key === "Escape") {
                    const box = document.getElementById("sm99SearchSuggestions");
                    if (box) box.hidden = true;
                }
            });
        }
        if (searchButton && !searchButton.dataset.searchBound) {
            searchButton.dataset.searchBound = "1";
            searchButton.addEventListener("click", event => {
                event.preventDefault();
                searchProducts(searchInput?.value || "");
                const box = document.getElementById("sm99SearchSuggestions");
                if (box) box.hidden = true;
                searchInput?.focus();
            });
        }
        document.addEventListener("click", event => {
            if (!event.target.closest(".search-wrapper")) {
                const box = document.getElementById("sm99SearchSuggestions");
                if (box) box.hidden = true;
            }
        });

        document.addEventListener(
            "click",
            function (event) {

                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );

                if (actionButton) {

                    const action =
                        actionButton.dataset.action;

                    const productId =
                        actionButton.dataset.productId;

                    if (action === "wishlist") {

                        toggleWishlist(productId);

                        return;
                    }

                    if (action === "add-cart") {

                        event.preventDefault();
                        event.stopPropagation();
                        const savedScrollY = window.scrollY;

                        const product =
                            getProducts().find(
                                item =>
                                    String(item.id) ===
                                    String(productId)
                            );

                        if (product) {

                            window.ShopMax99.cart.add(
                                product
                            );
                            requestAnimationFrame(() => {
                                window.scrollTo(0, savedScrollY);
                            });
                        }

                        return;
                    }

                    if (action === "buy-now") {
                        event.preventDefault();
                        event.stopPropagation();
                        const product = getProducts().find(item => String(item.id) === String(productId));
                        if (product) {
                            window.ShopMax99.cart.save([{ id: product.id, name: product.name, price: customerPrice(product), image: window.ShopMax99.getProductImage?.(product) || product.image || product.imageUrl || product.images?.[0] || product.photos?.[0] || "", category: product.category || "", quantity: 1, sellerPrice: product.sellerPrice || 0, sellerEmail: product.sellerEmail || "", productWeight: product.productWeight || 0, productWeightUnit: product.productWeightUnit || "gm", productWeightKg: Number(product.productWeightKg || 0) }]);
                            window.ShopMax99.updateCartCount?.();
                            document.querySelectorAll(".modal-overlay").forEach(modal => {
                                modal.hidden = true;
                                modal.style.display = "";
                            });
                            document.body.style.overflow = "";

                            window.ShopMax99.checkout?.();
                        }
                        return;
                    }

                    if (action === "search-product") {
                        event.preventDefault();
                        const box = document.getElementById("sm99SearchSuggestions");
                        if (box) box.hidden = true;
                        openProduct(productId);
                        return;
                    }

                    if (action === "view-product") {
                        event.preventDefault();
                        event.stopPropagation();
                        openProduct(productId);
                        return;
                    }

                    if (action === "view-more-products") {
                        event.preventDefault();
                        event.stopPropagation();
                        homeProductsExpanded = true;
                        renderProducts(lastHomeProducts.length ? lastHomeProducts : getProducts());
                        requestAnimationFrame(() => {
                            document.getElementById("productGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                        return;
                    }

                    if (action === "modal-buy-now") {
                        event.preventDefault();
                        event.stopPropagation();
                        const product = getProducts().find(item => String(item.id) === String(productId));
                        if (product) {
                            window.ShopMax99.cart.save([{
                                id: product.id, name: product.name, price: customerPrice(product),
                                image: window.ShopMax99.getProductImage?.(product) || product.image || product.imageUrl || product.images?.[0] || product.photos?.[0] || "", category: product.category || "", quantity: 1,
                                sellerPrice: product.sellerPrice || 0, sellerEmail: product.sellerEmail || "", productWeight: product.productWeight || 0, productWeightUnit: product.productWeightUnit || "gm", productWeightKg: Number(product.productWeightKg || 0)
                            }]);
                            window.ShopMax99.updateCartCount?.();
                            window.ShopMax99.closeModal("productModal");
                            requestAnimationFrame(() => window.ShopMax99.checkout?.());
                        }
                        return;
                    }

                    if (action === "modal-add-cart") {

                        event.preventDefault();
                        event.stopPropagation();
                        const product =
                            getProducts().find(
                                item =>
                                    String(item.id) ===
                                    String(productId)
                            );

                        if (product) {

                            window.ShopMax99.cart.add(
                                product
                            );

                            window.ShopMax99.closeModal(
                                "productModal"
                            );
                        }

                        return;
                    }
                }


                const card = event.target.closest(".product-card[data-product-id]");
                if (card && !event.target.closest("button, a, input, textarea, select, label")) {
                    openProduct(card.dataset.productId);
                    return;
                }

                const cartProduct = event.target.closest("[data-view-cart-product]");
                if (cartProduct && !event.target.closest("[data-cart-action]")) {
                    openProduct(cartProduct.dataset.viewCartProduct);
                    return;
                }

                const cartAction =
                    event.target.closest(
                        "[data-cart-action]"
                    );

                if (cartAction) {

                    const action =
                        cartAction.dataset.cartAction;

                    const productId =
                        cartAction.dataset.productId;

                    if (action === "plus") {

                        window.ShopMax99.cart.changeQuantity(
                            productId,
                            1
                        );
                    }

                    if (action === "minus") {

                        window.ShopMax99.cart.changeQuantity(
                            productId,
                            -1
                        );
                    }

                    if (action === "remove") {

                        window.ShopMax99.cart.remove(
                            productId
                        );
                    }

                    return;
                }

            }
        );
    }
    function showSponsoredInterestPopup() {
        try {
            const customerApp = document.getElementById("customerApp");
            const roleWorkspaceActive = ["sellerApp", "adminApp", "sellerSupportApp", "customerSupportApp"]
                .some(id => { const el = document.getElementById(id); return !!el && !el.hidden; });
            if (!customerApp || customerApp.hidden || roleWorkspaceActive) return;
            if (window.ShopMax99?.sitePreview?.active) return;
            const api = window.ShopMax99?.sponsorship;
            api?.cleanup?.();
            const active = api?.getActive?.() || [];
            if (!active.length) return;
            const products = getProducts();
            const available = active.map(s => products.find(p => String(p.id) === String(s.productId))).filter(Boolean);
            if (!available.length) return;

            const searches = JSON.parse(localStorage.getItem("shopmax99_search_history") || "[]");
            const recent = JSON.parse(localStorage.getItem("shopmax99_recent_views") || "[]");
            const terms = (Array.isArray(searches) ? searches : []).slice(0,20).map(x=>String(x?.query||"").toLowerCase()).filter(Boolean);
            const recentItems = Array.isArray(recent) ? recent.slice(0,20) : [];
            const scored = available.map(p => {
                const hay=[p.name,p.category,p.productCategory,p.subcategory,p.subCategory,p.description,p.brand,p.brandName].map(v=>String(v||"").toLowerCase()).join(" ");
                let score=Math.random()*10;
                terms.forEach(q=>{ if(q && hay.includes(q)) score+=30; });
                recentItems.forEach(x=>{ const c=String(x?.category||x?.productCategory||"").toLowerCase(); if(c && c===String(p.category||p.productCategory||"").toLowerCase()) score+=12; });
                return {p,score};
            }).sort((a,b)=>b.score-a.score);
            const lastShown = String(localStorage.getItem("shopmax99_sponsored_popup_last_product") || "");
            let candidates = available.filter(p => String(p.id) !== lastShown);
            if (!candidates.length) candidates = available;
            const candidateScored = candidates.map(p => scored.find(x => String(x.p.id) === String(p.id)) || {p, score: Math.random()*10});
            const top=candidateScored.slice(0,Math.min(candidateScored.length,4));
            const chosen=top[Math.floor(Math.random()*top.length)]?.p || candidates[Math.floor(Math.random()*candidates.length)];
            localStorage.setItem("shopmax99_sponsored_popup_last_product", String(chosen?.id || ""));
            const price=Number(chosen.customerPrice||chosen.price||chosen.sellerPrice||0);
            const img=chosen.image || (Array.isArray(chosen.images)?chosen.images.find(Boolean):"");
            const modal=document.createElement("div");
            modal.id="sm99SponsoredInterestPopup"; modal.className="sm99-sponsored-popup";
            modal.innerHTML=`<div class="sm99-sponsored-popup-card" role="dialog" aria-modal="true" aria-label="Sponsored product">
              <button type="button" class="sm99-sponsored-popup-close" aria-label="Close">×</button>
              <span class="sm99-sponsored-popup-label"><i class="fa-solid fa-bullhorn"></i> Sponsored for you</span>
              <div class="sm99-sponsored-popup-body"><div class="sm99-sponsored-popup-image">${img?`<img src="${img}" alt="${window.ShopMax99.escapeHTML(chosen.name||"Sponsored product")}">`:`<i class="fa-solid fa-box"></i>`}</div>
              <div class="sm99-sponsored-popup-info"><small>Recommended from your browsing & search activity</small><h3>${window.ShopMax99.escapeHTML(chosen.name||"Sponsored product")}</h3><strong>₹${price.toLocaleString("en-IN")}</strong><button type="button" class="sm99-sponsored-popup-view" data-sponsored-popup-product="${window.ShopMax99.escapeHTML(chosen.id)}">View Product</button></div></div></div>`;
            document.body.appendChild(modal);
            const close=()=>modal.remove();
            modal.querySelector(".sm99-sponsored-popup-close")?.addEventListener("click",close);
            modal.addEventListener("click",e=>{if(e.target===modal)close();});
            modal.querySelector("[data-sponsored-popup-product]")?.addEventListener("click",()=>{const id=modal.querySelector("[data-sponsored-popup-product]")?.dataset.sponsoredPopupProduct; close(); if(id) openProduct(id);});
        } catch(e){ console.warn("Sponsored interest popup error",e); }
    }

    function scheduleSponsoredPopup(initial=false) {
        try {
            const customerApp = document.getElementById("customerApp");
            const roleWorkspaceActive = ["sellerApp", "adminApp", "sellerSupportApp", "customerSupportApp"]
                .some(id => { const el = document.getElementById(id); return !!el && !el.hidden; });
            if (!customerApp || customerApp.hidden || roleWorkspaceActive) return;
            if (window.ShopMax99?.sitePreview?.active) return;
            const firstKey = "shopmax99_sponsored_popup_session_seen";
            const timerKey = "shopmax99_sponsored_popup_timer_started";
            if (initial && sessionStorage.getItem(firstKey) !== "1") {
                sessionStorage.setItem(firstKey, "1");
                sessionStorage.setItem(timerKey, String(Date.now()));
                setTimeout(() => {
                    showSponsoredInterestPopup();
                    localStorage.setItem("shopmax99_sponsored_popup_next_at", String(Date.now() + 5 * 60 * 1000));
                    scheduleSponsoredPopup(false);
                }, 2 * 60 * 1000);
                return;
            }
            const nextKey = "shopmax99_sponsored_popup_next_at";
            let next = Number(localStorage.getItem(nextKey) || 0);
            if (!next) {
                next = Date.now() + 5 * 60 * 1000;
                localStorage.setItem(nextKey, String(next));
            }
            const delay = Math.max(1000, next - Date.now());
            setTimeout(() => {
                showSponsoredInterestPopup();
                localStorage.setItem(nextKey, String(Date.now() + 5 * 60 * 1000));
                scheduleSponsoredPopup(false);
            }, delay);
        } catch(e) { console.warn("Sponsored popup scheduler error", e); }
    }

    function renderPricingCategoryUI() {
        const prices=[19,29,39,49,59,69,79,89,99];
        const bar=$("#categoryBar");
        if(bar) bar.innerHTML=`<button type="button" class="category-link active" data-category="all"><i class="fa-solid fa-layer-group"></i> All Products</button>`+prices.map(p=>`<button type="button" class="category-link" data-category="price_${p}">₹${p}</button>`).join("");
        const home=$("#homeCategoryCards");
        if(home) {
            home.innerHTML=prices.map(p=>`<button type="button" class="category-card" data-category="price_${p}"><div class="category-card-icon"><i class="fa-solid fa-tag"></i></div><strong>₹${p}</strong><span>₹${p === 19 ? 1 : p - 9}–₹${p}</span></button>`).join("");
            home.hidden = true;
        }
        const all=document.querySelector(".all-category-grid");
        if(all) all.innerHTML=prices.map(p=>`<button type="button" class="large-category-card" data-category="price_${p}"><i class="fa-solid fa-tag"></i><strong>₹${p}</strong><span>₹${p === 19 ? 1 : p - 9}–₹${p}</span></button>`).join("");
        renderCategoryBrowser("all");
    }
    function bindFinalProductInteractions() {
        if (document.documentElement.dataset.sm99FinalProductInteractions === "1") return;
        document.documentElement.dataset.sm99FinalProductInteractions = "1";
        document.addEventListener("click", function(event) {
            const viewMore = event.target.closest('[data-action="view-more-products"], .view-more-product-card');
            if (viewMore) {
                event.preventDefault();
                event.stopImmediatePropagation();
                homeProductsExpanded = true;
                const all = lastHomeProducts.length ? lastHomeProducts.slice() : getProducts();
                renderProducts(all);
                return;
            }

            const button = event.target.closest('[data-action="add-cart"], [data-action="buy-now"], [data-action="modal-add-cart"], [data-action="modal-buy-now"]');
            if (button) {
                event.preventDefault();
                event.stopImmediatePropagation();
                const id = String(button.dataset.productId || "");
                const allProducts = getProducts();
                const product = allProducts.find(p => String(p.id) === id) || window.ShopMax99.storage.get(STORAGE.products, []).find(p => String(p.id) === id);
                if (!product) {
                    window.ShopMax99.showToast?.("Product nahi mila. Page refresh karke dobara try karein.", "warning");
                    return;
                }
                const action = button.dataset.action;
                if (action === "add-cart" || action === "modal-add-cart") {
                    const result = window.ShopMax99.cart.add(product);
                    if (Array.isArray(result) && result.some(item => String(item.id || item.productId) === id)) {
                        window.ShopMax99.updateCartCount?.();
                        window.renderCart?.();
                        if (action === "modal-add-cart") window.ShopMax99.closeModal?.("productModal");
                    }
                    return;
                }
                const item = {
                    id, productId: id, name: product.name || "ShopMax99 Product",
                    price: Number(customerPrice(product) || product.price || 0),
                    customerPrice: Number(customerPrice(product) || product.price || 0),
                    image: window.ShopMax99.getProductImage?.(product) || product.image || product.imageUrl || product.images?.[0] || product.photos?.[0] || "", category: product.category || product.productCategory || "others",
                    quantity: 1, sellerPrice: Number(product.sellerPrice || 0), sellerEmail: product.sellerEmail || "",
                    productWeight: Number(product.productWeight || 0), productWeightUnit: product.productWeightUnit || "gm",
                    productWeightKg: Number(product.productWeightKg || 0)
                };
                const saved = window.ShopMax99.cart.save([item]);
                if (!Array.isArray(saved) || !saved.some(row => String(row.id || row.productId) === id)) return;
                window.ShopMax99.updateCartCount?.();
                window.renderCart?.();
                window.ShopMax99.closeModal?.("productModal");
                setTimeout(() => window.ShopMax99.checkout?.(), 0);
                return;
            }

            const card = event.target.closest('.product-card[data-product-id]');
            if (card && !event.target.closest('button,a,input,textarea,select,label,[data-action]')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                openProduct(card.dataset.productId);
            }
        }, true);

        document.addEventListener("keydown", function(event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            const viewMore = event.target.closest?.('.view-more-product-card');
            if (viewMore) {
                event.preventDefault();
                homeProductsExpanded = true;
                renderProducts(lastHomeProducts.length ? lastHomeProducts : getProducts());
            }
        }, true);
    }

    function bindShopByPriceToggle() {
        const list = document.getElementById("homeCategoryCards");
        const toggle = document.getElementById("sm99PriceCategoryToggle");
        const close = document.getElementById("sm99PriceCategoryClose");
        if (!list || !toggle || !close || toggle.dataset.bound === "1") return;
        toggle.dataset.bound = "1";
        const setExpanded = expanded => {
            list.hidden = !expanded;
            toggle.hidden = expanded;
            toggle.setAttribute("aria-expanded", String(expanded));
            close.hidden = !expanded;
        };
        toggle.addEventListener("click", () => setExpanded(true));
        close.addEventListener("click", () => setExpanded(false));
        setExpanded(false);
    }

    function initCustomer() {

        initializeProducts();
        renderPricingCategoryUI();
        bindShopByPriceToggle();

        bindCustomerEvents();
        bindProductCardOpeners();
        bindFinalProductInteractions();

        filterProducts("all");
        requestAnimationFrame(() => {
            const grid = document.getElementById("productGrid");
            if (grid && !grid.children.length) {
                homeProductsExpanded = false;
                currentCategory = "all";
                currentSearch = "";
                renderProducts(getProducts());
            }
        });
        scheduleSponsoredPopup(true);

        renderWishlist();

        renderCart();

        renderOrders();
        try {
            const params = new URLSearchParams(window.location.search);
            const legacyProduct = params.get('shopmax99_scroll_product') || params.get('product');
            if (legacyProduct) {
                requestAnimationFrame(() => openProduct(legacyProduct));
            }
        } catch (e) {}
    }
    function bindProductCardOpeners() {
        [document.getElementById("productGrid"), document.getElementById("categoryProductGrid")].forEach(grid => {
            if (!grid || grid.dataset.sm99CardOpenBound === "1") return;
            grid.dataset.sm99CardOpenBound = "1";
            grid.addEventListener("click", event => {
                const card = event.target.closest(".product-card[data-product-id]");
                if (!card || !grid.contains(card)) return;
                if (event.target.closest("button, a, input, textarea, select, label, [data-action]")) return;
                event.preventDefault();
                event.stopPropagation();
                openProduct(card.dataset.productId);
            }, true);
            grid.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                const card = event.target.closest(".product-card[data-product-id]");
                if (!card || !grid.contains(card)) return;
                event.preventDefault();
                openProduct(card.dataset.productId);
            });
        });
    }

    window.openShopMax99Product = openProduct;
    window.initCustomer = initCustomer;
    window.productCardPublic = productCard;

})();