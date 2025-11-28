const API_USERS = "http://62.169.27.35:3000/api/users";
const tableBody = document.querySelector("#usersTable tbody");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchTelegramId");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");

let allUsers = [];
let displayedUsers = [];
let currentPage = 1;
const pageSize = 15;

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

if (openBtn) openBtn.addEventListener("click", openSidebar);
if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

// Cerrar al hacer click en enlace mobile
sidebar.querySelectorAll("li").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ---------- CARGAR USUARIOS ----------
async function loadUsers() {
  try {
    const res = await fetch(API_USERS);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    allUsers = await res.json();
    displayedUsers = [...allUsers];
    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error("Error:", err);
    tableBody.innerHTML = "<tr><td colspan='4'>Error al cargar usuarios.</td></tr>";
  }
}

// ---------- RENDERIZAR TABLA ----------
function renderTable() {
  tableBody.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageItems = displayedUsers.slice(start, start + pageSize);

  if (pageItems.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No se encontraron usuarios.</td></tr>";
      return;
  }

  pageItems.forEach(u => {
    const row = document.createElement("tr");

    // Fecha formateada
    let dateStr = "-";
    if (u.created_at) {
        dateStr = new Date(u.created_at).toLocaleDateString() + " " + new Date(u.created_at).toLocaleTimeString();
    }

    row.innerHTML = `
      <td>${u.telegram_id}</td>
      <td>${u.first_name || ""} ${u.last_name || ""} (${u.username || "-"})</td>
      <td>${dateStr}</td>
    `;
    
    // Botón ver detalles
    const actionCell = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Ver Detalles";
    btn.classList.add("approve-btn"); // Reusando estilo botón
    btn.style.backgroundColor = "#3498db";
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `/user?telegramId=${u.telegram_id}`;
    });
    actionCell.appendChild(btn);
    
    row.appendChild(actionCell);

    // Click en la fila también lleva a detalles
    row.addEventListener("click", () => {
        window.location.href = `/user?telegramId=${u.telegram_id}`;
    });

    tableBody.appendChild(row);
  });

  pageInfo.textContent = `Página ${currentPage} de ${Math.ceil(displayedUsers.length / pageSize) || 1}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * pageSize >= displayedUsers.length;
}

// ---------- PAGINACIÓN ----------
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage * pageSize < displayedUsers.length) {
    currentPage++;
    renderTable();
  }
});

// ---------- BÚSQUEDA ----------
function handleSearch() {
    const term = searchInput.value.trim();
    if (!term) {
        displayedUsers = [...allUsers];
    } else {
        // Buscar coincidencia exacta o parcial en telegram_id 
        displayedUsers = allUsers.filter(u => u.telegram_id.toString().includes(term));
    }
    currentPage = 1;
    renderTable();
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') handleSearch();
});

resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    displayedUsers = [...allUsers];
    currentPage = 1;
    renderTable();
});

// ---------- INICIO ----------
loadUsers();
