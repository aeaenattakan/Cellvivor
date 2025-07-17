// update-fetch-socket-urls.js
import fs from 'fs';
import path from 'path';

// Folders to scan for files
const scanFolders = [
  'src',             // main source folder
  'src/game/scenes',
  'src/game/utils',
];

// Helper: Recursively collect .js/.jsx files
function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  });
  return files;
}

// Patterns to replace:

// 1. Replace fetch('http://localhost:5000/ or '/api/') URLs to use `${import.meta.env.VITE_API_URL}/...`
// This covers absolute localhost URLs and relative /api URLs

// Regex to catch fetch calls with single/double/backtick quotes
const fetchRegex = /fetch\s*\(\s*(['"`])((http:\/\/localhost:5000)?\/?api\/[^'"`]+)\1/g;

// 2. Replace socket.io client init URLs like io('http://localhost:5000') or io() to io(import.meta.env.VITE_API_URL)
const ioRegex = /io\s*\(\s*(['"`])?(http:\/\/localhost:5000)?(['"`])?\s*\)/g;

const filesToProcess = scanFolders.flatMap(folder => getFiles(path.join(process.cwd(), folder)));

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;

  // Replace fetch URLs
  updated = updated.replace(fetchRegex, (match, quote, urlPart) => {
    // urlPart may start with http://localhost:5000 or /api/
    // we want to convert all to `${import.meta.env.VITE_API_URL}/api/...`
    // remove any http://localhost:5000 prefix and any leading slash before api
    let apiPath = urlPart.replace(/^http:\/\/localhost:5000/, '').replace(/^\/?api\//, 'api/');
    return `fetch(\`\${import.meta.env.VITE_API_URL}/${apiPath}\``;
  });

  // Replace socket.io client init
  updated = updated.replace(ioRegex, () => {
    return `io(import.meta.env.VITE_API_URL)`;
  });

  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Updated URLs in: ${file}`);
  }
});

console.log('Fetch and socket.io URL updates done.');
