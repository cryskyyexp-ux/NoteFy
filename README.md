# 🌻 NoteFy

NoteFy is a lightweight, all-in-one web app for keeping your **diary entries**, **notes**, and **reminders** in one cozy, bright-yellow, glassmorphism-styled place — no backend, no sign-up, no dependencies to install.

![type: static web app](https://img.shields.io/badge/type-static%20web%20app-FFD60A?style=flat-square)
![stack: HTML • CSS • JS](https://img.shields.io/badge/stack-HTML%20%E2%80%A2%20CSS%20%E2%80%A2%20JS-FFA800?style=flat-square)
![storage: localStorage](https://img.shields.io/badge/storage-localStorage-2B2410?style=flat-square)

---

## ✨ Features

- **Three item types** — Diary (with a daily mood picker), Notes, and Reminders (with a specific date & time).
- **Full CRUD** — create, edit, delete, and mark any item as a favorite.
- **Smart sidebar filters** — All, Diary, Notes, Reminders, Favorites, each with a live count.
- **Search & sort** — instantly search by title/content, and sort by newest, oldest, or A–Z.
- **Reminder alerts** — a pop-up (with a short notification sound) fires automatically when a reminder's time arrives; overdue reminders are highlighted in red.
- **Live clock & date** in the sidebar.
- **HTML-powered diary entries** — enable "Render content as HTML" on any diary entry to write raw HTML/CSS and have it rendered live on the card, instead of shown as plain text. Great for custom layouts, embedded widgets, styled text, etc.
- **Persistent storage** — everything is saved automatically to your browser's `localStorage`, so your data survives page refreshes and browser restarts.
- **Fully responsive** — works on desktop, tablet, and mobile.
- **Custom SVG logo** — used both in the sidebar and as the browser favicon.

---

## 📁 Project Structure

```
notefy/
├── index.html   # Page structure & markup
├── style.css    # Bright-yellow glassmorphism styling
├── script.js    # All app logic (state, rendering, storage, reminders)
└── logo.svg     # NoteFy logo / favicon
```

The project is intentionally split into separate HTML / CSS / JS files with no build step and no external JS frameworks — just open `index.html` in a browser.

---

## 🍙 Getting Started

1. Download all four files (`index.html`, `style.css`, `script.js`, `logo.svg`) into the **same folder**.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Start writing! Click **"+ Add New"** to create your first diary entry, note, or reminder.

No installation, server, or internet connection required after the first load (only the Google Fonts request needs network access; the app still works offline with fallback fonts).

---

## 📝 Usage Guide

### Adding an item
1. Click **"+ Add New"** in the sidebar (or the button in the empty state).
2. Pick a type: **Diary**, **Note**, or **Reminder**.
3. Fill in the title and content.
   - For **Diary**, optionally pick a mood emoji.
   - For **Reminder**, pick a date & time — you'll get an alert when it arrives.
4. Click **Save**.

### Writing HTML in your diary
1. Create or edit a **Diary** entry.
2. Check **"Render content as HTML"**.
3. Type any HTML/CSS/JS-free markup in the content box (e.g. `<h2>Hello</h2><p style="color:red">Styled text</p>`).
4. The card will render it live and show an `</> HTML` badge.

> ⚠️ Because this is rendered as real HTML inside your own browser, only paste content you trust — the same way you would with any personal, single-user note-taking app.

### Managing items
- ⭐ **Favorite** — toggle from any card, or filter by "Favorites" in the sidebar.
- ✏️ **Edit** — opens the same form pre-filled with the item's data.
- 🗑️ **Delete** — asks for confirmation before removing an item permanently.
- 🔍 **Search** — filters by title and content across the currently selected view.
- ↕️ **Sort** — Newest, Oldest, or A–Z from the top bar.

---

## 💾 Data & Privacy

All data lives **only in your browser's `localStorage`** — nothing is sent to a server. This means:

- Your notes are private to the browser/device you used to create them.
- Clearing your browser data/cache will erase your NoteFy items.
- Data does **not** sync across devices or browsers.

---

## 🛠️ Built With

- Vanilla **HTML5**
- Vanilla **CSS3** (custom properties, backdrop-filter, grid/flexbox)
- Vanilla **JavaScript** (ES6+, no frameworks, no build tools)
- Web Audio API for the reminder alert sound
- Browser `localStorage` for persistence

---

## 📄 License

Free to use, modify, and share for personal or educational purposes.
