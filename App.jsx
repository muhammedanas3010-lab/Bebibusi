import React, { useState, useEffect } from 'react';
import { 
  Home, ShoppingBag, Users, UserCheck, DollarSign, Camera, 
  Plus, Trash2, Edit, AlertTriangle, Share2, Search, 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Send, Wallet, CreditCard, BarChart2 
} from 'lucide-react';

export default function KaizSooqApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States (Loaded from LocalStorage)
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('kaiz_orders')) || []);
  const [customers, setCustomers] = useState(() => JSON.parse(localStorage.getItem('kaiz_customers')) || []);
  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem('kaiz_employees')) || [
    { id: 1, name: 'Umma', role: 'Master Tailor' },
    { id: 2, name: 'Anu', role: 'Tailor' },
    { id: 3, name: 'Nusrath', role: 'Tailor' },
    { id: 4, name: 'Meema (v)', role: 'Tailor' }
  ]);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('kaiz_expenses')) || []);

  // Form States & Modals
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Order Form State
  const [orderForm, setOrderForm] = useState({
    customerName: '', phone: '', category: 'Lady', style: 'Frock',
    price: '', advance: '', materialCost: '', shipping: '50',
    tailor: 'Umma', dueDate: '', measurements: '', photo: '', status: 'Pending'
  });

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', measurements: '' });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('kaiz_orders', JSON.stringify(orders));
    localStorage.setItem('kaiz_customers', JSON.stringify(customers));
    localStorage.setItem('kaiz_employees', JSON.stringify(employees));
    localStorage.setItem('kaiz_expenses', JSON.stringify(expenses));
  }, [orders, customers, employees, expenses]);

  // --- FINANCIAL CALCULATIONS ---
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.price || 0), 0);
  const totalMaterialCost = orders.reduce((acc, o) => acc + Number(o.materialCost || 0), 0);
  const totalShipping = orders.reduce((acc, o) => acc + Number(o.shipping || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // Owner Cut Calculation (₹300 Rule per order)
  const totalOwnerCut = orders.reduce((acc, o) => {
    const profit = Number(o.price || 0) - (Number(o.materialCost || 0) + Number(o.shipping || 0));
    if (profit >= 300) return acc + 300;
    if (profit > 0) return acc + profit;
    return acc;
  }, 0);

  const netBusinessProfit = (totalRevenue - (totalMaterialCost + totalShipping + totalExpenses)) - totalOwnerCut;

  // --- HANDLERS ---
  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setOrders(orders.map(o => o.id === editingId ? { ...orderForm, id: editingId } : o));
      setEditingId(null);
    } else {
      const newOrder = { ...orderForm, id: Date.now() };
      setOrders([newOrder, ...orders]);
      if (!customers.some(c => c.phone === orderForm.phone)) {
        setCustomers([...customers, { id: Date.now(), name: orderForm.customerName, phone: orderForm.phone, measurements: orderForm.measurements }]);
      }
    }
    setOrderForm({
      customerName: '', phone: '', category: 'Lady', style: 'Frock',
      price: '', advance: '', materialCost: '', shipping: '50',
      tailor: 'Umma', dueDate: '', measurements: '', photo: '', status: 'Pending'
    });
  };

  const deleteOrder = (id) => setOrders(orders.filter(o => o.id !== id));
  const editOrder = (order) => { setOrderForm(order); setEditingId(order.id); setActiveTab('orders'); };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrderForm({ ...orderForm, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const shareToWhatsApp = (order) => {
    const text = `*KAIZ SOOQ Invoice*%0A*Customer:* ${order.customerName}%0A*Style:* ${order.style} (${order.category})%0A*Total Price:* ₹${order.price}%0A*Advance Paid:* ₹${order.advance}%0A*Balance Due:* ₹${order.price - order.advance}%0A*Due Date:* ${order.dueDate}%0A%0AThank you for shopping with Kaiz Sooq!`;
    window.open(`https://wa.me/91${order.phone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#072511] text-gray-100 font-sans pb-24">
      
      {/* Top Header matching reference image */}
      <header className="p-5 bg-[#072511] flex justify-between items-center border-b border-emerald-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white border border-emerald-500">
            KS
          </div>
          <div>
            <p className="text-xs text-emerald-300">Welcome Back,</p>
            <h1 className="text-lg font-bold tracking-wide text-white">Kaiz Sooq</h1>
          </div>
        </div>
        <div className="bg-emerald-950/80 p-2 rounded-full border border-emerald-800 text-emerald-400">
          <Wallet className="w-5 h-5" />
        </div>
      </header>

      {/* Wallet Balance Card matching image style */}
      <div className="mx-4 mt-4 p-6 rounded-2xl bg-gradient-to-b from-[#0b3c1b] to-[#072511] border border-emerald-800/60 shadow-xl">
        <p className="text-xs text-emerald-300 font-medium">Total Net Profit & Balance</p>
        <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">₹{netBusinessProfit.toLocaleString()}</h2>
        
        <div className="flex gap-3 mt-5">
          <button onClick={() => setActiveTab('orders')} className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition">
            <ArrowDownLeft className="w-4 h-4" /> Add Order
          </button>
          <button onClick={() => setActiveTab('finance')} className="flex-1 py-2.5 px-4 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 border border-emerald-700/50 transition">
            <ArrowUpRight className="w-4 h-4" /> Expenses
          </button>
        </div>
      </div>

      {/* Quick Action Bar matching image grid */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-[#0b3c1b]/60 backdrop-blur border border-emerald-800/40 grid grid-cols-4 gap-2 text-center">
        <button onClick={() => setActiveTab('orders')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-900/40 transition">
          <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1"><ShoppingBag className="w-5 h-5"/></div>
          <span className="text-xs text-emerald-200 font-medium">Orders</span>
        </button>
        <button onClick={() => setActiveTab('customers')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-900/40 transition">
          <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1"><Users className="w-5 h-5"/></div>
          <span className="text-xs text-emerald-200 font-medium">Customers</span>
        </button>
        <button onClick={() => setActiveTab('employees')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-900/40 transition">
          <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1"><UserCheck className="w-5 h-5"/></div>
          <span className="text-xs text-emerald-200 font-medium">Tailors</span>
        </button>
        <button onClick={() => setActiveTab('finance')} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-900/40 transition">
          <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1"><DollarSign className="w-5 h-5"/></div>
          <span className="text-xs text-emerald-200 font-medium">Finance</span>
        </button>
      </div>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto p-4 mt-2 space-y-6">
        
        {/* --- 1. DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Total Orders</p>
                <h3 className="text-2xl font-bold text-white mt-1">{orders.length}</h3>
              </div>
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Total Revenue</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">₹{totalRevenue}</h3>
              </div>
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Owner Cut Share</p>
                <h3 className="text-2xl font-bold text-emerald-300 mt-1">₹{totalOwnerCut}</h3>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-[#0b3c1b]/40 p-5 rounded-2xl border border-emerald-800/40">
              <h3 className="text-base font-bold text-white mb-3 flex items-center justify-between">
                <span>Recent Orders & Status</span>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-400 hover:underline">View All</button>
              </h3>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-sm text-emerald-400/60 text-center py-4">No orders added yet.</p>
                ) : (
                  orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-[#072511] border border-emerald-900/60">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-300 font-bold text-xs">
                          {o.category[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{o.customerName}</p>
                          <p className="text-xs text-emerald-400">{o.style} • {o.tailor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-300">₹{o.price}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">{o.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-[#0b3c1b]/50 p-5 rounded-2xl border border-emerald-800/50">
              <h3 className="text-base font-bold text-white mb-4">{editingId ? 'Edit Order' : 'Add New Order'}</h3>
              <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Customer Name</label>
                  <input type="text" required value={orderForm.customerName} onChange={e => setOrderForm({...orderForm, customerName: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Phone Number</label>
                  <input type="text" required value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Phone" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Sub-Platform</label>
                  <select value={orderForm.category} onChange={e => setOrderForm({...orderForm, category: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500">
                    <option value="Lady">Lady (Blue Theme)</option>
                    <option value="Baby">Baby (Lavender Theme)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Style / Product</label>
                  <input type="text" required value={orderForm.style} onChange={e => setOrderForm({...orderForm, style: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Frock / Anarkali / Lehanga" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Total Price (₹)</label>
                  <input type="number" required value={orderForm.price} onChange={e => setOrderForm({...orderForm, price: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Total Price" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Advance Paid (₹)</label>
                  <input type="number" value={orderForm.advance} onChange={e => setOrderForm({...orderForm, advance: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Advance Paid" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Material Cost (₹)</label>
                  <input type="number" value={orderForm.materialCost} onChange={e => setOrderForm({...orderForm, materialCost: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Material Cost" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Shipping Charge (₹)</label>
                  <input type="number" value={orderForm.shipping} onChange={e => setOrderForm({...orderForm, shipping: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Shipping" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Assigned Tailor</label>
                  <select value={orderForm.tailor} onChange={e => setOrderForm({...orderForm, tailor: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500">
                    {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Due Date</label>
                  <input type="date" value={orderForm.dueDate} onChange={e => setOrderForm({...orderForm, dueDate: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Status</label>
                  <select value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})} className="w-full p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white focus:outline-none focus:border-emerald-500">
                    <option value="Pending">Pending</option>
                    <option value="Stitching">Stitching in Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-emerald-300 mb-1">Work Photo (Any MB)</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-xs text-emerald-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-700" />
                </div>

                <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setOrderForm({customerName: '', phone: '', category: 'Lady', style: 'Frock', price: '', advance: '', materialCost: '', shipping: '50', tailor: 'Umma', dueDate: '', measurements: '', photo: '', status: 'Pending'}); }} className="px-4 py-2 bg-emerald-950 text-emerald-300 rounded-xl text-sm font-semibold border border-emerald-800">Cancel</button>}
                  <button type="submit" className="px-6 py-2 bg-emerald-500 text-gray-950 rounded-xl text-sm font-semibold shadow hover:bg-emerald-400 transition">{editingId ? 'Update Order' : 'Save Order'}</button>
                </div>
              </form>
            </div>

            {/* Orders Table */}
            <div className="bg-[#0b3c1b]/50 p-5 rounded-2xl border border-emerald-800/50">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h3 className="text-base font-bold text-white">All Orders List</h3>
                <input type="text" placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white w-full sm:w-64" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#072511] text-emerald-300 text-xs">
                    <tr>
                      <th className="p-3">Photo</th>
                      <th className="p-3">Customer & Phone</th>
                      <th className="p-3">Style & Category</th>
                      <th className="p-3">Price / Adv / Mat</th>
                      <th className="p-3">Adv Surplus</th>
                      <th className="p-3">Tailor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/40">
                    {orders.filter(o => o.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map(o => {
                      const adv = Number(o.advance || 0);
                      const mat = Number(o.materialCost || 0);
                      const advSurplus = adv - mat;
                      return (
                        <tr key={o.id} className="hover:bg-emerald-900/20">
                          <td className="p-3">
                            {o.photo ? <img src={o.photo} alt="Work" className="w-10 h-10 object-cover rounded-lg border border-emerald-700" /> : <Camera className="w-8 h-8 text-emerald-700" />}
                          </td>
                          <td className="p-3 font-medium text-white">
                            {o.customerName}
                            <div className="text-xs text-emerald-400">{o.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">{o.category}</span>
                            <div className="text-xs text-gray-300 mt-0.5">{o.style}</div>
                          </td>
                          <td className="p-3 text-xs">
                            <div>Price: ₹{o.price}</div>
                            <div className="text-emerald-400">Adv: ₹{o.advance}</div>
                            <div className="text-rose-400">Mat: ₹{o.materialCost}</div>
                          </td>
                          <td className="p-3 text-xs">
                            {advSurplus > 0 ? <span className="text-emerald-400 font-semibold">+₹{advSurplus}</span> : <span className="text-gray-400">₹{advSurplus}</span>}
                          </td>
                          <td className="p-3 text-xs text-emerald-200">{o.tailor}</td>
                          <td className="p-3"><span className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded text-xs border border-emerald-800">{o.status}</span></td>
                          <td className="p-3 flex items-center space-x-2">
                            <button onClick={() => shareToWhatsApp(o)} title="WhatsApp" className="p-1.5 bg-emerald-900/60 text-emerald-300 rounded-lg hover:bg-emerald-800"><Share2 className="w-4 h-4" /></button>
                            <button onClick={() => editOrder(o)} title="Edit" className="p-1.5 bg-blue-950 text-blue-300 rounded-lg hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteOrder(o.id)} title="Delete" className="p-1.5 bg-rose-950 text-rose-300 rounded-lg hover:bg-rose-900"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. CUSTOMERS TAB --- */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-[#0b3c1b]/50 p-5 rounded-2xl border border-emerald-800/50">
              <h3 className="text-base font-bold text-white mb-4">Customer Measurement Book</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <input type="text" placeholder="Customer Name" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <input type="text" placeholder="Phone Number" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <input type="text" placeholder="Measurements (Chest, Waist, Hip, Length)" value={customerForm.measurements} onChange={e => setCustomerForm({...customerForm, measurements: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <button onClick={() => { if(customerForm.name) { setCustomers([...customers, {...customerForm, id: Date.now()}]); setCustomerForm({name:'', phone:'', measurements:''}); } }} className="sm:col-span-3 px-4 py-2.5 bg-emerald-500 text-gray-950 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition">Save Customer Measurement</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customers.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-[#072511] border border-emerald-900/60 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <p className="text-xs text-emerald-400 mb-2">{c.phone}</p>
                      <p className="text-xs text-emerald-200 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">Measurements: {c.measurements || 'Not added'}</p>
                    </div>
                    <button onClick={() => setCustomers(customers.filter(item => item.id !== c.id))} className="mt-4 text-rose-400 text-xs flex items-center gap-1 hover:underline self-end"><Trash2 className="w-3 h-3"/> Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 4. EMPLOYEES TAB --- */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-[#0b3c1b]/50 p-5 rounded-2xl border border-emerald-800/50">
              <h3 className="text-base font-bold text-white mb-4">Tailor Performance Tracker</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {employees.map(emp => {
                  const empOrders = orders.filter(o => o.tailor === emp.name);
                  const completedCount = empOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;
                  const pendingCount = empOrders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered').length;
                  return (
                    <div key={emp.id} className="p-4 rounded-xl bg-[#072511] border border-emerald-900/60 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base">{emp.name}</h4>
                        <p className="text-xs text-emerald-400 mb-3">{emp.role}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">
                            <span className="text-emerald-300">Completed:</span>
                            <span className="font-bold text-white">{completedCount}</span>
                          </div>
                          <div className="flex justify-between bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
                            <span className="text-amber-300">Pending:</span>
                            <span className="font-bold text-white">{pendingCount}</span>
                          </div>
                          <div className="flex justify-between bg-emerald-950/40 p-2 rounded-lg border border-emerald-900">
                            <span className="text-emerald-300">Total Assigned:</span>
                            <span className="font-bold text-white">{empOrders.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- 5. FINANCE TAB --- */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Total Revenue</p>
                <h4 className="text-xl font-bold text-emerald-400 mt-1">₹{totalRevenue}</h4>
              </div>
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Total Expenses</p>
                <h4 className="text-xl font-bold text-rose-400 mt-1">₹{totalMaterialCost + totalShipping + totalExpenses}</h4>
              </div>
              <div className="bg-[#0b3c1b]/50 p-4 rounded-xl border border-emerald-800/50">
                <p className="text-xs text-emerald-300">Net Business Profit</p>
                <h4 className="text-xl font-bold text-white mt-1">₹{netBusinessProfit}</h4>
              </div>
            </div>

            {/* Daily Expense Tracker */}
            <div className="bg-[#0b3c1b]/50 p-5 rounded-2xl border border-emerald-800/50">
              <h3 className="text-base font-bold text-white mb-4">Daily Business Expenses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <input type="text" placeholder="Expense Title (e.g. Thread, Rent)" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <input type="number" placeholder="Amount (₹)" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="p-2.5 rounded-xl bg-[#072511] border border-emerald-800 text-sm text-white" />
                <button onClick={() => { if(expenseForm.title && expenseForm.amount) { setExpenses([...expenses, {...expenseForm, id: Date.now()}]); setExpenseForm({title:'', amount:'', date: new Date().toISOString().split('T')[0]}); } }} className="sm:col-span-3 px-4 py-2.5 bg-emerald-500 text-gray-950 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition">Add Expense</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#072511] text-emerald-300 text-xs">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/40">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-emerald-900/20">
                        <td className="p-3 text-white">{e.title}</td>
                        <td className="p-3 text-emerald-400 text-xs">{e.date}</td>
                        <td className="p-3 text-rose-400 font-semibold">₹{e.amount}</td>
                        <td className="p-3"><button onClick={() => setExpenses(expenses.filter(item => item.id !== e.id))} className="text-rose-400 hover:underline"><Trash2 className="w-4 h-4"/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar matching reference image */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#072511]/95 backdrop-blur border-t border-emerald-900/60 px-4 py-3 flex justify-around items-center z-50">
        {[
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'employees', label: 'Tailors', icon: UserCheck },
          { id: 'finance', label: 'Finance', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-emerald-700 hover:text-emerald-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-900/80 border border-emerald-700/50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}






   


