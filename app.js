/* ============================
   HABITRY — app.js
   Full habit tracker logic with localStorage persistence
   ============================ */

// ── CONFIG ──────────────────────────────────────────────
const CAT_ICONS = {
  exercise:    '🏃',
  nutrition:   '🥗',
  sleep:       '😴',
  hydration:   '💧',
  mindfulness: '🧘',
  other:       '✦',
};

const CAT_COLORS = {
  exercise:    { bg: 'rgba(74,222,158,0.12)',   text: '#4ade9e' },
  nutrition:   { bg: 'rgba(96,165,250,0.12)',   text: '#60a5fa' },
  sleep:       { bg: 'rgba(167,139,250,0.12)',  text: '#a78bfa' },
  hydration:   { bg: 'rgba(245,158,68,0.12)',   text: '#f59e44' },
  mindfulness: { bg: 'rgba(244,114,182,0.12)',  text: '#f472b6' },
  other:       { bg: 'rgba(248,113,113,0.12)',  text: '#f87171' },
};

const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── TEMPLATES ────────────────────────────────────────────
const HABIT_TEMPLATES = [
  { name: 'Morning workout', cat: 'exercise', freq: 'daily', note: '30 minutes', reminder: '06:00' },
  { name: 'Meditation', cat: 'mindfulness', freq: 'daily', note: '10 minutes', reminder: '07:00' },
  { name: 'Read', cat: 'mindfulness', freq: 'daily', note: '30 minutes', reminder: '20:00' },
  { name: 'Drink water', cat: 'hydration', freq: 'daily', note: '8 glasses', reminder: '09:00' },
  { name: 'Eat vegetables', cat: 'nutrition', freq: 'daily', note: '2+ servings', reminder: '12:00' },
  { name: 'Sleep early', cat: 'sleep', freq: 'daily', note: '7-8 hours', reminder: '22:00' },
  { name: 'Yoga', cat: 'exercise', freq: '3x/week', note: '20 minutes', reminder: '18:00' },
  { name: 'Journal', cat: 'mindfulness', freq: 'daily', note: '5 minutes', reminder: '21:00' },
  { name: 'Walk', cat: 'exercise', freq: 'daily', note: '10k steps', reminder: '14:00' },
  { name: 'Healthy meal prep', cat: 'nutrition', freq: '3x/week', note: 'Sunday, Wed, Fri', reminder: '18:00' },
];

// ── STATE ────────────────────────────────────────────────
let habits = [];
let editingId = null;
let currentFilter = 'all'; // For charts filtering

// ── STORAGE ──────────────────────────────────────────────
function loadHabits() {
  try {
    const saved = localStorage.getItem('habitry_habits');
    habits = saved ? JSON.parse(saved) : getDefaultHabits();
  } catch {
    habits = getDefaultHabits();
  }
}

function saveHabits() {
  localStorage.setItem('habitry_habits', JSON.stringify(habits));
}

function getDefaultHabits() {
  const today = new Date();
  return [
    {
      id: 1,
      name: 'Morning run',
      cat: 'exercise',
      freq: 'daily',
      note: 'At least 20 minutes',
      history: generateHistory(5, today),
      createdAt: today.toISOString(),
    },
    {
      id: 2,
      name: 'Drink 2L water',
      cat: 'hydration',
      freq: 'daily',
      note: '',
      history: generateHistory(3, today),
      createdAt: today.toISOString(),
    },
    {
      id: 3,
      name: 'Eat vegetables',
      cat: 'nutrition',
      freq: 'daily',
      note: 'At least 2 servings',
      history: generateHistory(7, today),
      createdAt: today.toISOString(),
    },
  ];
}

function generateHistory(streak, fromDate) {
  const h = {};
  for (let i = 0; i < streak; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() - i);
    h[dateKey(d)] = true;
  }
  return h;
}

