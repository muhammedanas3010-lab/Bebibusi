<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order & Financial Management System</title>
    <!-- Chart.js library for Graphs -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* Classic Original Blue Theme */
        :root {
            --primary-color: #1e3c72;
            --secondary-color: #2a5298;
            --accent-color: #2ecc71;
            --bg-color: #eef2f5;
            --card-bg: #ffffff;
            --text-color: #333333;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
        }

        /* Classic Top Header Banner */
        .header-banner {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .header-banner h1 {
            margin: 0;
            font-size: 24px;
        }

        .container {
            max-width: 1100px;
            margin: 20px auto;
            padding: 0 15px;
        }

        /* Original Classic Card Layout */
        .card {
            background: var(--card-bg);
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 6px;
            border-left: 5px solid var(--primary-color);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .card h3 {
            margin-top: 0;
            color: var(--primary-color);
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 8px;
            font-size: 18px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            font-size: 14px;
            color: #444;
        }

        input, select, button {
            width: 100%;
            padding: 9px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
        }

        input:focus, select:focus {
            border-color: var(--primary-color);
            outline: none;
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s ease;
        }

        button:hover {
            background-color: var(--secondary-color);
        }

        .btn-complete {
            background-color: var(--accent-color);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
        }

        .btn-complete:hover {
            background-color: #27ae60;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        /* Classic Table Styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: white;
        }

        th, td {
            border: 1px solid #e0e0e0;
            padding: 10px;
            text-align: left;
            font-size: 13px;
        }

        th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #fcfcfc;
        }

        .hint {
            font-size: 12px;
            margin-top: 4px;
            font-weight: bold;
        }
        .hint.positive { color: #27ae60; }
        .hint.negative { color: #c0392b; }

        /* Navigation Tabs */
        .nav-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .nav-tabs button {
            flex: 1;
            padding: 12px;
            background-color: #dcdfe3;
            color: #333;
            font-size: 15px;
            border-radius: 5px 5px 0 0;
            border: none;
        }

        .nav-tabs button.active {
            background-color: var(--primary-color);
            color: white;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* Gallery Layout */
        .item-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .item-card {
            border: 1px solid #ddd;
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            background: #fff;
        }

        .item-card img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 4px;
        }

        .employee-badge {
            display: inline-block;
            background: #e1e8f0;
            color: #1e3c72;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 5px;
            margin-top: 5px;
        }

        .chart-container {
            position: relative;
            margin: auto;
            height: 300px;
            width: 100%;
        }
    </style>
</head>
<body>

<div class="header-banner">
    <h1>Order & Financial Management System</h1>
</div>

<div class="container">

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
        <button id="tabBtnMain" class="active" onclick="switchTab('main')">Main Dashboard</button>
        <button id="tabBtnCompleted" onclick="switchTab('completed')">Completed Orders</button>
    </div>

    <!-- MAIN DASHBOARD TAB -->
    <div id="mainTab" class="tab-content active">

        <!-- Add Employee Section -->
        <div class="card">
            <h3>Add New Employee</h3>
            <div class="grid-2">
                <div>
                    <input type="text" id="newTailorName" placeholder="Enter Employee Name">
                </div>
                <div>
                    <button type="button" onclick="addTailor()">Add Employee</button>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <label>Current Employees:</label>
                <div id="employeeBadgeContainer"></div>
            </div>
        </div>

        <!-- Order Entry Form -->
        <div class="card">
            <h3>Create New Order</h3>
            <form id="orderForm" onsubmit="event.preventDefault(); saveOrder();">
                <div class="grid-3">
                    <div class="form-group">
                        <label>Customer Name:</label>
                        <input type="text" id="custName" required>
                    </div>
                    <div class="form-group">
                        <label>Order Date:</label>
                        <input type="date" id="orderDate" required>
                    </div>
                    <div class="form-group">
                        <label>Assign Employee:</label>
                        <select id="tailorSelect" required></select>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="form-group">
                        <label>Total Amount (₹):</label>
                        <input type="number" id="totalAmount" oninput="calculateFinancials()" value="0" required>
                    </div>
                    <div class="form-group">
                        <label>Material Cost (₹):</label>
                        <input type="number" id="materialCost" oninput="calculateFinancials()" value="0" required>
                    </div>
                    <div class="form-group">
                        <label>Stitching Charge (₹):</label>
                        <input type="number" id="stitchingCharge" oninput="calculateFinancials()" value="0" required>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>Advance Paid (₹):</label>
                        <input type="number" id="advancePaid" oninput="calculateFinancials()" value="0" required>
                        <div id="advanceHint" class="hint">Advance Balance: 0</div>
                    </div>
                    <div class="form-group">
                        <label>Other Expenses (₹):</label>
                        <input type="number" id="otherExpenses" oninput="calculateFinancials()" value="0">
                    </div>
                </div>

                <button type="submit" style="padding: 12px; font-size: 15px;">Save Order</button>
            </form>
        </div>

        <!-- Item Store -->
        <div class="card">
            <h3>Item Store (Upload & Gallery)</h3>
            <div class="grid-2">
                <div class="form-group">
                    <label>Item Name:</label>
                    <input type="text" id="itemName" placeholder="Item Name">
                </div>
                <div class="form-group">
                    <label>Select Image:</label>
                    <input type="file" id="itemImage" accept="image/*" onchange="handleImageUpload(event)">
                </div>
            </div>
            <button type="button" onclick="saveItem()">Add to Store</button>

            <h4 style="margin-top: 15px; margin-bottom: 5px;">Stored Items</h4>
            <div id="itemGallery" class="item-gallery"></div>
        </div>

        <!-- Employee Earnings -->
        <div class="card">
            <h3>Employee Stitching Earnings</h3>
            <div id="tailorEarningsList"></div>
        </div>

        <!-- Financial Analysis with Graph -->
        <div class="card">
            <h3>Date-Based Financial Analysis & Graph</h3>
            <div class="grid-3">
                <div>
                    <label>From Date:</label>
                    <input type="date" id="startDate">
                </div>
                <div>
                    <label>To Date:</label>
                    <input type="date" id="endDate">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button type="button" onclick="analyzeFinancials()">Analyze & Show Graph</button>
                </div>
            </div>

            <div id="analysisResult" style="margin-top: 15px; font-weight: 500;"></div>

            <!-- Graph Container -->
            <div class="chart-container" style="margin-top: 20px;">
                <canvas id="financialChart"></canvas>
            </div>
        </div>

        <!-- Active Orders Table -->
        <div class="card">
            <h3>Active Orders (Pending Completion)</h3>
            <table id="activeOrdersTable">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Tailor</th>
                        <th>Stitching</th>
                        <th>Reserved (₹300)</th>
                        <th>Net Profit</th>
                        <th>Transferred (< ₹300)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>

    </div>

    <!-- COMPLETED ORDERS TAB -->
    <div id="completedTab" class="tab-content">
        <div class="card">
            <h3>Completed Orders (Sorted by Date - Newest First)</h3>
            <table id="completedOrdersTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Tailor</th>
                        <th>Stitching</th>
                        <th>Reserved (₹300)</th>
                        <th>Net Profit</th>
                        <th>Transferred (< ₹300)</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

</div>

<script>
    let tailors = JSON.parse(localStorage.getItem('tailors')) || ['Umma', 'Nusrath'];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let currentBase64Image = "";
    let chartInstance = null;

    window.onload = function() {
        updateTailorDropdown();
        renderEmployeeBadges();
        renderTailorEarnings();
        renderOrders();
        renderItemGallery();
    };

    function switchTab(tabName) {
        document.getElementById('mainTab').classList.remove('active');
        document.getElementById('completedTab').classList.remove('active');
        document.getElementById('tabBtnMain').classList.remove('active');
        document.getElementById('tabBtnCompleted').classList.remove('active');

        if(tabName === 'main') {
            document.getElementById('mainTab').classList.add('active');
            document.getElementById('tabBtnMain').classList.add('active');
            renderOrders();
        } else {
            document.getElementById('completedTab').classList.add('active');
            document.getElementById('tabBtnCompleted').classList.add('active');
            renderCompletedOrders();
        }
    }

    function updateTailorDropdown() {
        const select = document.getElementById('tailorSelect');
        select.innerHTML = '';
        tailors.forEach(t => {
            let option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            select.appendChild(option);
        });
    }

    function renderEmployeeBadges() {
        const container = document.getElementById('employeeBadgeContainer');
        container.innerHTML = '';
        tailors.forEach(t => {
            let badge = document.createElement('span');
            badge.className = 'employee-badge';
            badge.textContent = t;
            container.appendChild(badge);
        });
    }

    function addTailor() {
        const nameInput = document.getElementById('newTailorName');
        const name = nameInput.value.trim();
        if (name && !tailors.includes(name)) {
            tailors.push(name);
            localStorage.setItem('tailors', JSON.stringify(tailors));
            updateTailorDropdown();
            renderEmployeeBadges();
            renderTailorEarnings();
            nameInput.value = '';
            alert('Employee Added Successfully!');
        } else {
            alert('Please enter a valid name or the employee already exists.');
        }
    }

    function calculateFinancials() {
        const matCost = parseFloat(document.getElementById('materialCost').value) || 0;
        const advance = parseFloat(document.getElementById('advancePaid').value) || 0;
        const diff = advance - matCost;
        const hintDiv = document.getElementById('advanceHint');
        
        if (diff >= 0) {
            hintDiv.className = "hint positive";
            hintDiv.textContent = `Advance Balance: +${diff} (Excess Advance)`;
        } else {
            hintDiv.className = "hint negative";
            hintDiv.textContent = `Advance Balance: ${diff} (Material cost exceeded)`;
        }
    }

    function saveOrder() {
        const custName = document.getElementById('custName').value;
        const orderDate = document.getElementById('orderDate').value;
        const tailor = document.getElementById('tailorSelect').value;
        const total = parseFloat(document.getElementById('totalAmount').value) || 0;
        const matCost = parseFloat(document.getElementById('materialCost').value) || 0;
        const stitchCharge = parseFloat(document.getElementById('stitchingCharge').value) || 0;
        const advance = parseFloat(document.getElementById('advancePaid').value) || 0;
        const otherExp = parseFloat(document.getElementById('otherExpenses').value) || 0;

        const rawProfit = total - (matCost + stitchCharge + otherExp);

        let profit300Column = 0;
        let netProfit = 0;
        let transferredToOther = 0;

        if (rawProfit >= 300) {
            profit300Column = 300;
            netProfit = rawProfit - 300;
        } else {
            transferredToOther = rawProfit;
            netProfit = 0;
        }

        const newOrder = {
            id: Date.now(),
            custName,
            orderDate,
            tailor,
            total,
            matCost,
            stitchCharge,
            advance,
            otherExp,
            profit300Column,
            netProfit,
            transferredToOther,
            status: 'pending'
        };

        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        alert('Order Saved Successfully!');
        document.getElementById('orderForm').reset();
        document.getElementById('advanceHint').textContent = 'Advance Balance: 0';
        
        renderTailorEarnings();
        renderOrders();
    }

    function markAsCompleted(orderId) {
        let order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            localStorage.setItem('orders', JSON.stringify(orders));
            renderOrders();
            alert('Order Shifted to Completed Orders!');
        }
    }

    function renderTailorEarnings() {
        const container = document.getElementById('tailorEarningsList');
        container.innerHTML = '';

        let earningsMap = {};
        tailors.forEach(t => earningsMap[t] = 0);

        orders.forEach(o => {
            if (earningsMap[o.tailor] !== undefined) {
                earningsMap[o.tailor] += o.stitchCharge;
            } else {
                earningsMap[o.tailor] = o.stitchCharge;
            }
        });

        let html = '<ul style="margin:0; padding-left:20px;">';
        for (let t in earningsMap) {
            html += `<li><strong>${t}:</strong> Earned ₹${earningsMap[t]}</li>`;
        }
        html += '</ul>';
        container.innerHTML = html;
    }

    function renderOrders() {
        const tbody = document.getElementById('activeOrdersTable').querySelector('tbody');
        tbody.innerHTML = '';

        const pendingOrders = orders.filter(o => o.status !== 'completed');

        pendingOrders.forEach(o => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${o.custName}</td>
                <td>${o.orderDate}</td>
                <td>${o.tailor}</td>
                <td>₹${o.stitchCharge}</td>
                <td>₹${o.profit300Column}</td>
                <td>₹${o.netProfit}</td>
                <td>₹${o.transferredToOther}</td>
                <td><button type="button" class="btn-complete" onclick="markAsCompleted(${o.id})">Mark Completed</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderCompletedOrders() {
        const tbody = document.getElementById('completedOrdersTable').querySelector('tbody');
        tbody.innerHTML = '';

        const completedOrders = orders
            .filter(o => o.status === 'completed')
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        completedOrders.forEach(o => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${o.orderDate}</strong></td>
                <td>${o.custName}</td>
                <td>${o.tailor}</td>
                <td>₹${o.stitchCharge}</td>
                <td>₹${o.profit300Column}</td>
                <td>₹${o.netProfit}</td>
                <td>₹${o.transferredToOther}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB!");
                event.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                currentBase64Image = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function saveItem() {
        const name = document.getElementById('itemName').value.trim();
        if (!name) {
            alert('Please enter Item Name');
            return;
        }
        if (!currentBase64Image) {
            alert('Please select an image');
            return;
        }

        items.push({ id: Date.now(), name: name, image: currentBase64Image });
        localStorage.setItem('items', JSON.stringify(items));
        
        alert('Item Added to Store!');
        document.getElementById('itemName').value = '';
        document.getElementById('itemImage').value = '';
        currentBase64Image = "";
        
        renderItemGallery();
    }

    function renderItemGallery() {
        const gallery = document.getElementById('itemGallery');
        gallery.innerHTML = '';

        if (items.length === 0) {
            gallery.innerHTML = '<p style="color:#777; font-size:13px;">No items added yet.</p>';
            return;
        }

        items.forEach(item => {
            let card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <p style="margin:5px 0 0 0; font-size:12px; font-weight:bold;">${item.name}</p>
            `;
            gallery.appendChild(card);
        });
    }

    function analyzeFinancials() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;

        if (!start || !end) {
            alert('Please select both From and To dates');
            return;
        }

        const filteredOrders = orders.filter(o => o.orderDate >= start && o.orderDate <= end);

        let totalRevenue = 0;
        let totalStitching = 0;
        let total300Reserved = 0;
        let totalNetProfit = 0;

        filteredOrders.forEach(o => {
            totalRevenue += o.total;
            totalStitching += o.stitchCharge;
            total300Reserved += o.profit300Column;
            totalNetProfit += o.netProfit;
        });

        const resultDiv = document.getElementById('analysisResult');
        resultDiv.innerHTML = `
            <p><strong>Total Orders:</strong> ${filteredOrders.length} | 
            <strong>Total Revenue:</strong> ₹${totalRevenue} | 
            <strong>Stitching Paid:</strong> ₹${totalStitching} | 
            <strong>Net Profit:</strong> ₹${totalNetProfit}</p>
        `;

        renderGraph(totalRevenue, totalStitching, total300Reserved, totalNetProfit);
    }

    function renderGraph(revenue, stitching, reserved, netProfit) {
        const ctx = document.getElementById('financialChart').getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Revenue', 'Stitching Charges', 'Reserved (₹300)', 'Net Profit'],
                datasets: [{
                    label: 'Financial Breakdown (₹)',
                    data: [revenue, stitching, reserved, netProfit],
                    backgroundColor: [
                        '#1e3c72',
                        '#f39c12',
                        '#3498db',
                        '#2ecc71'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
</script>

</body>
</html>






