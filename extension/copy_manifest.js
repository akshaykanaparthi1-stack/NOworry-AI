const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
fs.mkdirSync(distDir, { recursive: true });

// Read base manifest
let manifestStr = fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8');

// Adjust relative paths for inside dist/ folder
const distManifest = JSON.parse(manifestStr);
distManifest.action.default_popup = "src/popup/index.html";
distManifest.background.service_worker = "background.js";
if (distManifest.content_scripts && distManifest.content_scripts[0]) {
  distManifest.content_scripts[0].js = ["content.js"];
}

distManifest.icons = {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(distManifest, null, 2));

// Copy icons to dist/icons/
const iconSrcDir = path.join(__dirname, 'public', 'icons');
const iconDistDir = path.join(distDir, 'icons');
fs.mkdirSync(iconDistDir, { recursive: true });

if (fs.existsSync(iconSrcDir)) {
  fs.readdirSync(iconSrcDir).forEach(file => {
    fs.copyFileSync(path.join(iconSrcDir, file), path.join(iconDistDir, file));
  });
}

console.log('Generated dist/manifest.json with correct background, content script, and icon paths.');