// ── DATE HELPERS ─────────────────────────────────────────
const TODAY = new Date();

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todayKey() { return dateKey(TODAY); }

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function getStreak(habit) {
  let streak = 0;
  const d = new Date(TODAY);
  while (habit.history[dateKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getBestStreak(habit) {
  let max = 0, cur = 0;
  for (let i = 29; i >= 0; i--) {
    const d = offsetDate(TODAY, -i);
    if (habit.history[dateKey(d)]) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  }
  return max;
}

function weekCompletion(habit) {
  let done = 0;
  for (let i = 6; i >= 0; i--) {
    const d = offsetDate(TODAY, -i);
    if (habit.history[dateKey(d)]) done++;
  }
  return done;
}

// ── TOGGLE ───────────────────────────────────────────────
function toggleDay(id, key) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;
  if (habit.history[key]) {
    delete habit.history[key];
  } else {
    habit.history[key] = true;
  }
  saveHabits();
  render();
}

// ── DELETE ───────────────────────────────────────────────
function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  render();
  showToast('Habit deleted');
}

// ── MODAL ────────────────────────────────────────────────
function openModal(editId = null, habit = null) {
  editingId = editId;
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');

  if (editId && habit) {
    title.textContent = 'Edit Habit';
    document.getElementById('habitName').value = habit.name;
    document.getElementById('habitCat').value = habit.cat;
    document.getElementById('habitFreq').value = habit.freq;
    document.getElementById('habitNote').value = habit.note || '';
    document.getElementById('habitReminder').value = habit.reminder || '';
  } else {
    title.textContent = 'New Habit';
    document.getElementById('habitName').value = '';
    document.getElementById('habitCat').value = 'exercise';
    document.getElementById('habitFreq').value = 'daily';
    document.getElementById('habitNote').value = '';
    document.getElementById('habitReminder').value = '';
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('habitName').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null;
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) {
    document.getElementById('habitName').focus();
    showToast('Please enter a habit name');
    return;
  }

  const cat  = document.getElementById('habitCat').value;
  const freq = document.getElementById('habitFreq').value;
  const note = document.getElementById('habitNote').value.trim();
  const reminder = document.getElementById('habitReminder').value;

  if (editingId) {
    const habit = habits.find(h => h.id === editingId);
    habit.name = name;
    habit.cat  = cat;
    habit.freq = freq;
    habit.note = note;
    habit.reminder = reminder;
    showToast('Habit updated ✓');
  } else {
    habits.push({
      id: Date.now(),
      name, cat, freq, note, reminder,
      history: {},
      createdAt: new Date().toISOString(),
    });
    showToast('Habit added ✓');
  }

  saveHabits();
  closeModal();
  render();
}

// ── THEME TOGGLE ─────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = !document.body.classList.contains('light-theme');
  
  if (isDark) {
    document.body.classList.add('light-theme');
    localStorage.setItem('habitry_theme', 'light');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    localStorage.setItem('habitry_theme', 'dark');
    document.getElementById('themeToggleBtn').textContent = '🌙';
  }
}

function initTheme() {
  const theme = localStorage.getItem('habitry_theme') || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  }
}

// ── EXPORT / IMPORT ──────────────────────────────────────
function exportData() {
  const data = {
    habits,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitry-backup-${dateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Data exported!');
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.habits && Array.isArray(data.habits)) {
        if (confirm('Replace all habits? This cannot be undone.')) {
          habits = data.habits;
          saveHabits();
          render();
          showToast('✓ Data imported!');
        }
      }
    } catch {
      showToast('Invalid file format');
    }
  };
  reader.readAsText(file);
}

// ── TEMPLATES ────────────────────────────────────────────
function openTemplates() {
  const list = document.getElementById('templates-list');
  list.innerHTML = HABIT_TEMPLATES.map(t => `
    <div style="padding:10px;background:var(--bg-4);border-radius:8px;border:1px solid var(--border);cursor:pointer" onclick="addFromTemplate('${t.name}', '${t.cat}', '${t.freq}', '${t.note}', '${t.reminder}')">
      <div style="font-weight:500;color:var(--text)">${t.name}</div>
      <div style="font-size:12px;color:var(--text-3);margin-top:2px">${CAT_ICONS[t.cat]} ${t.cat} • ${t.freq} ${t.reminder ? '• ' + t.reminder : ''}</div>
    </div>
  `).join('');
  document.getElementById('templatesOverlay').classList.add('open');
}

function closeTemplates() {
  document.getElementById('templatesOverlay').classList.remove('open');
}

