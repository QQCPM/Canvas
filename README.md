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
- **Resizable Elements**: Resize any box using corner handles
- **Full-Screen Editor**: Click any element to open a nearly full-screen editing modal
- **Drawing Canvas**: Built-in drawing area with pen and eraser tools
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
4. **Resize Elements**: Drag the corner handles (blue dots) to resize any box
5. **Edit Content**: Click any element to open the full-screen editor
   - Left panel: Type and edit text content
   - Right panel: Draw with pen and eraser tools
   - Choose colors for sticky notes
   - Drawings are saved automatically
6. **Connect Elements**:
   - Click the connector tool (line icon)
   - Click on the first element
   - Click on the second element to create a connection
7. **Pan Canvas**: Click and drag on empty canvas space (or use Move tool)
8. **Zoom**: Use the zoom controls in the top-right corner

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

## Current Features

✅ Infinite pan and zoom canvas
✅ Multiple element types (sticky notes, text, links, mind maps, images)
✅ Connection lines between elements
✅ Resizable elements with corner handles
✅ Full-screen editor with dual panels
✅ Drawing canvas with pen and eraser
✅ Color customization for sticky notes

## Future Enhancements

- Image upload functionality
- More drawing tools (shapes, lines, highlighter)
- Collaborative editing
- Export to PNG/SVG
- Undo/Redo functionality
- Keyboard shortcuts
- Templates and themes
- Touch/tablet support

## License

MIT
