const products=[
{id:1,n:"Wireless Earbuds Pro",c:"Electronics",p:1290,o:1590,i:"🎧"},{id:2,n:"Smart Watch Series 8",c:"Electronics",p:1890,o:2290,i:"⌚"},
{id:3,n:"Premium Cotton T-Shirt",c:"Fashion",p:650,o:850,i:"👕"},{id:4,n:"Travel Backpack",c:"Accessories",p:990,o:1290,i:"🎒"},
{id:5,n:"Modern Table Lamp",c:"Home",p:790,o:990,i:"💡"},{id:6,n:"Daily Face Care Set",c:"Beauty",p:850,o:1100,i:"🧴"},
{id:7,n:"Portable Bluetooth Speaker",c:"Electronics",p:1490,o:1790,i:"🔊"},{id:8,n:"Casual Sneakers",c:"Fashion",p:1750,o:2100,i:"👟"},
{id:9,n:"Kitchen Storage Set",c:"Home",p:590,o:750,i:"🍱"},{id:10,n:"Sunglasses",c:"Accessories",p:490,o:690,i:"🕶️"},
{id:11,n:"Hair Styling Kit",c:"Beauty",p:1190,o:1450,i:"💇"},{id:12,n:"Mini Power Bank",c:"Electronics",p:990,o:1250,i:"🔋"}];
let cart=JSON.parse(localStorage.getItem("szcart")||"[]"),cat="All";
const money=n=>"৳"+n.toLocaleString("en-BD");
function render(){let q=document.getElementById("search").value.toLowerCase(),s=document.getElementById("sort").value;
let a=products.filter(x=>(cat==="All"||x.c===cat)&&(x.n+" "+x.c).toLowerCase().includes(q));
if(s==="low")a.sort((x,y)=>x.p-y.p);if(s==="high")a.sort((x,y)=>y.p-x.p);
document.getElementById("grid").innerHTML=a.map(x=>`<article class="card"><div class="pic">${x.i}</div><div class="body"><div class="tag">${x.c}</div><h3>${x.n}</h3><span class="price">${money(x.p)}</span><span class="old">${money(x.o)}</span><button class="add" onclick="add(${x.id})">Add to Cart</button></div></article>`).join("");
document.getElementById("none").hidden=!!a.length}
function save(){localStorage.setItem("szcart",JSON.stringify(cart))}
function add(id){let p=products.find(x=>x.id===id),x=cart.find(x=>x.id===id);x?x.q++:cart.push({...p,q:1});save();renderCart();openCart()}
function renderCart(){let qty=cart.reduce((a,x)=>a+x.q,0),sum=cart.reduce((a,x)=>a+x.p*x.q,0);document.getElementById("count").textContent=qty;document.getElementById("total").textContent=money(sum);document.getElementById("checkoutTotal").textContent=money(sum);
document.getElementById("items").innerHTML=cart.length?cart.map(x=>`<div class="cartitem"><div class="thumb">${x.i}</div><div><h4>${x.n}</h4><small>${money(x.p)}</small><div class="qty"><button onclick="change(${x.id},-1)">−</button><b>${x.q}</b><button onclick="change(${x.id},1)">+</button></div></div><button class="remove" onclick="removeItem(${x.id})">Remove</button></div>`).join(""):'<div class="empty">🛒<br><br>Your cart is empty.</div>'}
function change(id,n){let x=cart.find(x=>x.id===id);if(!x)return;x.q+=n;if(x.q<1)cart=cart.filter(x=>x.id!==id);save();renderCart()}
function removeItem(id){cart=cart.filter(x=>x.id!==id);save();renderCart()}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("shade").classList.add("show")}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("shade").classList.remove("show")}
function checkout(){if(!cart.length){alert("Your cart is empty.");return}document.getElementById("modal").classList.add("show");document.getElementById("form").hidden=false;document.getElementById("success").hidden=true}
function closeCheckout(){document.getElementById("modal").classList.remove("show")}
document.getElementById("search").oninput=render;
document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));b.classList.add("active");cat=b.dataset.cat;render()});
document.getElementById("form").onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));let order={id:"SZ"+Date.now(),customer:d,items:cart,total:cart.reduce((a,x)=>a+x.p*x.q,0)};localStorage.setItem("sz_last_order",JSON.stringify(order));cart=[];save();renderCart();e.target.hidden=true;document.getElementById("success").hidden=false};
render();renderCart();