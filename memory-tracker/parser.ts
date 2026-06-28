#!/usr/bin/env -S deno run --allow-read

import * as ts from "https://deno.land/std/node/typescript.ts";

interface MemoryNode {
  id: string;
  file: string;
  type: "module-export" | "constructor-param" | "variable";
  name: string;
  isMutable: boolean;
  line: number;
}

interface MemoryEdge {
  from: string;
  to: string;
  type: "import" | "constructor-injection" | "variable-reference";
  file: string;
  line: number;
}

interface MemoryGraph {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

class MemoryTracker {
  private nodes = new Map<string, MemoryNode>();
  private edges: MemoryEdge[] = [];

  async analyzeDirectory(dir: string): Promise<MemoryGraph> {
    const tsFiles = this.findTsFiles(dir);
    
    for (const file of tsFiles) {
      await this.analyzeFile(file);
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };
  }

  private findTsFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of Deno.readDirSync(dir)) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        files.push(...this.findTsFiles(path));
      } else if (entry.isFile && entry.name.endsWith(".ts")) {
        files.push(path);
      }
    }
    return files;
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = await Deno.readTextFile(filePath);
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    this.analyzeModuleExports(sourceFile, filePath);
    this.analyzeConstructorInjections(sourceFile, filePath);
    this.analyzeImports(sourceFile, filePath);
  }

  private analyzeModuleExports(sourceFile: ts.SourceFile, filePath: string): void {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isVariableStatement(node)) {
        const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        
        node.declarationList.declarations.forEach(decl => {
          if (decl.name && ts.isIdentifier(decl.name)) {
            const name = decl.name.text;
            const nodeId = `${filePath}:${name}`;
            
            let isMutable = decl.kind === ts.SyntaxKind.LetKeyword;
            
            if (decl.initializer) {
              if (this.isMutableType(decl.initializer)) {
                isMutable = true;
              }
            }

            if (isExported) {
              this.nodes.set(nodeId, {
                id: nodeId,
                file: filePath,
                type: "module-export",
                name,
                isMutable,
                line: sourceFile.getLineAndCharacterOfPosition(decl.getStart(sourceFile)).line + 1,
              });
            }
          }
        });
      }
    });
  }

  private isMutableType(node: ts.Node): boolean {
    if (ts.isNewExpression(node)) {
      const type = this.getTypeName(node.expression);
      return type === "Map" || type === "Set" || type === "Array";
    }
    if (ts.isObjectLiteralExpression(node)) {
      return true;
    }
    if (ts.isArrayLiteralExpression(node)) {
      return true;
    }
    return false;
  }

  private getTypeName(node: ts.Node): string {
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    return "";
  }

  private analyzeConstructorInjections(sourceFile: ts.SourceFile, filePath: string): void {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        
        node.members.forEach(member => {
          if (ts.isConstructorDeclaration(member)) {
            member.parameters.forEach(param => {
              if (param.name && ts.isIdentifier(param.name)) {
                const paramName = param.name.text;
                const nodeId = `${filePath}:${className}.${paramName}`;
                
                this.nodes.set(nodeId, {
                  id: nodeId,
                  file: filePath,
                  type: "constructor-param",
                  name: `${className}.${paramName}`,
                  isMutable: true,
                  line: sourceFile.getLineAndCharacterOfPosition(param.getStart(sourceFile)).line + 1,
                });
              }
            });
          }
        });
      }
    });
  }

  private analyzeImports(sourceFile: ts.SourceFile, filePath: string): void {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          const importPath = moduleSpecifier.text;
          
          // Track import as edge
          if (node.importClause) {
            if (node.importClause.name) {
              // Default import: import X from '...'
              const importedName = node.importClause.name.text;
              this.trackImport(filePath, importedName, importPath, sourceFile, node);
            }
            
            if (node.importClause.namedBindings) {
              if (ts.isNamedImports(node.importClause.namedBindings)) {
                // Named imports: import { X, Y } from '...'
                node.importClause.namedBindings.elements.forEach(element => {
                  const importedName = element.name.text;
                  this.trackImport(filePath, importedName, importPath, sourceFile, element);
                });
              }
            }
          }
        }
      }
    });
  }

  private trackImport(
    filePath: string,
    importedName: string,
    importPath: string,
    sourceFile: ts.SourceFile,
    node: ts.Node
  ): void {
    // Create consumer node if not exists
    const consumerId = `${filePath}:${importedName}`;
    if (!this.nodes.has(consumerId)) {
      this.nodes.set(consumerId, {
        id: consumerId,
        file: filePath,
        type: "variable",
        name: importedName,
        isMutable: false,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
      });
    }

    // Try to resolve the import path to find the actual module
    // For now, we'll create a placeholder edge
    const resolvedPath = this.resolveImportPath(filePath, importPath);
    if (resolvedPath) {
      const targetId = `${resolvedPath}:${importedName}`;
      this.edges.push({
        from: consumerId,
        to: targetId,
        type: "import",
        file: filePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
      });
    }
  }

  private resolveImportPath(currentFile: string, importPath: string): string | null {
    // Simple relative path resolution
    if (importPath.startsWith(".")) {
      const currentDir = currentFile.substring(0, currentFile.lastIndexOf("/"));
      let resolved = `${currentDir}/${importPath}`;
      
      // Remove .ts extension if present
      if (resolved.endsWith(".ts")) {
        resolved = resolved.slice(0, -3);
      }
      
      // Try to find the actual file
      const possiblePaths = [
        `${resolved}.ts`,
        `${resolved}/index.ts`,
      ];
      
      for (const path of possiblePaths) {
        try {
          Deno.statSync(path);
          return path;
        } catch {
          // File doesn't exist
        }
      }
    }
    
    return null;
  }
}

// CLI usage
const tracker = new MemoryTracker();
const backendDir = Deno.args[0] || "../backend";
const graph = await tracker.analyzeDirectory(backendDir);

console.log(JSON.stringify(graph, null, 2));
