import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgugRnMKEOcXLsR2mrJgWbHPapYzUq4c4",
  authDomain: "shopezone-4c666.firebaseapp.com",
  projectId: "shopezone-4c666",
  storageBucket: "shopezone-4c666.firebasestorage.app",
  messagingSenderId: "1049798447788",
  appId: "1:1049798447788:web:f6499203d62ea8df728509"
};

const auth = getAuth(initializeApp(firebaseConfig));
let confirmationResult = null;
let recaptchaVerifier = null;
const authModal=document.getElementById("authModal");
const authMessage=document.getElementById("authMessage");
function authMsg(text,error=false){authMessage.hidden=false;authMessage.textContent=text;authMessage.classList.toggle("error",error)}

let authMode="login";
const authTitle=document.getElementById("authTitle"),authHint=document.getElementById("authHint"),loginMode=document.getElementById("loginMode"),signupMode=document.getElementById("signupMode");
function setAuthMode(mode){authMode=mode;loginMode.classList.toggle("active",mode==="login");signupMode.classList.toggle("active",mode==="signup");authTitle.textContent=mode==="login"?"Login":"Sign Up";authHint.textContent=mode==="login"?"Login with your mobile number or email.":"Create your ShopeZone customer account.";document.getElementById("emailRegister").hidden=mode==="login";document.getElementById("emailLogin").hidden=mode==="signup";document.getElementById("sendOtp").textContent=mode==="login"?"Send Verification Code":"Send Sign Up Code";document.getElementById("otpArea").hidden=true;}
loginMode.onclick=()=>setAuthMode("login");signupMode.onclick=()=>setAuthMode("signup");
document.getElementById("accountBtn").onclick=()=>authModal.classList.add("show");
document.getElementById("authClose").onclick=()=>authModal.classList.remove("show");

document.querySelectorAll(".auth-tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".auth-tab").forEach(x=>x.classList.remove("active"));
  tab.classList.add("active");
  const phone=tab.dataset.auth==="phone";
  document.getElementById("phoneAuth").hidden=!phone;
  document.getElementById("emailAuth").hidden=phone;
  authMessage.hidden=true;
}));

document.getElementById("sendOtp").onclick=async()=>{
  const phone=document.getElementById("phoneNumber").value.trim();
  if(!/^\+\d{8,15}$/.test(phone)){authMsg("Use international format, e.g. +8801712345678.",true);return;}
  try{
    if(!recaptchaVerifier){recaptchaVerifier=new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});}
    confirmationResult=await signInWithPhoneNumber(auth,phone,recaptchaVerifier);
    document.getElementById("otpArea").hidden=false;
    authMsg("Verification code sent by SMS.");
  }catch(e){
    console.error(e); authMsg(e.message||"Could not send the verification code.",true);
    if(recaptchaVerifier){try{recaptchaVerifier.clear()}catch(_){}} recaptchaVerifier=null;
  }
};

document.getElementById("verifyOtp").onclick=async()=>{
  const code=document.getElementById("otpCode").value.trim();
  if(!confirmationResult){authMsg("Please request a verification code first.",true);return;}
  if(!/^\d{6}$/.test(code)){authMsg("Enter the 6-digit verification code.",true);return;}
  try{await confirmationResult.confirm(code);authMsg("Phone verified. You are now logged in.");}
  catch(e){authMsg("Invalid or expired verification code.",true);}
};

document.getElementById("emailRegister").onclick=async()=>{
  const email=document.getElementById("emailAddress").value.trim();
  const password=document.getElementById("emailPassword").value;
  if(!email||password.length<6){authMsg("Enter an email and a password of at least 6 characters.",true);return;}
  try{const cred=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(cred.user);authMsg("Account created. Check your email and click the verification link.");}
  catch(e){authMsg(e.message||"Could not create the account.",true);}
};

document.getElementById("emailLogin").onclick=async()=>{
  const email=document.getElementById("emailAddress").value.trim();
  const password=document.getElementById("emailPassword").value;
  try{
    const cred=await signInWithEmailAndPassword(auth,email,password);
    if(!cred.user.emailVerified){await sendEmailVerification(cred.user);authMsg("Please verify your email first. A new verification link was sent.");return;}
    authMsg("Email verified. You are now logged in.");
  }catch(e){authMsg(e.message||"Email login failed.",true);}
};


