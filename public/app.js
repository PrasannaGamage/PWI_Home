async function loadGallery(node) {
  const section = node.dataset.section;
  const mode = node.dataset.mode || 'single';
  const fallback = node.dataset.fallback;

  try {
    const res = await fetch(`/api/gallery/${section}`);
    if (!res.ok) throw new Error('Gallery request failed');
    const data = await res.json();
    const images = data.images && data.images.length ? data.images : [fallback];
    renderGallery(node, images, mode);
  } catch (error) {
    renderGallery(node, [fallback], mode);
  }
}

function renderGallery(node, images, mode) {
  node.innerHTML = '';
  const items = mode === 'grid' ? images.slice(0, 4) : images.slice(0, 1);

  items.forEach((src, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-image-wrap';
    if (src === node.dataset.fallback) wrap.classList.add('placeholder');

    const img = document.createElement('img');
    img.src = src;
    img.alt = `${node.dataset.section} image ${index + 1}`;
    img.loading = 'lazy';

    wrap.appendChild(img);
    node.appendChild(wrap);
  });

  if (mode === 'grid' && items.length === 1) {
    node.firstElementChild.classList.add('full-span');
  }
}


document.querySelectorAll('.dynamic-gallery').forEach((node) => {
  loadGallery(node);
});
