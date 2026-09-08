const products = [
 {id:1,name:"Smart Watch",cat:"Electronics",price:59.99,old:89.99,rating:4.8,badge:"Hot",img:"https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=700&q=80"},
 {id:2,name:"Wireless Headphones",cat:"Electronics",price:49.99,old:79.99,rating:4.7,badge:"New",img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"},
 {id:3,name:"Running Shoes",cat:"Fashion",price:69.99,old:99.99,rating:4.6,badge:"Sale",img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"},
 {id:4,name:"Smartphone 128GB",cat:"Electronics",price:699,old:799,rating:4.9,badge:"",img:"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=80"},
 {id:5,name:"Laptop Backpack",cat:"Fashion",price:39.99,old:59.99,rating:4.6,badge:"",img:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80"},
 {id:6,name:"Bluetooth Speaker",cat:"Electronics",price:29.99,old:49.99,rating:4.6,badge:"Popular",img:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80"},
 {id:7,name:"Coffee Maker",cat:"Home & Living",price:84.99,old:109.99,rating:4.5,badge:"",img:"https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=700&q=80"},
 {id:8,name:"Sports Backpack",cat:"Sports & Outdoor",price:44.99,old:64.99,rating:4.4,badge:"New",img:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80"},
 {id:9,name:"Gaming Controller",cat:"Toys & Games",price:54.99,old:69.99,rating:4.7,badge:"",img:"https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=700&q=80"},
 {id:10,name:"Desk Lamp",cat:"Home & Living",price:24.99,old:34.99,rating:4.5,badge:"",img:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80"},
 {id:11,name:"Perfume Gift Set",cat:"Beauty & Health",price:42.99,old:55.99,rating:4.8,badge:"Sale",img:"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"},
 {id:12,name:"Casual T-Shirt",cat:"Fashion",price:19.99,old:29.99,rating:4.5,badge:"Hot",img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"}
];

let cart = JSON.parse(localStorage.getItem("shopezone-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("shopezone-wishlist") || "[]");
let currentProducts = products;

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

function money(n){return "$"+Number(n).toFixed(2)}
function renderProducts(list=currentProducts){
  currentProducts=list;
  grid.innerHTML=list.map(p=>`
    <article class="product">
      <div class="product-img"><img loading="lazy" src="${p.img}" alt="${p.name}">${p.badge?`<span class="badge">${p.badge}</span>`:""}</div>
      <div class="product-body">
        <h3 title="${p.name}">${p.name}</h3>
        <div><span class="price">${money(p.price)}</span><span class="old">${money(p.old)}</span></div>
        <div class="rating">★★★★★ <span>(${p.rating})</span></div>
        <button class="add" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
      </div>
    </article>`).join("");
  empty.hidden=list.length!==0;
}
function save(){localStorage.setItem("shopezone-cart",JSON.stringify(cart));localStorage.setItem("shopezone-wishlist",JSON.stringify(wishlist));updateCounts()}
function updateCounts(){
  document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  document.getElementById("wishCount").textContent=wishlist.length;
  document.getElementById("subtotal").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0));
}
function addToCart(id){
  const p=products.find(x=>x.id===id), item=cart.find(x=>x.id===id);
  if(item)item.qty++; else cart.push({...p,qty:1});
  save(); renderCart(); openCart();
}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id); if(!item)return;
  item.qty+=delta; if(item.qty<=0)cart=cart.filter(x=>x.id!==id);
  save(); renderCart();
}
function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){box.innerHTML='<div class="empty">Your cart is empty.<br>Add some products to continue.</div>';return}
  box.innerHTML=cart.map(x=>`
    <div class="cart-row">
      <img src="${x.img}" alt="${x.name}">
      <div><h4>${x.name}</h4><p>${money(x.price)}</p><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${x.id},1)">+</button></div></div>
      <button class="modal-close" style="position:static;font-size:22px" onclick="changeQty(${x.id},-999)">×</button>
    </div>`).join("");
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show")}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("show")}
document.getElementById("cartBtn").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=closeCart;

document.getElementById("searchBtn").onclick=search;
document.getElementById("searchInput").addEventListener("input",search);
function search(){
  const q=document.getElementById("searchInput").value.toLowerCase().trim();
  renderProducts(products.filter(p=>(p.name+" "+p.cat).toLowerCase().includes(q)));
}
document.querySelectorAll(".categories button").forEach(btn=>btn.addEventListener("click",()=>{
  const cat=btn.dataset.cat;
  document.getElementById("shop").scrollIntoView({behavior:"smooth"});
  renderProducts(cat==="All"?products:products.filter(p=>p.cat===cat));
}));
document.getElementById("viewAll").onclick=()=>renderProducts(products);

const modal=document.getElementById("checkoutModal");
document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){alert("Your cart is empty.");return}
  modal.classList.add("show");
};
document.getElementById("closeModal").onclick=()=>modal.classList.remove("show");
/* ================================
   ShopeZone - EmailJS Order Email
   ================================ */
const EMAILJS_SERVICE_ID = "service_b12wcbq";
const EMAILJS_TEMPLATE_ID = "template_2ifmljr";
const EMAILJS_PUBLIC_KEY = "7p85t0kub-iS_jMnD";

function loadEmailJS(){
  return new Promise((resolve,reject)=>{
    if(window.emailjs){ resolve(); return; }
    const existing=document.querySelector('script[data-emailjs="shopezone"]');
    if(existing){
      existing.addEventListener("load",()=>resolve(),{once:true});
      existing.addEventListener("error",()=>reject(new Error("EmailJS library could not be loaded.")),{once:true});
      return;
    }
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.async=true;
    s.dataset.emailjs="shopezone";
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error("EmailJS library could not be loaded. Check your internet connection."));
    document.head.appendChild(s);
  });
}

async function sendOrderEmail(){
  await loadEmailJS();
  emailjs.init({publicKey: EMAILJS_PUBLIC_KEY});

  const form=document.getElementById("orderForm");
  const getValue=(name)=>{
    const el=form.elements[name] || document.getElementById(name);
    return el ? String(el.value || "").trim() : "";
  };

  const orderId="SZ-"+Date.now().toString(36).toUpperCase();
  const orderDetails=cart.map((item,index)=>
    `${index+1}. ${item.name} — Qty: ${item.qty} — ${money(item.price*item.qty)}`
  ).join("\n");
  const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    order_id: orderId,
    customer_name: getValue("name"),
    customer_phone: getValue("phone"),
    customer_address: getValue("address"),
    payment_method: getValue("payment") || getValue("payment_method"),
    order_details: orderDetails,
    total: money(total),
    order_time: new Date().toLocaleString("en-BD",{timeZone:"Asia/Dhaka"})
  });
}

document.getElementById("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();

  if(!cart.length){
    alert("Your cart is empty.");
    return;
  }

  const btn=e.submitter;
  if(btn) btn.disabled=true;

  try{
    await sendOrderEmail();
    document.getElementById("orderForm").hidden=true;
    document.getElementById("orderSuccess").hidden=false;
    cart=[]; save(); renderCart();
  }catch(error){
    console.error("ShopeZone EmailJS error:",error);
    alert("Order email could not be sent.\n\nEmailJS: "+(error?.text || error?.message || "Unknown error")+"\n\nYour order was NOT cleared. Please try again.");
  }finally{
    if(btn) btn.disabled=false;
  }
});
renderProducts(products);
renderCart();
updateCounts();