function addFromTemplate(name, cat, freq, note, reminder) {
  habits.push({
    id: Date.now(),
    name, cat, freq, note, reminder,
    history: {},
    createdAt: new Date().toISOString(),
  });
  saveHabits();
  closeTemplates();
  render();
  showToast(`✓ "${name}" added from template!`);
}

// ── REMINDERS ────────────────────────────────────────────
function openReminders() {
  const list = document.getElementById('reminders-list');
  const reminders = habits.filter(h => h.reminder);
  
  if (reminders.length === 0) {
    list.innerHTML = '<p style="color:var(--text-3);text-align:center">No reminders set</p>';
  } else {
    list.innerHTML = reminders.map(h => `
      <div style="padding:10px;background:var(--bg-4);border-radius:8px;border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:500;color:var(--text)">${h.name}</div>
          <div style="font-size:12px;color:var(--text-3)">⏰ ${h.reminder}</div>
        </div>
        <button class="delete-btn" onclick="clearReminder(${h.id})" title="Clear">✕</button>
      </div>
    `).join('');
  }
  
  document.getElementById('remindersOverlay').classList.add('open');
}

function closeReminders() {
  document.getElementById('remindersOverlay').classList.remove('open');
}

function clearReminder(id) {
  const habit = habits.find(h => h.id === id);
  if (habit) {
    habit.reminder = '';
    saveHabits();
    openReminders();
    showToast('Reminder cleared');
  }
}

function scheduleReminders() {
  habits.forEach(h => {
    if (h.reminder && Notification.permission === 'granted') {
      const [hours, minutes] = h.reminder.split(':');
      const now = new Date();
      let remindTime = new Date();
      remindTime.setHours(parseInt(hours), parseInt(minutes), 0);
      
      if (remindTime <= now) {
        remindTime.setDate(remindTime.getDate() + 1);
      }
      
      const diff = remindTime - now;
      setTimeout(() => {
        new Notification('Habitry Reminder', {
          body: `Time to: ${h.name}`,
          icon: '🔥',
          tag: `habitry-${h.id}`
        });
        scheduleReminders();
      }, diff);
    }
  });
}

// ── EDIT HABIT ───────────────────────────────────────────
function editHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;
  openModal(id, habit);
}

// ── Statistics Filter ────────────────────────────────────
function setChartFilter(filter) {
  currentFilter = filter;
  renderCharts();
}

// ── TOAST ────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ── NAVIGATION ───────────────────────────────────────────
let currentView = 'today';

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
}

// ── HEADER ───────────────────────────────────────────────
function renderHeader() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateEl = document.getElementById('headerDate');
  dateEl.innerHTML = `${days[TODAY.getDay()]}<strong>${months[TODAY.getMonth()]} ${TODAY.getDate()}, ${TODAY.getFullYear()}</strong>`;

  const doneToday = habits.filter(h => h.history[todayKey()]).length;
  const total = habits.length;
  const bestStreak = habits.reduce((m, h) => Math.max(m, getBestStreak(h)), 0);
  const weekTotal = habits.length * 7;
  const weekDone  = habits.reduce((s, h) => s + weekCompletion(h), 0);
  const weekPct   = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

  document.getElementById('headerStats').innerHTML = `
    <div class="hstat">
      <div class="hstat-val green">${doneToday}/${total}</div>
      <div class="hstat-label">Today</div>
    </div>
    <div class="hstat">
      <div class="hstat-val amber">${bestStreak}d</div>
      <div class="hstat-label">Best streak</div>
    </div>
    <div class="hstat">
      <div class="hstat-val blue">${weekPct}%</div>
      <div class="hstat-label">This week</div>
    </div>
  `;
}

