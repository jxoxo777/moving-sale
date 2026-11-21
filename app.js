const SITE_NAME = "Moving Out Sale";
const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.43-9.91 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.43 9.91-9.9C21.95 6.43 17.5 2 12.04 2zm5.89 14.06c-.25.7-1.45 1.29-2.02 1.37-.52.07-1.18.1-1.9-.12-.44-.13-.99-.32-1.71-.63-3.01-1.3-4.97-4.33-5.12-4.53-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.27-.3.6-.37.8-.37h.57c.18 0 .42-.07.66.5.25.6.85 2.07.92 2.22.08.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.3-.13.58.17.28.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.28.15.45.12.62-.08.17-.2.72-.83.91-1.12.2-.28.38-.23.64-.14.27.1 1.7.8 1.99.95.28.15.47.22.54.35.08.12.08.7-.17 1.4z"/></svg>`;

let catalog = null;
let galleryIndex = 0;
let galleryItem = null;
let galleryTrack = null;

const app = document.getElementById("app");
const backLink = document.getElementById("back-link");
const backLabel = document.getElementById("back-label");
const headerWa = document.getElementById("header-wa");

function waLink(text) {
  const number = catalog?.whatsappNumber || "918943960382";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function itemMessage(item) {
  return `Hi, is the ${item.name} (${item.priceLabel}) still available?`;
}

function generalMessage() {
  return "Hi, I saw the moving out sale.";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseHash() {
  const raw = decodeURIComponent((location.hash || "#/").replace(/^#/, ""));
  const parts = raw.split("/").filter(Boolean);
  return { categoryId: parts[0] || null, itemId: parts[1] || null };
}

function findCategory(id) {
  return catalog.categories.find((c) => c.id === id) || null;
}

function findItem(category, id) {
  return category?.items.find((i) => i.id === id) || null;
}

function itemCountLabel(n) {
  return n === 1 ? "1 item" : `${n} items`;
}

function setChrome(page, backHref, label) {
  document.body.dataset.page = page;
  if (page === "home") {
    backLink.hidden = true;
    backLink.removeAttribute("href");
  } else {
    backLink.hidden = false;
    backLink.href = backHref;
    backLabel.textContent = label;
  }
}

function renderHome() {
  setChrome("home");
  const tiles = catalog.categories
    .map((cat) => {
      const n = cat.items.length;
      return `<a class="category-tile" href="#/${encodeURIComponent(cat.id)}">
        <img src="${escapeHtml(cat.cover)}" alt="" loading="lazy" width="800" height="600">
        <div class="category-meta">
          <h2>${escapeHtml(cat.name)}</h2>
          <span class="count">${itemCountLabel(n)}</span>
        </div>
      </a>`;
    })
    .join("");

  app.innerHTML = `
    <section class="hero">
      <h1>${escapeHtml(SITE_NAME)}</h1>
      <p class="wa-note">${escapeHtml(catalog.whatsappNote)} <a href="${waLink(generalMessage())}" target="_blank" rel="noopener noreferrer">Message me on WhatsApp</a>.</p>
    </section>
    <div class="category-grid">${tiles}</div>`;
}

function renderCategory(category) {
  setChrome("category", "#/", "All categories");
  const cards = category.items
    .map((item) => {
      const thumb = item.thumbs?.[0] || item.images[0];
      return `<a class="item-card" href="#/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}">
        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.name)}" loading="lazy" width="400" height="400">
        <div class="cap">
          <h2>${escapeHtml(item.name)}</h2>
          <p class="price">${escapeHtml(item.priceLabel)}</p>
        </div>
      </a>`;
    })
    .join("");

  app.innerHTML = `
    <div class="section-head">
      <h1>${escapeHtml(category.name)}</h1>
      <span class="count">${itemCountLabel(category.items.length)}</span>
    </div>
    <div class="item-grid">${cards}</div>`;
}

function factRow(label, value) {
  if (!value) return "";
  return `<li><span class="k">${escapeHtml(label)}</span><p class="v">${escapeHtml(value)}</p></li>`;
}

function renderItem(category, item) {
  galleryItem = item;
  galleryIndex = 0;
  setChrome("item", `#/${encodeURIComponent(category.id)}`, category.name);

  const quantity = item.quantityLabel || (item.quantity && item.quantity > 1 ? `${item.quantity} available` : "1");
  const slides = item.images
    .map(
      (src, i) =>
        `<div class="gallery-slide">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}, photo ${i + 1} of ${item.images.length}" ${i === 0 ? 'loading="eager"' : 'loading="lazy"'} width="1600" height="1600">
        </div>`
    )
    .join("");
  const dots =
    item.images.length > 1
      ? `<div class="dots" role="tablist" aria-label="Photos">${item.images
          .map(
            (_, i) =>
              `<button type="button" class="dot" data-index="${i}" aria-label="Photo ${i + 1}" ${i === 0 ? 'aria-current="true"' : ""}></button>`
          )
          .join("")}</div>`
      : `<div class="dots" hidden></div>`;

  app.innerHTML = `
    <div class="item-page">
      <div class="gallery" id="gallery">
        <div class="gallery-track" id="gallery-track">${slides}</div>
        ${dots}
      </div>
      <div class="item-copy">
        <h1>${escapeHtml(item.name)}</h1>
        <p class="lead-price">${escapeHtml(item.priceLabel)}</p>
        <ul class="facts">
          ${factRow("Price", item.priceLabel)}
          ${factRow("Condition", item.condition)}
          ${factRow("Quantity", quantity)}
        </ul>
        <p class="desc">${escapeHtml(item.description)}</p>
      </div>
    </div>
    <div class="wa-bar">
      <a class="wa-btn" href="${waLink(itemMessage(item))}" target="_blank" rel="noopener noreferrer">
        ${WA_ICON} Message on WhatsApp
      </a>
    </div>`;

  bindGallery(item);
}

function setActiveDot(index) {
  document.querySelectorAll(".dot").forEach((btn, i) => {
    if (i === index) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });
}

function showImage(index, instant) {
  if (!galleryItem || !galleryTrack) return;
  const total = galleryItem.images.length;
  galleryIndex = ((index % total) + total) % total;
  const width = galleryTrack.clientWidth;
  galleryTrack.scrollTo({
    left: galleryIndex * width,
    behavior: instant ? "auto" : "smooth",
  });
  setActiveDot(galleryIndex);
}

function bindGallery(item) {
  galleryTrack = document.getElementById("gallery-track");
  if (!galleryTrack) return;

  const updateFromScroll = () => {
    const width = galleryTrack.clientWidth || 1;
    const next = Math.round(galleryTrack.scrollLeft / width);
    if (next !== galleryIndex && next >= 0 && next < item.images.length) {
      galleryIndex = next;
      setActiveDot(galleryIndex);
    }
  };

  galleryTrack.addEventListener("scroll", updateFromScroll, { passive: true });
  document.querySelectorAll(".dot").forEach((btn) => {
    btn.addEventListener("click", () => showImage(Number(btn.dataset.index)));
  });
}

function renderNotFound(message) {
  galleryItem = null;
  galleryTrack = null;
  setChrome("category", "#/", "All categories");
  app.innerHTML = `<div class="not-found">
    <h1>Nothing here</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="#/">Back to the sale</a></p>
  </div>`;
}

function render() {
  if (!catalog) return;
  const { categoryId, itemId } = parseHash();
  document.title = SITE_NAME;
  galleryItem = null;
  galleryTrack = null;
  window.scrollTo(0, 0);

  if (!categoryId) {
    renderHome();
    return;
  }

  const category = findCategory(categoryId);
  if (!category) {
    renderNotFound("That category is not in this sale.");
    return;
  }

  if (!itemId) {
    document.title = `${category.name} · ${SITE_NAME}`;
    renderCategory(category);
    return;
  }

  const item = findItem(category, itemId);
  if (!item) {
    renderNotFound("That item is not in this sale.");
    return;
  }

  document.title = `${item.name} · ${SITE_NAME}`;
  renderItem(category, item);
}

document.addEventListener("keydown", (event) => {
  if (!galleryItem || galleryItem.images.length < 2) return;
  const tag = event.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(galleryIndex + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(galleryIndex - 1);
  }
});

window.addEventListener("hashchange", render);

async function start() {
  try {
    const response = await fetch("data/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load catalogue (${response.status})`);
    catalog = await response.json();
    if (headerWa) headerWa.href = waLink(generalMessage());
    render();
  } catch (error) {
    app.innerHTML = `<p class="error">The sale list could not be loaded. ${escapeHtml(error.message)}</p>`;
  }
}

start();
