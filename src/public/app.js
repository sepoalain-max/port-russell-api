// src/public/app.js
(async function () {
  const $ = (sel) => document.querySelector(sel);

  function showError(err) {
    console.error(err);
    alert(err?.message || "Erreur");
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "include", // IMPORTANT: envoie les cookies (JWT)
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    // 204: No Content
    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  // -------------------------
  // CATWAYS PAGE
  // -------------------------
  async function loadCatways() {
    const tbody = $("#catways-table");
    if (!tbody) return;

    const items = await api("/catways");
    tbody.innerHTML = "";

    for (const c of items) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.catwayNumber}</td>
        <td>${c.catwayType}</td>
        <td>
          <input data-catway="${c.catwayNumber}" class="catway-state" value="${escapeHtml(c.catwayState)}" style="width: 320px;" />
          <button data-update="${c.catwayNumber}">Modifier état</button>
        </td>
        <td>
          <button data-delete="${c.catwayNumber}">Supprimer</button>
        </td>
      `;

      tbody.appendChild(tr);
    }

    // Update state
    tbody.querySelectorAll("button[data-update]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const id = btn.getAttribute("data-update");
          const input = tbody.querySelector(`input[data-catway="${id}"]`);
          const catwayState = input.value.trim();
          if (!catwayState) return alert("État requis");

          await api(`/catways/${id}`, {
            method: "PUT",
            body: JSON.stringify({ catwayState }),
          });
          alert("État mis à jour ✅");
        } catch (e) {
          showError(e);
        }
      });
    });

    // Delete
    tbody.querySelectorAll("button[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const id = btn.getAttribute("data-delete");
          if (!confirm(`Supprimer le catway ${id} ?`)) return;

          await api(`/catways/${id}`, { method: "DELETE" });
          await loadCatways();
        } catch (e) {
          showError(e);
        }
      });
    });
  }

  function bindCreateCatway() {
    const form = $("#create-catway");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form);
        const payload = {
          catwayNumber: Number(fd.get("catwayNumber")),
          catwayType: fd.get("catwayType"),
          catwayState: String(fd.get("catwayState") || "").trim(),
        };

        if (!Number.isFinite(payload.catwayNumber)) throw new Error("Numéro invalide");
        if (!["long", "short"].includes(payload.catwayType)) throw new Error("Type invalide");
        if (!payload.catwayState) throw new Error("État requis");

        await api("/catways", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        await loadCatways();
      } catch (e2) {
        showError(e2);
      }
    });
  }

  // -------------------------
  // USERS PAGE
  // -------------------------
  async function loadUsers() {
    const tbody = $("#users-table");
    if (!tbody) return;

    const items = await api("/users");
    tbody.innerHTML = "";

    for (const u of items) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><button data-delete-user="${escapeAttr(u.email)}">Supprimer</button></td>
      `;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll("button[data-delete-user]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const email = btn.getAttribute("data-delete-user");
          if (!confirm(`Supprimer l'utilisateur ${email} ?`)) return;
          await api(`/users/${encodeURIComponent(email)}`, { method: "DELETE" });
          await loadUsers();
        } catch (e) {
          showError(e);
        }
      });
    });
  }

  function bindCreateUser() {
    const form = $("#create-user");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form);
        const payload = {
          username: String(fd.get("username") || "").trim(),
          email: String(fd.get("email") || "").trim(),
          password: String(fd.get("password") || ""),
        };

        if (payload.username.length < 2) throw new Error("username trop court");
        if (!payload.email.includes("@")) throw new Error("email invalide");
        if (payload.password.length < 8) throw new Error("mot de passe min 8 caractères");

        await api("/users", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        await loadUsers();
      } catch (e2) {
        showError(e2);
      }
    });
  }

  // -------------------------
  // RESERVATIONS PAGE
  // -------------------------
  async function loadReservations(catwayNumber) {
    const tbody = $("#reservations-table");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!catwayNumber) return;

    const items = await api(`/catways/${catwayNumber}/reservations`);
    for (const r of items) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.catwayNumber}</td>
        <td>${escapeHtml(r.clientName)}</td>
        <td>${escapeHtml(r.boatName)}</td>
        <td>${formatDate(r.startDate)}</td>
        <td>${formatDate(r.endDate)}</td>
        <td><button data-del-res="${r._id}" data-catway="${r.catwayNumber}">Supprimer</button></td>
      `;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll("button[data-del-res]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const idReservation = btn.getAttribute("data-del-res");
          const catway = btn.getAttribute("data-catway");
          if (!confirm("Supprimer cette réservation ?")) return;
          await api(`/catways/${catway}/reservations/${idReservation}`, { method: "DELETE" });
          await loadReservations(catway);
        } catch (e) {
          showError(e);
        }
      });
    });
  }

  function bindCreateReservation() {
    const form = $("#create-reservation");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form);
        const catwayNumber = Number(fd.get("catwayNumber"));
        const payload = {
          clientName: String(fd.get("clientName") || "").trim(),
          boatName: String(fd.get("boatName") || "").trim(),
          startDate: fd.get("startDate"),
          endDate: fd.get("endDate"),
        };

        if (!Number.isFinite(catwayNumber)) throw new Error("catwayNumber invalide");
        if (!payload.clientName) throw new Error("clientName requis");
        if (!payload.boatName) throw new Error("boatName requis");
        if (!payload.startDate || !payload.endDate) throw new Error("Dates requises");

        await api(`/catways/${catwayNumber}/reservations`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // recharge la liste pour ce catway
        await loadReservations(catwayNumber);
        form.reset();
      } catch (e2) {
        showError(e2);
      }
    });

    // petit bonus: recharger la liste dès qu'on tape un catwayNumber
    const catwayInput = form.querySelector('input[name="catwayNumber"]');
    if (catwayInput) {
      catwayInput.addEventListener("change", () => {
        const n = Number(catwayInput.value);
        if (Number.isFinite(n)) loadReservations(n).catch(showError);
      });
    }
  }

  // -------------------------
  // DASHBOARD: réservations en cours
  // -------------------------
  async function loadCurrentReservationsOnDashboard() {
    const tbody = $("#reservations-table");
    if (!tbody) return;

    tbody.innerHTML = "";
    const now = new Date();

    const catways = await api("/catways");
    const current = [];

    // On scanne les réservations par catway (OK si petit dataset)
    for (const c of catways) {
      const list = await api(`/catways/${c.catwayNumber}/reservations`);
      for (const r of list) {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        if (start <= now && now <= end) current.push(r);
      }
    }

    // affichage
    for (const r of current) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.catwayNumber}</td>
        <td>${escapeHtml(r.clientName)}</td>
        <td>${escapeHtml(r.boatName)}</td>
        <td>${formatDate(r.startDate)}</td>
        <td>${formatDate(r.endDate)}</td>
      `;
      tbody.appendChild(tr);
    }

    if (current.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5">Aucune réservation en cours</td>`;
      tbody.appendChild(tr);
    }
  }

  // -------------------------
  // Helpers
  // -------------------------
  function formatDate(d) {
    try {
      return new Date(d).toLocaleDateString("fr-FR");
    } catch {
      return "";
    }
  }
  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("`", "&#096;");
  }

  // -------------------------
  // Init selon la page
  // -------------------------
  try {
    bindCreateCatway();
    bindCreateUser();
    bindCreateReservation();

    // charge selon ce qui existe dans la page
    if ($("#catways-table")) await loadCatways();
    if ($("#users-table")) await loadUsers();

    // reservations page: si input catwayNumber existe, on attend la saisie
    if ($("#create-reservation") && $("#reservations-table")) {
      // rien de plus
    }

    // dashboard
    if (location.pathname === "/dashboard" && $("#reservations-table")) {
      await loadCurrentReservationsOnDashboard();
    }
  } catch (e) {
    showError(e);
  }
})();
