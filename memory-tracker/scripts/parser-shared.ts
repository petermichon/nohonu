import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

export interface SymbolNode {
  id: string;
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface' | 'type' | 'enum';
  file: string;
  folder: string;
  isExport: boolean;
}

export interface SymbolEdge {
  source: string;
  target: string;
  sourceFile: string;
  targetFile: string;
}

export interface SymbolData {
  nodes: SymbolNode[];
  edges: SymbolEdge[];
}

export function extractImports(filePath: string): {
  imports: string[];
  symbols: string[];
  wildcardImports: string[];
  importMap: Map<string, string[]>;
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  const symbols: string[] = [];
  const wildcardImports: string[] = [];
  const importMap = new Map<string, string[]>(); // module specifier -> imported symbol names

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
      imports.push(moduleSpecifier);

      if (node.importClause && node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          const importedSymbols: string[] = [];
          node.importClause.namedBindings.elements.forEach((element) => {
            symbols.push(element.name.text);
            importedSymbols.push(element.name.text);
          });
          importMap.set(moduleSpecifier, importedSymbols);
        } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          wildcardImports.push(moduleSpecifier);
          importMap.set(moduleSpecifier, []); // Empty array indicates wildcard
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { imports, symbols, wildcardImports, importMap };
}

export interface ReExport {
  symbolName: string;
  sourceFile: string;
}

