const fs = require("fs");
let content = fs.readFileSync("public/product.html", "utf8");

const oldFetch = `        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) throw new Error("No id");
        
        let storeId = params.get('store_id');
        if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;
        const q = storeId ? "?store_id=" + storeId : '';
        
        const res = await fetch('/api/products/' + id + q);
        if (!res.ok) throw new Error("Not found");
        const product = await res.json();`;

const newFetch = `        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const slug = params.get('slug');
        if (!id && !slug) throw new Error("لم يتم تحديد المنتج");
        
        let storeId = params.get('store_id');
        if (!storeId && typeof CURRENT_STORE_ID !== 'undefined') storeId = CURRENT_STORE_ID;
        const q = storeId ? "?store_id=" + storeId : '';
        
        let product;
        if (id) {
            const res = await fetch('/api/products/' + id + q);
            if (!res.ok) throw new Error("المنتج غير موجود");
            product = await res.json();
        } else {
            const qStr = storeId ? "?store_id=" + storeId + "&slug=" + encodeURIComponent(slug) : "?slug=" + encodeURIComponent(slug);
            const res = await fetch('/api/products' + qStr);
            if (!res.ok) throw new Error("المنتج غير موجود");
            const arr = await res.json();
            if (!arr || arr.length === 0) throw new Error("المنتج غير موجود");
            product = arr[0];
        }`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  fs.writeFileSync("public/product.html", content, "utf8");
  console.log("Updated product fetch logic");
} else {
  console.log("Could not find fetch logic to replace. Let's try with regex.");
}
