import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { Folder, File, Box } from 'lucide-react';
import './index.css';
import { symbols, parseSymbols } from './fileSystem';

function TreeNode({
  data,
  path,
  expandedFolders,
  toggleFolder,
  colorScale,
  onHoverSymbol,
  hoveredSymbolId,
  onSelectSymbol,
  selectedNodeId,
}: any) {
  return (
    <>
      {Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, item]: [string, any]) => {
          const fullPath = path ? `${path}/${name}` : name;
          const isExpanded = expandedFolders.has(fullPath);
          const isFolder = item.type === 'folder';
          const folderColor = isFolder ? (colorScale(fullPath) as string) : (colorScale(path) as string);

          return (
            <div key={fullPath} className="mb-1">
              <button
                onClick={() => toggleFolder(fullPath)}
                className="w-full text-left px-2 py-1 text-sm font-medium text-neutral-300 hover:bg-neutral-700 rounded flex items-center gap-1 cursor-pointer"
              >
                {isFolder ? (
                  <Folder size={16} className="text-neutral-500" />
                ) : (
                  <File size={16} className="text-neutral-500" />
                )}
                <span className="truncate" style={{ color: folderColor }}>
                  {name}
                </span>
                {isFolder && (
                  <span className="text-neutral-500 text-sm ml-auto">({Object.keys(item.children).length})</span>
                )}
                {!isFolder && <span className="text-neutral-500 text-sm ml-auto">({item.symbols.length})</span>}
              </button>
              {isExpanded && isFolder && (
                <div className="ml-4 mt-1">
                  <TreeNode
                    data={item.children}
                    path={fullPath}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    colorScale={colorScale}
                    onHoverSymbol={onHoverSymbol}
                    hoveredSymbolId={hoveredSymbolId}
                    onSelectSymbol={onSelectSymbol}
                    selectedNodeId={selectedNodeId}
                  />
                </div>
              )}
              {isExpanded && !isFolder && (
                <div className="ml-4 mt-1">
                  {item.symbols.sort().map((symbol: string) => {
                    const symbolId = `${fullPath}.${symbol}`;
                    const isHovered = hoveredSymbolId === symbolId;
                    const isSelected = selectedNodeId === symbolId;
                    return (
                      <div
                        key={symbol}
                        ref={
                          isSelected
                            ? (el: HTMLDivElement) => {
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                              }
                            : null
                        }
                        className={`text-sm px-2 py-0.5 truncate cursor-pointer rounded flex items-center gap-1 ${
                          isSelected ? 'bg-neutral-500' : isHovered ? 'bg-neutral-600' : 'hover:bg-neutral-700'
                        }`}
                        style={{ color: folderColor }}
                        onMouseEnter={() => onHoverSymbol(symbolId)}
                        onMouseLeave={() => onHoverSymbol(null)}
                        onClick={() => onSelectSymbol(symbolId)}
                      >
                        <Box size={16} className="text-neutral-500 flex-shrink-0" />
                        {symbol}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}

const MemoizedTreeNode = memo(TreeNode);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeRef = useRef<(() => void) | null>(null);
  const sidebarOpenRef = useRef(false);
  const simulationRef = useRef<any>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const hoveredNodeRef = useRef<any>(null);
  const selectedNodeRef = useRef<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [hoveredSymbolId, setHoveredSymbolId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => parseSymbols(symbols), [symbols]);

  const handleHoverSymbol = useCallback(
    (nodeId: string | null) => {
      if (nodeId === null) {
        hoveredNodeRef.current = null;
      } else {
        const node = generatedNodes.find((n: any) => n.id === nodeId);
        hoveredNodeRef.current = node || null;
      }
      if (drawRef.current) {
        drawRef.current();
      }
    },
    [generatedNodes]
  );

  const handleSelectSymbol = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);

    // Expand the folder path for the selected node
    const lastDotIndex = nodeId.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const filePath = nodeId.substring(0, lastDotIndex);
      const pathParts = filePath.split('/');
      const pathsToExpand: string[] = [];

      let currentPath = '';
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        pathsToExpand.push(currentPath);
      }

      setExpandedFolders((prev) => {
        const next = new Set(prev);
        pathsToExpand.forEach((path) => next.add(path));
        return next;
      });
    }
  }, []);

  // Sync selectedNodeId to ref for use in draw function
  useEffect(() => {
    selectedNodeRef.current = selectedNodeId;
    if (drawRef.current) {
      drawRef.current();
    }
  }, [selectedNodeId]);

  // Extract folder names for coloring
  const { folderMap, colorScale } = useMemo(() => {
    const map = new Map<string, string>();
    generatedNodes.forEach((node: any) => {
      const folder = node.data.folder || 'root';
      map.set(node.id, folder);
    });

    const folderList = Array.from(new Set(Array.from(map.values())));
    const scale = d3.scaleOrdinal(d3.schemeSet3).domain(folderList);

    return { folderMap: map, colorScale: scale };
  }, [generatedNodes]);

  // Build hierarchical folder/file tree structure
  const treeStructure = useMemo(() => {
    const tree: Record<string, any> = {};

    generatedNodes.forEach((node: any) => {
      const lastDotIndex = node.id.lastIndexOf('.');
      if (lastDotIndex === -1) return;
      const filePath = node.id.substring(0, lastDotIndex);
      const symbolName = node.id.substring(lastDotIndex + 1);

      // Split path into parts
      const parts = filePath.split('/');
      let current = tree;

      parts.forEach((part: string, index: number) => {
        if (!current[part]) {
          current[part] = {
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: {},
            symbols: [],
          };
        }
        if (index === parts.length - 1) {
          // This is a file, add the symbol
          current[part].symbols.push(symbolName);
        } else {
          // This is a folder, move to children
          current = current[part].children;
        }
      });
    });

    return tree;
  }, [generatedNodes]);

  const toggleFolder = useCallback((folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = window.innerWidth - (sidebarOpenRef.current ? 300 : 0);
    let height = window.innerHeight;

    console.log('Canvas dimensions:', { width, height });
    console.log('Node center position:', { x: width / 2, y: height / 2 });

    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth - (sidebarOpenRef.current ? 300 : 0);
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      transform.x = width / 2;
      transform.y = height / 2;
      simulation.alpha(0.3).restart();
    };

    const handleSidebarResize = () => {
      const newWidth = window.innerWidth - (sidebarOpenRef.current ? 300 : 0);
      canvas.width = newWidth;
      transform.x = newWidth / 2;
      if (drawRef.current) {
        drawRef.current();
      }
    };

    resizeRef.current = handleSidebarResize;

    window.addEventListener('resize', handleResize);

    let transform = { x: width / 2, y: height / 2, k: 1 };

    // Manual zoom/pan handling
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let draggedNode: any = null;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newK = transform.k * zoomFactor;

      // Zoom towards mouse position
      transform.x = mouseX - (mouseX - transform.x) * (newK / transform.k);
      transform.y = mouseY - (mouseY - transform.y) * (newK / transform.k);
      transform.k = newK;

      draw();
    };

    canvas.addEventListener('wheel', handleWheel);

    const simulation = d3
      .forceSimulation(generatedNodes as any)
      .force(
        'link',
        d3.forceLink(generatedEdges as any).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('x', d3.forceX(0))
      .force('y', d3.forceY(0))
      .alphaMin(0.001); // Keep simulation alive for drag interaction

    simulationRef.current = simulation;

    // Initial draw
    draw();

    function draw() {
      if (!context) return;
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      // Draw edges
      generatedEdges.forEach((edge: any) => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = 12;

        let targetX = edge.target.x;
        let targetY = edge.target.y;

        if (distance > 0) {
          targetX = edge.source.x + (dx / distance) * (distance - offset);
          targetY = edge.source.y + (dy / distance) * (distance - offset);
        }

        context.beginPath();
        context.moveTo(edge.source.x, edge.source.y);
        context.lineTo(targetX, targetY);
        context.strokeStyle = colorScale(folderMap.get(edge.source.id) || 'root') as string;
        context.lineWidth = 2;
        context.globalAlpha = 0.5;
        context.stroke();
        context.globalAlpha = 1;
      });

      // Draw nodes
      generatedNodes.forEach((node: any) => {
        const isSelected = node.id === selectedNodeRef.current;
        context.beginPath();
        context.arc(node.x, node.y, isSelected ? 7 : 5, 0, 2 * Math.PI);
        context.fillStyle = colorScale(folderMap.get(node.id) || 'root') as string;
        context.fill();
        context.strokeStyle = isSelected ? '#ffffff' : '#171717';
        context.lineWidth = isSelected ? 2.5 : 1.5;
        context.stroke();
      });

      // Log first few node positions for debugging
      if (generatedNodes.length > 0) {
        console.log('First node position:', {
          x: generatedNodes[0].x,
          y: generatedNodes[0].y,
          id: generatedNodes[0].id,
        });
      }

      // Draw selected label (always shows if node is selected)
      if (selectedNodeRef.current) {
        const selectedNode = generatedNodes.find((n: any) => n.id === selectedNodeRef.current);
        if (selectedNode) {
          const lastDotIndex = selectedNode.id.lastIndexOf('.');
          const pathPart = selectedNode.id.substring(0, lastDotIndex);
          const symbolPart = selectedNode.id.substring(lastDotIndex + 1);

          // Measure symbol part with bold font
          context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const symbolWidth = context.measureText(symbolPart).width;

          // Measure path part with normal font
          context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const pathWidth = context.measureText(` ${pathPart}`).width;

          const totalWidth = symbolWidth + pathWidth;
          const startX = selectedNode.x - totalWidth / 2;

          // Draw shadow for symbol (bold)
          context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = 'rgba(0, 0, 0, 1)';
          context.fillText(symbolPart, startX + 0.5, selectedNode.y - 12 + 0.5);

          // Draw shadow for path (normal)
          context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = 'rgba(0, 0, 0, 1)';
          context.fillText(` ${pathPart}`, startX + symbolWidth + 0.5, selectedNode.y - 12 + 0.5);

          // Draw symbol (bold, white)
          context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = '#fafafa'; // neutral-50
          context.fillText(symbolPart, startX, selectedNode.y - 12);

          // Draw path (normal, gray)
          context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = '#fafafa'; // neutral-50
          context.fillText(` ${pathPart}`, startX + symbolWidth, selectedNode.y - 12);
        }
      }

      // Draw hover label (shows if hovering and different from selected)
      if (hoveredNodeRef.current && hoveredNodeRef.current.id !== selectedNodeRef.current) {
        const lastDotIndex = hoveredNodeRef.current.id.lastIndexOf('.');
        const pathPart = hoveredNodeRef.current.id.substring(0, lastDotIndex);
        const symbolPart = hoveredNodeRef.current.id.substring(lastDotIndex + 1);

        // Measure symbol part with bold font
        context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const symbolWidth = context.measureText(symbolPart).width;

        // Measure path part with normal font
        context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const pathWidth = context.measureText(` ${pathPart}`).width;

        const totalWidth = symbolWidth + pathWidth;
        const startX = hoveredNodeRef.current.x - totalWidth / 2;

        // Draw shadow for symbol (bold)
        context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillText(symbolPart, startX + 0.5, hoveredNodeRef.current.y - 10 + 0.5);

        // Draw shadow for path (normal)
        context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillText(` ${pathPart}`, startX + symbolWidth + 0.5, hoveredNodeRef.current.y - 10 + 0.5);

        // Draw symbol (bold, white)
        context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = '#fafafa'; // neutral-50
        context.fillText(symbolPart, startX, hoveredNodeRef.current.y - 10);

        // Draw path (normal, gray)
        context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = '#fafafa'; // neutral-50
        context.fillText(` ${pathPart}`, startX + symbolWidth, hoveredNodeRef.current.y - 10);
      }

      context.restore();
    }

    drawRef.current = draw;

    simulation.on('tick', draw);

    // Combined mousemove handler for hover, drag, and pan
    const handleMouseMove = (event: MouseEvent) => {
      // Handle pan
      if (isPanning) {
        const dx = event.clientX - panStart.x;
        const dy = event.clientY - panStart.y;
        transform.x += dx;
        transform.y += dy;
        panStart = { x: event.clientX, y: event.clientY };
        draw();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - transform.x) / transform.k;
      const mouseY = (event.clientY - rect.top - transform.y) / transform.k;

      // Handle drag
      if (draggedNode) {
        draggedNode.fx = mouseX;
        draggedNode.fy = mouseY;
        draw();
        return;
      }

      // Handle hover
      let found = null;
      for (const node of generatedNodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < 100) {
          // 10px radius squared
          found = node;
          break;
        }
      }

      if (found !== hoveredNodeRef.current) {
        hoveredNodeRef.current = found;
        setHoveredSymbolId(found ? found.id : null);
        draw();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (event: MouseEvent) => {
      // Check if middle mouse button or shift key for panning
      if (event.button === 1 || event.shiftKey) {
        isPanning = true;
        panStart = { x: event.clientX, y: event.clientY };
        event.preventDefault();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - transform.x) / transform.k;
      const mouseY = (event.clientY - rect.top - transform.y) / transform.k;

      // Check for node click (selection)
      let nodeClicked = false;
      for (const node of generatedNodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < 100) {
          // 10px radius squared
          handleSelectSymbol(node.id);
          nodeClicked = true;
          draw();
          break;
        }
      }

      // Deselect if clicking on empty space
      if (!nodeClicked) {
        setSelectedNodeId(null);
        draw();
      }

      for (const node of generatedNodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < 100) {
          draggedNode = node;
          simulation.alpha(0.3).restart();
          draggedNode.fx = node.x;
          draggedNode.fy = node.y;
          break;
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);

    const handleMouseUp = () => {
      isPanning = false;
      if (draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        draggedNode = null;
        simulation.alphaTarget(0);
      }
    };

    canvas.addEventListener('mouseup', handleMouseUp);

    const handleMouseLeave = () => {
      isPanning = false;
      hoveredNodeRef.current = null;
      if (draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        draggedNode = null;
        simulation.alphaTarget(0);
      }
      draw();
    };

    canvas.addEventListener('mouseleave', handleMouseLeave);

    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };

    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [generatedNodes, generatedEdges, folderMap, colorScale]);

  // Handle sidebar resize without re-initializing simulation
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
    if (resizeRef.current) {
      resizeRef.current();
    }
  }, [sidebarOpen]);

  return (
    <div className="h-screen w-screen bg-neutral-900 flex">
      {/* Sidebar */}
      <div
        className={`bg-neutral-800 overflow-hidden ${sidebarOpen ? 'border-r border-neutral-700' : ''}`}
        style={{ width: sidebarOpen ? '300px' : '0px' }}
      >
        <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
          <h2 className="font-semibold text-neutral-50 text-sm">Symbol Explorer</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-2 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="flex justify-end mb-2">
            <button
              onClick={collapseAll}
              className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded cursor-pointer"
            >
              Collapse All
            </button>
          </div>
          <MemoizedTreeNode
            data={treeStructure}
            path=""
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            colorScale={colorScale}
            onHoverSymbol={handleHoverSymbol}
            hoveredSymbolId={hoveredSymbolId}
            onSelectSymbol={handleSelectSymbol}
            selectedNodeId={selectedNodeId}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <h1 className="font-semibold text-neutral-50">Memory Dependency Tracker</h1>
        </div>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 mt-8 bg-neutral-800 border border-neutral-700 text-neutral-300 px-2 py-1 rounded text-xs hover:bg-neutral-700 cursor-pointer"
          >
            ☰ Explorer
          </button>
        )}
        <canvas ref={canvasRef} width="100%" height="100%" />
      </div>
    </div>
  );
}

export default App;
