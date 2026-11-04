/* ==========================================
   ADOR ORDERS — SCRIPT
========================================== */

const $ = id => document.getElementById(id);

/* ==========================================
   PRODUCT DATABASE
========================================== */

// এখানে নিজের আসল প্রোডাক্টের নাম ও মূল্য বসাতে হবে।

let products = [
    { id: 1, name: "প্রোডাক্ট ১", price: 100 },
    { id: 2, name: "প্রোডাক্ট ২", price: 150 },
    { id: 3, name: "প্রোডাক্ট ৩", price: 200 },
    { id: 4, name: "প্রোডাক্ট ৪", price: 250 },
    { id: 5, name: "প্রোডাক্ট ৫", price: 300 }
];

/* ==========================================
   LOCAL STORAGE
========================================== */

let orders = JSON.parse(
    localStorage.getItem("adorOrders")
) || [];

let cart = [];

/* ==========================================
   SAVE DATA
========================================== */

function saveData() {
    localStorage.setItem(
        "adorOrders",
        JSON.stringify(orders)
    );
}

/* ==========================================
   SECTION NAVIGATION
========================================== */

function showSection(sectionId) {

    document.querySelectorAll(".app-section")
        .forEach(section => {
            section.classList.add("hidden");
        });

    const section = $(sectionId);

    if (section) {
        section.classList.remove("hidden");
    }

    if (sectionId === "orderList") {
        renderOrders();
    }

    if (sectionId === "products") {
        renderProducts();
    }

    if (sectionId === "reports") {
        renderReports();
    }
}

/* ==========================================
   PRODUCT SEARCH
========================================== */

$("prodSearch").addEventListener("input", function () {

    const q = this.value.trim().toLowerCase();

    const box = $("prodSuggest");

    box.innerHTML = "";

    if (!q) {
        box.classList.add("hidden");
        return;
    }

    const matches = products.filter(product =>
        product.name.toLowerCase().includes(q)
    );

    if (matches.length === 0) {

        box.innerHTML = `
            <div class="card">
                কোনো প্রোডাক্ট পাওয়া যায়নি
            </div>
        `;

        box.classList.remove("hidden");

        return;
    }

    matches.forEach(product => {

        const item = document.createElement("div");

        item.className = "card";

        item.style.cursor = "pointer";

        item.innerHTML = `
            <strong>${product.name}</strong>
            <br>
            মূল্য: ৳ ${product.price}
        `;

        item.addEventListener("click", function () {

            addToCart(product);

            $("prodSearch").value = "";

            box.innerHTML = "";

            box.classList.add("hidden");

        });

        box.appendChild(item);

    });

    box.classList.remove("hidden");

});

/* ==========================================
   ADD PRODUCT TO CART
========================================== */

function addToCart(product) {

    const existing = cart.find(
        item => item.id === product.id
    );

    if (existing) {

        existing.qty++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1
        });

    }

    renderCart();

}

/* ==========================================
   CART RENDER
========================================== */

function renderCart() {

    const container = $("cartContainer");

    container.innerHTML = "";

    cart.forEach((item, index) => {

        const subtotal = item.price * item.qty;

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <h3>${item.name}</h3>

            <p>
                মূল্য: ৳ ${item.price}
            </p>

            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-top:10px;
            ">

                <button data-action="minus"
                        data-index="${index}">
                    -
                </button>

                <strong>${item.qty}</strong>

                <button data-action="plus"
                        data-index="${index}">
                    +
                </button>

                <button data-action="remove"
                        data-index="${index}"
                        style="background:#dc2626;">
                    বাদ
                </button>

            </div>

            <p style="margin-top:10px;">
                সাবটোটাল: ৳ ${subtotal}
            </p>
        `;

        container.appendChild(card);

    });

    updateCalculation();

}

/* ==========================================
   CART BUTTON ACTIONS
========================================== */

$("cartContainer").addEventListener("click", function (e) {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    const index = Number(button.dataset.index);

    if (!cart[index]) return;

    if (action === "plus") {

        cart[index].qty++;

    }

    if (action === "minus") {

        cart[index].qty--;

        if (cart[index].qty <= 0) {

            cart.splice(index, 1);

        }

    }

    if (action === "remove") {

        cart.splice(index, 1);

    }

    renderCart();

});

/* ==========================================
   AUTO CALCULATION
========================================== */

function updateCalculation() {

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const paid = Number(
        $("paidAmount").value
    ) || 0;

    const due = total - paid;

    $("orderTotal").textContent =
        "৳ " + total.toLocaleString("en-IN");

    $("dueAmount").textContent =
        "৳ " + due.toLocaleString("en-IN");

}

$("paidAmount").addEventListener(
    "input",
    updateCalculation
);

/* ==========================================
   SAVE NEW ORDER
========================================== */

$("saveOrder").addEventListener("click", function () {

    const customerName =
        $("customerName").value.trim();

    const customerPhone =
        $("customerPhone").value.trim();

    const customerAddress =
        $("customerAddress").value.trim();

    const note =
        $("orderNote").value.trim();

    const paid =
        Number($("paidAmount").value) || 0;

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    if (!customerName) {

        alert("কাস্টমারের নাম লিখুন");

        return;

    }

    if (cart.length === 0) {

        alert("অন্তত একটি প্রোডাক্ট নির্বাচন করুন");

        return;

    }

    if (paid < 0 || paid > total) {

        alert("জমার পরিমাণ সঠিকভাবে লিখুন");

        return;

    }

    const order = {

        id: Date.now(),

        customerName,

        customerPhone,

        customerAddress,

        items: [...cart],

        total,

        paid,

        due: total - paid,

        note,

        date: new Date().toLocaleString("bn-BD")

    };

    orders.unshift(order);

    saveData();

    alert("অর্ডার সফলভাবে সংরক্ষণ হয়েছে!");

    cart = [];

    $("customerName").value = "";

    $("customerPhone").value = "";

    $("customerAddress").value = "";

    $("paidAmount").value = 0;

    $("orderNote").value = "";

    $("prodSearch").value = "";

    $("cartContainer").innerHTML = "";

    updateCalculation();

    updateDashboard();

});

/* ==========================================
   ORDER LIST
========================================== */

function renderOrders() {

    const container = $("ordersContainer");

    container.innerHTML = "";

    if (orders.length === 0) {

        container.innerHTML = `
            <div class="card">
                কোনো অর্ডার নেই
            </div>
        `;

        return;

    }

    orders.forEach(order => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <h3>${order.customerName}</h3>

            <p>
                মোবাইল: ${order.customerPhone || "-"}
            </p>

            <p>
                অর্ডার তারিখ: ${order.date}
            </p>

            <p>
                মোট: ৳ ${order.total}
            </p>

            <p>
                জমা: ৳ ${order.paid}
            </p>

            <p style="color:#dc2626;">
                বকেয়া: ৳ ${order.due}
            </p>

            <button data-order-id="${order.id}"
                    class="deleteOrder"
                    style="background:#dc2626;margin-top:10px;">
                অর্ডার মুছুন
            </button>
        `;

        container.appendChild(card);

    });

}

