(function () {
  "use strict";
  const STORAGE_KEY = "notefy_items_v1"; //Key For locaStorage
  let items = loadItems();
  let currentFilter = "all";
  let currentSearch = "";
  let currentSort = "newest";
  let currentType = "diary";
  let selectedMood = "🙂";
  let notifiedIds = new Set(loadNotified());
  // Dom ELements WHre iam lazy and i copy paste it :))
  const el = {
    grid: document.getElementById("cardGrid"),
    skeletonGrid: document.getElementById("skeletonGrid"),
    emptyState: document.getElementById("emptyState"),
    viewTitle: document.getElementById("viewTitle"),
    viewSubtitle: document.getElementById("viewSubtitle"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    navFilters: document.getElementById("navFilters"),
    btnAdd: document.getElementById("btnAdd"),
    btnAddEmpty: document.getElementById("btnAddEmpty"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalBox: document.getElementById("modalBox"),
    modalTitle: document.getElementById("modalTitle"),
    modalClose: document.getElementById("modalClose"),
    btnCancel: document.getElementById("btnCancel"),
    typeTabs: document.getElementById("typeTabs"),
    itemForm: document.getElementById("itemForm"),
    editId: document.getElementById("editId"),
    fieldTitle: document.getElementById("fieldTitle"),
    fieldContent: document.getElementById("fieldContent"),
    fieldDate: document.getElementById("fieldDate"),
    dateField: document.getElementById("dateField"),
    fieldRenderHtml: document.getElementById("fieldRenderHtml"),
    htmlToggleField: document.getElementById("htmlToggleField"),
    moodRow: document.getElementById("moodRow"),
    moodOptions: document.querySelectorAll(".mood-btn"),
    toast: document.getElementById("toast"),
    clock: document.getElementById("clock"),
    today: document.getElementById("today"),
    countAll: document.getElementById("countAll"),
    countDiary: document.getElementById("countDiary"),
    countNote: document.getElementById("countNote"),
    countReminder: document.getElementById("countReminder"),
    countFav: document.getElementById("countFav"),
    reminderAlert: document.getElementById("reminderAlert"),
    reminderAlertTitle: document.getElementById("reminderAlertTitle"),
    reminderAlertText: document.getElementById("reminderAlertText"),
    reminderAlertClose: document.getElementById("reminderAlertClose"),
  };
  const TYPE_LABELS = {
    diary: { label: "Diary", emoji: "📔" },
    note: { label: "Note", emoji: "🗒️" },
    reminder: { label: "Reminder", emoji: "⏰" },
  };
  const VIEW_TITLES = {
    all: ["All Notes", "Everything you saved is right here"],
    diary: ["Your Diary", "Your daily stories and feelings"],
    note: ["Notes", "Important things worth remembering"],
    reminder: ["Reminders", "Don't miss out!"],
    favorite: ["Favorites", "The ones closest to your heart"],
  };
  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load NoteFy data:", e);
      return [];
    }
  }
  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save NoteFy data:", e);
      showToast("Failed to save data 😢");
    }
  }
  function loadNotified() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + "_notified");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveNotified() {
    localStorage.setItem(
      STORAGE_KEY + "_notified",
      JSON.stringify(Array.from(notifiedIds))
    );
  }
  function uid() {
    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }
  function render() {
    const filtered = getFilteredItems();
    el.grid.innerHTML = "";
    const [title, subtitle] = VIEW_TITLES[currentFilter] || VIEW_TITLES.all;
    el.viewTitle.textContent = title;
    el.viewSubtitle.textContent = subtitle;
    if (filtered.length === 0) {
      el.emptyState.classList.add("show");
    } else {
      el.emptyState.classList.remove("show");
      filtered.forEach((item) => el.grid.appendChild(buildCard(item)));
    }
    updateCounts();
  }
  function getFilteredItems() {
    let list = [...items];
    if (currentFilter === "favorite") {
      list = list.filter((i) => i.favorite);
    } else if (currentFilter !== "all") {
      list = list.filter((i) => i.type === currentFilter);
    }
    if (currentSearch.trim()) {
      const q = currentSearch.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (currentSort === "newest") return b.createdAt - a.createdAt;
      if (currentSort === "oldest") return a.createdAt - b.createdAt;
      if (currentSort === "az") return a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }
  function buildCard(item) {
    const card = document.createElement("div");
    const isOverdue =
      item.type === "reminder" &&
      item.reminderAt &&
      item.reminderAt < Date.now() &&
      !item.done;
    card.className = `card type-${item.type}${isOverdue ? " overdue" : ""}`;
    card.dataset.id = item.id;
    const typeInfo = TYPE_LABELS[item.type];
    const isHtmlDiary = item.type === "diary" && item.renderHtml;
    card.innerHTML = `
      <div class="card-top">
        <div class="card-tag-group">
          <span class="card-tag">${typeInfo.emoji} ${typeInfo.label}</span>
          ${isHtmlDiary ? `<span class="card-tag-html">&lt;/&gt; HTML</span>` : ""}
        </div>
        ${item.mood ? `<span class="card-mood">${item.mood}</span>` : ""}
      </div>
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      ${
        isHtmlDiary
          ? `<div class="card-content-html"></div>`
          : `<p class="card-content">${escapeHtml(item.content)}</p>`
      }
      ${
        item.type === "reminder" && item.reminderAt
          ? `<div class="card-reminder-time">${isOverdue ? "⚠️ Overdue: " : "🔔 "}${formatDateTime(item.reminderAt)}</div>`
          : ""
      }
      <div class="card-date">Created ${formatDateTime(item.createdAt)}</div>
      <div class="card-actions">
        <button class="icon-btn fav ${item.favorite ? "active" : ""}" data-action="fav" title="Favorite">${item.favorite ? "⭐" : "☆"}</button>
        <button class="icon-btn" data-action="edit" title="Edit">✏️</button>
        <button class="icon-btn" data-action="delete" title="Delete">🗑️</button>
      </div>
    `;
    if (isHtmlDiary) {
      card.querySelector(".card-content-html").innerHTML = item.content;}
    card.querySelector('[data-action="fav"]').addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(item.id);
    });
    card.querySelector('[data-action="edit"]').addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(item.id);
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", (e) => {
      e.stopPropagation();
      deleteItem(item.id);
    });

    return card;
  }
  function updateCounts() {
    el.countAll.textContent = items.length;
    el.countDiary.textContent = items.filter((i) => i.type === "diary").length;
    el.countNote.textContent = items.filter((i) => i.type === "note").length;
    el.countReminder.textContent = items.filter((i) => i.type === "reminder").length;
    el.countFav.textContent = items.filter((i) => i.favorite).length;
  }
  function addItem(data) {
    const newItem = {
      id: uid(),
      type: data.type,
      title: data.title,
      content: data.content,
      mood: data.type === "diary" ? data.mood : null,
      reminderAt: data.type === "reminder" && data.reminderAt ? data.reminderAt : null,
      renderHtml: data.type === "diary" ? !!data.renderHtml : false,
      favorite: false,
      done: false,
      createdAt: Date.now(),
    };
    items.push(newItem);
    saveItems();
    render();
    showToast("Saved! 🎉");
  }
  function updateItem(id, data) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    items[idx] = {
      ...items[idx],
      type: data.type,
      title: data.title,
      content: data.content,
      mood: data.type === "diary" ? data.mood : null,
      reminderAt: data.type === "reminder" && data.reminderAt ? data.reminderAt : null,
      renderHtml: data.type === "diary" ? !!data.renderHtml : false,
    };
    saveItems();
    render();
    showToast("Changes saved ✅");
  }
  function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    items = items.filter((i) => i.id !== id);
    saveItems();
    render();
    showToast("Item deleted 🗑️");
  }
  function toggleFavorite(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.favorite = !item.favorite;
    saveItems();
    render();
  }
  function openAddModal() {
    el.modalTitle.textContent = "Add New";
    el.editId.value = "";
    el.itemForm.reset();
    selectedMood = "🙂";
    setMoodSelection(selectedMood);
    el.fieldRenderHtml.checked = false;
    setActiveTypeTab(currentFilter === "reminder" ? "reminder" : currentFilter === "note" ? "note" : "diary");
    toggleModal(true);
  }
  function openEditModal(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    el.modalTitle.textContent = "Edit Item";
    el.editId.value = item.id;
    el.fieldTitle.value = item.title;
    el.fieldContent.value = item.content;
    selectedMood = item.mood || "🙂";
    setMoodSelection(selectedMood);
    el.fieldRenderHtml.checked = !!item.renderHtml;
    if (item.type === "reminder" && item.reminderAt) {
      el.fieldDate.value = toDatetimeLocalValue(item.reminderAt);
    } else {
      el.fieldDate.value = "";
    }
    setActiveTypeTab(item.type);
    toggleModal(true);
  }
  function toggleModal(show) {
    el.modalOverlay.classList.toggle("show", show);
  }
  function setActiveTypeTab(type) {
    currentType = type;
    el.typeTabs.querySelectorAll(".type-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.type === type);
    });
    el.moodRow.style.display = type === "diary" ? "block" : "none";
    el.htmlToggleField.classList.toggle("hidden", type !== "diary");
    el.dateField.classList.toggle("hidden", type !== "reminder");
    el.fieldDate.required = type === "reminder";
  }
  function setMoodSelection(mood) {
    selectedMood = mood;
    el.moodOptions.forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.mood === mood);
    });
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    const title = el.fieldTitle.value.trim();
    const content = el.fieldContent.value.trim();
    if (!title || !content) {
      showToast("Title and content cannot be empty!");
      return;
    }
    let reminderAt = null;
    if (currentType === "reminder") {
      if (!el.fieldDate.value) {
        showToast("Please pick a reminder date & time first!");
        return;
      }
      reminderAt = new Date(el.fieldDate.value).getTime();
    }
    const data = {
      type: currentType,
      title,
      content,
      mood: selectedMood,
      reminderAt,
      renderHtml: currentType === "diary" ? el.fieldRenderHtml.checked : false,
    };
    const editId = el.editId.value;
    if (editId) {
      updateItem(editId, data);
    } else {
      addItem(data);
    }
    toggleModal(false);
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function formatDateTime(timestamp) {
    const d = new Date(timestamp);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return d.toLocaleString("en-US", options);
  }
  function toDatetimeLocalValue(timestamp) {
    const d = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  let toastTimer = null;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }
  function updateClock() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    el.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    el.today.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  function checkReminders() {
    const now = Date.now();
    items.forEach((item) => {
      if (
        item.type === "reminder" &&
        item.reminderAt &&
        item.reminderAt <= now &&
        item.reminderAt > now - 60000 &&
        !notifiedIds.has(item.id)
      ) {
        triggerReminderAlert(item);
        notifiedIds.add(item.id);
        saveNotified();
      }
    });
    render();
  }
  function triggerReminderAlert(item) {
    el.reminderAlertTitle.textContent = item.title;
    el.reminderAlertText.textContent = item.content;
    el.reminderAlert.classList.add("show");
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }
  el.btnAdd.addEventListener("click", openAddModal);
  el.btnAddEmpty.addEventListener("click", openAddModal);
  el.modalClose.addEventListener("click", () => toggleModal(false));
  el.btnCancel.addEventListener("click", () => toggleModal(false));
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) toggleModal(false);
  });
  el.itemForm.addEventListener("submit", handleFormSubmit);
  el.typeTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".type-tab");
    if (!tab) return;
    setActiveTypeTab(tab.dataset.type);
  });
  el.moodOptions.forEach((btn) => {
    btn.addEventListener("click", () => setMoodSelection(btn.dataset.mood));
  });
  el.navFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    el.navFilters.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
  el.searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    render();
  });
  el.sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    render();
  });
  el.reminderAlertClose.addEventListener("click", () => {
    el.reminderAlert.classList.remove("show");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleModal(false);
      el.reminderAlert.classList.remove("show");
    }
  });
  function init() {
    setActiveTypeTab("diary");
    setMoodSelection("🙂");
    updateClock();
    setInterval(updateClock, 1000);
    el.grid.classList.add("hide");
    setTimeout(() => {
      el.skeletonGrid.classList.add("hide");
      el.grid.classList.remove("hide");
      checkReminders();
      setInterval(checkReminders, 15000);
      render();
    }, 700);
  }

  init();
})();
