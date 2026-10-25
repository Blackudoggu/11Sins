/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';


/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  let dex = await charadex.initialize.page(null, charadex.page.traits, null, 
  (listData) => {

    if (listData.type == 'profile') {

      const trait = listData.profileArray[0];
      const page = $('.charadex-list');

      const guideImage = charadex.tools.toImageUrl(trait.guideurl);
      if (guideImage) {
        page.find('.cd-guide-image').attr({ src: guideImage, alt: `${trait.trait} guide` });
      } else {
        page.find('.cd-guide-section').hide();
      }

    }

  });
  charadex.tools.loadPage('.softload', 500);
});
