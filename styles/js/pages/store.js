
import { charadex } from '../charadex.js';



document.addEventListener("DOMContentLoaded", async () => {

  const config = charadex.page.store;
  const message = $('#store-empty');

  try {

    let items = await charadex.importSheet(config.sheetPage);

    // Currency icons 
    charadex.tools.addPriceIcons(items);

    
    const isChecked = (value) => value === true || String(value).toLowerCase() === 'true';

    items = items
      .filter(item => isChecked(item.shop))
      .map(item => ({ ...item, type: item.type || 'Misc' }));

    if (!charadex.tools.checkArray(items)) {
      message.text('Nothing is for sale right now. Check back soon!').show();
    } else {
     
      items = charadex.manageData.sortArray(items, 'item', 'asc');
      await charadex.initialize.groupGallery(
        config,
        items,
        'type',
        charadex.url.getPageUrl(config.sitePage)
      );
    }

  } catch (err) {
    console.error(err);
    message.text('The store could not be loaded. Please try again later.').show();
  }

  charadex.tools.loadPage('.softload', 500);

});
