# Flowcus - Your Neural Network Dashboard

A visual project management tool that acts as your "second brain" - connecting all your projects, tasks, notes, and ideas in one interactive canvas.

## Features

- **Visual Node-Based Interface**: See all your projects at a glance on an interactive canvas
- **7 Pre-loaded Projects**: Modern Amenities, AIMS, GHL, Bisqy, DevSwarm, Accordant Capital, UO Foundation
- **Task Management**: Create and track tasks for each project
- **Notes & Ideas**: Capture meeting notes, ideas, and thoughts linked to specific projects
- **Drag & Drop**: Move projects around the canvas and their positions are saved
- **Real-time Updates**: All changes persist immediately to local storage

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## How to Use

1. **View Projects**: Your 7 projects are pre-loaded on the canvas
2. **Click a Project**: View details, tasks, notes, and ideas in the right panel
3. **Add Tasks**: Click into any project and add tasks in the Tasks tab
4. **Move Projects**: Drag and drop project nodes to organize your canvas
5. **Add Connections**: Click and drag from the connection points on nodes to link related projects

## Data Storage

All data is stored in your browser's localStorage, so it persists across sessions but is private to your device.

## Tech Stack

- **Next.js 14** - React framework
- **React Flow** - Node-based canvas
- **Zustand** - State management with localStorage persistence
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Roadmap

### Phase 2 (Next Steps)
- Asana integration for automatic task sync
- Daily to-do list view
- Journal entries

### Phase 3
- Claude AI assistant for smart suggestions
- Context-aware recommendations
- Follow-up reminders

### Phase 4
- Google Drive + Notion integration
- Document linking to projects

### Phase 5
- Granola call notes integration
- Wispr voice note capture
- Automatic categorization

### Phase 6
- Automatic project connections
- Pattern recognition
- Weekly summaries
- Smart search

## Deployment

Deploy to Vercel with one click:

```bash
vercel
```

Or push to GitHub and connect your repository to Vercel for automatic deployments.