const profileModal=document.getElementById("profileModal");
const profileForm=document.getElementById("profileForm");
const checkoutForm=document.getElementById("orderForm");
const savedCustomerBox=document.getElementById("savedCustomerBox");
const profileKey=user=>`shopezone-profile-${user.uid}`;
function getProfile(user){try{return JSON.parse(localStorage.getItem(profileKey(user))||"null")}catch(e){return null}}
function openProfile(user){
  if(!user)return;
  const p=getProfile(user);
  document.getElementById("profileName").value=p?.name||"";
  document.getElementById("profilePhone").value=p?.phone||user.phoneNumber||"";
  document.getElementById("profileBilling").value=p?.billingCode||`SZ-${user.uid.slice(-8).toUpperCase()}`;
  document.getElementById("profileAddress").value=p?.address||"";
  profileModal.classList.add("show");
}
function saveProfile(user,data){localStorage.setItem(profileKey(user),JSON.stringify(data))}
function fillCheckout(user){
  const p=getProfile(user);
  if(!p)return false;
  checkoutForm.name.value=p.name;
  checkoutForm.phone.value=p.phone;
  checkoutForm.address.value=p.address;
  savedCustomerBox.innerHTML=`<strong>✓ Saved Customer Details</strong><span>👤 ${p.name}</span><span>📱 ${p.phone}</span><span>🧾 Billing Code: ${p.billingCode}</span><span>📍 ${p.address}</span><button type="button" class="profile-edit" id="editProfile">Edit details</button>`;
  savedCustomerBox.hidden=false;
  checkoutForm.name.hidden=true; checkoutForm.phone.hidden=true; checkoutForm.address.hidden=true;
  document.getElementById("editProfile").onclick=()=>openProfile(user);
  return true;
}
profileForm.addEventListener("submit",e=>{
  e.preventDefault();
  const user=auth.currentUser;if(!user)return;
  const data={name:document.getElementById("profileName").value.trim(),phone:document.getElementById("profilePhone").value.trim(),billingCode:document.getElementById("profileBilling").value.trim()||`SZ-${user.uid.slice(-8).toUpperCase()}`,address:document.getElementById("profileAddress").value.trim()};
  if(!data.name||!data.phone||!data.address)return;
  saveProfile(user,data); profileModal.classList.remove("show");
  fillCheckout(user);
});
document.getElementById("closeProfile").onclick=()=>profileModal.classList.remove("show");

document.getElementById("logoutBtn").onclick=()=>signOut(auth);
onAuthStateChanged(auth,user=>{
  const panel=document.getElementById("userPanel");
  panel.hidden=!user;
  if(user){
    document.getElementById("userName").textContent=user.displayName||"ShopeZone Customer";
    document.getElementById("userEmail").textContent=user.email||user.phoneNumber||"";
    document.querySelector(".auth-tabs").hidden=true;
    document.getElementById("phoneAuth").hidden=true;
    document.getElementById("emailAuth").hidden=true;
  }else{
    document.querySelector(".auth-tabs").hidden=false;
    document.getElementById("phoneAuth").hidden=false;
    document.getElementById("emailAuth").hidden=true;
  }
});

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
window.addToCart = function addToCart(id){
  const p=products.find(x=>x.id===id), item=cart.find(x=>x.id===id);
  if(item)item.qty++; else cart.push({...p,qty:1});
  save(); renderCart(); openCart();
}
window.changeQty = function changeQty(id,delta){
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
  const user=auth.currentUser;
  if(!user){alert("Please Login / Sign Up first. Your saved customer details will then be used automatically.");document.getElementById("authModal").classList.add("show");return}
  if(!getProfile(user)){openProfile(user);return}
  modal.classList.add("show");
  fillCheckout(user);
};
document.getElementById("closeModal").onclick=()=>{modal.classList.remove("show");};
document.getElementById("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  document.getElementById("orderForm").hidden=true;
  document.getElementById("orderSuccess").hidden=false;
  cart=[];save();renderCart();
});
renderProducts(products);
renderCart();
updateCounts();
