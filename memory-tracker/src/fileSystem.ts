interface FileNode {
  type: 'file';
  path: string;
  imports: string[];
}

interface DirectoryNode {
  type: 'directory';
  path: string;
  children: Record<string, FileNode | DirectoryNode>;
}

type FileSystemNode = FileNode | DirectoryNode;

// Load file system data from generated JSON
import fileSystemData from './fileSystemData.json';
import symbolData from './symbolData.json';

const fileSystem: DirectoryNode = fileSystemData as DirectoryNode;

export { fileSystem, type FileSystemNode, type FileNode, type DirectoryNode };

// Symbol-level data interfaces
interface SymbolNode {
  id: string;
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface' | 'type' | 'enum';
  file: string;
  folder: string;
  isExport: boolean;
}

interface SymbolEdge {
  source: string;
  target: string;
  sourceFile: string;
  targetFile: string;
}

interface SymbolData {
  nodes: SymbolNode[];
  edges: SymbolEdge[];
}

const symbols: SymbolData = symbolData as SymbolData;

export { symbols, type SymbolNode, type SymbolEdge, type SymbolData };

// Track if logging has already occurred to prevent duplicates
let hasLogged = false;

// Parser for symbol-level graph
export function parseSymbols(data: SymbolData) {
  const nodes: any[] = [];
  const edges: any[] = [];

  // Create nodes from symbols
  data.nodes.forEach((symbol) => {
    nodes.push({
      id: symbol.id,
      position: { x: 0, y: 0 },
      type: 'endpoint',
      data: {
        label: symbol.name,
        file: symbol.file,
        folder: symbol.folder,
        symbolType: symbol.type,
      },
    });
  });

  // Create edges from symbol dependencies
  data.edges.forEach((edge, idx) => {
    edges.push({
      id: `e-${edge.source}-${edge.target}-${idx}`,
      source: edge.source,
      target: edge.target,
    });
  });

  if (!hasLogged) {
    console.log('Parsing symbol data...');
    console.log('Total symbols:', data.nodes.length);
    console.log('Total edges in data:', data.edges.length);

    // Check export status
    const exportedSymbols = data.nodes.filter((n) => n.isExport);
    const nonExportedSymbols = data.nodes.filter((n) => !n.isExport);
    console.log('Exported symbols:', exportedSymbols.length);
    console.log('Non-exported symbols:', nonExportedSymbols.length);

    // Check for duplicate node IDs
    const nodeIds = data.nodes.map((n) => n.id);
    const uniqueNodeIds = new Set(nodeIds);
    console.log('Unique node IDs:', uniqueNodeIds.size);
    console.log('Duplicate nodes:', nodeIds.length - uniqueNodeIds.size);

    // Check for duplicate symbol names
    const symbolNames = data.nodes.map((n) => n.name);
    const uniqueSymbolNames = new Set(symbolNames);
    console.log('Unique symbol names:', uniqueSymbolNames.size);
    console.log('Duplicate symbol names:', symbolNames.length - uniqueSymbolNames.size);

    // Show some duplicate examples if any
    if (nodeIds.length !== uniqueNodeIds.size) {
      const idCounts = new Map<string, number>();
      nodeIds.forEach((id) => idCounts.set(id, (idCounts.get(id) || 0) + 1));
      const duplicates = Array.from(idCounts.entries()).filter(([_, count]) => count > 1);
      console.log('Duplicate node IDs examples:', duplicates.slice(0, 5));
    }

    console.log('Created nodes:', nodes.length);
    console.log('Created edges:', edges.length);
    console.log('Sample edge:', edges[0]);
    console.log('Sample node:', nodes[0]);

    // Detect and log duplicate edges
    const edgeKeyCount = new Map<string, number>();
    data.edges.forEach((edge) => {
      const key = `${edge.source}-${edge.target}`;
      edgeKeyCount.set(key, (edgeKeyCount.get(key) || 0) + 1);
    });

    const duplicateEdges = Array.from(edgeKeyCount.entries()).filter(([_, count]) => count > 1);
    console.log('Total unique edges:', edgeKeyCount.size);
    console.log('Duplicate edge pairs:', duplicateEdges.length);
    if (duplicateEdges.length > 0) {
      console.log('Duplicate edge examples:');
      duplicateEdges.slice(0, 5).forEach(([key, count]) => {
        console.log(`  ${key}: ${count} occurrences`);
      });
    }

    hasLogged = true;
  }

  return { nodes, edges };
}

// Simple path resolution for relative imports
function resolvePath(basePath: string, relativePath: string): string {
  const baseParts = basePath.split('/');
  const relativeParts = relativePath.split('/');

  // Remove filename from base path
  baseParts.pop();

  for (const part of relativeParts) {
    if (part === '..') {
      baseParts.pop();
    } else if (part !== '.') {
      baseParts.push(part);
    }
  }

  return baseParts.join('/');
}