export function extractReExports(filePath: string): ReExport[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const reExports: ReExport[] = [];
  const imports = new Map<string, string>(); // symbolName -> sourceFile

  function visit(node: ts.Node) {
    // Track imports
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings) {
      const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');

      if (ts.isNamedImports(node.importClause.namedBindings)) {
        node.importClause.namedBindings.elements.forEach((element) => {
          imports.set(element.name.text, moduleSpecifier);
        });
      }
    }

    // Detect direct re-exports: export { x } from './file'
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');

      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((element) => {
          reExports.push({
            symbolName: element.name.text,
            sourceFile: moduleSpecifier,
          });
        });
      }
    }

    // Detect re-exports of imported symbols: export { x }
    if (
      ts.isExportDeclaration(node) &&
      !node.moduleSpecifier &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      node.exportClause.elements.forEach((element) => {
        const sourceFile = imports.get(element.name.text);
        if (sourceFile) {
          reExports.push({
            symbolName: element.name.text,
            sourceFile: sourceFile,
          });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return reExports;
}

export function extractSymbolsFromFile(filePath: string, folder: string): SymbolNode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const symbols: SymbolNode[] = [];
  const symbolCounts = new Map<string, number>();

  function getUniqueId(baseName: string): string {
    const count = symbolCounts.get(baseName) || 0;
    symbolCounts.set(baseName, count + 1);
    return count === 0 ? baseName : `${baseName}-${count}`;
  }

  function isTopLevel(node: ts.Node): boolean {
    return node.parent === sourceFile;
  }

  function getBaseId(symbolName: string): string {
    const fileName = path.basename(filePath, '.ts');
    if (folder === '.') {
      return `${fileName}.${symbolName}`;
    }
    return `${folder}/${fileName}.${symbolName}`;
  }

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const baseId = getBaseId(node.name.text);
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'function',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isClassDeclaration(node) && node.name) {
      const baseId = getBaseId(node.name.text);
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'class',
        file: path.basename(filePath),
        folder,
        isExport: node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false,
      });
    } else if (ts.isVariableStatement(node) && isTopLevel(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (ts.isIdentifier(decl.name)) {
          const baseId = getBaseId(decl.name.text);
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
      const baseId = getBaseId(node.name.text);
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'interface',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isTypeAliasDeclaration(node) && node.name) {
      const baseId = getBaseId(node.name.text);
      symbols.push({
        id: getUniqueId(baseId),
        name: node.name.text,
        type: 'type',
        file: path.basename(filePath),
        folder,
        isExport: true,
      });
    } else if (ts.isEnumDeclaration(node) && node.name) {
      const baseId = getBaseId(node.name.text);
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

export function buildSymbolGraphFromFileSystem(
  fsData: any,
  backendPath: string,
  debugLog?: (msg: string) => void
): SymbolData {
  const allSymbols: SymbolNode[] = [];
  const fileToSymbols = new Map<string, SymbolNode[]>();
  const fileToReExports = new Map<string, ReExport[]>();
  const edges: SymbolEdge[] = [];

  function traverse(node: any) {
    if (debugLog) debugLog('Traversing node type: ' + node.type + ' path: ' + (node.path || 'none'));

    if (node.type === 'directory') {
      const childKeys = Object.keys(node.children || {});
      if (debugLog) debugLog('Directory has ' + childKeys.length + ' children: ' + childKeys.join(', '));
      Object.values(node.children || {}).forEach((child: any) => traverse(child));
    } else if (node.type === 'file') {
      const relativePath = node.path;
      const filePath = path.join(backendPath, relativePath);
      const folder = path.dirname(relativePath);

      if (debugLog) {
        debugLog('Processing file: ' + node.path);
        debugLog('Relative path: ' + relativePath);
        debugLog('Full path: ' + filePath);
        debugLog('File exists: ' + fs.existsSync(filePath));
      }

      if (fs.existsSync(filePath)) {
        const symbols = extractSymbolsFromFile(filePath, folder);
        if (debugLog) debugLog('Extracted ' + symbols.length + ' symbols from ' + node.path);
        allSymbols.push(...symbols);
        fileToSymbols.set(relativePath, symbols);

        // Extract re-exports
        const reExports = extractReExports(filePath);
        if (reExports.length > 0) {
          fileToReExports.set(relativePath, reExports);
          if (debugLog) debugLog('Extracted ' + reExports.length + ' re-exports from ' + node.path);
        }
      }
    }
  }

  if (debugLog) debugLog('Traversing file system...');
  traverse(fsData);
  if (debugLog) debugLog(`Extracted ${allSymbols.length} symbols from ${fileToSymbols.size} files`);

  // Use all symbols (both exported and non-exported)
  if (debugLog) debugLog(`Using all ${allSymbols.length} symbols (exported and non-exported)`);

  // Track edge keys to prevent duplicates
  const edgeKeyCount = new Map<string, number>();

  // Build re-export resolution map: symbolName -> actual source file path
  // Handle recursive re-export chains
  const reExportMap = new Map<string, string>();

  function resolveReExportChain(symbolName: string, currentPath: string, visited: Set<string>): string | null {
    if (visited.has(currentPath)) {
      if (debugLog) debugLog('Circular re-export detected for ' + symbolName + ' at ' + currentPath);
      return null;
    }
    visited.add(currentPath);

    const reExports = fileToReExports.get(currentPath);
    if (reExports) {
      const reExport = reExports.find((r) => r.symbolName === symbolName);
      if (reExport) {
        const dirPath = path.dirname(currentPath);
        const resolvedPath = path.resolve(path.join(backendPath, dirPath), reExport.sourceFile);
        const targetPath = resolvedPath.endsWith('.ts') ? resolvedPath : `${resolvedPath}.ts`;
        const targetRelativePath = path.relative(backendPath, targetPath);

        // Check if the target file also re-exports this symbol (recursive)
        const targetReExports = fileToReExports.get(targetRelativePath);
        if (targetReExports && targetReExports.some((r) => r.symbolName === symbolName)) {
          return resolveReExportChain(symbolName, targetRelativePath, visited);
        }

        return targetRelativePath;
      }
    }

    return null;
  }

  fileToReExports.forEach((reExports, filePath) => {
    reExports.forEach((reExport) => {
      const resolvedPath = resolveReExportChain(reExport.symbolName, filePath, new Set());
      if (resolvedPath) {
        reExportMap.set(reExport.symbolName, resolvedPath);
      }
    });
  });

  if (debugLog) debugLog('Built re-export map with ' + reExportMap.size + ' entries');

  // Build edges from file-level dependencies
  function buildEdges(node: any) {
    if (node.type === 'directory') {
      Object.values(node.children || {}).forEach((child: any) => buildEdges(child));
    } else if (node.type === 'file') {
      const relativePath = node.path;
      const filePath = path.join(backendPath, relativePath);
      const sourceSymbols = fileToSymbols.get(relativePath);
      if (!sourceSymbols || !fs.existsSync(filePath)) return;

      // Use AST-based import extraction to detect imports and imported symbols
      const { imports, wildcardImports, importMap } = extractImports(filePath);

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

        // Get actually imported symbols for this specific import path
        const importedSymbolNames = importMap.get(importPath) || [];
        const isWildcard = importedSymbolNames.length === 0 && wildcardImports.includes(importPath);

        // For wildcard imports, all source symbols can access all target exports
        // For named imports, all source symbols can access the specifically imported target symbols
        const targetSymbolsToConnect = isWildcard
          ? targetExports
          : targetExports.filter((s) => importedSymbolNames.includes(s.name));

        // Create edges from all source symbols to the imported target symbols
        sourceSymbols.forEach((sourceSymbol) => {
          targetSymbolsToConnect.forEach((targetSymbol) => {
            const edgeKey = `${sourceSymbol.id}-${targetSymbol.id}`;
            if (!edgeKeyCount.has(edgeKey)) {
              edges.push({
                source: sourceSymbol.id,
                target: targetSymbol.id,
                sourceFile: path.basename(relativePath, '.ts'),
                targetFile: path.basename(targetRelativePath, '.ts'),
              });
              edgeKeyCount.set(edgeKey, 1);
            } else {
              edgeKeyCount.set(edgeKey, edgeKeyCount.get(edgeKey)! + 1);
            }
          });
        });

        // Also check if target file has re-exports and create edges to the actual source files
        const targetReExports = fileToReExports.get(targetRelativePath);
        if (targetReExports) {
          targetReExports.forEach((reExport) => {
            const actualSourcePath = reExportMap.get(reExport.symbolName);
            if (actualSourcePath) {
              const actualSourceSymbols = fileToSymbols.get(actualSourcePath);
              if (actualSourceSymbols) {
                const actualSourceMatches = actualSourceSymbols.filter((s) => s.name === reExport.symbolName);
                actualSourceMatches.forEach((actualSymbol) => {
                  sourceSymbols.forEach((sourceSymbol) => {
                    const edgeKey = `${sourceSymbol.id}-${actualSymbol.id}`;
                    if (!edgeKeyCount.has(edgeKey)) {
                      edges.push({
                        source: sourceSymbol.id,
                        target: actualSymbol.id,
                        sourceFile: path.basename(relativePath, '.ts'),
                        targetFile: path.basename(actualSourcePath, '.ts'),
                      });
                      edgeKeyCount.set(edgeKey, 1);
                    } else {
                      edgeKeyCount.set(edgeKey, edgeKeyCount.get(edgeKey)! + 1);
                    }
                  });
                });
              }
            }
          });
        }
      });
    }
  }

  if (debugLog) debugLog('Building edges...');
  buildEdges(fsData);
  if (debugLog) debugLog(`Created ${edges.length} edges`);

  // Add intra-file bidirectional edges (symbols in same file can access each other)
  let intraFileEdges = 0;
  fileToSymbols.forEach((symbols, filePath) => {
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];

        // Create bidirectional edge
        const edgeKey1 = `${symbol1.id}-${symbol2.id}`;
        const edgeKey2 = `${symbol2.id}-${symbol1.id}`;

        if (!edgeKeyCount.has(edgeKey1)) {
          edges.push({
            source: symbol1.id,
            target: symbol2.id,
            sourceFile: path.basename(filePath, '.ts'),
            targetFile: path.basename(filePath, '.ts'),
          });
          edgeKeyCount.set(edgeKey1, 1);
          intraFileEdges++;
        }

        if (!edgeKeyCount.has(edgeKey2)) {
          edges.push({
            source: symbol2.id,
            target: symbol1.id,
            sourceFile: path.basename(filePath, '.ts'),
            targetFile: path.basename(filePath, '.ts'),
          });
          edgeKeyCount.set(edgeKey2, 1);
          intraFileEdges++;
        }
      }
    }
  });

  if (debugLog) debugLog(`Added ${intraFileEdges} intra-file edges`);

  // Log duplicate edge statistics (edgeKeyCount already tracks this from deduplication)
  const duplicateEdges = Array.from(edgeKeyCount.entries()).filter(([_, count]) => count > 1);
  if (debugLog) {
    debugLog(`Total unique edges: ${edgeKeyCount.size}`);
    debugLog(`Duplicate edge pairs prevented: ${duplicateEdges.length}`);
    if (duplicateEdges.length > 0) {
      debugLog('Duplicate edge examples (prevented):');
      duplicateEdges.slice(0, 5).forEach(([key, count]) => {
        debugLog(`  ${key}: ${count} occurrences`);
      });
    }
  }

  return { nodes: allSymbols, edges };
}
