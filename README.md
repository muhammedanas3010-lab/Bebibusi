<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KAIZ SOOQ - Executive Dashboard</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React & React DOM -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  
  <!-- Babel -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
</head>
<body class="bg-[#0D1B2A] text-[#E2E8F0] font-sans antialiased pb-24 selection:bg-[#2ECC71] selection:text-black">

  <div id="root"></div>

  <!-- Firebase Modular SDKs -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { 
      getFirestore, 
      collection, 
      onSnapshot, 
      doc, 
      setDoc, 
      deleteDoc 
    } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // FIREBASE CONFIGURATION
    const firebaseConfig = {
      apiKey: "AIzaSyB6dfOGbFdZTPyTrXpg_oA79CDyLZcW250",
      authDomain: "kaiz-sooq.firebaseapp.com",
      projectId: "kaiz-sooq",
      storageBucket: "kaiz-sooq.firebasestorage.app",
      messagingSenderId: "351947002124",
      appId: "1:351947002124:web:766e557c2b25a241d2f929"
    };

    // Initialize Firebase & Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Make db and Firestore functions available globally for React
    window.db = db;
    window.firestoreModule = { collection, onSnapshot, doc, setDoc, deleteDoc };
  </script>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function KaizSooqApp() {
      const [view, setView] = useState('dashboard');
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [brandFilter, setBrandFilter] = useState('All');
      const [orders, setOrders] = useState([]);
      const [editingOrderId, setEditingOrderId] = useState(null);
      const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

      // HARDCODED TAILOR NUMBERS
      const TAILOR_NUMBERS = {
        'Umma': '918943887325',
        'Ani Mol': '919995549582',
        'Nusrath': '917510702526'
      };

      const initialFormState = {
        brand: 'Ledi',
        customerName: '',
        whatsapp: '',
        address: '',
        dressName: '', 
        itemModel: '',
        imageUrl: '',
        itemDescription: '',
        deliveryDate: '',
        sellingPrice: '', advanceAmount: '', materialRate: '', stitchingCharge: '', tailorName: 'Ani Mol', shippingCharge: '',
        isAdvPaid: false,
        isFullyPaid: false,
        isTailorNotified: false
      };

      const [formData, setFormData] = useState(initialFormState);

      // Realtime Firebase Firestore Sync
      useEffect(() => {
        const checkAndSubscribe = () => {
          if (window.db && window.firestoreModule) {
            const { collection, onSnapshot } = window.firestoreModule;
            const ordersRef = collection(window.db, 'orders');

            const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
              const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              // Sort by ID / Created date descending
              fetchedOrders.sort((a, b) => Number(b.id) - Number(a.id));
              setOrders(fetchedOrders);
            }, (error) => {
              console.error("Firestore Listen Error:", error);
            });

            return unsubscribe;
          } else {
            setTimeout(checkAndSubscribe, 200);
          }
        };

        const unsubscribe = checkAndSubscribe();
        return () => { if (unsubscribe) unsubscribe(); };
      }, []);

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

      // Save or Update Order in Firestore
      const saveOrderToFirestore = async (orderData) => {
        try {
          const { doc, setDoc } = window.firestoreModule;
          const orderId = String(orderData.id);
          await setDoc(doc(window.db, 'orders', orderId), orderData);
        } catch (error) {
          console.error("Error saving to Firestore: ", error);
          alert("Error saving order: " + error.message);
        }
      };

      // Delete Order from Firestore
      const deleteOrderFromFirestore = async (id) => {
        try {
          const { doc, deleteDoc } = window.firestoreModule;
          await deleteDoc(doc(window.db, 'orders', String(id)));
        } catch (error) {
          console.error("Error deleting from Firestore: ", error);
          alert("Error deleting order: " + error.message);
        }
      };

      const handleWhatsappChange = (waNum) => {
        setFormData(prev => ({ ...prev, whatsapp: waNum }));
        const existingOrder = orders.find(o => o.whatsapp === waNum);
        if (existingOrder && !editingOrderId) {
          setFormData(prev => ({
            ...prev,
            customerName: existingOrder.customerName,
            address: existingOrder.address
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

      const handleOrderSubmit = async (e) => {
        e.preventDefault();
        checkAuthAndAction(async () => {
          if (editingOrderId) {
            const updatedOrder = { ...formData, id: editingOrderId };
            await saveOrderToFirestore(updatedOrder);
            alert('Order Updated Successfully!');
            setEditingOrderId(null);
          } else {
            const newOrder = { ...formData, id: Date.now() };
            await saveOrderToFirestore(newOrder);
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
        checkAuthAndAction(async () => {
          if (confirm('Are you sure you want to delete this order?')) {
            await deleteOrderFromFirestore(id);
            if (selectedOrderDetails && selectedOrderDetails.id === id) {
              setSelectedOrderDetails(null);
            }
          }
        });
      };

      // AUTOMATED CUSTOMER WHATSAPP TRIGGER FUNCTIONS
      const triggerWhatsApp = async (type, order) => {
        const rawTargetPhone = order.whatsapp || '';
        
        if (!rawTargetPhone) {
          alert('WhatsApp number not found for this order!');
          return;
        }

        let cleanPhone = rawTargetPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
          cleanPhone = '91' + cleanPhone;
        }

        const balance = order.isFullyPaid ? 0 : (Number(order.sellingPrice || 0) - Number(order.advanceAmount || 0));
        const brandHeader = order.brand === 'Bebi' ? 'BEBI WEAR' : 'LEDI WEAR';
        let msg = '';

        if (type === 'adv') {
          msg = `*${brandHeader} - Order Confirmed! 🎉*\n\nHello *${order.customerName}*,\nYour order for *${order.dressName}* ${order.itemModel ? `(Model: ${order.itemModel})` : ''} has been confirmed.\n\n👗 *Dress Price:* ₹${order.sellingPrice || 0}\n💳 *Advance Paid:* ₹${order.advanceAmount || 0}\n💵 *Remaining Balance:* ₹${balance}\n📅 *Expected Delivery:* ${order.deliveryDate}`;
          
          await saveOrderToFirestore({ ...order, isAdvPaid: true });

        } else if (type === 'remind') {
          msg = `*${brandHeader} - Payment Reminder 🔔*\n\nHello *${order.customerName}*,\nThis is a friendly reminder regarding your order for *${order.dressName}*.\n\n👗 *Total Price:* ₹${order.sellingPrice || 0}\n💳 *Advance Paid:* ₹${order.advanceAmount || 0}\n💵 *Pending Balance:* ₹${balance}\n\nPlease pay the remaining balance via GPay/PhonePe to:\n👉 *Muhammedanas3010-1@oksbi*`;
        
        } else if (type === 'full') {
          msg = `*${brandHeader} - Payment Received! ✅*\n\nHello *${order.customerName}*,\nThank you! We have received full payment for your dress *${order.dressName}*.\n\n👗 *Total Amount:* ₹${order.sellingPrice || 0}\n✅ *Status:* Fully Paid\n🚚 *Transit Update:* Your dress is currently in transit and will reach you shortly!\n\nThank you for shopping with us!`;
          
          await saveOrderToFirestore({ ...order, isFullyPaid: true, advanceAmount: order.sellingPrice });
        }

        msg += order.brand === 'Bebi' ? `\n\n*KAIZ SOOQ - Be Every Baby’s Ideal*` : `\n\n*KAIZ SOOQ*`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      };

      // TAILOR WHATSAPP MESSAGE FUNCTION
      const triggerTailorWhatsApp = async (order) => {
        const tailorName = order.tailorName || 'Ani Mol';
        const stitchingCharge = order.stitchingCharge || 0;
        const customerName = order.customerName || 'Customer';
        
        const targetNumber = TAILOR_NUMBERS[tailorName] || TAILOR_NUMBERS['Ani Mol'];
        
        const msg = `Hello ${tailorName},\n\nThank you so much for your excellent work on *${order.dressName}* (Customer: *${customerName}*)! The stitching was outstanding and awesome.\n\nYour stitching charge of *₹${stitchingCharge}* has been credited to your account.\n\nBest regards,\n*KAIZ SOOQ*`;

        await saveOrderToFirestore({ ...order, isTailorNotified: true });
        setSelectedOrderDetails(prev => prev ? { ...prev, isTailorNotified: true } : null);

        window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(msg)}`, '_blank');
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
        csvContent += "Brand,Customer Name,WhatsApp,Dress Name,Model,Selling Price,Advance,Balance,Fully Paid,Delivery Date,Tailor\n";

        reportData.forEach(o => {
          const bal = o.isFullyPaid ? 0 : (Number(o.sellingPrice || 0) - Number(o.advanceAmount || 0));
          csvContent += `"${o.brand}","${o.customerName}","${o.whatsapp}","${o.dressName}","${o.itemModel || ''}",${o.sellingPrice},${o.advanceAmount},${bal},"${o.isFullyPaid ? 'YES' : 'NO'}","${o.deliveryDate}","${o.tailorName}"\n`;
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
        const matchesSearch = (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (o.whatsapp || '').includes(searchQuery) ||
                              (o.dressName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (o.itemModel || '').toLowerCase().includes(searchQuery.toLowerCase());
        
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

      const aniMolStitching = orders.filter(o => o.tailorName === 'Ani Mol').reduce((sum, o) => sum + Number(o.stitchingCharge || 0), 0);
      const ummaStitching = orders.filter(o => o.tailorName === 'Umma').reduce((sum, o) => sum + Number(o.stitchingCharge || 0), 0);
      const nusrathStitching = orders.filter(o => o.tailorName === 'Nusrath').reduce((sum, o) => sum + Number(o.stitchingCharge || 0), 0);

      const calculateBrandFinancials = (brandOrders) => {
        let totalProfit = 0;
        let totalExpense = 0;
        let totalRevenue = 0;
        brandOrders.forEach(o => {
          const sp = Number(o.sellingPrice || 0);
          const exp = Number(o.materialRate || 0) + Number(o.stitchingCharge || 0) + Number(o.shippingCharge || 0);
          totalRevenue += sp;
          totalExpense += exp;
          totalProfit += (sp - exp);
        });
        return { totalProfit, totalExpense, totalRevenue };
      };

      const lediFinancials = calculateBrandFinancials(lediOrders);
      const bebiFinancials = calculateBrandFinancials(bebiOrders);

      const overallTotalRevenue = filteredOrdersByBrand.reduce((sum, o) => sum + Number(o.sellingPrice || 0), 0);
      const overallNetProfit = filteredOrdersByBrand.reduce((sum, o) => {
        const sp = Number(o.sellingPrice || 0);
        const cost = Number(o.materialRate || 0) + Number(o.stitchingCharge || 0) + Number(o.shippingCharge || 0);
        return sum + (sp - cost);
      }, 0);

      const currentFormProfit = (Number(formData.sellingPrice) || 0) - (
        (Number(formData.materialRate) || 0) + 
        (Number(formData.stitchingCharge) || 0) + 
        (Number(formData.shippingCharge) || 0)
      );

      const nextUpcoming = [...orders].filter(o => !o.isFullyPaid).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))[0];

      return (
        <div className="min-h-screen">

          {/* Header Bar */}
          <header className="bg-[#1B2A4A] text-[#E2E8F0] p-4 sticky top-0 z-50 flex justify-between items-center border-b border-gray-800 shadow-md">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="text-2xl text-[#2ECC71]">☰</button>
              <div>
                <h1 className="font-black text-lg tracking-wider text-white">KAIZ SOOQ</h1>
                <p className="text-[10px] text-gray-400">
                  {isLoggedIn ? '🔑 Owner Mode Active' : '👁️ View Only Mode'}
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

          {/* Owner Login Modal */}
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

          {/* Sidebar Drawer */}
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
                    <button onClick={() => { setView('reports'); setIsSidebarOpen(false); }} className="text-left p-2 hover:bg-[#0D1B2A] hover:text-[#2ECC71] rounded-lg transition">📥 Reports & Downloads</button>
                  </nav>
                </div>
                <div className="text-[10px] text-gray-500">KAIZ SOOQ v3.7 - Cloud Store Active</div>
              </div>
              <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
            </div>
          )}

          {/* MAIN CONTAINER */}
          <main className="p-4 max-w-md mx-auto space-y-5">

            {/* VIEW 1: DASHBOARD */}
            {view === 'dashboard' && (
              <>
                <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0F172A] rounded-2xl p-5 border border-gray-800 shadow-xl relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Financial Summary</span>
                    <span className="text-xs bg-[#2ECC71]/10 text-[#2ECC71] px-2 py-0.5 rounded font-mono font-bold border border-[#2ECC71]/30">Cloud Live</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-800 pb-3">
                    <div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase">Total Revenue</div>
                      <div className="text-2xl font-black text-blue-400 mt-1">₹{overallTotalRevenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase">Net Calculated Profit</div>
                      <div className="text-2xl font-black text-[#2ECC71] mt-1">₹{overallNetProfit.toLocaleString()}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400">Real-time cloud database revenue and profit tracking across all orders.</p>
                </div>

                <div className="bg-[#1B2A4A] p-3.5 rounded-xl border border-emerald-500/30 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wide">📦 Orders & Status Summary</span>
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Primary Shortcuts</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => checkAuthAndAction(() => { setEditingOrderId(null); setFormData(initialFormState); setView('addOrder'); })} className="bg-[#1B2A4A] hover:border-[#2ECC71] p-3 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition group">
                      <span className="text-2xl group-hover:scale-110 transition">➕</span>
                      <span className="text-[10px] font-bold text-gray-300">Add Order</span>
                    </button>
                    <button onClick={() => setView('savedOrders')} className="bg-[#1B2A4A] hover:border-[#2ECC71] p-3 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition group">
                      <span className="text-2xl group-hover:scale-110 transition">📜</span>
                      <span className="text-[10px] font-bold text-gray-300">Orders</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stitching & Profit Earnings</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800">
                      <div className="text-[10px] text-gray-400 font-medium line-clamp-1">Ani Mol Stitching</div>
                      <div className="text-lg font-bold text-[#2ECC71] mt-1">₹{aniMolStitching.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800">
                      <div className="text-[10px] text-gray-400 font-medium line-clamp-1">Umma Stitching</div>
                      <div className="text-lg font-bold text-[#2ECC71] mt-1">₹{ummaStitching.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800">
                      <div className="text-[10px] text-gray-400 font-medium line-clamp-1">Nusrath Stitching</div>
                      <div className="text-lg font-bold text-[#2ECC71] mt-1">₹{nusrathStitching.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1B2A4A] p-3 rounded-xl border border-[#2ECC71]/40 bg-[#2ECC71]/5">
                      <div className="text-[10px] text-gray-300 font-bold line-clamp-1">Anu profit</div>
                      <div className="text-lg font-black text-[#2ECC71] mt-1">₹{overallNetProfit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">🗓 Next Pending Delivery</span>
                    <button onClick={() => setView('savedOrders')} className="text-xs text-[#2ECC71] hover:underline font-bold">View All →</button>
                  </div>
                  {nextUpcoming ? (
                    <div 
                      onClick={() => setView('savedOrders')}
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
              </>
            )}

            {/* VIEW 2: ADD / EDIT ORDER FORM */}
            {view === 'addOrder' && (
              <form onSubmit={handleOrderSubmit} className="bg-[#1B2A4A] p-4 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2">
                  {editingOrderId ? 'Edit Order Details' : 'Create New Order / Store Item'}
                </h2>
                
                <div>
                  <label className="text-xs font-bold text-gray-400">Select Brand Target</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button type="button" onClick={() => setFormData({ ...formData, brand: 'Ledi' })} className={`py-2 text-xs font-bold rounded-lg border ${formData.brand === 'Ledi' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}>Ledi (Women)</button>
                    <button type="button" onClick={() => setFormData({ ...formData, brand: 'Bebi' })} className={`py-2 text-xs font-bold rounded-lg border ${formData.brand === 'Bebi' ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#0D1B2A] text-gray-400 border-gray-800'}`}>Bebi (Baby Wear)</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <input type="text" placeholder="Customer Name" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  <input type="text" placeholder="WhatsApp Number (e.g. 9876543210)" value={formData.whatsapp} onChange={(e) => handleWhatsappChange(e.target.value)} required className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  <textarea placeholder="Shipping Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 text-xs bg-[#0D1B2A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none h-16"></textarea>
                </div>

                {/* ITEM STORE SPECIFIC DETAILS */}
                <div className="space-y-2 bg-[#0D1B2A] p-3 rounded-xl border border-gray-800">
                  <h3 className="text-xs font-bold text-[#2ECC71]">🛍️ Item & Store Information</h3>
                  
                  <input type="text" placeholder="Dress Name / Item Title *" value={formData.dressName} onChange={(e) => setFormData({ ...formData, dressName: e.target.value })} required className="w-full p-2.5 text-xs bg-[#1B2A4A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  
                  <input type="text" placeholder="Model Number / Code (e.g. MOD-2026-X)" value={formData.itemModel || ''} onChange={(e) => setFormData({ ...formData, itemModel: e.target.value })} className="w-full p-2.5 text-xs bg-[#1B2A4A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
                  
                  <input type="url" placeholder="Image URL (e.g. https://example.com/image.jpg)" value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full p-2.5 text-xs bg-[#1B2A4A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="p-2 bg-[#1B2A4A] border border-gray-800 rounded-lg flex items-center gap-3">
                      <img 
                        src={formData.imageUrl} 
                        alt="Item Preview" 
                        className="w-12 h-12 object-cover rounded-md border border-gray-700"
                        onError={(e) => e.target.style.display='none'} 
                      />
                      <span className="text-[10px] text-gray-400">Image Preview Loaded</span>
                    </div>
                  )}

                  <textarea placeholder="Item Description (Fabric details, color, sizes...)" value={formData.itemDescription || ''} onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })} className="w-full p-2.5 text-xs bg-[#1B2A4A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none h-16"></textarea>

                  <div>
                    <label className="text-[10px] font-bold text-[#E74C3C]">Expected Delivery Date *</label>
                    <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} required className="w-full p-2.5 text-xs bg-[#1B2A4A] border border-gray-800 rounded-lg text-white focus:border-[#2ECC71] outline-none" />
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
                      <label className="text-[10px] text-gray-400 font-bold">Assign Tailor</label>
                      <select value={formData.tailorName} onChange={(e) => setFormData({ ...formData, tailorName: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white font-semibold w-full">
                        <option value="Ani Mol">Ani Mol</option>
                        <option value="Umma">Umma</option>
                        <option value="Nusrath">Nusrath</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Material Cost (₹)</label>
                      <input type="number" placeholder="Material Cost (₹)" value={formData.materialRate} onChange={(e) => setFormData({ ...formData, materialRate: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white w-full" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold">Shipping Cost (₹)</label>
                      <input type="number" placeholder="Shipping Cost (₹)" value={formData.shippingCharge} onChange={(e) => setFormData({ ...formData, shippingCharge: e.target.value })} className="p-2 text-xs bg-[#1B2A4A] border border-gray-800 rounded text-white w-full" />
                    </div>
                  </div>

                  <div className="bg-[#1B2A4A] p-2.5 rounded-lg border border-[#2ECC71]/30 flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-gray-300">Automated Profit Column:</span>
                    <span className={`text-sm font-black ${currentFormProfit >= 0 ? 'text-[#2ECC71]' : 'text-red-400'}`}>
                      ₹{currentFormProfit}
                    </span>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-black font-extrabold py-3 rounded-xl shadow-lg transition">
                  {editingOrderId ? 'Update Order Record' : 'Save Order Record'}
                </button>
              </form>
            )}

            {/* VIEW 3: SAVED ORDERS HISTORY */}
            {view === 'savedOrders' && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white">Saved Orders History (Cloud Synced)</h2>

                <div className="bg-[#1B2A4A] p-3 rounded-xl border border-gray-800 space-y-2">
                  <input 
                    type="text" 
                    placeholder="🔍 Search Customer, Model, Dress..." 
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

                    // COMPLETED ORDERS CARD
                    if (order.isFullyPaid) {
                      return (
                        <div key={order.id} className="bg-[#1B2A4A] p-4 rounded-xl border border-emerald-500/40 flex justify-between items-center shadow-md">
                          <div className="flex items-center gap-3">
                            {order.imageUrl && (
                              <img src={order.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-700" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-[#2ECC71] border border-emerald-500/40 px-2 py-0.5 rounded">
                                  Completed
                                </span>
                                <h3 className="font-bold text-base text-white">{order.customerName}</h3>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">📱 {order.whatsapp} {order.itemModel ? `| Model: ${order.itemModel}` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div className="text-base font-black text-[#2ECC71]">₹{order.sellingPrice}</div>
                            <button 
                              onClick={() => setSelectedOrderDetails(order)} 
                              className="text-xs bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/30 px-2.5 py-1.5 rounded-lg font-bold hover:bg-[#2ECC71] hover:text-black transition"
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // PENDING ORDERS CARD
                    return (
                      <div key={order.id} className="bg-[#1B2A4A] p-4 rounded-xl border border-gray-800 space-y-3 shadow-md relative">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex gap-3">
                            {order.imageUrl && (
                              <img src={order.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-700 mt-1" />
                            )}
                            <div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${order.brand === 'Ledi' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                {order.brand}
                              </span>
                              <h3 className="font-bold text-base text-white mt-1">{order.customerName}</h3>
                              <p className="text-xs text-gray-300">📱 WA: {order.whatsapp}</p>
                              <p className="text-xs text-gray-400">{order.dressName} {order.itemModel ? `(${order.itemModel})` : ''} | Delivery: <span className="text-gray-200">{order.deliveryDate}</span></p>
                              <p className="text-[11px] text-gray-400">🧵 Tailor: <span className="text-[#2ECC71] font-bold">{order.tailorName || 'Ani Mol'}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-[#2ECC71]">₹{order.sellingPrice}</div>
                            <div className="text-[11px] font-bold text-[#E74C3C]">
                              Bal: ₹{balance}
                            </div>

                            <div className="flex gap-2 mt-2 justify-end">
                              <button onClick={() => handleEditOrder(order)} className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">✏️ Edit</button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="text-[11px] bg-[#E74C3C]/10 text-[#E74C3C] px-2 py-0.5 rounded border border-[#E74C3C]/30">🗑️</button>
                            </div>
                          </div>
                        </div>

                        {/* AUTOMATED WHATSAPP ACTION BUTTONS */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-sm">
                          {!order.isAdvPaid ? (
                            <button title="Send Advance Confirmation" onClick={() => triggerWhatsApp('adv', order)} className="bg-[#0D1B2A] hover:border-[#2ECC71] text-[#2ECC71] border border-gray-800 py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs transition">
                              💳 Send Adv Info
                            </button>
                          ) : (
                            <button title="Send Full Payment Confirmation" onClick={() => triggerWhatsApp('full', order)} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs transition">
                              💰 Mark Completed
                            </button>
                          )}

                          <button title="Send Payment Reminder" onClick={() => triggerWhatsApp('remind', order)} className="bg-[#0D1B2A] hover:border-amber-400 text-amber-400 border border-gray-800 py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1 text-xs transition">
                            🔔 Reminder
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* VIEW DETAILS MODAL */}
                {selectedOrderDetails && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1B2A4A] border border-gray-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-emerald-500/20 text-[#2ECC71] border border-emerald-500/40 px-2 py-0.5 rounded">
                            ✅ Order Details
                          </span>
                          <h3 className="font-bold text-white text-base">{selectedOrderDetails.customerName}</h3>
                        </div>
                        <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 font-bold text-lg">✕</button>
                      </div>

                      {/* Product Image Display */}
                      {selectedOrderDetails.imageUrl && (
                        <div className="w-full h-44 bg-[#0D1B2A] rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
                          <img 
                            src={selectedOrderDetails.imageUrl} 
                            alt={selectedOrderDetails.dressName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-2 text-xs text-gray-300 bg-[#0D1B2A] p-3 rounded-xl border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dress / Item:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.dressName}</span>
                        </div>
                        {selectedOrderDetails.itemModel && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Model No:</span>
                            <span className="font-bold text-amber-400">{selectedOrderDetails.itemModel}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Brand:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.brand}</span>
                        </div>

                        {selectedOrderDetails.itemDescription && (
                          <div className="border-t border-gray-800 pt-2 mt-1">
                            <span className="text-gray-400 block mb-0.5">Item Description:</span>
                            <p className="text-[11px] text-gray-300 bg-[#1B2A4A] p-2 rounded border border-gray-800">
                              {selectedOrderDetails.itemDescription}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
                          <span className="text-gray-400">WhatsApp:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.whatsapp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Delivery Date:</span>
                          <span className="font-bold text-white">{selectedOrderDetails.deliveryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tailor Name:</span>
                          <span className="font-bold text-[#2ECC71]">{selectedOrderDetails.tailorName || 'Ani Mol'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stitching Fee:</span>
                          <span className="font-bold text-[#2ECC71]">₹{selectedOrderDetails.stitchingCharge || 0}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-800 pt-1 mt-1">
                          <span className="text-gray-400">Total Price:</span>
                          <span className="font-extrabold text-[#2ECC71]">₹{selectedOrderDetails.sellingPrice}</span>
                        </div>
                      </div>

                      {/* TAILOR MESSAGE BUTTON */}
                      {!selectedOrderDetails.isTailorNotified && (
                        <button 
                          onClick={() => triggerTailorWhatsApp(selectedOrderDetails)} 
                          className="w-full bg-[#0D1B2A] hover:bg-[#2ECC71] hover:text-black text-[#2ECC71] border border-[#2ECC71]/40 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                        >
                          🧵 Msg Tailor ({selectedOrderDetails.tailorName || 'Ani Mol'})
                        </button>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleEditOrder(selectedOrderDetails)} 
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          ✏️ Edit Order
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

            {/* VIEW 4: REPORTS & CSV DOWNLOAD */}
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

          {/* FLOATING BOTTOM NAVIGATION BAR */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#1B2A4A] border-t border-gray-800 py-3 px-6 flex justify-around items-center z-40 shadow-2xl">
            <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">🏠</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => setView('savedOrders')} className={`flex flex-col items-center gap-1 ${view === 'savedOrders' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">📜</span>
              <span className="text-[10px] font-bold">Orders</span>
            </button>
            <button onClick={() => setView('reports')} className={`flex flex-col items-center gap-1 ${view === 'reports' ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              <span className="text-lg">📥</span>
              <span className="text-[10px] font-bold">Reports</span>
            </button>
          </nav>

        </div>
      );
    }

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<KaizSooqApp />);
  </script>
</body>
</html>



