# 🚇 Mini Metro Calendar & Habit Tracker (`MiNiCal2`)

A minimalist, high-aesthetic interactive personal habit tracking and transit calendar inspired by Dinosaur Polo Club's iconic game **Mini Metro**.

![Mini Metro Calendar Architecture](https://img.shields.io/badge/Aesthetic-Mini_Metro-EE3535?style=flat-square)
![React](https://img.shields.io/badge/React-19-0D84DE?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6-27963C?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-F4B300?style=flat-square)
![Web Audio API](https://img.shields.io/badge/Audio-Disasterpeace_Chimes-9A34B0?style=flat-square)

---

## 🎨 Design Philosophy & Metaphor

In traditional habit trackers, habits feel like chores on a todo list. In **Mini Metro Calendar**, **every habit is a living Transit Line** and **every day is a Station Node**:

- **Subway Lines as Habits**: Each habit has a distinct transit line color (Central Red, Piccadilly Blue, District Green, Circle Yellow, etc.) and a geometric station glyph (Circle ●, Square ■, Triangle ▲, Diamond ◆, Cross ✚, Star ★, Pentagon ⬟).
- **Streak Rails**: When you consistently practice your habits, your transit network connects day stations into unbroken railway corridors.
- **Interchange Stations**: Days where multiple habits are maintained become buzzing multi-line interchange hubs.
- **Procedural Audio (Disasterpeace inspired)**: Harmonic pentatonic chimes generated procedurally using the Web Audio API — pitch scales with streak length, and a celebratory fanfare triggers when a day's schedule is fully cleared.

---

## 🚀 Key Features

### 1. 📅 Month View (Topological Grid Rail Map)
- 7-column calendar grid with transit platform headers.
- **Dynamic Subway Rails**: Real-time SVG tracks that connect adjacent completed days with authentic 45°/90° angles and parallel multi-track spacing.
- **Station Nodes**: Geometric station markers showing completed lines, unserved ghost outlines, and clearance counts.
- **Line Filter Bar**: Isolate individual transit lines across the entire month to study route consistency.
- **Radar Beacon**: Today's station pulses with an active radar ring.
- **Direct 1-Click Toggle**: Click any day station's track pills to check off habits on the fly.

### 2. ⚡ Week View (Multi-Track Timetable)
- Horizontal railway channel view for each active transit line.
- Station stops along each line's weekly path with connected rail tracks.
- Weekly passenger volume progress bar and goal targets (e.g. `5/7 days`).
- Quick navigation across weeks (`< Prev`, `Next >`).
- Commuter flow insights and target clearance badges.

### 3. 🗺️ Metro Network Map View (Topological Schematic & Animated Trains)
- Full-screen topological schematic map of your recent transit history.
- **Animated Trains**: Smooth carriage cars glide along completed tracks in real-time.
- **Simulation Control HUD**: Play / Pause train traffic, toggle `1x` / `2x` simulation speed, and zoom in/out.
- Stations arranged topographically with river water bodies in authentic Mini Metro style.

### 4. 📊 Line Analytics & Performance
- System-wide **Network Efficiency %**, **Passengers Served** (total completions), and **Active Route Count**.
- Per-line current streak (🔥), longest streak (⭐), and 30-day punctuality rate.
- **30-Day Rail Corridor Heatmap** for each habit line.
- Complete line management (edit line name, change color, pick station glyph, set weekly goals, or decommission lines).

### 5. 🎛️ Station Control Center (Daily Log & Notes)
- Click any station node to open the Station Control Center.
- Full habit checklist with visual dispatch toggles and celebration confetti.
- Station Log: Record daily reflections, notes, and commuter mood (`Great`, `Steady`, `Tired`, `Breakthrough`).
- Swift `< Previous Day` and `Next Day >` shortcuts.

### 6. 🎨 4 Authentic Color Themes
1. **Classic Canvas (Linen Paper)**: Warm off-white `#F5F2EB` paper map with crisp primary line contrasts.
2. **Night Service**: Deep slate `#14171F` subway night mode with luminous tracks.
3. **Tokyo Neo**: High-contrast cyber transit dark mode `#0B0F19` with vivid neon lines.
4. **Blueprint Paper**: Architectural blueprint parchment `#EBE8DE`.

### 7. 💾 Local Persistence & System Archive
- Automatic LocalStorage persistence for all habits, streaks, and reflections.
- Export entire transit network to clean JSON backup.
- Import backup files to restore data.
- 1-click Reset to loaded realistic demo network.

---

## 🛠️ Tech Stack & Architecture

- **React 19 + TypeScript**: Modern reactive components with strict TypeScript types.
- **Tailwind CSS v4 + `@tailwindcss/vite`**: Zero-overhead atomic styling.
- **Web Audio API**: Pure procedural audio synthesis (zero external audio files).
- **Lucide React**: Clean minimalist iconography.
- **Canvas Confetti**: Lightweight celebration particle effects.
- **Vite 8**: Ultra-fast build and hot-module replacement.

---

## 🏃 Running the Application

```bash
# Install dependencies (already completed)
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
