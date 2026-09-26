<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KAIZ SOOQ - Executive Dashboard</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React & React DOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Babel -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-[#0D1B2A] text-[#E2E8F0] font-sans antialiased pb-24 selection:bg-[#2ECC71] selection:text-black">

  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    function KaizSooqApp() {
      const [view, setView] = useState('dashboard');
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [brandFilter, setBrandFilter] = useState('All');
      const [orders, setOrders] = useState([]);
      const [employees, setEmployees] = useState(['Ani Mol', 'Umma']);
      const [editingOrderId, setEditingOrderId] = useState(null);
      const [expandedCustomerId, setExpandedCustomerId] = useState(null);
      const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

      // New Employee State
      const [newEmployeeName, setNewEmployeeName] = useState('');

      // Search & Filter State
      const [searchQuery, setSearchQuery] = useState('');
      const [statusFilter, setStatusFilter] = useState('All');

      // Auth State
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [loginUser, setLoginUser] = useState('');
      const [loginPass, setLoginPass] = useState('');
      const [showLoginModal, setShowLoginModal] = useState(false);

      // Report Dates
      const [fromDate, setFromDate] = useState('');
      const [toDate, setToDate] = useState('');

      const chartRef = useRef(null);
      const chartInstance = useRef(null);

      const initialFormState = {
        brand: 'Ledi',
        customerName: '',
        whatsapp: '',
        dressName: '', 
        deliveryDate: '', 
        sellingPrice: '', 
        advanceAmount: '', 
        materialRate: '', 
        stitchingCharge: '', 
        tailorName: 'Ani Mol', 
        shippingCharge: '',
        isAdvPaid: false,
        isFullyPaid: false
      };

      const [formData, setFormData] = useState(initialFormState);

      // Load initial data (Simulating Cloud Sync)
      useEffect(() => {
        const savedOrders = localStorage.getItem('kaiz_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedEmployees = localStorage.getItem('kaiz_employees');
        if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      }, []);

      // Chart Rendering
      useEffect(() => {
        if (view === 'analytics' && chartRef.current) {
          if (chartInstance.current) chartInstance.current.destroy();

          const ctx = chartRef.current.getContext('2d');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const profitData = new Array(12).fill(0);

          orders.forEach(o => {
            if (o.deliveryDate) {
              const d = new Date(o.deliveryDate);
              const m = d.getMonth();
              const sp = Number(o.sellingPrice || 0);
              const exp = Number(o.materialRate || 0) + Number(o.stitchingCharge || 0) + Number(o.shippingCharge || 0);
              profitData[m] += (sp - exp);
            }
          });

          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: months,
              datasets: [{
                label: 'Monthly Net Profit (₹)',
                data: profitData,
                backgroundColor: '#2ECC71',
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { labels: { color: '#E2E8F0' } } },
              scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } },
                y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } }
              }
            }
          });
        }
      }, [view, orders]);

      const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser === 'kaiz sooq' && loginPass === 'kaiz2024') {
          setIsLoggedIn(true);
          setShowLoginModal(false);
          alert('Owner Login Successful!');
        } else {
          alert('Invalid Username or Password!');
        }
      };

      const checkAuthAndAction = (action) => {
        if (!isLoggedIn) {
          setShowLoginModal(true);
        } else {
          action();
        }
      };

      const saveOrdersToStorage = (updatedOrders) => {
        setOrders(updatedOrders);
        localStorage.setItem('kaiz_orders', JSON.stringify(updatedOrders));
      };

      const saveEmployeesToStorage = (updatedEmployees) => {
        setEmployees(updatedEmployees);
        localStorage.setItem('kaiz_employees', JSON.stringify(updatedEmployees));
      };

      const handleAddEmployee = (e) => {
        e.preventDefault();
        if (!newEmployeeName.trim()) return;
        if (employees.includes(newEmployeeName.trim())) {
          alert('Employee already exists!');
          return;
        }
        const updated = [...employees, newEmployeeName.trim()];
        saveEmployeesToStorage(updated);
        setNewEmployeeName('');
        alert('New Employee Added Successfully!');
      };

      const handleWhatsappChange = (waNum) => {
        setFormData(prev => ({ ...prev, whatsapp: waNum }));
        const existingOrder = orders.find(o => o.whatsapp === waNum);
        if (existingOrder && !editingOrderId) {
          setFormData(prev => ({
            ...prev,
            customerName: existingOrder.customerName
          }));
        }
      };

      const handleSellingPriceChange = (val) => {
        const sp = Number(val) || 0;
        const autoAdv = sp > 0 ? (sp * 0.5) : '';
        setFormData(prev => ({
          ...prev,
          sellingPrice: val,
          advanceAmount: autoAdv
        }));
      };

      const handleOrderSubmit = (e) => {
        e.preventDefault();
        checkAuthAndAction(() => {
          if (editingOrderId) {
            const updated = orders.map(o => o.id === editingOrderId ? { ...formData, id: editingOrderId } : o);
            saveOrdersToStorage(updated);
            alert('Order Updated Successfully!');
            setEditingOrderId(null);
          } else {
            const newOrder = { ...formData, id: Date.now() };
            saveOrdersToStorage([newOrder, ...orders]);
            alert('Order Saved Successfully!');
          }
          setFormData(initialFormState);
          setView('savedOrders');
        });
      };

      const handleEditOrder = (order) => {
        checkAuthAndAction(() => {
          setFormData(order);
          setEditingOrderId(order.id);
          setSelectedOrderDetails(null);
          setView('addOrder');
        });
      };

      const handleDeleteOrder = (id) => {
        checkAuthAndAction(() => {
          if (confirm('Are you sure you want to delete this order?')) {
            const updated = orders.filter(o => o.id !== id);
            saveOrdersToStorage(updated);
            if (selectedOrderDetails && selectedOrderDetails.id === id) {
              setSelectedOrderDetails(null);
            }
          }
        });
      };

      const triggerWhatsApp = (type, order) => {
        const balance = order.isFullyPaid ? 0 : (Number(order.sellingPrice || 0) - Number(order.advanceAmount || 0));
        const brandHeader = order.brand;
        let msg = '';

        if (type === 'adv') {
          msg = `*${brandHeader} Order Confirmed!*\nHello ${order.customerName},\nYour order for *${order.dressName}* is confirmed.\n\n👗 *Dress Price:* ₹${order.sellingPrice || 0}\n💳 *Advance Paid:* ₹${order.advanceAmount || 0}\n💵 *Remaining Balance:* ₹${balance}\n📅 *Expected Delivery:* ${order.deliveryDate}`;
          const updated = orders.map(o => o.id === order.id ? { ...o, isAdvPaid: true } : o);
          saveOrdersToStorage(updated);

        } else if (type === 'remind') {
          msg = `*${brandHeader} Payment Reminder*\nHello ${order.customerName},\nThis is a reminder for your order: *${order.dressName}*\n\n👗 *Dress Price:* ₹${order.sellingPrice || 0}\n💳 *Advance Paid:* ₹${order.advanceAmount || 0}\n💵 *Pending Balance:* ₹${balance}\n\nPlease pay the remaining balance via GPay/PhonePe to:\n*Muhammedanas3010-1@oksbi*`;
        } else if (type === 'full') {
          msg = `*${brandHeader} Payment Confirmation*\nThank you ${order.customerName}.\nYour payment for *${order.dressName}* has been received in full.\n\n👗 *Dress Price:* ₹${order.sellingPrice || 0}\n✅ *Total Paid:* ₹${order.sellingPrice || 0}`;
          const updated = orders.map(o => o.id === order.id ? { ...o, isFullyPaid: true, advanceAmount: order.sellingPrice } : o);
          saveOrdersToStorage(updated);
        }

        msg += order.brand === 'Bebi' ? `\n\n*KAIZ SOOQ - be every baby’s ideal*` : `\n\n*KAIZ SOOQ*`;

        window.open(`https://wa.me/91${order.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
      };

      const sendDirectWhatsAppToClient = (waNumber, name) => {
        const msg = `Hello ${name},\nGreetings from *KAIZ SOOQ*! How can we help you today?`;
        window.open(`https://wa.me/91${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      };

      const downloadReport = () => {
        let reportData = [...orders];

        if (fromDate && toDate) {
          reportData = reportData.filter(o => o.deliveryDate >= fromDate && o.deliveryDate <= toDate);
        }

        if (reportData.length === 0) {
          alert('No orders found for the selected criteria!');
          return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Brand,Customer Name,WhatsApp,Dress Name,Selling Price,Advance,Balance,Fully Paid,Delivery Date,Tailor\n";

        reportData.forEach(o => {
          const bal = o.isFullyPaid ? 0 : (Number(o.sellingPrice || 0) - Number(o.advanceAmount || 0));
          csvContent += `"${o.brand}","${o.customerName}","${o.whatsapp}","${o.dressName}",${o.sellingPrice},${o.advanceAmount},${bal},"${o.isFullyPaid ? 'YES' : 'NO'}","${o.deliveryDate}","${o.tailorName}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `KAIZ_SOOQ_Report_${fromDate || 'All'}_to_${toDate || 'All'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const filteredOrdersByBrand = brandFilter === 'All' ? orders : orders.filter(o => o.brand === brandFilter);
      
      const searchedAndFilteredOrders = filteredOrdersByBrand.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              o.whatsapp.includes(searchQuery) ||
                              o.dressName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (statusFilter === 'Pending') return matchesSearch && !o.isFullyPaid;
        if (statusFilter === 'Completed') return matchesSearch && o.isFullyPaid;
        return matchesSearch;
      });

      const lediOrders = orders.filter(o => o.brand === 'Ledi');
      const bebiOrders = orders.filter(o => o.brand === 'Bebi');

      const lediFullPaid = lediOrders.filter(o => o.isFullyPaid).length;
      const bebiFullPaid = bebiOrders.filter(o => o.isFullyPaid).length;
      const totalFullPaid = orders.filter(o => o.isFullyPaid).length;
      const activeOrdersCount = orders.filter(o => !o.isFullyPaid).length;

      const calculateBrandFinancials = (brandOrders) => {
        let totalProfit = 0;
        let totalExpense = 0;
        brandOrders.forEach(o => {
          const sp = Number(o.sellingPrice || 0);
          const exp = Number(o.materialRate || 0) + Number(o.stitchingCharge || 0) + Number(o.shippingCharge || 0);
          totalExpense += exp;
          totalProfit += (sp - exp);
        });
        return { totalProfit, totalExpense };
      };

      const lediFinancials = calculateBrandFinancials(lediOrders);
      const bebiFinancials = calculateBrandFinancials(bebiOrders);

      const overallNetProfit = filteredOrdersByBrand.reduce((sum, o) => {
        const sp = Number(o.sellingPrice || 0);
        const cost = Number(o.materialRate || 0) + Number(o.stitchingCharge || 0) + Number(o.shippingCharge || 0);
        return sum + (sp - cost);
      }, 0);

      const uniqueCustomers = Array.from(new Set(orders.map(o => o.whatsapp))).map(wa => {
        return orders.find(o => o.whatsapp === wa);
      });

      const nextUpcoming = [...orders].filter(o => !o.isFullyPaid).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))[0];

      return (
        <div className="min-h-screen">

          <header className="bg-[#1B2A4A] text-[#E2E8F0] p-4 sticky top-0 z-50 flex justify-between items-center border-b border-gray-800 shadow-md">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="text-2xl text-[#2ECC71]">☰</button>
              <div>
                <h1 className="font-black text-lg tracking-wider text-white">KAIZ SOOQ</h1>
                <p className="text-[10px] text-gray-400">
                  {isLoggedIn ? '🔑 Cloud Sync Active' : '👁️ View Only Mode'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isLoggedIn ? (
                <button onClick={() => setShowLoginModal(true)} className="bg-[#2ECC71] text-black font-bold text-xs px-2.5 py-1 rounded-lg">
                  Owner Login
                </button>
              ) : (
                <button onClick={() => setIsLoggedIn(false)} className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-1 rounded-lg font-bold">
                  Logout
                </button>
              )}

              <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="bg-[#0D1B2A] text-[#2ECC71] border border-[#2ECC71] rounded-lg px-2 py-1 text-xs font-bold outline-none">
                <option value="All">All Brands</option>
                <option value="Ledi">Ledi Wear</option>
                <option value="Bebi">Bebi Wear</option>
              </select>
            </div>
          </header>

          {showLoginModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <form onSubmit={handleLogin} className="bg-[#1B2A4A] border border-gray-800 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">Owner Verification</h3>
                  <button type="button" onClick={() => setShowLoginModal(false)} className="text-gray-400 font-bold">✕</button>
                </div>
                <div className="space-y-2">
                  <input type="text" placeholder="Username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white outline-none focus:border-[#2ECC71]" />
                  <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white outline-none focus:border-[#2ECC71]" />
                </div>
                <button type="submit" className="w-full bg-[#2ECC71] text-black font-extrabold py-2.5 rounded-lg text-xs">
                  Authenticate Owner
                </button>
              </form>
            </div>
          )}

          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex backdrop-blur-sm">
              <div className="bg-[#1B2A4A] w-64 p-5 h-full flex flex-col justify-between shadow-2xl border-r border-gray-800">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-[#2ECC71]">Menu Navigation</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-xl font-bold text-gray-400">✕</button>
                  </div>
                  <nav className="flex flex-col gap-3 font-semibold text-gray-300">
                    <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">🏠 Dashboard</button>
                    <button onClick={() => { checkAuthAndAction(() => { setEditingOrderId(null); setFormData(initialFormState); setView('addOrder'); setIsSidebarOpen(false); }); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">➕ Create New Order</button>
                    <button onClick={() => { setView('savedOrders'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">📜 Saved Orders History</button>
                    <button onClick={() => { setView('employees'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">🧵 Manage Tailors / Employees</button>
                    <button onClick={() => { setView('customers'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">👤 Customer Directory</button>
                    <button onClick={() => { setView('analytics'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">📊 Business Graph & Analytics</button>
                    <button onClick={() => { setView('reports'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">📥 Reports & Downloads</button>
                  </nav>
                </div>
                <div className="text-[10px] text-gray-500">KAIZ SOOQ v4.0 - Cloud Enabled Executive Dashboard</div>
              </div>
              <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
            </div>
          )}

          <main className="p-4 max-w-md mx-auto space-y-5">

            {view === 'dashboard' && (
              <React.Fragment>
                <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0F172A] rounded-2xl p-5 border border-gray-800 shadow-xl relative overflow-hidden space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Net Calculated Profit</span>
                    <span className="text-xs bg-[#2ECC71]/10 text-[#2ECC71] px-2 py-0.5 rounded font-mono font-bold border border-[#2ECC71]/30">Cloud Syncing</span>
                  </div>
                  <div className="text-4xl font-extrabold text-[#2ECC71] tracking-tight">₹{overallNetProfit.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">Real-time revenue tracking across registered orders.</p>
                </div>

                <div className="bg-[#1B2A4A] p-3.5 rounded-xl border border-emerald-500/30 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wide">📦 Orders Summary</span>
                    <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                      Active: {activeOrdersCount}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0D1B2A] p-2 rounded-lg border border-gray-800">
                      <div className="text-[10px] text-blue-400 font-bold">LEDI PAID</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{lediFullPaid}</div>
                    </div>
                    <div className="bg-[#0D1B2A] p-2 rounded-lg border border-gray-800">
                      <div className="text-[10px] text-purple-400 font-bold">BEBI PAID</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{bebiFullPaid}</div>
                    </div>
                    <div className="bg-[#0D1B2A] p-2 rounded-lg border border-emerald-500/40">
                      <div className="text-[10px] text-[#2ECC71] font-bold">TOTAL PAID</div>
                      <div className="text-base font-extrabold text-[#2ECC71] mt-0.5">{totalFullPaid}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1B2A4A] p-3 rounded-xl border border-blue-500/30 space-y-1">
                    <div className="text-xs font-bold text-blue-400 uppercase">👗 LEDI WEAR</div>
                    <div className="text-xs text-gray-300">Profit: <span className="font-bold text-[#2ECC71]">₹{lediFinancials.totalProfit}</span></div>
                    <div className="text-xs text-gray-300">Expense: <span className="font-bold text-[#E74C3C]">₹{lediFinancials.totalExpense}</span></div>
                  </div>
                  <div className="bg-[#1B2A4A] p-3 rounded-xl border border-purple-500/30 space-y-1">
                    <div className="text-xs font-bold text-purple-400 uppercase">👶 BEBI WEAR</div>
                    <div className="text-xs text-gray-300">Profit: <span className="font-bold text-[#2ECC71]">₹{bebiFinancials.totalProfit}</span></div>
                    <div className="text-xs text-gray-300">Expense: <span className="font-bold text-[#E74C3C]">₹{bebiFinancials.totalExpense}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shortcuts</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => checkAuthAndAction(() => { setEditingOrderId(null); setFormData(initialFormState); setView('addOrder'); })} className="bg-[#1B2A4A] hover:border-[#2ECC71] p-3 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition group">
                      <span className="text-2xl group-hover:scale-110 transition">➕</span>
                      <span className="text-[10px] font-bold text-gray-300">Add Order</span>
                    </button>
                    <button onClick={() => setView('savedOrders')} className="bg-[#1B2A4A] hover:border-[#2ECC71] p-3 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition group">
                      <span className="text-2xl group-hover:scale-110 transition">📜</span>
                      <span className="text-[10px] font-bold text-gray-300">Orders</span>
                    </button>
                    <button onClick={() => setView('employees')} className="bg-[#1B2A4A] hover:border-[#2ECC71] p-3 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition group">
                      <span className="text-2xl group-hover:scale-110 transition">🧵</span>
                      <span className="text-[10px] font-bold text-gray-300">Tailors</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stitching Earnings per Employee</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {employees.map(emp => {
                      const totalStitching = orders.filter(o => o.tailorName === emp).reduce((sum, o) => sum + Number(o.stitchingCharge || 0), 0);
                      return (
                        <div key={emp} className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800">
                          <div className="text-[10px] text-gray-400 font-medium line-clamp-1">{emp}</div>
                          <div className="text-lg font-bold text-[#2ECC71] mt-1">₹{totalStitching.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">🗓 Next Pending Delivery</span>
                    <button onClick={() => setView('savedOrders')} className="text-xs text-[#2ECC71] hover:underline font-bold">View All →</button>
                  </div>
                  {nextUpcoming ? (
                    <div 
                      onClick={() => {
                        setExpandedCustomerId(nextUpcoming.whatsapp);
                        setView('customers');
                      }}
                      className="flex justify-between items-center cursor-pointer hover:bg-[#0D1B2A] p-2 rounded-xl border border-transparent hover:border-gray-700 transition"
                    >
                      <div>
                        <div className="text-lg font-black text-white">{nextUpcoming.customerName} ↗</div>
                        <div className="text-xs text-gray-400">{nextUpcoming.dressName} ({nextUpcoming.brand})</div>
                      </div>
                      <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-extrabold text-xs px-3 py-1.5 rounded-lg">
                        {nextUpcoming.deliveryDate}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 py-2">No pending deliveries found</div>
                  )}
                </div>
              </React.Fragment>
            )}

            {view === 'addOrder' && (
              <form onSubmit={handleOrderSubmit} className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">
                  {editingOrderId ? 'Edit Order Details' : 'Create New Order'}
                </h2>
                
                <div>
                  <label className="text-xs font-bold text-gray-400">Select Brand Target</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button type="button" onClick={() => setFormData({ ...formData, brand: 'Ledi' })} className={`py-2 text-xs font-bold rounded-lg border ${formData.brand === 'Ledi' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}>Ledi (Women)</button>
                    <button type="button" onClick={() => setFormData({ ...formData, brand: 'Bebi' })} className={`py-2 text-xs font-bold rounded-lg border ${formData.brand === 'Bebi' ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}>Bebi (Baby Wear)</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <input type="text" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={(e) => handleWhatsappChange(e.target.value)} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  <input type="text" placeholder="Customer Name" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                </div>

                <div className="space-y-2">
                  <input type="text" placeholder="Dress Name / Item Code" value={formData.dressName} onChange={(e) => setFormData({ ...formData, dressName: e.target.value })} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  <div>
                    <label className="text-[10px] font-bold text-[#E74C3C]">Expected Delivery Date *</label>
                    <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  </div>
                </div>

                <div className="bg-[#0D1B2A] p-3 rounded-xl border border-gray-800 space-y-2">
                  <h3 className="text-xs font-bold text-[#2ECC71]">Financial & Stitching Breakdown</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Selling Price (₹)</label>
                      <input type="number" placeholder="Selling Price (₹)" value={formData.sellingPrice} onChange={(e) => handleSellingPriceChange(e.target.value)} required className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white w-full" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Advance Amount</label>
                      <input type="number" placeholder="Advance (₹)" value={formData.advanceAmount} onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Stitching Charge (₹)</label>
                      <input type="number" placeholder="Stitching Charge (₹)" value={formData.stitchingCharge} onChange={(e) => setFormData({ ...formData, stitchingCharge: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white w-full" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Assign Tailor / Employee</label>
                      <select value={formData.tailorName} onChange={(e) => setFormData({ ...formData, tailorName: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white font-semibold w-full">
                        {employees.map(emp => (
                          <option key={emp} value={emp}>{emp}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Material Cost (₹)" value={formData.materialRate} onChange={(e) => setFormData({ ...formData, materialRate: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white" />
                    <input type="number" placeholder="Shipping Cost (₹)" value={formData.shippingCharge} onChange={(e) => setFormData({ ...formData, shippingCharge: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-black font-extrabold py-3 rounded-xl shadow-lg transition">
                  {editingOrderId ? 'Update Order Record' : 'Save Order Record'}
                </button>
              </form>
            )}

            {view === 'employees' && (
              <div className="space-y-4">
                <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-3">
                  <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">➕ Add New Employee / Tailor</h2>
                  <form onSubmit={handleAddEmployee} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Tailor / Employee Name" 
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      className="flex-1 p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white outline-none focus:border-[#2ECC71]"
                    />
                    <button type="submit" className="bg-[#2ECC71] text-black font-bold text-xs px-4 py-2.5 rounded-lg">
                      Add
                    </button>
                  </form>
                </div>

                <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-3">
                  <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">🧵 Registered Tailors List</h2>
                  <div className="space-y-2">
                    {employees.map((emp, idx) => (
                      <div key={idx} className="bg-[#0D1B2A] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-xs font-bold text-white">
                        <span>👤 {emp}</span>
                        <span className="text-[10px] text-gray-400">
                          {orders.filter(o => o.tailorName === emp).length} Active Orders
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'savedOrders' && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white">Saved Orders History</h2>

                <div className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800 space-y-2">
                  <input 
                    type="text" 
                    placeholder="🔍 Search Customer, WhatsApp, or Dress..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none"
                  />
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStatusFilter('All')} 
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${statusFilter === 'All' ? 'bg-[#2ECC71] text-black border-[#2ECC71]' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}
                    >
                      All ({orders.length})
                    </button>
                    <button 
                      onClick={() => setStatusFilter('Pending')} 
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${statusFilter === 'Pending' ? 'bg-amber-500 text-black border-amber-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}
                    >
                      Pending ({activeOrdersCount})
                    </button>
                    <button 
                      onClick={() => setStatusFilter('Completed')} 
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${statusFilter === 'Completed' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}
                    >
                      Paid ({totalFullPaid})
                    </button>
                  </div>
                </div>

                {searchedAndFilteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">No orders match your search criteria.</div>
                ) : (
                  searchedAndFilteredOrders.map(order => {
                    const balance = order.isFullyPaid ? 0 : (Number(order.sellingPrice || 0) - Number(order.advanceAmount || 0));
                    return (
                      <div key={order.id} className="bg-[#1B2A4A] p-4 rounded-xl border border-gray-800 space-y-3 shadow-md relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${order.brand === 'Ledi' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                              {order.brand}
                            </span>
                            <h3 className="font-bold text-base text-white mt-1">{order.customerName}</h3>
                            <p className="text-xs text-gray-400">{order.dressName} | Delivery: <span className="text-gray-200">{order.deliveryDate}</span></p>
                            <p className="text-[11px] text-gray-400">🧵 Tailor: <span className="text-[#2ECC71] font-bold">{order.tailorName || 'Ani Mol'}</span></p>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-[#2ECC71]">₹{order.sellingPrice}</div>
                            <div className={`text-[11px] font-bold ${balance > 0 ? 'text-[#E74C3C]' : 'text-[#2ECC71]'}`}>
                              {balance > 0 ? `Bal: ₹${balance}` : 'Bal: ₹0 (Paid)'}
                            </div>

                            <div className="flex gap-2 mt-2 justify-end">
                              {order.isFullyPaid ? (
                                <button 
                                  onClick={() => setSelectedOrderDetails(order)} 
                                  className="text-xs bg-emerald-500/20 text-[#2ECC71] px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold flex items-center gap-1 hover:bg-[#2ECC71] hover:text-black transition"
                                >
                                  👁️ Details
                                </button>
                              ) : (
                                <React.Fragment>
                                  <button onClick={() => handleEditOrder(order)} className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">✏️</button>
                                  <button onClick={() => handleDeleteOrder(order.id)} className="text-[11px] bg-[#E74C3C]/10 text-[#E74C3C] px-2 py-0.5 rounded border border-[#E74C3C]/30">🗑️</button>
                                </React.Fragment>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-sm">
                          {!order.isAdvPaid ? (
                            <button title="Advance Paid Notification" onClick={() => triggerWhatsApp('adv', order)} className="bg-[#0D1B2A] hover:border-[#2ECC71] text-[#2ECC71] border border-gray-800 py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs">
                              💬 Confirmation
                            </button>
                          ) : !order.isFullyPaid ? (
                            <button title="Mark Full Paid" onClick={() => triggerWhatsApp('full', order)} className="bg-amber-500/20 text-amber-400 border border-amber-500/30 py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs">
                              💰 Full Paid
                            </button>
                          ) : null}

                          {!order.isFullyPaid && (
                            <button title="Send Reminder" onClick={() => triggerWhatsApp('remind', order)} className="bg-[#0D1B2A] hover:border-amber-400 text-amber-400 border border-gray-800 py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs">
                              🔔 Reminder
                            </button>
                          )}

                          {order.isFullyPaid && (
                            <div className="col-span-2 bg-emerald-500/10 text-[#2ECC71] border border-emerald-500/30 py-1.5 px-2 rounded-lg font-extrabold flex items-center justify-center gap-1.5 text-xs">
                              ✅ Order Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {selectedOrderDetails && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1B2A4A] border border-gray-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-emerald-500/20 text-[#2ECC71] border border-emerald-500/40 px-2 py-0.5 rounded">
                            ✅ Paid Order
                          </span>
                          <h3 className="font-bold text-white text-base">{selectedOrderDetails.customerName}</h3>
                        </div>
                        <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 font-bold text-lg">✕</button>
                      </div>

                      <div className="space-y-2 text-xs text-gray-300 bg-[#0D1B2A] p-3 rounded-xl border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dress / Item:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.dressName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Brand:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">WhatsApp:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.whatsapp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Delivery Date:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.deliveryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tailor:</span>
                          <span className="font-bold text-[#2ECC71]">{selectedOrderDetails.tailorName || 'Ani Mol'}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
                          <span className="text-gray-400">Total Price:</span>
                          <span className="font-extrabold text-[#2ECC71]">₹{selectedOrderDetails.sellingPrice}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => handleEditOrder(selectedOrderDetails)} 
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          ✏️ Edit Order Details
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(selectedOrderDetails.id)} 
                          className="bg-red-500/20 text-red-400 border border-red-500/30 p-2.5 rounded-xl text-xs font-bold"
                          title="Delete Order"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'customers' && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white">Customer Directory (CRM)</h2>
                {uniqueCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">No client profile recorded.</div>
                ) : (
                  uniqueCustomers.map(customer => {
                    const isExpanded = expandedCustomerId === customer.whatsapp;
                    const customerOrders = orders.filter(o => o.whatsapp === customer.whatsapp);

                    return (
                      <div key={customer.whatsapp} className="bg-[#1B2A4A] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="p-3 hover:bg-[#0D1B2A] flex justify-between items-center transition">
                          <div onClick={() => setExpandedCustomerId(isExpanded ? null : customer.whatsapp)} className="cursor-pointer flex-1">
                            <div className="font-bold text-sm text-white">{customer.customerName}</div>
                            <div className="text-xs text-gray-400">💬 {customer.whatsapp}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => sendDirectWhatsAppToClient(customer.whatsapp, customer.customerName)}
                              className="bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/40 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#2ECC71] hover:text-black transition"
                            >
                              💬 Chat
                            </button>
                            <button onClick={() => setExpandedCustomerId(isExpanded ? null : customer.whatsapp)} className="text-xs font-bold text-gray-400 p-1">
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 bg-[#0D1B2A] space-y-3 text-xs border-t border-gray-800">
                            <div className="space-y-2">
                              <div className="font-bold text-gray-400">Order History Log:</div>
                              {customerOrders.map(ord => (
                                <div key={ord.id} className="bg-[#1B2A4A] p-2 rounded border border-gray-800 space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-white">{ord.dressName} ({ord.brand})</span>
                                    <span className="text-[#2ECC71]">₹{ord.sellingPrice}</span>
                                  </div>
                                  <div className="text-gray-400 text-[10px]">Delivery: {ord.deliveryDate} | Tailor: {ord.tailorName || 'Ani Mol'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {view === 'analytics' && (
              <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">📊 Business Performance Graph</h2>
                <p className="text-xs text-gray-400">Monthly profit analytics based on delivery dates.</p>
                <div className="bg-[#0D1B2A] p-3 rounded-xl border border-gray-800">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            )}

            {view === 'reports' && (
              <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">📥 Download Business Reports</h2>
                <p className="text-xs text-gray-400">Export order records to Excel/CSV. Filter by delivery dates if needed.</p>

                <div className="space-y-3 bg-[#0D1B2A] p-3 rounded-xl border border-gray-800">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400">From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400">To Date</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white mt-1" />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setFromDate(''); setToDate(''); }} className="w-1/3 bg-gray-800 text-gray-300 text-xs py-2 rounded-lg font-bold">Clear Dates</button>
                    <button onClick={downloadReport} className="w-2/3 bg-[#2ECC71] text-black font-extrabold text-xs py-2 rounded-lg">Download CSV Report</button>
                  </div>
                </div>
              </div>
            )}

          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-[#1B2A4A] border-t border-gray-800 py-3 px-6 flex justify-around items-center z-40 shadow-2xl">
            <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">🏠</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => setView('savedOrders')} className={`flex flex-col items-center gap-1 ${view === 'savedOrders' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">📜</span>
              <span className="text-[10px] font-bold">Orders</span>
            </button>
            <button onClick={() => setView('employees')} className={`flex flex-col items-center gap-1 ${view === 'employees' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">🧵</span>
              <span className="text-[10px] font-bold">Tailors</span>
            </button>
            <button onClick={() => setView('customers')} className={`flex flex-col items-center gap-1 ${view === 'customers' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">👥</span>
              <span className="text-[10px] font-bold">Clients</span>
            </button>
          </nav>

        </div>
      );
    }

    ReactDOM.render(<KaizSooqApp />, document.getElementById('root'));
  </script>
</body>
</html>
