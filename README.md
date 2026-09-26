<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order & Financial Management System</title>
    <style>
        :root {
            --primary-color: #4a90e2;
            --success-color: #2ecc71;
            --bg-color: #f4f7f6;
            --card-bg: #ffffff;
            --text-color: #333333;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .card {
            background: var(--card-bg);
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        h2, h3 { color: #2c3e50; }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input, select, button {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        }

        button:hover { opacity: 0.9; }

        .btn-complete {
            background-color: var(--success-color);
            padding: 6px 12px;
            margin-top: 0;
            font-size: 0.9em;
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

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        th { background-color: #f2f2f2; }

        .hint {
            font-size: 0.85em;
            margin-top: 4px;
            font-weight: bold;
        }
        .hint.positive { color: green; }
        .hint.negative { color: red; }

        /* Item Store Gallery */
        .item-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .item-card {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            background: #fafafa;
        }

        .item-card img {
            max-width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 4px;
        }

        /* Nav Tabs */
        .nav-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .nav-tabs button {
            flex: 1;
            padding: 12px;
            background-color: #e0e0e0;
            color: #333;
            font-size: 1em;
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

        .employee-list {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }

        .employee-badge {
            background: #e2e8f0;
            padding: 5px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 0.9em;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Order & Financial Management System</h2>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
        <button id="tabBtnMain" class="active" onclick="switchTab('main')">Main Dashboard</button>
        <button id="tabBtnCompleted" onclick="switchTab('completed')">Completed Orders</button>
    </div>

    <!-- MAIN DASHBOARD TAB -->
    <div id="mainTab" class="tab-content active">

        <!-- Add Employee Section -->
        <div class="card">
            <h3>1. Add New Employee (Tailor)</h3>
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
                <div id="employeeBadgeContainer" class="employee-list"></div>
            </div>
        </div>

        <!-- Order Form -->
        <div class="card">
            <h3>2. Create New Order</h3>
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
                        <label>Select Tailor:</label>
                        <select id="tailorSelect" required></select>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="form-group">
                        <label>Total Amount:</label>
                        <input type="number" id="totalAmount" oninput="calculateFinancials()" value="0" required>
                    </div>
                    <div class="form-group">
                        <label>Material Cost:</label>
                        <input type="number" id="materialCost" oninput="calculateFinancials()" value="0" required>
                    </div>
                    <div class="form-group">
                        <label>Stitching Charge:</label>
                        <input type="number" id="stitchingCharge" oninput="calculateFinancials()" value="0" required>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>Advance Paid:</label>
                        <input type="number" id="advancePaid" oninput="calculateFinancials()" value="0" required>
                        <div id="advanceHint" class="hint">Advance Balance: 0</div>
                    </div>
                    <div class="form-group">
                        <label>Other Expenses:</label>
                        <input type="number" id="otherExpenses" oninput="calculateFinancials()" value="0">
                    </div>
                </div>

                <button type="submit">Save Order</button>
            </form>
        </div>

        <!-- Item Store Section -->
        <div class="card">
            <h3>3. Item Store (Upload & Display Items)</h3>
            <div class="grid-2">
                <div class="form-group">
                    <label>Item Name:</label>
                    <input type="text" id="itemName" placeholder="e.g., Silk Saree, Blouse Design">
                </div>
                <div class="form-group">
                    <label>Select Image (Max 5MB):</label>
                    <input type="file" id="itemImage" accept="image/*" onchange="handleImageUpload(event)">
                </div>
            </div>
            <button type="button" onclick="saveItem()">Save to Item Store</button>

            <!-- Store Display Gallery -->
            <h4 style="margin-top: 20px;">Saved Items Gallery</h4>
            <div id="itemGallery" class="item-gallery"></div>
        </div>

        <!-- Employee Earnings -->
        <div class="card">
            <h3>4. Employee Stitching Earnings</h3>
            <div id="tailorEarningsList"></div>
        </div>

        <!-- Active / Pending Orders Table -->
        <div class="card">
            <h3>Active Orders (Pending)</h3>
            <table id="activeOrdersTable">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Tailor</th>
                        <th>Stitching Charge</th>
                        <th>Reserved Amount (₹300)</th>
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
                        <th>Stitching Charge</th>
                        <th>Reserved Amount (₹300)</th>
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
            alert('Employee added successfully!');
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

        alert('Order saved successfully!');
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
            alert('Order moved to Completed Orders!');
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
            html += `<li><strong>${t}:</strong> Earned ₹${earningsMap[t]} from stitching.</li>`;
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
                <td><button class="btn-complete" onclick="markAsCompleted(${o.id})">Mark Completed</button></td>
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

    /* Item Store Image Handling */
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
            alert('Please select an image for the item');
            return;
        }

        items.push({ id: Date.now(), name: name, image: currentBase64Image });
        localStorage.setItem('items', JSON.stringify(items));
        
        alert('Item added to Item Store!');
        document.getElementById('itemName').value = '';
        document.getElementById('itemImage').value = '';
        currentBase64Image = "";
        
        renderItemGallery();
    }

    function renderItemGallery() {
        const gallery = document.getElementById('itemGallery');
        gallery.innerHTML = '';

        if (items.length === 0) {
            gallery.innerHTML = '<p style="color:#777;">No items added to the store yet.</p>';
            return;
        }

        items.forEach(item => {
            let card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <p style="margin:5px 0 0 0; font-weight:bold;">${item.name}</p>
            `;
            gallery.appendChild(card);
        });
    }
</script>

</body>
</html>





