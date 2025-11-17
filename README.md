# Kid Mission Control 🚀

A playful React + TypeScript app that turns kid chores into colorful quests. Track every helper’s points, streaks, and upcoming missions while creating new tasks on the fly—all from a single-page dashboard that stores progress locally.

## Highlights

- **Kid dashboard** – progress bars, badges, streaks, and “next up” teasers for each helper.
- **Mission board** – filter by “Today”, “High fives”, or “Bonus boosts”, and mark tasks as complete with one tap.
- **Mission builder** – friendly form for creating custom chores with categories, reminders, and reward points.
- **Persistent progress** – kids and tasks are saved in `localStorage`, so refreshing keeps the current state.
- **Delightful UI** – custom typography, tactile panels, and a textured background using the provided ChicagoFLF font + noise image.

## Tech

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) dev tooling with lightning-fast HMR
- Vanilla CSS for styling, including theme variables and responsive layouts

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`) to explore the tracker. The app automatically persists state to the browser, so clearing localStorage resets it to the sample data.

## Customization tips

- Update the sample kids and tasks in `src/App.tsx` to match your household.
- Tweak theme colors, spacing, or layout inside `src/index.css` and `src/App.css`.
- Extend the state model with additional fields (e.g., rewards catalog, time blocks) and surface them in the UI.

Have fun turning routines into daily wins! 🎉
