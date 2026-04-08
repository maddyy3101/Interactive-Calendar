# Interactive-Calendar

Interactive wall calendar built as a responsive frontend experience with date-range selection and note-taking... :P

Designed using Figma and Implemented using React on VSC... :)

## Brief: Design And Implementation Choices

- Month-first experience: each month has a themed hero image to make navigation feel visual and seasonal.
- Theme synced to image: UI accent colors change with the active month image so selections, buttons, and notes feel cohesive.
- Range-based planning: users can select a single day or a date range, then attach notes to that selection.
- Clear interactions: a `Clear Selection` button appears in the notes panel and is only active when a selection exists.
- Responsive layout: desktop uses a split calendar/notes view, while mobile stacks content for smaller screens.
- Local persistence: notes are stored in `localStorage` so data remains after refresh.

## Run Locally

Prerequisite: Node.js 18+ and npm.

1. Install dependencies:
   `npm install`

2. Start the development server:
   `npm run dev`

3. Open the local URL shown in terminal (usually `http://127.0.0.1:5173/`).

## Build For Production

Run:
`npm run build`
