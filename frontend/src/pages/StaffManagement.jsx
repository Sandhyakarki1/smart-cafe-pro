import React, { useState, useEffect } from 'react';
import { Plus, Edit, UserCheck, UserMinus, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Waiter' });
  
  const API_URL = `${BASE_URL}/api/staff/`;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(user => ({
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.assigned_role || 'Waiter',
          isActive: user.is_active !== undefined ? user.is_active : true // Handle Django's is_active field
        }));
        setStaffList(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // Function to Toggle Active/Inactive status instead of deleting
  const handleToggleStatus = async (staff) => {
    const action = staff.isActive ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} ${staff.name}?`)) {
      try {
        const response = await fetch(`${API_URL}${staff.id}/`, {
          method: 'PATCH', // Use PATCH to update only the status field
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !staff.isActive })
        });

        if (response.ok) {
          // Update local state to reflect change
          setStaffList(staffList.map(s => 
            s.id === staff.id ? { ...s, isActive: !s.isActive } : s
          ));
        }
      } catch (error) {
        alert("Status update failed.");
      }
    }
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'Waiter' });
    setIsModalOpen(true);
  };

  const handleEditClick = (staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, email: staff.email, password: '', role: staff.role });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: formData.name,
      email: formData.email,
      role: formData.role
    };
    if (formData.password) payload.password = formData.password;

    const url = editingStaff ? `${API_URL}${editingStaff.id}/` : API_URL;
    const method = editingStaff ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchStaff(); 
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert("Error: " + JSON.stringify(errorData));
      }
    } catch (error) {
      alert("Connection to Django failed!");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 text-left">Staff Management</h1>
          <p className="text-gray-500 text-sm">Manage team members and their account status</p>
        </div>
        <button 
          onClick={handleAddClick} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-semibold"
        >
          <Plus size={20} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Gmail</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staffList.map((staff) => (
              <tr key={staff.id} className={`hover:bg-indigo-50/30 transition-colors ${!staff.isActive ? 'bg-gray-50 opacity-70' : ''}`}>
                <td className="px-8 py-5 font-semibold text-gray-700">
                  {staff.name}
                  {!staff.isActive && <span className="ml-2 text-[10px] text-red-400 font-normal italic">(Inactive)</span>}
                </td>
                <td className="px-8 py-5 text-gray-500">{staff.email}</td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                     staff.role === 'Waiter' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                   }`}>
                    {staff.role}
                   </span>
                </td>
                <td className="px-8 py-5">
                   {staff.isActive ? (
                     <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md w-fit">
                       <ShieldCheck size={14}/> Active
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-100 px-2 py-1 rounded-md w-fit">
                       <ShieldAlert size={14}/> Inactive
                     </span>
                   )}
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleEditClick(staff)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit details"
                    >
                      <Edit size={18}/>
                    </button>
                    
                    <button 
                      onClick={() => handleToggleStatus(staff)} 
                      className={`p-2 rounded-lg transition-colors ${staff.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={staff.isActive ? "Deactivate Account" : "Activate Account"}
                    >
                      {staff.isActive ? <UserMinus size={18}/> : <UserCheck size={18}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal remains largely the same, but we can add a note about status */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{editingStaff ? 'Edit Staff' : 'Create Staff'}</h2>
            <p className="text-gray-500 text-sm mb-6">Enter details for the team member</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                  <input 
                    required className="w-full border-2 p-3 rounded-xl outline-none focus:border-indigo-500 mt-1" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Gmail Address</label>
                  <input 
                    type="email" required className="w-full border-2 p-3 rounded-xl outline-none focus:border-indigo-500 mt-1" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                  <input 
                    type="password" required={!editingStaff} className="w-full border-2 p-3 rounded-xl outline-none focus:border-indigo-500 mt-1" 
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingStaff ? "Leave blank to keep same" : "••••••••"}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Staff Role</label>
                  <select 
                    className="w-full border-2 p-3 rounded-xl bg-white outline-none focus:border-indigo-500 mt-1" 
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Waiter">Waiter</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                  </select>
               </div>
                <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg mt-4">
                  {editingStaff ? 'Update Account' : 'Create Account'}
                </button>
            </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;