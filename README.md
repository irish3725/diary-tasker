This README is designed to reflect the custom, OSRS-inspired habit tracker you’ve built, highlighting the specific data structures and the "Data for Good" philosophy we've discussed.

---

# ⚔️ Old School Progress Tracker (OSRS-Habit-Diary)

A specialized productivity application inspired by the **Achievement Diary** and **Quest** systems of Old School RuneScape. This tool transforms personal development, technical learning, and community service into a gamified "Completionist" journey.

## 📜 Overview

Unlike standard to-do lists, this tracker categorizes tasks into **Regions** (representing life domains) and **Quests** (representing multi-step projects). It features a custom CSS theme that mimics the stone-and-parchment aesthetic of the 2007-era Gielinor interface.

### Key Features
* **Regional Achievement Diaries:** Organize habits by location or category (e.g., "Seattle," "Portland," "Work," "Data Engineering").
* **Dynamic Quest System:** Track multi-stage projects with a specialized "Quest Point" (QP) economy.
* **Weekly Persistence:** A history-based data model that tracks completion status week-over-week without losing your "Master Template."
* **Progress Visualization:** OSRS-style progress bars that transition from **Yellow** to **Green** upon 100% completion.
* **Technical Stack:** Built with **React**, **Tailwind CSS**, **Lucide React** for iconography, and a custom **JSON-based local storage** hook for data persistence.

---

## 🛠 Technical Architecture

### Data Schema
The application relies on a centralized `db` object managed via a custom `useDiary` hook. This ensures a "Single Source of Truth" across the three main views.

* **`regions`**: The blueprint for your habits. Deleting a task here removes it from all future weeks.
* **`history`**: A time-stamped record of task completion.
* **`quests`**: An array of objects containing `tasks` and a `completed` boolean.

### Custom Hooks
The engine of the app is `useDiary.js`, which handles:
* **State Persistence:** Automatic synchronization with `localStorage`.
* **Derived Stats:** Real-time calculation of **Quest Points** and **Completion Percentages** using `useMemo` to prevent unnecessary re-renders.
* **Deep Cloning:** Uses `JSON.parse(JSON.stringify(prev))` to ensure state immutability during complex nested updates (like deleting a daily habit).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **Yarn** or **npm**

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/osrs-habit-tracker.git
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn dev
   ```

### UI Styling
The project uses a custom Tailwind configuration to support OSRS-specific aesthetics:
* **Font:** `font-osrs` (Custom pixel-style font)
* **Colors:** * `#ff9800` (OSRS Orange)
    * `#ffff00` (Quest Yellow)
    * `#00ff00` (Completed Green)
    * `#0a0a0a` (Interface Dark Grey)

---

## 🗺 Roadmap & "Data for Good"

This project is evolving to support community-focused data initiatives. Future iterations include:
* **Volunteer Integration:** Specialized "Quest Lines" for tracking hours in volunteer bike delivery and "Data for Good" projects.
* **Socio-Economic Tracking:** Modules to track reading progress on socio-economic literature (e.g., poverty and social systems).
* **Data Export:** Capability to export weekly "Completion Reports" into CSV format for external analysis.

---

## 🤝 Contributing

This project is currently a personal development tool. If you encounter bugs—especially the dreaded "Black Screen of Death" (typically caused by Hook rule violations or ReferenceErrors)—please check the browser console and verify that all props are correctly passed through `App.jsx`.

**"The grind never stops."** ⚔️