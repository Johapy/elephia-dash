const API_TX = "http://62.169.27.35:3000/api/transactions";
const API_PM = "http://62.169.27.35:3000/api/payment-methods";
const API_USERS = "http://62.169.27.35:3000/api/users"; // Nueva constante para users

const tableBody = document.querySelector("#userTransactionsTable tbody");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
// const userTitle = document.getElementById("userTitle"); // Ya no se usa userTitle en header sino en la card
const pmContainer = document.getElementById("userPaymentMethods");
const pmList = document.getElementById("paymentMethodsList");

// Elementos del perfil de usuario
const u_telegramId = document.getElementById("u_telegramId");
const u_fullName = document.getElementById("u_fullName");
const u_username = document.getElementById("u_username");
const u_email = document.getElementById("u_email");
const u_phone = document.getElementById("u_phone");
const u_joined = document.getElementById("u_joined");


let transactions = [];
let currentPage = 1;
const pageSize = 5;

// Obtener telegramId de la URL
const params = new URLSearchParams(window.location.search);
const telegramId = params.get("telegramId");

// ---------- SIDEBAR LOGIC ----------
const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

function openSidebar() {
  sidebar.classList.add("active");
}

function closeSidebar() {
  sidebar.classList.remove("active");
}

if(openBtn) openBtn.addEventListener("click", openSidebar);
if(closeBtn) closeBtn.addEventListener("click", closeSidebar);

// Cerrar al hacer click en enlace mobile
sidebar.querySelectorAll("li").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ---------- CARGAR DATOS DEL USUARIO ----------
async function loadUserInfo() {
    try {
        const res = await fetch(`${API_USERS}/${telegramId}`);
        if (!res.ok) throw new Error("Error al obtener datos del usuario");
        const user = await res.json();
        
        u_telegramId.textContent = user.telegram_id || "-";
        u_fullName.textContent = `${user.first_name || ""} ${user.last_name || ""}`;
        u_username.textContent = user.username ? `@${user.username}` : "-";
        u_email.textContent = user.email || "-";
        // Aquí se corrige la propiedad del teléfono
        u_phone.textContent = user.phone || "-";
        
        if (user.created_at) {
            u_joined.textContent = new Date(user.created_at).toLocaleDateString();
        } else {
            u_joined.textContent = "-";
        }

    } catch (err) {
        console.error(err);
        u_telegramId.textContent = "Error al cargar";
    }
}


// ---------- CARGAR TRANSACCIONES ----------
async function loadUserTransactions() {
  try {
    const res = await fetch(`${API_TX}/${telegramId}`);
    if (!res.ok) throw new Error("Error al obtener transacciones");
    transactions = await res.json();
    renderTable();
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='8'>Error al cargar transacciones.</td></tr>";
  }
}

// ---------- RENDER TABLE ----------
function renderTable() {
  tableBody.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageItems = transactions.slice(start, start + pageSize);
  
  if (pageItems.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='8'>No hay transacciones.</td></tr>";
      return;
  }

  pageItems.forEach(tx => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.transaction_type}</td>
      <td>$${parseFloat(tx.amount_usd).toFixed(2)}</td>
      <td>$${parseFloat(tx.commission_usd).toFixed(2)}</td>
      <td>$${parseFloat(tx.total_usd).toFixed(2)}</td>
      <td>${parseFloat(tx.rate_bs).toFixed(2)}</td>
      <td>${parseFloat(tx.total_bs).toFixed(2)}</td>
      <td>${tx.status}</td>
    `;
    tableBody.appendChild(row);
  });

  pageInfo.textContent = `Página ${currentPage} de ${Math.ceil(transactions.length / pageSize) || 1}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * pageSize >= transactions.length;
}

// ---------- PAGINACIÓN ----------
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage * pageSize < transactions.length) {
    currentPage++;
    renderTable();
  }
});

// ---------- MÉTODOS DE PAGO ----------
async function loadPaymentMethods() {
  try {
    const res = await fetch(`${API_PM}/${telegramId}`);
    if (!res.ok) throw new Error("Error al obtener métodos de pago");
    const methods = await res.json();

    pmList.innerHTML = "";
    if (methods.length === 0) {
      pmList.innerHTML = "<li>No hay métodos de pago registrados</li>";
    } else {
      methods.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `Tipo: ${m.method_type} | Cuenta: ${m.account_details || m.nickname || "-"}`;
        pmList.appendChild(li);
      });
    }
    pmContainer.style.display = "block";
  } catch (err) {
    console.error(err);
    pmList.innerHTML = "<li>Error al cargar métodos de pago</li>";
    pmContainer.style.display = "block";
  }
}

// ---------- INICIO ----------
if(telegramId){
    loadUserInfo();
    loadUserTransactions();
    loadPaymentMethods();
} else {
    document.querySelector(".content-area").innerHTML = "<h3>No se especificó un ID de usuario.</h3>";
}
