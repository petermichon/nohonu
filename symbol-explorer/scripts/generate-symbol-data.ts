import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSymbolGraphFromFileSystem, extractImports, type SymbolData } from './parser-shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Write debug output to file
const debugLog = (message: string) => {
  fs.appendFileSync(path.resolve(__dirname, 'debug.log'), message + '\n');
};

debugLog('Script started');
debugLog('__dirname: ' + __dirname);

// Generate file system data for actual codebase
const testCodebasePath = path.resolve(__dirname, '../../backend/src');

function buildTestFileSystem(dirPath: string, basePath: string = ''): any {
  const children: Record<string, any> = {};
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      children[entry.name] = buildTestFileSystem(fullPath, relativePath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const { imports } = extractImports(fullPath);
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

const fileSystemData = buildTestFileSystem(testCodebasePath, '');
debugLog('Test file system data generated');

// Build symbol graph from test codebase directory
const backendPath = testCodebasePath;

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

const symbolData = buildSymbolGraphFromFileSystem(fileSystemData, backendPath, debugLog);

debugLog('Symbol graph generation complete');

// Write to JSON file
const outputPath = path.resolve(__dirname, '../src/symbolData.json');
fs.writeFileSync(outputPath, JSON.stringify(symbolData, null, 2));

debugLog('Symbol data generated at: ' + outputPath);
debugLog(`Found ${symbolData.nodes.length} symbols and ${symbolData.edges.length} dependencies`);
