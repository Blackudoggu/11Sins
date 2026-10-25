/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';


/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const items = charadex.tools.addPriceIcons(await charadex.importSheet(charadex.page.items.sheetPage));
  let dex = await charadex.initialize.page(items, charadex.page.items);
  charadex.tools.loadPage('.softload', 500);
});
