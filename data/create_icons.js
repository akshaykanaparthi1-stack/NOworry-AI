const fs = require('fs');
const path = require('path');

// Generate 1x1 base64 blue pixel PNG data buffer
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const iconBuffer = Buffer.from(base64Png, 'base64');

const iconDir = path.join(__dirname, '..', 'extension', 'public', 'icons');
fs.mkdirSync(iconDir, { recursive: true });

[16, 48, 128].forEach(size => {
  fs.writeFileSync(path.join(iconDir, `icon${size}.png`), iconBuffer);
});

console.log('Generated extension icons successfully.');
