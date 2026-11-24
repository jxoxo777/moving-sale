# Moving Out Sale

A static, mobile-first listing of items for sale. Open `index.html` via any static host (GitHub Pages works). The page reads only `data/catalog.json`.

## Adding a category later

Edit `data/catalog.json`. Copy a category object in the `categories` array and fill in:

- `id` — URL slug, for example `furniture`, `clothes`, or `gym`
- `name` — label on the category tile
- `cover` — path to a thumbnail, such as `images/thumbs/furniture/cover/cover.jpg`
- `items` — an array of items using the same item shape (id, name, price, priceLabel, quantity, condition, description, images, thumbs). Set `sold: true` on an item to keep it listed at the end of its category with a Sold badge; category counts then include only the items still available.

Put photos under `images/full/<category-id>/<item-id>/` and matching thumbnails under `images/thumbs/...`. The site updates itself from the JSON; no rebuild is required.