// Parser to traverse file system and generate React Flow nodes and edges
export function parseFileSystem(fs: DirectoryNode) {
  const nodes: any[] = [];
  const edges: any[] = [];
  const allFiles: FileNode[] = [];
  const filePathMap: { [key: string]: string } = {}; // Maps import paths to unique IDs

  function traverse(node: FileSystemNode) {
    if (node.type === 'directory') {
      const dirNode = node as DirectoryNode;

      // Traverse children
      Object.values(dirNode.children).forEach((child) => {
        traverse(child);
      });
    } else if (node.type === 'file') {
      const fileNode = node as FileNode;

      // Add all files
      allFiles.push(fileNode);

      // Map file path to unique ID for edge resolution
      const fileName = fileNode.path.split('/').pop()!.replace('.ts', '');
      const dirName = fileNode.path.split('/').slice(-2, -1)[0];
      const uniqueId = `${dirName}-${fileName}`;
      filePathMap[fileNode.path] = uniqueId;
    }
  }

  traverse(fs);

  // Build adjacency list for dependency analysis
  const adjacency: { [key: string]: string[] } = {};
  const reverseAdjacency: { [key: string]: string[] } = {};

  allFiles.forEach((fileNode) => {
    const fileName = fileNode.path.split('/').pop()!.replace('.ts', '');
    const dirName = fileNode.path.split('/').slice(-2, -1)[0];
    const uniqueId = `${dirName}-${fileName}`;
    adjacency[uniqueId] = [];
    reverseAdjacency[uniqueId] = [];
  });

  allFiles.forEach((fileNode) => {
    const fileName = fileNode.path.split('/').pop()!.replace('.ts', '');
    const dirName = fileNode.path.split('/').slice(-2, -1)[0];
    const uniqueId = `${dirName}-${fileName}`;

    fileNode.imports.forEach((importPath) => {
      const resolvedPath = resolvePath(fileNode.path, importPath);
      const targetPath = resolvedPath.endsWith('.ts') ? resolvedPath : `${resolvedPath}.ts`;
      const targetId = filePathMap[targetPath];

      if (targetId) {
        adjacency[uniqueId].push(targetId);
        reverseAdjacency[targetId].push(uniqueId);
      }
    });
  });

  // Calculate dependency depth for each node using BFS
  const dependencyDepth: { [key: string]: number } = {};
  const visited = new Set<string>();

  function calculateDepth(nodeId: string, depth: number = 0) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    dependencyDepth[nodeId] = Math.max(dependencyDepth[nodeId] || 0, depth);

    // Traverse dependencies
    adjacency[nodeId].forEach((depId) => {
      calculateDepth(depId, depth + 1);
    });
  }

  // Start from nodes with no incoming edges (pure providers)
  Object.keys(reverseAdjacency).forEach((nodeId) => {
    if (reverseAdjacency[nodeId].length === 0) {
      visited.clear();
      calculateDepth(nodeId, 0);
    }
  });

  // Ensure all nodes have a depth value
  Object.keys(adjacency).forEach((nodeId) => {
    if (dependencyDepth[nodeId] === undefined) {
      dependencyDepth[nodeId] = 0;
    }
  });

  // Classify nodes and assign positions
  const nodePositions: { [key: string]: { x: number; y: number } } = {};
  const consumers: string[] = [];
  const providers: string[] = [];
  const mixed: { nodeId: string; depth: number }[] = [];

  Object.keys(adjacency).forEach((nodeId) => {
    const inDegree = reverseAdjacency[nodeId].length;
    const outDegree = adjacency[nodeId].length;

    if (inDegree > 0 && outDegree === 0) {
      consumers.push(nodeId);
    } else if (inDegree === 0 && outDegree > 0) {
      providers.push(nodeId);
    } else {
      mixed.push({ nodeId, depth: dependencyDepth[nodeId] || 0 });
    }
  });

  // Position providers on the left (they don't depend on anything)
  providers.forEach((nodeId, index) => {
    nodePositions[nodeId] = { x: 40, y: index * 40 + 40 };
  });

  // Position consumers on the right (they only import)
  consumers.forEach((nodeId, index) => {
    nodePositions[nodeId] = { x: 800, y: index * 40 + 40 };
  });

  // Position mixed nodes in the middle based on depth
  const maxDepth = Math.max(...mixed.map((m) => m.depth), 1);
  mixed.forEach((m) => {
    const depthIndex = m.depth;
    const nodesAtDepth = mixed.filter((n) => n.depth === depthIndex);
    const indexInDepth = nodesAtDepth.findIndex((n) => n.nodeId === m.nodeId);
    const x = Math.round((200 + (depthIndex / maxDepth) * 500) / 20) * 20;
    const y = indexInDepth * 40 + 40;
    nodePositions[m.nodeId] = { x, y };
  });

  // Create nodes with calculated positions
  allFiles.forEach((fileNode) => {
    const fileName = fileNode.path.split('/').pop()!.replace('.ts', '');
    const dirName = fileNode.path.split('/').slice(-2, -1)[0];
    const uniqueId = `${dirName}-${fileName}`;
    const pos = nodePositions[uniqueId] || { x: 400, y: 40 };

    nodes.push({
      id: uniqueId,
      position: pos,
      type: 'endpoint',
      data: {
        label: fileName,
        file: fileNode.path,
      },
    });

    // Create edges for imports
    fileNode.imports.forEach((importPath, idx) => {
      const resolvedPath = resolvePath(fileNode.path, importPath);
      const targetPath = resolvedPath.endsWith('.ts') ? resolvedPath : `${resolvedPath}.ts`;
      const targetId = filePathMap[targetPath];

      if (targetId) {
        edges.push({
          id: `e-${uniqueId}-${targetPath}-${idx}`,
          source: uniqueId,
          target: targetId,
          style: {
            stroke: 'oklch(0.5 0 0)',
            strokeWidth: 2,
          },
        });
      }
    });
  });

  return { nodes, edges };
}