// ── TODAY VIEW ───────────────────────────────────────────
function renderToday() {
  const container = document.getElementById('today-habits');
  const empty = document.getElementById('today-empty');

  if (!habits.length) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = habits.map(h => {
    const done   = !!h.history[todayKey()];
    const streak = getStreak(h);
    const color  = CAT_COLORS[h.cat] || CAT_COLORS.other;

    const dots = Array.from({ length: 7 }, (_, i) => {
      const d = offsetDate(TODAY, i - 6);
      const k = dateKey(d);
      const filled  = !!h.history[k];
      const isToday = k === todayKey();
      return `<div class="wd ${filled ? 'filled' : ''} ${isToday ? 'today' : ''}"></div>`;
    }).join('');

    return `
      <div class="habit-card ${done ? 'done' : ''}" style="${done ? `border-left: 3px solid ${color.text};` : ''}">
        <div class="card-top">
          <div class="card-info">
            <div class="cat-icon" style="background:${color.bg}">${CAT_ICONS[h.cat]}</div>
            <div>
              <div class="card-name">${escHtml(h.name)}</div>
              ${h.note ? `<div class="card-note">${escHtml(h.note)}</div>` : `<div class="card-note">${h.freq}</div>`}
            </div>
          </div>
          <div class="card-actions">
            <button class="delete-btn" onclick="deleteHabit(${h.id})" title="Delete">✕</button>
            <button class="edit-btn" onclick="editHabit(${h.id})" title="Edit">✏️</button>
            <button class="check-btn ${done ? 'checked' : ''}"
              onclick="toggleDay(${h.id}, '${todayKey()}')"
              title="${done ? 'Mark undone' : 'Mark done'}">
              ${done ? '✓' : ''}
            </button>
          </div>
        </div>
        <div class="card-bottom">
          <div class="week-dots">${dots}</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="freq-tag">${h.freq}</span>
            <span class="streak-pill">🔥 ${streak}d</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── WEEK VIEW ────────────────────────────────────────────
function renderWeek() {
  const container = document.getElementById('week-content');

  const weekDays = Array.from({ length: 7 }, (_, i) => offsetDate(TODAY, i - 6));

  const headerCells = weekDays.map((d, i) => {
    const isToday = dateKey(d) === todayKey();
    return `<th class="${isToday ? 'today-col' : ''}">
      ${DAYS_SHORT[d.getDay()]}<br>
      <span style="font-size:11px">${d.getDate()}</span>
    </th>`;
  }).join('');

  const rows = habits.map(h => {
    const color = CAT_COLORS[h.cat] || CAT_COLORS.other;
    const dayCells = weekDays.map(d => {
      const k = dateKey(d);
      const checked = !!h.history[k];
      const isToday = k === todayKey();
      return `<td class="day-cell">
        <button class="day-check ${checked ? 'checked' : ''} ${isToday ? 'today-btn' : ''}"
          onclick="toggleDay(${h.id}, '${k}')"
          title="${DAYS_SHORT[d.getDay()]} ${d.getDate()}">
          ${checked ? '✓' : ''}
        </button>
      </td>`;
    }).join('');

    const done = weekCompletion(h);
    return `
      <tr>
        <td>
          <div class="habit-cell">
            <span>${CAT_ICONS[h.cat]}</span>
            <span style="color:var(--text)">${escHtml(h.name)}</span>
          </div>
        </td>
        ${dayCells}
        <td style="text-align:center">
          <span style="font-family:var(--mono);font-size:12px;color:${color.text}">${done}/7</span>
        </td>
      </tr>
    `;
  }).join('');

  // Summary row
  const summaryPcts = weekDays.map(d => {
    const k = dateKey(d);
    const done = habits.filter(h => h.history[k]).length;
    const pct  = habits.length > 0 ? Math.round(done / habits.length * 100) : 0;
    return `<td class="week-pct">${pct}%</td>`;
  }).join('');

  container.innerHTML = `
    <table class="week-table">
      <thead>
        <tr>
          <th class="habit-col">Habit</th>
          ${headerCells}
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="week-summary-row">
          <td style="font-size:12px;color:var(--text-3);font-family:var(--mono)">completion</td>
          ${summaryPcts}
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

// ── MONTH VIEW ───────────────────────────────────────────
function renderMonth() {
  const container = document.getElementById('month-content');

  const year  = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  container.innerHTML = habits.map(h => {
    const color = CAT_COLORS[h.cat] || CAT_COLORS.other;
    const totalDone = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return h.history[dateKey(d)] ? 1 : 0;
    }).reduce((a, b) => a + b, 0);

    const dayLabels = DAYS_SHORT.map(d => `<div class="month-day-label">${d.substring(0,1)}</div>`).join('');

    // Empty cells before first day
    const emptyCells = Array.from({ length: firstDay }, () => `<div class="month-day empty"></div>`).join('');

    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month, dayNum);
      const k = dateKey(d);
      const filled  = !!h.history[k];
      const isToday = k === todayKey();
      const isFuture = d > TODAY;
      return `<div class="month-day ${filled ? 'filled' : ''} ${isToday ? 'today' : ''}"
        onclick="${isFuture ? '' : `toggleDay(${h.id}, '${k}')`}"
        style="${isFuture ? 'opacity:0.35;cursor:default' : 'cursor:pointer'}"
        title="${d.toDateString()}">${dayNum}</div>`;
    }).join('');

    const pct = daysInMonth > 0 ? Math.round(totalDone / TODAY.getDate() * 100) : 0;

    return `
      <div class="month-habit-block">
        <div class="month-habit-header">
          <div class="month-habit-name">
            <span>${CAT_ICONS[h.cat]}</span>
            <span>${escHtml(h.name)}</span>
          </div>
          <div class="month-habit-stats" style="color:${color.text}">${totalDone}/${TODAY.getDate()} days · ${pct}%</div>
        </div>
        <div class="month-calendar">
          ${dayLabels}
          ${emptyCells}
          ${dayCells}
        </div>
      </div>
    `;
  }).join('');

  if (!habits.length) container.innerHTML = '<p style="color:var(--text-3);font-size:14px">No habits to display.</p>';
}

