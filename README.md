# Infinity Canvas - Miro-like Prototype

A modern, interactive infinite canvas prototype inspired by Miro, built with React and Tailwind CSS.

## Features

- **Infinite Canvas**: Pan and zoom across an unlimited workspace
- **Multiple Element Types**:
  - Sticky Notes (with color customization)
  - Text boxes
  - Image placeholders
  - Web links
  - Mind map nodes
- **Connection Lines**: Draw arrows to connect elements together
- **Drag & Drop**: Move elements freely across the canvas
- **Rich Editing**: Double-click any element to open a full editing modal
- **Intuitive Controls**: Easy-to-use toolbar with visual feedback

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## How to Use

1. **Select a Tool**: Click on any tool in the top toolbar
2. **Create Elements**: Click anywhere on the canvas to create a new element
3. **Move Elements**: Drag elements to reposition them
4. **Edit Content**: Double-click any element to open the editing modal
5. **Connect Elements**:
   - Click the connector tool (line icon)
   - Click on the first element
   - Click on the second element to create a connection
6. **Pan Canvas**: Click and drag on empty canvas space (or use Move tool)
7. **Zoom**: Use the zoom controls in the top-right corner

## Keyboard Shortcuts

- **Pan**: Click and drag on canvas
- **Zoom In**: Click the + button
- **Zoom Out**: Click the - button

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
Canvas/
├── src/
│   ├── components/
│   │   └── InfiniteCanvas.jsx  # Main canvas component
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies
└── vite.config.js              # Vite configuration
```

## Future Enhancements

- Image upload functionality
- Drawing tools (freehand, shapes)
- Collaborative editing
- Export to PNG/SVG
- Undo/Redo functionality
- Keyboard shortcuts
- Templates and themes

## License

MIT
