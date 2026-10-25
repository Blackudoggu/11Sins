/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';


/* ==================================================================== */
/* Load
/* Sheet columns used: Species, Image URL, Description,
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {

  let dex = await charadex.initialize.page(null, charadex.page.species, null, 
  (listData) => {

    if (listData.type == 'profile') {

      const species = listData.profileArray[0];
      const page = $('.charadex-list');

      // Example tiles 
      charadex.tools.buildForms(species, /^example/);

      // Introduction
      if (!String(species.description || '').trim()) {
        page.find('.description').closest('.cd-species-section').hide();
      }

      // Guide image + description
      const guideImage = charadex.tools.toImageUrl(species.guideurl);
      const hasGuideText = String(species.guidedescription || '').trim() !== '';

      if (!guideImage && !hasGuideText) {
        page.find('.cd-guide-section').hide();
      } else {
        if (guideImage) page.find('.cd-guide-image').attr({ src: guideImage, alt: `${species.species} guide` });
        else page.find('.cd-guide-image').hide();
        if (!hasGuideText) page.find('.guidedescription').hide();
      }

    }

  });

  charadex.tools.loadPage('.softload', 500);

});