// ── CHARTS VIEW ──────────────────────────────────────────
function renderCharts() {
  const container = document.getElementById('charts-content');
  if (!habits.length) {
    container.innerHTML = '<p style="color:var(--text-3);font-size:14px">Add habits to see charts.</p>';
    return;
  }

  // Filter functionality
  const filteredHabits = currentFilter === 'all' ? habits : habits.filter(h => h.cat === currentFilter);
  
  const categories = ['all', ...Object.keys(CAT_ICONS)];
  const filterBtn = categories.map(cat => {
    const isActive = currentFilter === cat;
    const label = cat === 'all' ? 'All' : `${CAT_ICONS[cat]} ${cat}`;
    return `<button style="padding:6px 12px;border:1px solid ${isActive ? 'var(--accent)' : 'var(--border)'};background:${isActive ? 'var(--accent-dim)' : 'transparent'};color:${isActive ? 'var(--accent)' : 'var(--text-2)'};border-radius:6px;cursor:pointer;font-size:12px;transition:all var(--transition)" onclick="setChartFilter('${cat}')">${label}</button>`;
  }).join('');

  let html = `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">${filterBtn}</div>`;

  // 1. Weekly completion bar chart
  const weekDays = Array.from({ length: 7 }, (_, i) => offsetDate(TODAY, i - 6));
  const maxPossible = filteredHabits.length;
  const bars = weekDays.map(d => {
    const k = dateKey(d);
    const done = filteredHabits.filter(h => h.history[k]).length;
    const pct  = maxPossible > 0 ? done / maxPossible : 0;
    const h    = Math.max(4, Math.round(pct * 100));
    const isToday = k === todayKey();
    return `
      <div class="bar-col">
        <div class="bar-fill" style="height:${h}px;background:${isToday ? '#4ade9e' : 'rgba(74,222,158,0.35)'};"></div>
        <div class="bar-day">${DAYS_SHORT[d.getDay()]}</div>
      </div>
    `;
  }).join('');

  // 2. Category distribution ring
  const catCounts = {};
  Object.values(CAT_ICONS).forEach((_, i) => {});
  filteredHabits.forEach(h => {
    catCounts[h.cat] = (catCounts[h.cat] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort((a,b) => b[1]-a[1]);
  const total = filteredHabits.length;

  let offset = 0;
  const circumference = 2 * Math.PI * 38;
  const segments = catEntries.map(([cat, count]) => {
    const frac  = count / total;
    const dash  = frac * circumference;
    const gap   = circumference - dash;
    const color = (CAT_COLORS[cat] || CAT_COLORS.other).text;
    const seg   = `<circle r="38" cx="50" cy="50" fill="none" stroke="${color}" stroke-width="12"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="${(-offset * circumference).toFixed(2)}" />`;
    offset += frac;
    return seg;
  }).join('');

  const legend = catEntries.map(([cat, count]) => {
    const color = (CAT_COLORS[cat] || CAT_COLORS.other).text;
    const pct = Math.round(count / total * 100);
    return `
      <div class="legend-item">
        <div class="legend-dot" style="background:${color}"></div>
        <span>${CAT_ICONS[cat]} ${cat}</span>
        <span class="legend-pct">${pct}%</span>
      </div>
    `;
  }).join('');

  // 3. Streak bars
  const maxStreak = Math.max(...filteredHabits.map(h => getBestStreak(h)), 1);
  const streakBars = filteredHabits.map(h => {
    const s = getBestStreak(h);
    const pct = Math.round(s / maxStreak * 100);
    const color = (CAT_COLORS[h.cat] || CAT_COLORS.other).text;
    return `
      <div class="streak-row">
        <div class="streak-name">${escHtml(h.name)}</div>
        <div class="streak-bar-bg">
          <div class="streak-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="streak-num">${s}d</div>
      </div>
    `;
  }).join('');

  // 4. Overall 30-day stats
  let total30 = 0, possible30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = offsetDate(TODAY, -i);
    const k = dateKey(d);
    possible30 += filteredHabits.length;
    total30 += filteredHabits.filter(h => h.history[k]).length;
  }
  const overall = possible30 > 0 ? Math.round(total30 / possible30 * 100) : 0;
  const currentStreaks = filteredHabits.map(h => getStreak(h));
  const avgStreak = filteredHabits.length > 0 ? Math.round(currentStreaks.reduce((a,b) => a+b, 0) / filteredHabits.length) : 0;

  html += `
    <div class="chart-card">
      <div class="chart-card-title">◫ Weekly completion</div>
      <div class="bar-chart">${bars}</div>
    </div>

    <div class="chart-card">
      <div class="chart-card-title">◉ By category</div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="100" height="100" viewBox="0 0 100 100" style="transform:rotate(-90deg)">
          <circle r="38" cx="50" cy="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
          ${segments}
        </svg>
        <div class="ring-legend">${legend}</div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-card-title">◬ Best streaks</div>
      <div class="streak-bars">${streakBars}</div>
    </div>

    <div class="chart-card">
      <div class="chart-card-title">◈ 30-day summary</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
        <div style="background:var(--bg-4);border-radius:8px;padding:1rem;text-align:center;">
          <div style="font-size:28px;font-weight:500;font-family:var(--mono);color:#4ade9e">${overall}%</div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-top:4px">Overall rate</div>
        </div>
        <div style="background:var(--bg-4);border-radius:8px;padding:1rem;text-align:center;">
          <div style="font-size:28px;font-weight:500;font-family:var(--mono);color:#f59e44">${avgStreak}d</div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-top:4px">Avg streak</div>
        </div>
        <div style="background:var(--bg-4);border-radius:8px;padding:1rem;text-align:center;">
          <div style="font-size:28px;font-weight:500;font-family:var(--mono);color:#60a5fa">${filteredHabits.length}</div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-top:4px">Total habits</div>
        </div>
        <div style="background:var(--bg-4);border-radius:8px;padding:1rem;text-align:center;">
          <div style="font-size:28px;font-weight:500;font-family:var(--mono);color:#a78bfa">${total30}</div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-top:4px">Check-ins (30d)</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ── RENDER ───────────────────────────────────────────────
function render() {
  renderHeader();
  renderToday();
  renderWeek();
  renderMonth();
  renderCharts();
}

// ── UTILS ────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── EVENT LISTENERS ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadHabits();
  render();
  
  // Request notification permission for reminders
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  scheduleReminders();

  // Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Add habit button (sidebar)
  document.getElementById('openModalBtn').addEventListener('click', () => openModal());

  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Templates
  document.getElementById('templatesBtn').addEventListener('click', openTemplates);

  // Reminders
  document.getElementById('remindersViewBtn').addEventListener('click', openReminders);

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Modal overlay click to close
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  document.getElementById('templatesOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('templatesOverlay')) closeTemplates();
  });

  document.getElementById('remindersOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('remindersOverlay')) closeReminders();
  });

  // Enter key in modal
  document.getElementById('habitName').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveHabit();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'n' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) {
      openModal();
    }
    if (e.key === 'Escape') {
      closeModal();
      closeTemplates();
      closeReminders();
    }
  });
});
