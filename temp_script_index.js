const dCart = document.getElementById('cartBtnDesktop');
if (dCart) dCart.addEventListener('click', () => { if(window.openCart) window.openCart(); });

const mCart = document.getElementById('mobileNavCart');
if (mCart) mCart.addEventListener('click', () => { if(window.openCart) window.openCart(); });
