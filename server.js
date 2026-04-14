const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGE_ROOT = path.join(PUBLIC_DIR, 'image');
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

function listImages(section) {
  const sectionDir = path.join(IMAGE_ROOT, section);
  if (!sectionDir.startsWith(IMAGE_ROOT)) return [];
  if (!fs.existsSync(sectionDir)) return [];
  const items = fs.readdirSync(sectionDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => `/image/${section}/${encodeURIComponent(name)}`);
  return items;
}

app.get('/api/gallery/:section', (req, res) => {
  const section = req.params.section;
  if (!/^[a-z0-9-]+$/i.test(section)) {
    return res.status(400).json({ error: 'Invalid section.' });
  }
  return res.json({ section, images: listImages(section) });
});

app.get('/api/galleries', (_req, res) => {
  const sections = fs.existsSync(IMAGE_ROOT)
    ? fs.readdirSync(IMAGE_ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    : [];

  const galleries = Object.fromEntries(sections.map((section) => [section, listImages(section)]));
  return res.json({ galleries });
});

app.use(express.static(PUBLIC_DIR));

app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PWI site running on http://localhost:${PORT}`);
});
