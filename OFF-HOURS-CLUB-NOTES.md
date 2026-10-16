# OFF HOURS CLUB — interactive collection preview

Routes: /off-hours-club/ and /off-hours-club/shop/.

The storefront uses four individually generated transparent garment photographs and a coastal campaign photograph. The supplied concept boards informed the designs and remain archived; neither board is displayed on the new storefront. Generation used built-in imagegen. Exact prompts and project asset paths are in assets/off-hours/generation-notes.json. These are concept images, not photographs of manufactured goods.

Interaction: native horizontal swipe, mouse drag, arrow controls and keyboard left/right; selecting a garment lifts it from the rail into a native product dialog. Returning reverses the motion. Reduced-motion users receive immediate transitions. Product views, preview sizes and a browser-local demo bag are included. Prices, stock, materials, production sizing, payment and orders are not connected. The rail features four tee concepts; the boards also show hoodie/cap concepts that are not separate purchasable products.

No private customer data is collected. Bag state uses a dedicated localStorage key and falls back to in-memory state if storage is blocked. Existing marketplace/demo portal state is separate.

Original file assets: essentials.png (1536 × 1024), collection.png (1774 × 887). New collection filters separate essentials and graphics. The detail view magnifies the same garment rather than inventing its reverse side.

JavaScript syntax and static route/asset checks passed. Browser visual/interaction verification was unavailable; confirm rail motion on desktop and mobile before a public launch.
