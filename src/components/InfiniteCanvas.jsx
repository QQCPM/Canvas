import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Square, Image, Link, GitBranch, Move, ZoomIn, ZoomOut, X, Minus, Pen, Eraser, Download } from 'lucide-react';

const InfiniteCanvas = () => {
  const [elements, setElements] = useState([
    { id: 1, type: 'sticky', x: 100, y: 100, width: 150, height: 150, content: 'Start', color: 'bg-purple-400', drawing: null },
    { id: 2, type: 'sticky', x: 300, y: 100, width: 150, height: 150, content: 'Stop', color: 'bg-green-400', drawing: null },
    { id: 3, type: 'sticky', x: 500, y: 100, width: 150, height: 150, content: 'Continue', color: 'bg-orange-400', drawing: null },
  ]);

  const [connections, setConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState('pen');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const drawingCanvasRef = useRef(null);
  const drawingContextRef = useRef(null);

  const canvasRef = useRef(null);
  const nextId = useRef(4);

  const tools = [
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'sticky', icon: Square, label: 'Sticky Note' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'link', icon: Link, label: 'Link' },
    { id: 'mindmap', icon: GitBranch, label: 'Mind Map' },
    { id: 'connector', icon: Minus, label: 'Connect' },
  ];

  const stickyColors = [
    'bg-purple-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-orange-400',
    'bg-pink-400',
  ];

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      if (selectedTool && selectedTool !== 'move' && selectedTool !== 'connector') {
        // Create new element
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        const newElement = {
          id: nextId.current++,
          type: selectedTool,
          x,
          y,
          width: selectedTool === 'sticky' ? 150 :
                 selectedTool === 'mindmap' ? 150 :
                 selectedTool === 'image' ? 200 : 200,
          height: selectedTool === 'sticky' ? 150 :
                  selectedTool === 'mindmap' ? 150 :
                  selectedTool === 'image' ? 200 : 100,
          content: selectedTool === 'sticky' ? 'New note' :
                   selectedTool === 'text' ? 'Type here...' :
                   selectedTool === 'link' ? 'https://example.com' :
                   selectedTool === 'mindmap' ? 'Central Idea' :
                   'New element',
          color: selectedTool === 'sticky' ? stickyColors[Math.floor(Math.random() * stickyColors.length)] : 'bg-white',
          drawing: null,
        };

        setElements([...elements, newElement]);
        setSelectedTool(null);
      } else if (selectedTool !== 'connector') {
        // Start panning
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (draggingElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const newY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;

      setElements(elements.map(el =>
        el.id === draggingElement.id ? { ...el, x: newX, y: newY } : el
      ));
    }

    if (resizingElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const deltaX = mouseX - resizeStart.x;
      const deltaY = mouseY - resizeStart.y;

      setElements(elements.map(el => {
        if (el.id === resizingElement.id) {
          let newWidth = el.width;
          let newHeight = el.height;
          let newX = el.x;
          let newY = el.y;

          if (resizeDirection.includes('e')) {
            newWidth = Math.max(50, resizeStart.width + deltaX);
          }
          if (resizeDirection.includes('w')) {
            const widthChange = resizeStart.width - deltaX;
            if (widthChange >= 50) {
              newWidth = widthChange;
              newX = resizeStart.elementX + deltaX;
            }
          }
          if (resizeDirection.includes('s')) {
            newHeight = Math.max(50, resizeStart.height + deltaY);
          }
          if (resizeDirection.includes('n')) {
            const heightChange = resizeStart.height - deltaY;
            if (heightChange >= 50) {
              newHeight = heightChange;
              newY = resizeStart.elementY + deltaY;
            }
          }

          return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        return el;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingElement(null);
    setResizingElement(null);
    setResizeDirection(null);
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();

    // Prevent opening modal if we just finished dragging
    if (draggingElement) {
      return;
    }

    if (selectedTool === 'connector') {
      if (!connectingFrom) {
        // First click - select starting element
        setConnectingFrom(element);
      } else if (connectingFrom.id !== element.id) {
        // Second click - create connection
        const newConnection = {
          id: nextId.current++,
          from: connectingFrom.id,
          to: element.id,
        };
        setConnections([...connections, newConnection]);
        setConnectingFrom(null);
        setSelectedTool(null);
      }
    } else if (!resizingElement) {
      // Single click opens full screen modal
      setEditingElement(element);
    }
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();

    if (selectedTool === 'connector') {
      return; // Let handleElementClick handle connector logic
    }

    // Check if clicking on resize handle
    const isResizeHandle = e.target.classList.contains('resize-handle');
    if (isResizeHandle) {
      return; // Resize handle has its own handler
    }

    const rect = e.currentTarget.getBoundingClientRect();

    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
    setDraggingElement(element);
  };

  const handleResizeMouseDown = (e, element, direction) => {
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setResizingElement(element);
    setResizeDirection(direction);
    setResizeStart({
      x: mouseX,
      y: mouseY,
      width: element.width,
      height: element.height,
      elementX: element.x,
      elementY: element.y,
    });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.3));
  };

  const updateElementContent = (content) => {
    setElements(elements.map(el =>
      el.id === editingElement.id ? { ...el, content } : el
    ));
    setEditingElement({ ...editingElement, content });
  };

  const deleteElement = () => {
    // Delete element and all connections to/from it
    setElements(elements.filter(el => el.id !== editingElement.id));
    setConnections(connections.filter(conn =>
      conn.from !== editingElement.id && conn.to !== editingElement.id
    ));
    setEditingElement(null);
  };

  const getElementCenter = (element) => {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
    };
  };

  // Drawing functions for modal
  useEffect(() => {
    if (editingElement && drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      const context = canvas.getContext('2d');
      drawingContextRef.current = context;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Load existing drawing if any
      if (editingElement.drawing) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        img.src = editingElement.drawing;
      } else {
        // Clear canvas
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [editingElement]);

  const startDrawing = (e) => {
    if (!drawingContextRef.current) return;

    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawingContextRef.current.beginPath();
    drawingContextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !drawingContextRef.current) return;

    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = drawingContextRef.current;

    if (drawingTool === 'pen') {
      context.strokeStyle = drawingColor;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineTo(x, y);
      context.stroke();
    } else if (drawingTool === 'eraser') {
      context.strokeStyle = 'white';
      context.lineWidth = 20;
      context.lineCap = 'round';
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!drawingContextRef.current) return;

    drawingContextRef.current.closePath();
    setIsDrawing(false);

    // Save drawing to element
    if (drawingCanvasRef.current) {
      const drawingData = drawingCanvasRef.current.toDataURL();
      setElements(elements.map(el =>
        el.id === editingElement.id ? { ...el, drawing: drawingData } : el
      ));
      setEditingElement({ ...editingElement, drawing: drawingData });
    }
  };

  const clearDrawing = () => {
    if (!drawingCanvasRef.current || !drawingContextRef.current) return;

    const canvas = drawingCanvasRef.current;
    const context = drawingContextRef.current;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    setElements(elements.map(el =>
      el.id === editingElement.id ? { ...el, drawing: null } : el
    ));
    setEditingElement({ ...editingElement, drawing: null });
  };

  const renderConnections = () => {
    return connections.map(connection => {
      const fromElement = elements.find(el => el.id === connection.from);
      const toElement = elements.find(el => el.id === connection.to);

      if (!fromElement || !toElement) return null;

      const from = getElementCenter(fromElement);
      const to = getElementCenter(toElement);

      return (
        <line
          key={connection.id}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  const renderResizeHandles = (element) => {
    const handleSize = 8;
    const handles = ['nw', 'ne', 'sw', 'se'];

    return handles.map(direction => {
      const style = {
        position: 'absolute',
        width: `${handleSize}px`,
        height: `${handleSize}px`,
        background: '#3b82f6',
        border: '1px solid white',
        borderRadius: '50%',
        cursor: `${direction}-resize`,
      };

      if (direction.includes('n')) style.top = '-4px';
      if (direction.includes('s')) style.bottom = '-4px';
      if (direction.includes('w')) style.left = '-4px';
      if (direction.includes('e')) style.right = '-4px';

      return (
        <div
          key={direction}
          className="resize-handle"
          style={style}
          onMouseDown={(e) => handleResizeMouseDown(e, element, direction)}
        />
      );
    });
  };

  const renderElement = (element) => {
    const isConnecting = selectedTool === 'connector';
    const isConnectingFrom = connectingFrom && connectingFrom.id === element.id;
    const commonClasses = `absolute rounded-lg shadow-lg transition-all ${
      isConnecting ? 'cursor-pointer hover:ring-4 hover:ring-blue-400' : 'cursor-move hover:scale-105'
    } ${isConnectingFrom ? 'ring-4 ring-blue-500' : ''}`;

    const commonStyle = {
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
    };

    switch (element.type) {
      case 'sticky':
        return (
          <div
            key={element.id}
            className={`${commonClasses} ${element.color} p-4 flex items-center justify-center relative group`}
            style={commonStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
          >
            <p className="text-center font-medium text-gray-800 break-words overflow-hidden">
              {element.content}
            </p>
            {renderResizeHandles(element)}
          </div>
        );

      case 'text':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-transparent p-2 relative group`}
            style={commonStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
          >
            <p className="text-gray-800 text-lg overflow-hidden">{element.content}</p>
            {renderResizeHandles(element)}
          </div>
        );

      case 'link':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-blue-50 border-2 border-blue-300 p-3 relative group`}
            style={commonStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
          >
            <Link className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-blue-600 text-sm break-all overflow-hidden">{element.content}</p>
            {renderResizeHandles(element)}
          </div>
        );

      case 'mindmap':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 p-4 rounded-full flex items-center justify-center relative group`}
            style={commonStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
          >
            <p className="text-center font-semibold text-purple-800 text-sm overflow-hidden">
              {element.content}
            </p>
            {renderResizeHandles(element)}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-gray-100 border-2 border-gray-300 p-4 flex items-center justify-center relative group`}
            style={commonStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
          >
            <div className="text-center">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Click to edit</p>
            </div>
            {renderResizeHandles(element)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Canvas
          </h1>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  if (selectedTool === tool.id) {
                    setSelectedTool(null);
                    setConnectingFrom(null);
                  } else {
                    setSelectedTool(tool.id);
                    setConnectingFrom(null);
                  }
                }}
                className={`p-2 rounded-lg transition-all ${
                  selectedTool === tool.id
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 mt-16 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'relative',
          }}
        >
          {/* SVG for connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Elements */}
          {elements.map(element => renderElement(element))}
        </div>
      </div>

      {/* Full Screen Edit Modal */}
      {editingElement && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-[95vw] h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {editingElement.type.charAt(0).toUpperCase() + editingElement.type.slice(1)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Click to type, draw, and customize</p>
              </div>
              <button
                onClick={() => setEditingElement(null)}
                className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Text Editor */}
              <div className="w-1/2 p-6 flex flex-col border-r border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Text Content</h3>
                  {editingElement.type === 'sticky' && (
                    <div className="flex gap-2">
                      {stickyColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setElements(elements.map(el =>
                              el.id === editingElement.id ? { ...el, color } : el
                            ));
                            setEditingElement({ ...editingElement, color });
                          }}
                          className={`w-8 h-8 ${color} rounded-lg border-2 ${
                            editingElement.color === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                          } hover:scale-110 transition-transform`}
                          title="Change color"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  value={editingElement.content}
                  onChange={(e) => updateElementContent(e.target.value)}
                  className="flex-1 p-6 border-2 border-gray-300 rounded-2xl resize-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-xl transition-all font-sans"
                  placeholder="Type your content here..."
                  autoFocus
                />
              </div>

              {/* Right Panel - Drawing Canvas */}
              <div className="w-1/2 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Drawing Area</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDrawingTool('pen')}
                      className={`p-2 rounded-lg transition-all ${
                        drawingTool === 'pen'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Pen"
                    >
                      <Pen className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDrawingTool('eraser')}
                      className={`p-2 rounded-lg transition-all ${
                        drawingTool === 'eraser'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Eraser"
                    >
                      <Eraser className="w-5 h-5" />
                    </button>
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                      title="Drawing color"
                    />
                    <button
                      onClick={clearDrawing}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium ml-2"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <canvas
                  ref={drawingCanvasRef}
                  className="flex-1 border-2 border-gray-300 rounded-2xl cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use your mouse to draw on the canvas. Drawings are saved automatically.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={deleteElement}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Delete Element
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingElement(null)}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions / Status Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        {selectedTool === 'connector' && !connectingFrom && (
          <div className="bg-blue-500 text-white rounded-lg shadow-lg px-4 py-2 animate-pulse">
            <p className="text-sm font-medium">Click on first element to start connection</p>
          </div>
        )}
        {selectedTool === 'connector' && connectingFrom && (
          <div className="bg-blue-500 text-white rounded-lg shadow-lg px-4 py-2 animate-pulse">
            <p className="text-sm font-medium">Click on second element to complete connection</p>
          </div>
        )}
        {elements.length === 3 && !selectedTool && (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
            <p className="text-sm text-gray-700">
              <strong>Quick Guide:</strong> Select a tool and click canvas to create.
              Click box to open full screen editor. Drag to move. Resize with corner handles!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteCanvas;
