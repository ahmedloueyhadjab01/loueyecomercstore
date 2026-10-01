const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

code = code.replace(
  `let ALL_CATEGORIES = [];
  let CURRENT_CATEGORY = '';
  let SEARCH_QUERY = '';`,
  `let ALL_CATEGORIES = [];
  const _urlParams = new URLSearchParams(window.location.search);
  let CURRENT_CATEGORY = _urlParams.get('category_id') || '';
  let SEARCH_QUERY = _urlParams.get('q') || '';`
);

// We should also set the search input value to SEARCH_QUERY on load
code = code.replace(
  `updateCartCount();`,
  `updateCartCount();
  const deskInp = document.getElementById('searchInput');
  const attInp = document.getElementById('attachedSearchInput');
  const mobInp = document.getElementById('mobileSearchInput');
  if (deskInp && SEARCH_QUERY) deskInp.value = SEARCH_QUERY;
  if (attInp && SEARCH_QUERY) attInp.value = SEARCH_QUERY;
  if (mobInp && SEARCH_QUERY) mobInp.value = SEARCH_QUERY;`
);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Search query fixed!");
