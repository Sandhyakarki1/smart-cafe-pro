import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Grid3x3, CheckCircle, Circle } from 'lucide-react';
import { BASE_URL } from '../config';

const TableSettings = () => {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = `${BASE_URL}/api/tables/`;

  const fetchTables = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    setError('');
    if (!newTableNumber) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: newTableNumber })
      });
      const data = await res.json();

      if (res.ok) {
        setNewTableNumber('');
        fetchTables();
      } else {
        setError(data.error || 'Could not add table.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  const handleDeleteTable = async (id, number) => {
    if (!window.confirm(`Remove Table ${number}? This cannot be undone.`)) return;
    try {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchTables();
    } catch (err) {
      alert('Failed to delete table.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Grid3x3 className="text-indigo-600" size={28} />
          Table Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Add or remove tables for your cafe. Each table gets its own QR code for customer ordering.
        </p>
      </div>

      {/* ADD TABLE FORM */}
      <form onSubmit={handleAddTable} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-end gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Table Number
          </label>
          <input
            type="number"
            min="1"
            required
            placeholder="e.g. 6"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md font-semibold"
        >
          <Plus size={20} /> Add Table
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* TABLE GRID */}
      {loading ? (
        <div className="text-center py-20 text-gray-300 font-bold italic">Loading tables...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black">
                {table.number}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Table {table.number}
              </p>
              <div className="flex items-center gap-1.5">
                {table.is_occupied ? (
                  <>
                    <Circle size={10} className="fill-orange-500 text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500 uppercase">Occupied</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={10} className="fill-emerald-500 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Free</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleDeleteTable(table.id, table.number)}
                className="mt-2 text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Remove table"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {tables.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-2xl text-gray-300 font-bold italic">
              No tables yet. Add your first table above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableSettings;
