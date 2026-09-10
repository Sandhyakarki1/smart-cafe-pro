import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Search, ShoppingBag, Plus, Minus, Utensils, Pizza, Coffee, Loader2 } from "lucide-react";
import { BASE_URL } from "../config";

export default function CustomerMenu() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true); 
  const [showSplash, setShowSplash] = useState(true); 
  const [tableNumber, setTableNumber] = useState("1");
  const { tableId } = useParams(); 
  const navigate = useNavigate();

  const categories = [{ name: "All", icon: <Utensils size={18}/> }, { name: "Meals", icon: <Utensils size={18}/> }, { name: "Snacks", icon: <Pizza size={18}/> }, { name: "Drinks", icon: <Coffee size={18}/> }];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.includes("http")) return imagePath.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, BASE_URL);
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    // Splash Timer: 2 seconds
    const timer = setTimeout(() => setShowSplash(false), 2000);

    // tableId from the URL is the real Table database ID (from the QR code).
    // Store it so CustomerCart can send it back when placing the order.
    if (tableId) {
      localStorage.setItem("table_id", tableId);
    }
    const storedTableId = tableId || localStorage.getItem("table_id");

    setLoading(true);

    // Fetch the real table list to find this table's display number
    fetch(`${BASE_URL}/api/tables/`)
      .then(res => res.json())
      .then(tables => {
        const match = tables.find(t => String(t.id) === String(storedTableId));
        if (match) {
          setTableNumber(match.number);
          localStorage.setItem("table", match.number);
        }
      })
      .catch(() => {});

    fetch(`${BASE_URL}/api/menu/`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
      
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
    return () => clearTimeout(timer);
  }, [tableId]);

  const handleAddToCart = (e, item) => {
    if (e) e.stopPropagation();
    if (item.stock <= 0) return alert("Out of stock!");
    const existing = cart.find(i => i.id === item.id);
    let updated = existing 
      ? cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...item, quantity: 1, note: "" }]; 
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleRemoveOne = (e, itemId) => {
    if (e) e.stopPropagation();
    const existing = cart.find(i => i.id === itemId);
    if (!existing) return;
    let updated = existing.quantity > 1 
      ? cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
      : cart.filter(i => i.id !== itemId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const filteredMenu = menu.filter(i => (activeCategory === "All" || i.category === activeCategory) && i.name.toLowerCase().includes(search.toLowerCase()));

  // --- WELCOME SPLASH UI ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
         <div className="mb-8 p-4 bg-white rounded-[40px] shadow-2xl shadow-orange-100 animate-bounce">
            <img src="/logo.jpg" alt="Logo" className="w-28 h-28 object-contain" />
         </div>
         <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            <span className="text-slate-800">Welcome </span>
            <span className="text-slate-300 text-2xl lowercase font-medium mx-1">to</span>
            <span className="block mt-3 bg-gradient-to-r from-orange-500 via-red-500 to-indigo-600 text-transparent bg-clip-text">
               SmartCafe
            </span>
         </h1>
         <div className="mt-12 flex items-center gap-2 text-slate-300">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Opening Menu</span>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFB100] min-h-screen font-sans pb-32">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white text-left">
            <h1 className="text-3xl font-black">Smart Cafe</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest text-white/80">Table {tableNumber} Menu</p>
          </div>
          <button onClick={() => navigate('/cart')} className="bg-white p-3 rounded-2xl text-orange-500 shadow-xl relative active:scale-95 transition-all">
             <ShoppingBag size={24}/>
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black animate-bounce">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
        <div className="relative mb-6">
          <input type="text" placeholder="Search delicious food..." className="w-full bg-white/95 p-4 pl-12 rounded-2xl outline-none shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
        </div>
      </div>

      <div className="bg-slate-50 rounded-t-[50px] min-h-screen p-6 shadow-2xl">
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex flex-col items-center gap-2 min-w-[75px] transition-all ${activeCategory === cat.name ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeCategory === cat.name ? 'bg-[#FFB100] text-white' : 'bg-white text-slate-400'}`}>{cat.icon}</div>
              <span className="text-[10px] font-black uppercase text-slate-600">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 text-left">
          {loading ? <div className="col-span-2 text-center py-10 italic text-slate-300">Loading Menu...</div> : 
           filteredMenu.map((item) => {
            const cartItem = cart.find(c => c.id === item.id);
            const qty = cartItem ? cartItem.quantity : 0;
            return (
            <div key={item.id} className="bg-white rounded-[35px] p-3 shadow-sm border border-white flex flex-col min-h-[220px] transition-all relative overflow-hidden">
              <div className="w-full aspect-square overflow-hidden rounded-[28px] mb-3 relative">
                <img src={getImageUrl(item.image)} onError={(e) => e.target.src="https://via.placeholder.com/150"} className="w-full h-full object-cover" alt={item.name}/>
              </div>
              <h4 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1">{item.name}</h4>
              <p className="text-[9px] text-slate-400 font-medium mb-2 line-clamp-2 h-6">{item.description || "Freshly prepared"}</p>
              <div className="flex justify-between items-center mt-auto px-1">
                <span className="font-black text-orange-600 text-[11px]">Rs {item.price}</span>
                <div className="h-9 flex items-center">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button onClick={(e) => handleRemoveOne(e, item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm"><Minus size={12} /></button>
                      <span className="text-xs font-black text-slate-800 w-3 text-center">{qty}</span>
                      <button onClick={(e) => handleAddToCart(e, item)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm"><Plus size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={(e) => handleAddToCart(e, item)} disabled={item.stock === 0} className="bg-orange-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-90 disabled:bg-gray-200">
                      {item.stock === 0 ? "Empty" : "Add"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
      {cart.length > 0 && <div className="fixed bottom-6 left-0 right-0 px-6 z-50 animate-in slide-in-from-bottom-4"><button
       onClick={() => navigate('/cart')} className="w-full max-w-md mx-auto bg-slate-900 text-white py-5 rounded-[24px] shadow-2xl font-black flex justify-between items-center px-8 transition-transform active:scale-95 border border-white/10">
        <div className="flex items-center gap-2"><span>{cart.reduce((a,b)=>a+b.quantity, 0)} Items</span></div>
        <span className="text-orange-400 uppercase text-[10px] tracking-widest">View Order →</span></button></div>}
    </div>
  );
}