/* ==========================================
   DELETE ORDER
========================================== */

$("ordersContainer").addEventListener("click", function (e) {

    const button = e.target.closest(".deleteOrder");

    if (!button) return;

    const id = Number(button.dataset.orderId);

    const confirmDelete = confirm(
        "আপনি কি এই অর্ডারটি মুছতে চান?"
    );

    if (!confirmDelete) return;

    orders = orders.filter(
        order => order.id !== id
    );

    saveData();

    renderOrders();

    updateDashboard();

});

/* ==========================================
   ORDER SEARCH
========================================== */

$("orderSearch").addEventListener("input", function () {

    const q = this.value.trim().toLowerCase();

    const filtered = orders.filter(order =>
        order.customerName.toLowerCase().includes(q) ||
        (order.customerPhone || "").includes(q)
    );

    const container = $("ordersContainer");

    container.innerHTML = "";

    filtered.forEach(order => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <h3>${order.customerName}</h3>

            <p>মোবাইল: ${order.customerPhone || "-"}</p>

            <p>মোট: ৳ ${order.total}</p>

            <p>জমা: ৳ ${order.paid}</p>

            <p>বকেয়া: ৳ ${order.due}</p>
        `;

        container.appendChild(card);

    });

});

/* ==========================================
   PRODUCT LIST
========================================== */

function renderProducts() {

    const container = $("productsContainer");

    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <h3>${product.name}</h3>

            <p>
                মূল্য: ৳ ${product.price}
            </p>
        `;

        container.appendChild(card);

    });

}

/* ==========================================
   DASHBOARD
========================================== */

function updateDashboard() {

    const totalOrders = orders.length;

    const totalSales = orders.reduce(
        (sum, order) => sum + order.total,
        0
    );

    const totalDue = orders.reduce(
        (sum, order) => sum + order.due,
        0
    );

    $("totalOrders").textContent =
        totalOrders.toLocaleString("en-IN");

    $("totalSales").textContent =
        "৳ " + totalSales.toLocaleString("en-IN");

    $("totalDue").textContent =
        "৳ " + totalDue.toLocaleString("en-IN");

}

/* ==========================================
   REPORTS
========================================== */

function renderReports() {

    const container = $("reportsContainer");

    const totalSales = orders.reduce(
        (sum, order) => sum + order.total,
        0
    );

    const totalPaid = orders.reduce(
        (sum, order) => sum + order.paid,
        0
    );

    const totalDue = orders.reduce(
        (sum, order) => sum + order.due,
        0
    );

    container.innerHTML = `

        <div class="card">

            <h3>মোট অর্ডার</h3>

            <p>${orders.length}</p>

        </div>

        <div class="card">

            <h3>মোট বিক্রয়</h3>

            <p>৳ ${totalSales.toLocaleString("en-IN")}</p>

        </div>

        <div class="card">

            <h3>মোট জমা</h3>

            <p>৳ ${totalPaid.toLocaleString("en-IN")}</p>

        </div>

        <div class="card">

            <h3>মোট বকেয়া</h3>

            <p>৳ ${totalDue.toLocaleString("en-IN")}</p>

        </div>

    `;

}

/* ==========================================
   APP INITIALIZATION
========================================== */

updateDashboard();

updateCalculation();

renderProducts();

console.log("Ador Orders App Loaded Successfully");
