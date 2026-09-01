import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Utensils, Image as ImageIcon, Loader2, Save, Check } from 'lucide-react';


const BASE_URL = "https://prisoners-mood-hearing-moved.trycloudflare.com";
const API_URL = `${BASE_URL}/api/menu/`;

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  
  // State for Form Data 
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Meals', 
    price: '', 
    stock: '', 
    image: null,
    description: '' 
  });

  const [preview, setPreview] = useState(null); 

  // Helper to handle image paths through the tunnel
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (typeof imagePath !== 'string') return null;
    const cleanPath = imagePath.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, "");
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description || ""); 
    
    
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }

    const url = editingItem ? `${API_URL}${editingItem.id}/` : API_URL;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: data,
      });

      if (res.ok) {
        fetchMenu();
        setIsModalOpen(false);
        setPreview(null);
      } else {
        const errData = await res.json();
        alert("Error: " + JSON.stringify(errData));
      }
    } catch (error) {
      alert("Failed to connect to server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchMenu();
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item, image: null }); 
      setPreview(getFullImageUrl(item.image)); 
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: 'Meals', price: '', stock: '', image: null, description: '' });
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* TOP HEADER */}
      <div className="flex justify-between items-center mb-10 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Menu Management</h1>
          <p className="text-slate-400 font-medium text-sm">Organize digital food menu and inventory</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {/* MENU TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="animate-spin mb-3" size={40} />
                <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Syncing Menu...</p>
            </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Item Details</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5">Stock</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 flex-shrink-0 shadow-sm">
                      <img 
                        src={getFullImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src="https://via.placeholder.com/150"; }}
                      />
                    </div>
                    <div>
                        <span className="font-black text-slate-800 block text-sm">{item.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px] font-medium">{item.description || "No description"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-white border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-sm font-bold ${item.stock < 5 ? 'text-red-500' : 'text-slate-600'}`}>
                    {item.stock > 0 ? `Qty: ${item.stock}` : "Out of Stock"}
                  </span>
                </td>
                <td className="px-8 py-5 font-black text-indigo-600">Rs {item.price}</td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(item)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/*  DESIGN-MATCHED MODAL  */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={24} />
            </button>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                {editingItem ? 'Edit Food Item' : 'Add Food Item'}
            </h2>
            <p className="text-slate-500 font-medium mb-10 text-sm">Fill in the menu details below</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* FOOD NAME */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Food Name</label>
                <input 
                    required 
                    className="w-full border-2 border-indigo-200 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-slate-700" 
                    placeholder=""
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Food Description</label>
                <textarea 
                  className="w-full border-2 border-black p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 h-24 resize-none" 
                  placeholder=""
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              
              {/* CATEGORY & PRICE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Category</label>
                  <select 
                    className="w-full border-2 border-black p-4 rounded-2xl font-bold text-slate-700 outline-none appearance-none bg-white cursor-pointer" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Meals">Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Price (Rs)</label>
                  <input 
                    required type="number" 
                    className="w-full border-2 border-black p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                    placeholder="0.00"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
              </div>

              {/* STOCK */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Available Quantity (Stock)</label>
                <input 
                    required type="number" 
                    className="w-full border-2 border-black p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                    placeholder=""
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                />
              </div>

              {/* IMAGE UPLOAD BOX */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider ml-1">Food Image</label>
                <div className="border-2 border-dashed border-black rounded-2xl p-4 flex items-center justify-start gap-4 bg-slate-50/50">
                    <input type="file" accept="image/*" id="file-upload" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="file-upload" className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-[10px] font-black cursor-pointer hover:bg-indigo-200 uppercase tracking-widest transition-all">
                        Choose File
                    </label>
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                        {formData.image ? (formData.image.name || "Image selected") : "no file selected"}
                    </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#4f46e5] text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : (editingItem ? 'Update Menu' : 'Add to Menu')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;