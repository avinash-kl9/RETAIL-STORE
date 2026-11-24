const STORAGE_KEY = "retail-store-products-v1";
const starterProducts = [
  {id:"p1",name:"Cotton T-shirt",sku:"TS-001",category:"Clothing",price:499,quantity:24,description:"Regular fit cotton T-shirt"},
  {id:"p2",name:"Water Bottle",sku:"WB-010",category:"Accessories",price:199,quantity:4,description:"Reusable 1 litre bottle"},
  {id:"p3",name:"Wireless Mouse",sku:"WM-020",category:"Electronics",price:799,quantity:0,description:"2.4 GHz wireless mouse"}
];
let products = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || starterProducts;
const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(value);
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(products));}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function render(){
  const totalStock=products.reduce((s,p)=>s+p.quantity,0);
  $("totalProducts").textContent=products.length;
  $("totalStock").textContent=totalStock;
  $("lowStock").textContent=products.filter(p=>p.quantity<=5).length;
  $("inventoryValue").textContent=money(products.reduce((s,p)=>s+p.price*p.quantity,0));

  const categories=[...new Set(products.map(p=>p.category).filter(Boolean))].sort();
  const selected=$("categoryFilter").value;
  $("categoryFilter").innerHTML='<option value="">All categories</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  $("categoryFilter").value=selected;

  const q=$("searchInput").value.trim().toLowerCase();
  const category=$("categoryFilter").value;
  const stock=$("stockFilter").value;
  const filtered=products.filter(p=>
    (!q || [p.name,p.sku,p.category].some(v=>String(v).toLowerCase().includes(q))) &&
    (!category || p.category===category) &&
    (!stock || (stock==="low" ? p.quantity>0&&p.quantity<=5 : p.quantity===0))
  );
  $("productRows").innerHTML=filtered.map(p=>{
    const status=p.quantity===0?'<span class="pill out">Out of stock</span>':p.quantity<=5?'<span class="pill low">Low stock</span>':'<span class="pill">In stock</span>';
    return `<tr>
      <td><div class="product-name">${escapeHtml(p.name)}</div><div class="muted">${escapeHtml(p.description||"")}</div></td>
      <td>${escapeHtml(p.sku)}</td><td>${escapeHtml(p.category)}</td>
      <td>${money(p.price)}</td><td>${p.quantity} <div class="muted">${status}</div></td>
      <td>${money(p.price*p.quantity)}</td>
      <td><div class="actions"><button class="small-btn" data-edit="${p.id}">Edit</button><button class="small-btn delete" data-delete="${p.id}">Delete</button></div></td>
    </tr>`;
  }).join("");
  $("emptyState").hidden=filtered.length!==0;
}
function openForm(product){
  $("productForm").reset();
  $("productId").value=product?.id||"";
  $("dialogTitle").textContent=product?"Edit product":"Add product";
  if(product){["name","sku","category","price","quantity","description"].forEach(k=>$(k).value=product[k]??"");}
  $("productDialog").showModal();
}
$("addProductBtn").addEventListener("click",()=>openForm());
$("closeDialog").addEventListener("click",()=>$("productDialog").close());
$("cancelBtn").addEventListener("click",()=>$("productDialog").close());
$("productForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("productId").value;
  const item={id:id||crypto.randomUUID(),name:$("name").value.trim(),sku:$("sku").value.trim(),category:$("category").value.trim(),price:Number($("price").value),quantity:Number($("quantity").value),description:$("description").value.trim()};
  if(products.some(p=>p.sku.toLowerCase()===item.sku.toLowerCase()&&p.id!==id)){alert("That SKU/code already exists. Please use a unique SKU.");return;}
  if(id)products=products.map(p=>p.id===id?item:p);else products.push(item);
  save();$("productDialog").close();render();
});
$("productRows").addEventListener("click",e=>{
  const edit=e.target.dataset.edit,del=e.target.dataset.delete;
  if(edit){const p=products.find(x=>x.id===edit);if(p)openForm(p);}
  if(del){const p=products.find(x=>x.id===del);if(p&&confirm(`Delete "${p.name}"?`)){products=products.filter(x=>x.id!==del);save();render();}}
});
["searchInput","categoryFilter","stockFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",render));
render();