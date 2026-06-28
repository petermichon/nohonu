import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Regex to match TypeScript import statements
const importRegex = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;

function extractImports(content: string): string[] {
  const imports: string[] = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function buildFileSystem(dirPath: string, basePath: string = ''): DirectoryNode {
  const children: Record<string, FileNode | DirectoryNode> = {};
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other common exclusions
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) {
        continue;
      }
      children[entry.name] = buildFileSystem(fullPath, relativePath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const imports = extractImports(content);
      children[entry.name] = {
        type: 'file',
        path: relativePath,
        imports,
      };
    }
  }

  return {
    type: 'directory',
    path: basePath,
    children,
  };
}

// Build file system from backend directory
const backendPath = path.resolve(__dirname, '../../backend/src');
const fileSystem = buildFileSystem(backendPath, 'src');

// Write to JSON file
const outputPath = path.resolve(__dirname, '../src/fileSystemData.json');
fs.writeFileSync(outputPath, JSON.stringify(fileSystem, null, 2));

console.log('File system data generated at:', outputPath);
