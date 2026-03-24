# Habitry — Habit Tracker

A beautiful, dark-themed habit tracking web app built with vanilla JavaScript. Track daily habits across multiple categories, visualize streaks and progress, and stay motivated with real-time statistics.

## Features

✨ **Today's View**
- Quick habit check-in cards with visual completion status
- 7-day streak indicator dots
- Current streak counter with fire emoji 🔥
- Color-coded by category
- Edit & delete buttons (hover to reveal)

📊 **Week View**
- Table showing all habits and last 7 days
- Daily completion toggles
- Per-habit progress (X/7 days)
- Weekly completion percentages

📅 **Month View**
- Calendar grid for each habit
- Visual progress tracking across the entire month
- Completion rate percentage
- Future days disabled (light opacity)

📈 **Charts & Analytics**
- Weekly completion bar chart
- Category distribution ring chart
- Best streak comparison bars
- 30-day summary stats (overall rate, avg streak, total habits, check-ins)
- **NEW:** Filter by category

🎯 **Core Features**
- Create, **edit**, and delete habits
- Assign category (Exercise, Nutrition, Sleep, Hydration, Mindfulness, Other)
- Set frequency (Daily, 3× per week, Weekdays, Weekends)
- Add optional goal/notes
- **NEW:** Set reminder times (browser notifications)
- **NEW:** Quick habit templates (10 presets)
- **NEW:** Export/import data as JSON
- **NEW:** Theme toggle (light/dark mode)
- Persistent storage via localStorage
- Toast notifications for user feedback
- Keyboard shortcuts (N for new habit, Esc to close modal)
- Responsive design (mobile-friendly)
- Dark & light themes with accent colors

## Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies needed!

### Installation

1. Clone or download this project
2. Open `index.html` in your browser
3. Start tracking habits!

## Project Structure

```
habit-tracker/
├── index.html       # HTML structure & UI
├── style.css        # Dark theme styles (responsive)
├── app.js           # All state, logic, and rendering
└── README.md        # This file
```

## State & Storage

### Data Model

Each habit object contains:
```javascript
{
  id: timestamp,              // Unique identifier
  name: string,               // Habit name
  cat: string,                // Category key
  freq: string,               // Frequency setting
  note: string,               // Optional note/goal
  history: {
    'YYYY-MM-DD': true,       // Completion dates
    ...
  },
  createdAt: ISO string       // Creation timestamp
}
```

Habits are stored in `localStorage` under the key `habitry_habits` as a JSON array.

### Key Functions

**State Management**
- `loadHabits()` — Load from localStorage or set defaults
- `saveHabits()` — Save to localStorage
- `getDefaultHabits()` — Generate 3 sample habits

**Habit Operations**
- `toggleDay(id, key)` — Toggle completion for a date
- `deleteHabit(id)` — Remove a habit
- `saveHabit()` — Create or update habit

**Calculations**
- `getStreak(habit)` — Current streak count
- `getBestStreak(habit)` — Best streak in last 30 days
- `weekCompletion(habit)` — Days completed this week

**Rendering**
- `render()` — Full page re-render
- `renderToday()` — Today view
- `renderWeek()` — Week view
- `renderMonth()` — Month view
- `renderCharts()` — Charts view
- `renderHeader()` — Header stats

## UI Components

### Colors & Theme

