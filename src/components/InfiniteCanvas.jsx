import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Square, Image, Link, GitBranch, Move, ZoomIn, ZoomOut, X, Minus } from 'lucide-react';

const InfiniteCanvas = () => {
  const [elements, setElements] = useState([
    { id: 1, type: 'sticky', x: 100, y: 100, content: 'Start', color: 'bg-purple-400' },
    { id: 2, type: 'sticky', x: 300, y: 100, content: 'Stop', color: 'bg-green-400' },
    { id: 3, type: 'sticky', x: 500, y: 100, content: 'Continue', color: 'bg-orange-400' },
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
          content: selectedTool === 'sticky' ? 'New note' :
                   selectedTool === 'text' ? 'Type here...' :
                   selectedTool === 'link' ? 'https://example.com' :
                   selectedTool === 'mindmap' ? 'Central Idea' :
                   'New element',
          color: selectedTool === 'sticky' ? stickyColors[Math.floor(Math.random() * stickyColors.length)] : 'bg-white',
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
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingElement(null);
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();

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
    }
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();

    if (selectedTool === 'connector') {
      return; // Let handleElementClick handle connector logic
    }

    const rect = e.currentTarget.getBoundingClientRect();

    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
    setDraggingElement(element);
  };

  const handleElementDoubleClick = (e, element) => {
    e.stopPropagation();
    if (selectedTool !== 'connector') {
      setEditingElement(element);
    }
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
    const width = element.type === 'sticky' ? 150 :
                  element.type === 'mindmap' ? 150 :
                  element.type === 'image' ? 200 : 200;
    const height = element.type === 'sticky' ? 150 :
                   element.type === 'mindmap' ? 150 :
                   element.type === 'image' ? 200 : 80;

    return {
      x: element.x + width / 2,
      y: element.y + height / 2,
    };
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

  const renderElement = (element) => {
    const isConnecting = selectedTool === 'connector';
    const isConnectingFrom = connectingFrom && connectingFrom.id === element.id;
    const commonClasses = `absolute rounded-lg shadow-lg transition-all ${
      isConnecting ? 'cursor-pointer hover:ring-4 hover:ring-blue-400' : 'cursor-move hover:scale-105'
    } ${isConnectingFrom ? 'ring-4 ring-blue-500' : ''}`;

    switch (element.type) {
      case 'sticky':
        return (
          <div
            key={element.id}
            className={`${commonClasses} ${element.color} p-4 min-w-[150px] min-h-[150px] flex items-center justify-center`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          >
            <p className="text-center font-medium text-gray-800 break-words max-w-[130px]">
              {element.content}
            </p>
          </div>
        );

      case 'text':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-transparent p-2 min-w-[200px]`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          >
            <p className="text-gray-800 text-lg">{element.content}</p>
          </div>
        );

      case 'link':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-blue-50 border-2 border-blue-300 p-3 min-w-[200px]`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          >
            <Link className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-blue-600 text-sm break-all">{element.content}</p>
          </div>
        );

      case 'mindmap':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 p-4 rounded-full w-[150px] h-[150px] flex items-center justify-center`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          >
            <p className="text-center font-semibold text-purple-800 text-sm">
              {element.content}
            </p>
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            className={`${commonClasses} bg-gray-100 border-2 border-gray-300 p-4 w-[200px] h-[200px] flex items-center justify-center`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          >
            <div className="text-center">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Click to upload</p>
            </div>
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

      {/* Edit Modal */}
      {editingElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit {editingElement.type.charAt(0).toUpperCase() + editingElement.type.slice(1)}
              </h2>
              <button
                onClick={() => setEditingElement(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={editingElement.content}
                onChange={(e) => updateElementContent(e.target.value)}
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all"
                placeholder="Type your content here..."
                autoFocus
              />

              {editingElement.type === 'sticky' && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Choose color:</p>
                  <div className="flex gap-3">
                    {stickyColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setElements(elements.map(el =>
                            el.id === editingElement.id ? { ...el, color } : el
                          ));
                          setEditingElement({ ...editingElement, color });
                        }}
                        className={`w-12 h-12 ${color} rounded-xl border-3 ${
                          editingElement.color === color ? 'border-gray-800 ring-4 ring-gray-300' : 'border-gray-200'
                        } hover:scale-110 transition-transform shadow-md`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {editingElement.type === 'image' && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Upload Image:</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Click or drag to upload image</p>
                    <p className="text-gray-400 text-sm mt-1">(Prototype - Upload feature coming soon)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={deleteElement}
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Delete
              </button>
              <button
                onClick={() => setEditingElement(null)}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Done
              </button>
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
              Double-click to edit. Drag to move. Use connector to link elements!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteCanvas;
