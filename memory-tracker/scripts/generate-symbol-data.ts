import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Write debug output to file
const debugLog = (message: string) => {
  fs.appendFileSync(path.resolve(__dirname, 'debug.log'), message + '\n');
};

debugLog('Script started');
debugLog('__dirname: ' + __dirname);

// Load existing file system data
const fileSystemDataPath = path.resolve(__dirname, '../src/fileSystemData.json');
debugLog('Loading file system data from: ' + fileSystemDataPath);
const fileSystemData = JSON.parse(fs.readFileSync(fileSystemDataPath, 'utf-8'));
debugLog('File system data loaded');

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

function extractSymbols(filePath: string, folder: string): SymbolNode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const symbols: SymbolNode[] = [];

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      symbols.push({
        id: `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`,
        name: node.name.text,
        type: 'function',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isClassDeclaration(node) && node.name) {
      symbols.push({
        id: `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`,
        name: node.name.text,
        type: 'class',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (ts.isIdentifier(decl.name)) {
          symbols.push({
            id: `${folder}-${path.basename(filePath, '.ts')}-${decl.name.text}`,
            name: decl.name.text,
            type: 'variable',
            file: path.basename(filePath),
            folder,
            isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
          });
        }
      });
    } else if (ts.isInterfaceDeclaration(node) && node.name) {
      symbols.push({
        id: `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`,
        name: node.name.text,
        type: 'interface',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isTypeAliasDeclaration(node) && node.name) {
      symbols.push({
        id: `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`,
        name: node.name.text,
        type: 'type',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isEnumDeclaration(node) && node.name) {
      symbols.push({
        id: `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`,
        name: node.name.text,
        type: 'enum',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return symbols;
}

function extractImports(filePath: string): { imports: string[]; symbols: string[]; wildcardImports: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  const symbols: string[] = [];
  const wildcardImports: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
      imports.push(moduleSpecifier);

      if (node.importClause && node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          // Named imports: import { foo, bar } from './file'
          node.importClause.namedBindings.elements.forEach((element) => {
            symbols.push(element.name.text);
          });
        } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          // Wildcard import: import * as namespace from './file'
          wildcardImports.push(moduleSpecifier);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { imports, symbols, wildcardImports };
}

function extractSymbolsFromFile(filePath: string, folder: string): SymbolNode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const symbols: SymbolNode[] = [];
  const symbolCounts = new Map<string, number>();

  function getUniqueId(baseName: string): string {
    const count = symbolCounts.get(baseName) || 0;
    symbolCounts.set(baseName, count + 1);
    return count === 0 ? baseName : `${baseName}-${count}`;
  }

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const baseId = `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`;
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'function',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isClassDeclaration(node) && node.name) {
      const baseId = `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`;
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'class',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (ts.isIdentifier(decl.name)) {
          const baseId = `${folder}-${path.basename(filePath, '.ts')}-${decl.name.text}`;
          symbols.push({
            id: getUniqueId(baseId),
            name: decl.name.text,
            type: 'variable',
            file: path.basename(filePath),
            folder,
            isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
          });
        }
      });
    } else if (ts.isInterfaceDeclaration(node) && node.name) {
      const baseId = `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`;
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'interface',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isTypeAliasDeclaration(node) && node.name) {
      const baseId = `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`;
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'type',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isEnumDeclaration(node) && node.name) {
      const baseId = `${folder}-${path.basename(filePath, '.ts')}-${node.name.text}`;
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'enum',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return symbols;
}

function buildSymbolGraphFromFileSystem(fsData: any, backendPath: string): SymbolData {
  const allSymbols: SymbolNode[] = [];
  const fileToSymbols = new Map<string, SymbolNode[]>();
  const edges: SymbolEdge[] = [];

  function traverse(node: any) {
    debugLog('Traversing node type: ' + node.type + ' path: ' + (node.path || 'none'));

    if (node.type === 'directory') {
      const childKeys = Object.keys(node.children || {});
      debugLog('Directory has ' + childKeys.length + ' children: ' + childKeys.join(', '));
      Object.values(node.children || {}).forEach((child: any) => traverse(child));
    } else if (node.type === 'file') {
      // Remove 'src/' prefix from path to avoid duplication
      const relativePath = node.path.startsWith('src/') ? node.path.substring(4) : node.path;
      const filePath = path.join(backendPath, relativePath);
      const folder = path.dirname(relativePath);

      debugLog('Processing file: ' + node.path);
      debugLog('Relative path: ' + relativePath);
      debugLog('Full path: ' + filePath);
      debugLog('File exists: ' + fs.existsSync(filePath));

      if (fs.existsSync(filePath)) {
        const symbols = extractSymbolsFromFile(filePath, folder);
        debugLog('Extracted ' + symbols.length + ' symbols from ' + node.path);
        allSymbols.push(...symbols);
        fileToSymbols.set(relativePath, symbols);
      }
    }
  }

  debugLog('Traversing file system...');
  traverse(fsData);
  debugLog(`Extracted ${allSymbols.length} symbols from ${fileToSymbols.size} files`);

  // Build edges from file-level dependencies
  function buildEdges(node: any) {
    if (node.type === 'directory') {
      Object.values(node.children || {}).forEach((child: any) => buildEdges(child));
    } else if (node.type === 'file') {
      // Remove 'src/' prefix from path to avoid duplication
      const relativePath = node.path.startsWith('src/') ? node.path.substring(4) : node.path;
      const filePath = path.join(backendPath, relativePath);
      const sourceSymbols = fileToSymbols.get(relativePath);
      if (!sourceSymbols || !fs.existsSync(filePath)) return;

      const sourceExports = sourceSymbols.filter((s) => s.isExport);

      // Use AST-based import extraction to detect wildcard imports
      const { imports, wildcardImports } = extractImports(filePath);

      // Handle all imports (both named and wildcard)
      const allImports = [...imports, ...wildcardImports];

      allImports.forEach((importPath: string) => {
        // Resolve import path
        const dirPath = path.dirname(relativePath);
        const resolvedPath = path.resolve(path.join(backendPath, dirPath), importPath);
        const targetPath = resolvedPath.endsWith('.ts') ? resolvedPath : `${resolvedPath}.ts`;
        const targetRelativePath = path.relative(backendPath, targetPath);

        const targetSymbols = fileToSymbols.get(targetRelativePath);
        if (!targetSymbols) return;

        const targetExports = targetSymbols.filter((s) => s.isExport);

        // Create edges from all source exports to all target exports
        sourceExports.forEach((sourceSymbol) => {
          targetExports.forEach((targetSymbol) => {
            edges.push({
              source: sourceSymbol.id,
              target: targetSymbol.id,
              sourceFile: path.basename(relativePath, '.ts'),
              targetFile: path.basename(targetRelativePath, '.ts'),
            });
          });
        });
      });
    }
  }

  debugLog('Building edges...');
  buildEdges(fsData);
  debugLog(`Created ${edges.length} edges`);

  return { nodes: allSymbols, edges };
}

// Build symbol graph from backend directory
const backendPath = path.resolve(__dirname, '../../backend/src');

try {
  const stats = fs.statSync(backendPath);
  debugLog('Backend path: ' + backendPath);
  debugLog('Backend exists: true');
  debugLog('Is directory: ' + stats.isDirectory());
} catch (e) {
  debugLog('Backend path: ' + backendPath);
  debugLog('Backend exists: false');
  debugLog('Error: ' + e);
  process.exit(1);
}

debugLog('Starting symbol graph generation...');

const symbolData = buildSymbolGraphFromFileSystem(fileSystemData, backendPath);

debugLog('Symbol graph generation complete');

// Write to JSON file
const outputPath = path.resolve(__dirname, '../src/symbolData.json');
fs.writeFileSync(outputPath, JSON.stringify(symbolData, null, 2));

debugLog('Symbol data generated at: ' + outputPath);
debugLog(`Found ${symbolData.nodes.length} symbols and ${symbolData.edges.length} dependencies`);