CSS variables (dark theme):
- `--bg`: Main background (#0d0d0f)
- `--accent`: Primary green (#4ade9e)
- `--amber`: Warning/streak color (#f59e44)
- `--blue`: Data color (#60a5fa)
- `--text`: Main text (#f0f0f2)
- `--text-3`: Muted text (#5a5a68)

Category colors (emoji + overlay):
- 🏃 Exercise — Green
- 🥗 Nutrition — Blue
- 😴 Sleep — Purple
- 💧 Hydration — Amber
- 🧘 Mindfulness — Pink
- ✦ Other — Red

### Typography

- **Font**: DM Sans (body), DM Mono (monospace)
- **Sizes**: 13px (labels), 14px (body), 22px (headers)
- **Weights**: 300, 400, 500

### Responsive Breakpoints

- **Desktop**: Full sidebar + main content
- **Mobile** (≤680px): Collapsed sidebar (icon-only), single-column layouts

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Open new habit modal |
| `Enter` | Save habit (in modal) |
| `Esc` | Close modal/overlay |

## New Quick Enhancements 🔥

### 1️⃣ **Edit Habits** ✏️
- Hover over habit cards to reveal the edit button
- Click to modify habit details (name, category, frequency, notes, reminder)
- Changes save instantly

### 2️⃣ **Export Data** 📥
- Click the export button in sidebar (📥)
- Downloads a JSON backup of all habits and history
- Automatically named with today's date
- Great for manual backups or moving data

### 3️⃣ **Theme Toggle** 🌙/☀️
- Click the theme button in sidebar
- Instantly switches between dark and light themes
- Preference is saved in browser storage
- Perfect for different lighting conditions

### 4️⃣ **Habit Templates** ⚡
- 10 pre-configured habit templates included:
  - Morning workout, Meditation, Read
  - Drink water, Eat vegetables, Sleep early
  - Yoga, Journal, Walk, Meal prep
- Click ⚡ button to see all templates
- Click any template to instantly add it with preset details

### 5️⃣ **Reminders** ⏰
- Set reminder time when creating/editing a habit
- Browser sends notification at your set time
- Manage all reminders from ⏰ button in sidebar
- View active reminders and clear them individually
- *Requires notification permission*

### 6️⃣ **Statistics Filters** 🎯
- Go to Charts view
- Click category filter buttons to focus on specific habit types
- Charts and stats update based on selected filter
- "All" shows every habit

## Usage Tips

1. **Getting Started**
   - Click "+ New Habit" or press `N`
   - Enter name, select category & frequency
   - Add optional goal/note and reminder time
   - Save!

2. **Edit Existing Habits**
   - Hover over a habit card in Today view
   - Click the pencil icon (✏️) to edit
   - Modify any details and save

3. **Set Reminders**
   - When creating/editing a habit, set "Reminder Time"
   - Browser will send notifications at your set time
   - Manage all reminders from the ⏰ button in sidebar

4. **Quick Templates**
   - Click the ⚡ button in sidebar
   - Choose from 10 pre-configured habits
   - Instantly add common habits (yoga, meditation, etc.)

5. **Export Your Data**
   - Click the 📥 button in sidebar
   - Downloads JSON backup of all habits & history
   - Keep it safe for manual backups

6. **Theme Toggle**
   - Click 🌙 button in sidebar (becomes ☀️ in light mode)
   - Switches between dark and light themes
   - Preference saved automatically

7. **Filter Charts**
   - Go to Charts view
   - Click category buttons to filter by category
   - See stats for specific habit types

8. **Daily Check-in**
   - Go to Today view
   - Click the check button on habit cards
   - Card highlights when marked done

9. **Reviewing Progress**
   - Week view: See your last 7 days at a glance
   - Month view: Spot patterns across the month
   - Charts: Analyze streaks and overall stats (with filtering)

10. **Data Persistence**
   - All data auto-saves to browser's localStorage
   - Refresh the page—your habits are still there
   - Export regularly for backups

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Lightweight: ~25KB total (unminified)
- No external dependencies
- Renders in <50ms even with 50+ habits
- localStorage can handle 5-10 MB (more than enough!)

## Further Enhancements

Possible features for future versions:
- ✅ Export/import data as JSON *(added!)*
- ✅ Habit reminders (browser notifications) *(added!)*
- ✅ Habit templates for quick setup *(added!)*
- ✅ Theme toggle (light/dark) *(added!)*
- ✅ Edit existing habits *(added!)*
- ✅ Filter charts by category *(added!)*
- Monthly/yearly reports & trend analysis
- Habit streaks UI (badges, milestones)
- Customizable colors per habit
- Multi-language support
- Mobile PWA with offline support
- Cloud sync (Firebase/Supabase)
- Social sharing of achievements
- Habit statistics comparison

## License

Free to use, modify, and distribute.

## Credits

**Design inspired by** modern productivity apps like Streaks, Habitica, and Done.

**Built with** vanilla JavaScript, CSS3, and HTML5.

---

**Happy habit tracking!** 🔥
