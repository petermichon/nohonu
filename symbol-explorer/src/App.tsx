import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import * as d3 from 'd3';
import {
  Folder,
  File,
  Box,
  Eye,
  EyeOff,
  CopyMinus,
  CopyPlus,
  Menu,
  Eye as EyeOpen,
  Lock,
  Unlock,
  Play,
  Pause,
  RefreshCw,
  Settings,
} from 'lucide-react';
import './index.css';
import { symbols, parseSymbols } from './fileSystem';

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="relative inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed z-9999 px-3 py-1.5 text-xs text-white bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 whitespace-nowrap pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

function TreeNode({
  data,
  path,
  expandedFolders,
  toggleFolder,
  hiddenPaths,
  togglePathVisibility,
  hiddenNodes,
  toggleNodeVisibility,
  colorScale,
  onHoverSymbol,
  onHoverFile,
  onHoverFolder,
  hoveredSymbolId,
  onSelectSymbol,
  selectedNodeId,
}: any) {
  // Helper to check if a path or any of its parents is hidden
  const isPathOrParentHidden = (itemPath: string): boolean => {
    if (hiddenPaths.has(itemPath)) return true;
    const parts = itemPath.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const parentPath = parts.slice(0, i + 1).join('/');
      if (hiddenPaths.has(parentPath)) return true;
    }
    return false;
  };

  return (
    <>
      {Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, item]: [string, any]) => {
          const fullPath = path ? `${path}/${name}` : name;
          const isExpanded = expandedFolders.has(fullPath);
          const isFolder = item.type === 'folder';
          const isHidden = hiddenPaths.has(fullPath);
          const isParentHidden = isPathOrParentHidden(fullPath);
          const folderColor = isFolder ? (colorScale(fullPath) as string) : (colorScale(path) as string);

          return (
            <div key={fullPath} className="mb-1">
              <div
                onClick={() => toggleFolder(fullPath)}
                className="w-full text-left px-2 py-1 text-sm font-medium text-neutral-300 hover:bg-neutral-700 rounded flex items-center gap-1 cursor-pointer group"
                style={{ opacity: isHidden || isParentHidden ? 0.5 : 1 }}
                onMouseEnter={() => {
                  if (isFolder) onHoverFolder(fullPath);
                  else onHoverFile(fullPath);
                }}
                onMouseLeave={() => {
                  if (isFolder) onHoverFolder(null);
                  else onHoverFile(null);
                }}
              >
                {isFolder ? (
                  <Folder size={16} style={{ color: folderColor }} />
                ) : (
                  <File size={16} style={{ color: folderColor }} />
                )}
                <span className="truncate" style={{ color: folderColor }}>
                  {name}
                </span>
                {isFolder && (
                  <span className="text-neutral-500 text-sm ml-auto">({Object.keys(item.children).length})</span>
                )}
                {!isFolder && <span className="text-neutral-500 text-sm ml-auto">({item.symbols.length})</span>}
                <Tooltip content={isHidden ? 'Show' : 'Hide'}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePathVisibility(fullPath);
                    }}
                    className={`${isHidden ? '' : 'hidden group-hover:block'} ml-2 cursor-pointer text-neutral-300`}
                  >
                    {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </Tooltip>
              </div>
              {isExpanded && isFolder && (
                <div className="ml-4 mt-1">
                  <TreeNode
                    data={item.children}
                    path={fullPath}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    hiddenPaths={hiddenPaths}
                    togglePathVisibility={togglePathVisibility}
                    hiddenNodes={hiddenNodes}
                    toggleNodeVisibility={toggleNodeVisibility}
                    colorScale={colorScale}
                    onHoverSymbol={onHoverSymbol}
                    onHoverFile={onHoverFile}
                    onHoverFolder={onHoverFolder}
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
                    const isNodeHidden = hiddenNodes.has(symbolId);
                    const isParentHidden = isPathOrParentHidden(fullPath);
                    return (
                      <div
                        key={symbol}
                        ref={
                          isSelected
                            ? (el: HTMLDivElement) => {
                                if (el) {
                                  requestAnimationFrame(() => {
                                    const scrollContainer = el.closest('.overflow-y-scroll') as HTMLElement;
                                    if (scrollContainer) {
                                      const containerRect = scrollContainer.getBoundingClientRect();
                                      const elementRect = el.getBoundingClientRect();
                                      const offsetTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
                                      const containerHeight = containerRect.height;

                                      // Center the element in the viewport
                                      const targetScroll = offsetTop - containerHeight / 2 + elementRect.height / 2;
                                      scrollContainer.scrollTop = targetScroll;
                                    }
                                  });
                                }
                              }
                            : null
                        }
                        className={`text-sm px-2 py-0.5 truncate cursor-pointer rounded flex items-center gap-1 group ${
                          isSelected ? 'bg-neutral-500' : isHovered ? 'bg-neutral-600' : 'hover:bg-neutral-700'
                        }`}
                        style={{ color: folderColor, opacity: isNodeHidden || isParentHidden ? 0.5 : 1 }}
                        onMouseEnter={() => {
                          onHoverSymbol(symbolId);
                        }}
                        onMouseLeave={() => {
                          onHoverSymbol(null);
                        }}
                        onClick={() => onSelectSymbol(symbolId)}
                      >
                        <Box size={16} className="flex-shrink-0" style={{ color: folderColor }} />
                        <span className="truncate flex-1">{symbol}</span>
                        <Tooltip content={isNodeHidden ? 'Show' : 'Hide'}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeVisibility(symbolId);
                            }}
                            className={`${isNodeHidden ? '' : 'hidden group-hover:block'} cursor-pointer text-neutral-300`}
                          >
                            {isNodeHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </Tooltip>
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
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const mouseOverCanvasRef = useRef(false);
  const selectedNodeRef = useRef<string | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const dprRef = useRef(window.devicePixelRatio || 1);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [rightSidebarOpen, setRightSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('rightSidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const rightSidebarOpenRef = useRef(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [hiddenPaths, setHiddenPaths] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hiddenPaths');
    return saved !== null ? new Set(JSON.parse(saved)) : new Set();
  });
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hiddenNodes');
    return saved !== null ? new Set(JSON.parse(saved)) : new Set();
  });
  const [hoveredSymbolId, setHoveredSymbolId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [simulationLocked, setSimulationLocked] = useState(false);
  const simulationLockedRef = useRef(false);
  const [forcesEnabled, setForcesEnabled] = useState(false);
  const forcesEnabledRef = useRef(false);
  const [chargeStrength, setChargeStrength] = useState(() => {
    const saved = localStorage.getItem('chargeStrength');
    return saved !== null ? JSON.parse(saved) : -100;
  });
  const [linkDistance, setLinkDistance] = useState(() => {
    const saved = localStorage.getItem('linkDistance');
    return saved !== null ? JSON.parse(saved) : 30;
  });
  const [alphaDecayValue, setAlphaDecayValue] = useState(() => {
    const saved = localStorage.getItem('alphaDecayValue');
    return saved !== null ? JSON.parse(saved) : 0.0228;
  });
  const [edgeOpacity, setEdgeOpacity] = useState(() => {
    const saved = localStorage.getItem('edgeOpacity');
    return saved !== null ? JSON.parse(saved) : 0.5;
  });

  const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => parseSymbols(symbols), [symbols]);

  // Filter nodes and edges based on hidden folders, files, and individual nodes
  const { filteredNodes, filteredEdges } = useMemo(() => {
    const hiddenSet = hiddenPaths;
    const hiddenNodeSet = hiddenNodes;

    const visibleNodes = generatedNodes.filter((node: any) => {
      // Check if this specific node is hidden
      if (hiddenNodeSet.has(node.id)) {
        return false;
      }

      const folder = node.data.folder || 'root';
      const file = node.data.file || '';

      // Check if this folder or any parent folder is hidden
      const folderParts = folder.split('/');
      for (let i = 0; i < folderParts.length; i++) {
        const parentPath = folderParts.slice(0, i + 1).join('/');
        if (hiddenSet.has(parentPath)) {
          return false;
        }
      }

      // Check if this specific file is hidden
      // Remove .ts extension from file for matching with tree paths
      const fileNameWithoutExt = file.replace('.ts', '');
      const filePath = file ? `${folder}/${fileNameWithoutExt}` : folder;
      if (hiddenSet.has(filePath)) {
        return false;
      }

      return true;
    });

    const visibleNodeIds = new Set(visibleNodes.map((n: any) => n.id));

    const visibleEdges = generatedEdges.filter((edge: any) => {
      // Handle both string IDs and D3 node objects
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return { filteredNodes: visibleNodes, filteredEdges: visibleEdges };
  }, [generatedNodes, generatedEdges, hiddenPaths, hiddenNodes]);

  const handleHoverSymbol = useCallback(
    (nodeId: string | null) => {
      if (nodeId === null) {
        hoveredNodeRef.current = null;
      } else {
        const node = filteredNodes.find((n: any) => n.id === nodeId);
        hoveredNodeRef.current = node || null;
      }
      if (drawRef.current) {
        drawRef.current();
      }
    },
    [filteredNodes]
  );

  const handleHoverFile = useCallback(
    (filePath: string | null) => {
      // Update hovered nodes to include all nodes from this file
      if (filePath === null) {
        hoveredNodeRef.current = null;
      } else {
        const nodesInFile = filteredNodes.filter((n: any) => {
          const lastDotIndex = n.id.lastIndexOf('.');
          const nodeFilePath = n.id.substring(0, lastDotIndex);
          return nodeFilePath === filePath;
        });
        hoveredNodeRef.current = nodesInFile.length > 0 ? nodesInFile : null;
      }
      if (drawRef.current) {
        drawRef.current();
      }
    },
    [filteredNodes]
  );

  const handleHoverFolder = useCallback(
    (folderPath: string | null) => {
      // Update hovered nodes to include all nodes from this folder and subfolders
      if (folderPath === null) {
        hoveredNodeRef.current = null;
      } else {
        const nodesInFolder = filteredNodes.filter((n: any) => {
          const lastDotIndex = n.id.lastIndexOf('.');
          const nodeFilePath = n.id.substring(0, lastDotIndex);
          // Check if node's file path starts with the folder path
          return nodeFilePath.startsWith(folderPath + '/') || nodeFilePath === folderPath;
        });
        hoveredNodeRef.current = nodesInFolder.length > 0 ? nodesInFolder : null;
      }
      if (drawRef.current) {
        drawRef.current();
      }
    },
    [filteredNodes]
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

  // Extract folder names for coloring (based on all nodes for consistent colors)
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

  // Build hierarchical folder/file tree structure (based on all nodes for sidebar)
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

  const togglePathVisibility = useCallback((path: string) => {
    setHiddenPaths((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const toggleNodeVisibility = useCallback((nodeId: string) => {
    setHiddenNodes((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  const showAll = useCallback(() => {
    setHiddenPaths(new Set());
    setHiddenNodes(new Set());
  }, []);

  const hideAll = useCallback(() => {
    const pathsToHide = new Set<string>();
    const nodesToHide = new Set<string>();

    function collectVisibleItems(node: any, currentPath: string = '') {
      Object.entries(node).forEach(([name, item]: [string, any]) => {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;

        if (item.type === 'folder') {
          if (expandedFolders.has(fullPath)) {
            // Folder is expanded, hide its direct children
            Object.entries(item.children).forEach(([childName, childItem]: [string, any]) => {
              const childPath = `${fullPath}/${childName}`;
              if (childItem.type === 'folder') {
                pathsToHide.add(childPath);
              } else if (childItem.type === 'file') {
                pathsToHide.add(childPath);
                childItem.symbols.forEach((symbol: string) => {
                  nodesToHide.add(`${childPath}.${symbol}`);
                });
              }
            });
          } else {
            // Folder is collapsed, hide the folder itself
            pathsToHide.add(fullPath);
          }
        } else if (item.type === 'file') {
          // Files are only visible if their parent folder is expanded
          // If we reach a file, its parent must be expanded, so hide it
          pathsToHide.add(fullPath);
          item.symbols.forEach((symbol: string) => {
            nodesToHide.add(`${fullPath}.${symbol}`);
          });
        }
      });
    }

    collectVisibleItems(treeStructure);
    setHiddenPaths(pathsToHide);
    setHiddenNodes(nodesToHide);
  }, [treeStructure, expandedFolders]);

  const toggleSimulationLock = useCallback(() => {
    setSimulationLocked((prev) => {
      const newLocked = !prev;
      if (simulationRef.current) {
        if (newLocked) {
          simulationRef.current.stop();
        } else {
          simulationRef.current.alpha(0.3).restart();
        }
      }
      return newLocked;
    });
  }, []);

  const toggleForces = useCallback(() => {
    setForcesEnabled((prev) => {
      const newEnabled = !prev;
      forcesEnabledRef.current = newEnabled;
      if (simulationRef.current) {
        if (newEnabled) {
          // Run forces: set alphaDecay to 0 so it doesn't decay
          simulationRef.current.alphaDecay(0).alpha(0.3).restart();
        } else {
          // Stop forces: restore normal alphaDecay
          simulationRef.current.alphaDecay(0.0228);
        }
      }
      return newEnabled;
    });
  }, []);

  const resetGraph = useCallback(() => {
    if (simulationRef.current) {
      // Reset all node positions with random positions around center
      filteredNodes.forEach((node: any) => {
        node.x = (Math.random() - 0.5) * 100;
        node.y = (Math.random() - 0.5) * 100;
        node.vx = 0;
        node.vy = 0;
      });
      // Reset transform to center
      transformRef.current = {
        x: window.innerWidth / 2 - (sidebarOpenRef.current ? 150 : 0),
        y: window.innerHeight / 2,
        k: 1,
      };
      simulationRef.current.alpha(1).restart();
      if (drawRef.current) {
        drawRef.current();
      }
    }
  }, [filteredNodes]);

  const expandAll = useCallback(() => {
    const allPaths = new Set<string>();
    function collectPaths(node: any, currentPath: string = '') {
      Object.entries(node).forEach(([name, item]: [string, any]) => {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;
        if (item.type === 'folder') {
          allPaths.add(fullPath);
          collectPaths(item.children, fullPath);
        } else if (item.type === 'file') {
          allPaths.add(fullPath);
        }
      });
    }
    collectPaths(treeStructure);
    setExpandedFolders(allPaths);
  }, [treeStructure]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const widthRef = {
      current: window.innerWidth - (sidebarOpenRef.current ? 300 : 0) - (rightSidebarOpenRef.current ? 300 : 0),
    };
    const heightRef = { current: window.innerHeight };
    let width = widthRef.current;
    let height = heightRef.current;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(dpr, dpr);

    const handleResize = () => {
      const newDpr = window.devicePixelRatio || 1;
      const dprChanged = newDpr !== dprRef.current;

      if (dprChanged) {
        dprRef.current = newDpr;
      }

      width = window.innerWidth - (sidebarOpenRef.current ? 300 : 0) - (rightSidebarOpenRef.current ? 300 : 0);
      height = window.innerHeight;
      widthRef.current = width;
      heightRef.current = height;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(newDpr, 0, 0, newDpr, 0, 0);
      transformRef.current.x = width / 2;
      transformRef.current.y = height / 2;
      simulation.alpha(0.3).restart();
    };

    const handleSidebarResize = () => {
      const newDpr = dprRef.current;
      const newWidth = window.innerWidth - (sidebarOpenRef.current ? 300 : 0) - (rightSidebarOpenRef.current ? 300 : 0);
      widthRef.current = newWidth;
      canvas.width = newWidth * newDpr;
      canvas.style.width = `${newWidth}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(newDpr, newDpr);
      transformRef.current.x = newWidth / 2;
      if (drawRef.current) {
        drawRef.current();
      }
    };

    resizeRef.current = handleSidebarResize;

    window.addEventListener('resize', handleResize);

    // Initialize transform if not set
    if (transformRef.current.x === 0 && transformRef.current.y === 0) {
      transformRef.current = { x: width / 2, y: height / 2, k: 1 };
    }

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
      const newK = transformRef.current.k * zoomFactor;

      // Zoom towards mouse position
      transformRef.current.x = mouseX - (mouseX - transformRef.current.x) * (newK / transformRef.current.k);
      transformRef.current.y = mouseY - (mouseY - transformRef.current.y) * (newK / transformRef.current.k);
      transformRef.current.k = newK;

      draw();
    };

    canvas.addEventListener('wheel', handleWheel);

    const simulation = d3
      .forceSimulation(filteredNodes as any)
      .force(
        'link',
        d3
          .forceLink(filteredEdges as any)
          .id((d: any) => d.id)
          .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('x', d3.forceX(0))
      .force('y', d3.forceY(0))
      .alphaDecay(forcesEnabled ? 0 : alphaDecayValue); // Use forcesEnabled to set initial decay

    simulationRef.current = simulation;

    // Stop simulation if locked
    if (simulationLocked) {
      simulation.stop();
    }

    // Initial draw
    draw();

    function draw() {
      if (!context) return;
      context.save();
      context.clearRect(0, 0, widthRef.current, heightRef.current);
      context.translate(transformRef.current.x, transformRef.current.y);
      context.scale(transformRef.current.k, transformRef.current.k);

      // Draw edges
      const hoveredNodes = hoveredNodeRef.current;
      const hoveredNodeId = Array.isArray(hoveredNodes) ? hoveredNodes[0]?.id : hoveredNodes?.id;
      const selectedNodeId = selectedNodeRef.current;

      filteredEdges.forEach((edge: any) => {
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
        // Show outgoing edges from hovered or selected node at full opacity
        const isOutgoingFromHovered = hoveredNodeId && edge.source.id === hoveredNodeId;
        const isOutgoingFromSelected = selectedNodeId && edge.source.id === selectedNodeId;
        context.globalAlpha = isOutgoingFromHovered || isOutgoingFromSelected ? 1 : edgeOpacity;
        context.stroke();
        context.globalAlpha = 1;
      });

      // Draw nodes
      filteredNodes.forEach((node: any) => {
        const isSelected = node.id === selectedNodeRef.current;
        const hoveredNodes = hoveredNodeRef.current;
        const isHovered = Array.isArray(hoveredNodes)
          ? hoveredNodes.some((n: any) => n.id === node.id)
          : hoveredNodes?.id === node.id;

        context.beginPath();
        context.arc(node.x, node.y, isSelected ? 7 : 5, 0, 2 * Math.PI);
        context.fillStyle = colorScale(folderMap.get(node.id) || 'root') as string;
        context.fill();

        context.strokeStyle = isSelected ? '#ffffff' : '#171717';
        context.lineWidth = isSelected ? 2.5 : 1.5;
        context.stroke();

        // Draw hover overlay (50% opacity neutral-50) on top of border
        if (isHovered && !isSelected) {
          context.beginPath();
          context.arc(node.x, node.y, 8, 0, 2 * Math.PI);
          context.fillStyle = 'rgba(250, 250, 250, 0.5)';
          context.fill();
        }
      });

      // Draw selected label (always shows if node is selected)
      if (selectedNodeRef.current) {
        const selectedNode = filteredNodes.find((n: any) => n.id === selectedNodeRef.current);
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
          const padding = 6;
          const rectWidth = totalWidth + padding * 2;
          const rectHeight = 20;
          const rectX = startX - padding;
          const rectY = selectedNode.y - 12 - rectHeight;
          const textY = rectY + rectHeight / 2 + 3; // Center text vertically with slight offset for baseline

          // Draw rounded rectangle background (zinc-950 transparent)
          context.fillStyle = 'rgba(9, 9, 11, 0.5)';
          context.beginPath();
          context.roundRect(rectX, rectY, rectWidth, rectHeight, 4);
          context.fill();

          // Draw symbol (bold, white)
          context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = '#fafafa'; // neutral-50
          context.fillText(symbolPart, startX, textY);

          // Draw path (normal, gray)
          context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          context.fillStyle = '#fafafa'; // neutral-50
          context.fillText(` ${pathPart}`, startX + symbolWidth, textY);
        }
      }

      // Draw hover label (shows if hovering and different from selected)
      if (
        hoveredNodeRef.current &&
        !Array.isArray(hoveredNodeRef.current) &&
        hoveredNodeRef.current.id !== selectedNodeRef.current
      ) {
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
        const padding = 6;
        const rectWidth = totalWidth + padding * 2;
        const rectHeight = 20;
        const rectX = startX - padding;
        const rectY = hoveredNodeRef.current.y - 10 - rectHeight;
        const textY = rectY + rectHeight / 2 + 3; // Center text vertically with slight offset for baseline

        // Draw rounded rectangle background (zinc-950 transparent)
        context.fillStyle = 'rgba(9, 9, 11, 0.5)';
        context.beginPath();
        context.roundRect(rectX, rectY, rectWidth, rectHeight, 4);
        context.fill();

        // Draw symbol (bold, white)
        context.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = '#fafafa'; // neutral-50
        context.fillText(symbolPart, startX, textY);

        // Draw path (normal, gray)
        context.font = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        context.fillStyle = '#fafafa'; // neutral-50
        context.fillText(` ${pathPart}`, startX + symbolWidth, textY);
      }

      context.restore();
    }

    drawRef.current = draw;

    // Check hover state based on current mouse position
    const checkHover = () => {
      // Only check canvas hover if mouse is over the canvas
      if (!mouseOverCanvasRef.current) return;

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      let found = null;
      for (const node of filteredNodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < 100) {
          found = node;
          break;
        }
      }

      if (found !== hoveredNodeRef.current) {
        hoveredNodeRef.current = found;
        setHoveredSymbolId(found ? found.id : null);
        canvas.style.cursor = found ? 'pointer' : 'default';
      }
    };

    simulation.on('tick', () => {
      checkHover();
      draw();
    });

    // Combined mousemove handler for hover, drag, and pan
    const handleMouseMove = (event: MouseEvent) => {
      // Handle pan
      if (isPanning) {
        const dx = event.clientX - panStart.x;
        const dy = event.clientY - panStart.y;
        transformRef.current.x += dx;
        transformRef.current.y += dy;
        panStart = { x: event.clientX, y: event.clientY };
        draw();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
      const mouseY = (event.clientY - rect.top - transformRef.current.y) / transformRef.current.k;
      mousePositionRef.current = { x: mouseX, y: mouseY };

      // Handle drag
      if (draggedNode) {
        draggedNode.fx = mouseX;
        draggedNode.fy = mouseY;
        draw();
        return;
      }

      // Handle hover
      let found = null;
      for (const node of filteredNodes) {
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
        canvas.style.cursor = found ? 'pointer' : 'default';
        draw();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', () => {
      mouseOverCanvasRef.current = true;
    });

    const handleMouseDown = (event: MouseEvent) => {
      // Check if middle mouse button or shift key for panning
      if (event.button === 1 || event.shiftKey) {
        isPanning = true;
        panStart = { x: event.clientX, y: event.clientY };
        event.preventDefault();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
      const mouseY = (event.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

      // Check for node click (selection)
      let nodeClicked = false;
      for (const node of filteredNodes) {
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

      for (const node of filteredNodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < 100) {
          draggedNode = node;
          if (!simulationLockedRef.current) {
            simulation.alpha(0.3).restart();
          }
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
        if (!simulationLockedRef.current) {
          simulation.alphaTarget(0);
        }
      }
    };

    canvas.addEventListener('mouseup', handleMouseUp);

    const handleMouseLeave = () => {
      mouseOverCanvasRef.current = false;
      isPanning = false;
      hoveredNodeRef.current = null;
      if (draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        draggedNode = null;
        if (!simulationLockedRef.current) {
          simulation.alphaTarget(0);
        }
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
  }, [filteredNodes, filteredEdges, folderMap, colorScale, hiddenPaths, hiddenNodes, edgeOpacity]);

  // Handle sidebar resize without re-initializing simulation
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    if (resizeRef.current) {
      resizeRef.current();
    }
  }, [sidebarOpen]);

  // Handle right sidebar resize without re-initializing simulation
  useEffect(() => {
    rightSidebarOpenRef.current = rightSidebarOpen;
    localStorage.setItem('rightSidebarOpen', JSON.stringify(rightSidebarOpen));
    if (resizeRef.current) {
      resizeRef.current();
    }
  }, [rightSidebarOpen]);

  // Persist hiddenPaths to localStorage
  useEffect(() => {
    localStorage.setItem('hiddenPaths', JSON.stringify(Array.from(hiddenPaths)));
  }, [hiddenPaths]);

  // Persist hiddenNodes to localStorage
  useEffect(() => {
    localStorage.setItem('hiddenNodes', JSON.stringify(Array.from(hiddenNodes)));
  }, [hiddenNodes]);

  // Persist D3 parameters to localStorage
  useEffect(() => {
    localStorage.setItem('chargeStrength', JSON.stringify(chargeStrength));
  }, [chargeStrength]);

  useEffect(() => {
    localStorage.setItem('linkDistance', JSON.stringify(linkDistance));
  }, [linkDistance]);

  useEffect(() => {
    localStorage.setItem('alphaDecayValue', JSON.stringify(alphaDecayValue));
  }, [alphaDecayValue]);

  useEffect(() => {
    localStorage.setItem('edgeOpacity', JSON.stringify(edgeOpacity));
  }, [edgeOpacity]);

  // Update simulation forces when D3 parameters change
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.force('charge').strength(chargeStrength);
      simulationRef.current.force('link').distance(linkDistance);
      simulationRef.current.alpha(0.3).restart();
    }
  }, [chargeStrength, linkDistance]);

  // Update alpha decay when parameter changes
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.alphaDecay(forcesEnabled ? 0 : alphaDecayValue);
      simulationRef.current.alpha(0.3).restart();
    }
  }, [alphaDecayValue, forcesEnabled]);

  // Handle simulation lock state
  useEffect(() => {
    simulationLockedRef.current = simulationLocked;
    if (simulationRef.current) {
      if (simulationLocked) {
        simulationRef.current.stop();
      } else {
        simulationRef.current.alpha(0.3).restart();
      }
    }
  }, [simulationLocked]);

  return (
    <div className="h-screen w-screen bg-neutral-900 flex">
      {/* Sidebar */}
      <div
        className={`bg-neutral-900 overflow-hidden ${sidebarOpen ? 'border-r border-neutral-700' : ''}`}
        style={{ width: sidebarOpen ? '300px' : '0px' }}
      >
        <div className="p-4">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 p-2 rounded-lg select-none"
            onClick={() => setSidebarOpen(false)}
            style={{ maxWidth: 'fit-content' }}
          >
            <Menu size={24} className="text-neutral-50" />
            <h1 className="font-semibold text-neutral-50">Symbol Explorer</h1>
          </div>
        </div>
        <div>
          <div className="flex flex-col">
            <div className="pr-4 flex justify-end gap-1">
              <Tooltip content="Show All">
                <button
                  onClick={showAll}
                  className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg cursor-pointer"
                >
                  <EyeOpen size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Hide All">
                <button
                  onClick={hideAll}
                  className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg cursor-pointer"
                >
                  <EyeOff size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Expand All">
                <button
                  onClick={expandAll}
                  className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg cursor-pointer"
                >
                  <CopyPlus size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Collapse All">
                <button
                  onClick={collapseAll}
                  className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg cursor-pointer"
                >
                  <CopyMinus size={16} />
                </button>
              </Tooltip>
            </div>
            <div className="p-2 overflow-y-scroll" style={{ height: 'calc(100vh - 100px)' }}>
              <MemoizedTreeNode
                data={treeStructure}
                path=""
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                hiddenPaths={hiddenPaths}
                togglePathVisibility={togglePathVisibility}
                hiddenNodes={hiddenNodes}
                toggleNodeVisibility={toggleNodeVisibility}
                colorScale={colorScale}
                onHoverSymbol={handleHoverSymbol}
                onHoverFile={handleHoverFile}
                onHoverFolder={handleHoverFolder}
                hoveredSymbolId={hoveredSymbolId}
                onSelectSymbol={handleSelectSymbol}
                selectedNodeId={selectedNodeId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {!sidebarOpen && (
            <div
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg select-none"
              style={{ maxWidth: 'fit-content' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} className="text-neutral-50" />
              <h1 className="font-semibold text-neutral-50">Symbol Explorer</h1>
            </div>
          )}
        </div>
        <div className="absolute top-6 right-6 z-10">
          {!rightSidebarOpen && (
            <div onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="cursor-pointer">
              <Settings size={24} className="text-neutral-400" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} width="100%" height="100%" />
      </div>

      {/* Right sidebar */}
      <div
        className={`bg-neutral-900 overflow-hidden ${rightSidebarOpen ? 'border-l border-neutral-700' : ''}`}
        style={{ width: rightSidebarOpen ? '300px' : '0px' }}
      >
        <div className="p-4">
          <div className="p-2 flex items-center justify-between">
            <h1 className="font-semibold text-neutral-50">Settings</h1>
            <div onClick={() => setRightSidebarOpen(false)} className="cursor-pointer">
              <Settings size={24} className="text-neutral-400" />
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex justify-end gap-1">
            <Tooltip content="Lock Simulation">
              <button
                onClick={() => !simulationLocked && toggleSimulationLock()}
                disabled={simulationLocked}
                className={`p-2 rounded-lg cursor-pointer ${simulationLocked ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'}`}
              >
                <Lock size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Unlock Simulation">
              <button
                onClick={() => simulationLocked && toggleSimulationLock()}
                disabled={!simulationLocked}
                className={`p-2 rounded-lg cursor-pointer ${!simulationLocked ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'}`}
              >
                <Unlock size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Run Forces">
              <button
                onClick={() => !forcesEnabled && toggleForces()}
                disabled={forcesEnabled}
                className={`p-2 rounded-lg cursor-pointer ${forcesEnabled ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'}`}
              >
                <Play size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Stop Forces">
              <button
                onClick={() => forcesEnabled && toggleForces()}
                disabled={!forcesEnabled}
                className={`p-2 rounded-lg cursor-pointer ${!forcesEnabled ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'}`}
              >
                <Pause size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Reset Graph">
              <button
                onClick={resetGraph}
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Charge Strength</label>
            <input
              type="number"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-full bg-neutral-800 text-neutral-50 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Link Distance</label>
            <input
              type="number"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full bg-neutral-800 text-neutral-50 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Alpha Decay</label>
            <input
              type="number"
              step="0.0001"
              value={alphaDecayValue}
              onChange={(e) => setAlphaDecayValue(Number(e.target.value))}
              className="w-full bg-neutral-800 text-neutral-50 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Edge Opacity</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={edgeOpacity}
              onChange={(e) => setEdgeOpacity(Number(e.target.value))}
              className="w-full bg-neutral-800 text-neutral-50 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
