const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.43-9.91 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.43 9.91-9.9C21.95 6.43 17.5 2 12.04 2zm5.89 14.06c-.25.7-1.45 1.29-2.02 1.37-.52.07-1.18.1-1.9-.12-.44-.13-.99-.32-1.71-.63-3.01-1.3-4.97-4.33-5.12-4.53-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.27-.3.6-.37.8-.37h.57c.18 0 .42-.07.66.5.25.6.85 2.07.92 2.22.08.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.3-.13.58.17.28.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.28.15.45.12.62-.08.17-.2.72-.83.91-1.12.2-.28.38-.23.64-.14.27.1 1.7.8 1.99.95.28.15.47.22.54.35.08.12.08.7-.17 1.4z"/></svg>`;

let catalog = null;
let galleryIndex = 0;
let galleryItem = null;

const app = document.getElementById("app");

function waLink(text) {
  const number = catalog?.whatsappNumber || "918943960382";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function itemMessage(item) {
  return `Hi Javed, is the ${item.name} (${item.priceLabel}) still available?`;
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

function renderHome() {
  const tiles = catalog.categories
    .map((cat) => {
      const n = cat.items.length;
      return `<a class="category-tile" href="#/${encodeURIComponent(cat.id)}">
        <img src="${escapeHtml(cat.cover)}" alt="">
        <div class="category-meta">
          <h2>${escapeHtml(cat.name)}</h2>
          <span class="count">${itemCountLabel(n)}</span>
        </div>
      </a>`;
    })
    .join("");

  app.innerHTML = `
    <section class="hero">
      <h1>Javed's Moving Sale</h1>
      <p class="wa-note">${escapeHtml(catalog.whatsappNote)} <a href="${waLink("Hi Javed, I saw your moving sale.")}" target="_blank" rel="noopener noreferrer">Message me on WhatsApp</a>.</p>
    </section>
    <div class="category-grid">${tiles}</div>`;
}

function renderCategory(category) {
  const cards = category.items
    .map((item) => {
      const thumb = item.thumbs?.[0] || item.images[0];
      return `<a class="item-card" href="#/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}">
        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.name)}">
        <div class="cap">
          <h2>${escapeHtml(item.name)}</h2>
          <p class="price">${escapeHtml(item.priceLabel)}</p>
        </div>
      </a>`;
    })
    .join("");

  app.innerHTML = `
    <nav class="crumbs"><a href="#/">All categories</a> / ${escapeHtml(category.name)}</nav>
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
  const quantity = item.quantityLabel || (item.quantity && item.quantity > 1 ? `${item.quantity} available` : "1");
  const thumbs =
    item.images.length > 1
      ? `<div class="thumbs" role="tablist" aria-label="Photos">${item.thumbs
          .map(
            (src, i) =>
              `<button type="button" data-index="${i}" aria-label="Photo ${i + 1}" ${i === 0 ? 'aria-current="true"' : ""}>
                <img src="${escapeHtml(src)}" alt="">
              </button>`
          )
          .join("")}</div>`
      : "";

  const nav =
    item.images.length > 1
      ? `<button class="nav-btn prev" type="button" aria-label="Previous photo">‹</button>
         <button class="nav-btn next" type="button" aria-label="Next photo">›</button>
         <div class="counter" aria-live="polite">1 / ${item.images.length}</div>`
      : "";

  app.innerHTML = `
    <div class="item-page">
      <div>
        <nav class="crumbs">
          <a href="#/">All categories</a> /
          <a href="#/${encodeURIComponent(category.id)}">${escapeHtml(category.name)}</a> /
          ${escapeHtml(item.name)}
        </nav>
        <div class="gallery" id="gallery">
          <div class="gallery-stage">
            <img id="gallery-image" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.name)}">
            ${nav}
          </div>
          ${thumbs}
        </div>
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
        <a class="wa-btn" href="${waLink(itemMessage(item))}" target="_blank" rel="noopener noreferrer">
          ${WA_ICON} Message on WhatsApp
        </a>
      </div>
    </div>`;

  bindGallery(item);
}

function showImage(index) {
  if (!galleryItem) return;
  const total = galleryItem.images.length;
  galleryIndex = (index + total) % total;
  const img = document.getElementById("gallery-image");
  if (img) {
    img.src = galleryItem.images[galleryIndex];
    img.alt = `${galleryItem.name}, photo ${galleryIndex + 1} of ${total}`;
  }
  const counter = document.querySelector(".counter");
  if (counter) counter.textContent = `${galleryIndex + 1} / ${total}`;
  document.querySelectorAll(".thumbs button").forEach((btn, i) => {
    if (i === galleryIndex) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });
}

function bindGallery(item) {
  const gallery = document.getElementById("gallery");
  if (!gallery || item.images.length < 2) return;

  gallery.querySelector(".nav-btn.prev")?.addEventListener("click", () => showImage(galleryIndex - 1));
  gallery.querySelector(".nav-btn.next")?.addEventListener("click", () => showImage(galleryIndex + 1));
  gallery.querySelectorAll(".thumbs button").forEach((btn) => {
    btn.addEventListener("click", () => showImage(Number(btn.dataset.index)));
  });

  const stage = gallery.querySelector(".gallery-stage");
  let startX = null;
  let startY = null;
  let tracking = false;

  const onDown = (event) => {
    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
  };
  const onMove = (event) => {
    if (!tracking) return;
    // Let vertical scroll win if the gesture is mostly vertical
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      event.preventDefault();
    }
  };
  const onUp = (event) => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    if (dx > 40) showImage(galleryIndex - 1);
    else if (dx < -40) showImage(galleryIndex + 1);
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", () => { tracking = false; });
  stage.addEventListener("pointerleave", (event) => {
    if (tracking) onUp(event);
  });
}

function renderNotFound(message) {
  galleryItem = null;
  app.innerHTML = `<div class="not-found">
    <h1>Nothing here</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="#/">Back to the sale</a></p>
  </div>`;
}

function render() {
  if (!catalog) return;
  const { categoryId, itemId } = parseHash();
  document.title = "Javed's Moving Sale";
  galleryItem = null;

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
    document.title = `${category.name} · Javed's Moving Sale`;
    renderCategory(category);
    return;
  }

  const item = findItem(category, itemId);
  if (!item) {
    renderNotFound("That item is not in this sale.");
    return;
  }

  document.title = `${item.name} · Javed's Moving Sale`;
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
  const headerWa = document.getElementById("header-wa");
  try {
    const response = await fetch("data/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load catalogue (${response.status})`);
    catalog = await response.json();
    if (headerWa) {
      headerWa.href = waLink("Hi Javed, I saw your moving sale.");
    }
    render();
  } catch (error) {
    app.innerHTML = `<p class="error">The sale list could not be loaded. ${escapeHtml(error.message)}</p>`;
  }
}

start();
