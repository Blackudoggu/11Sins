/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';


/* ==================================================================== */
/* Trait sin sticker
======================================================================= */
const loadTokenPictures = async () => {

  const config = charadex.page.traits.sin || {};
  const scrub = charadex.tools.scrub;
  const pictures = new Map();

  try {
    const items = await charadex.importSheet(charadex.sheet.pages.items);
    const byName = new Map(items.map(item => [scrub(item.item), item.image]));

    const special = new Map(Object.entries(config.tokens || {}).map(([sin, token]) => [scrub(sin), token]));

    return (sin) => {
      const key = scrub(sin);
      if (!key) return '';
      if (!pictures.has(key)) {
        const tokenName = special.get(key) ?? `${sin}${config.tokenSuffix ?? ' Trait Token'}`;
        pictures.set(key, byName.get(scrub(tokenName)) || '');
      }
      return pictures.get(key);
    };
  } catch (err) {
    console.error(err);
    return () => '';
  }

};

const addSticker = (card, sin, tokenPicture) => {
  card.find('.cd-sin-sticker').remove();
  const picture = sin ? tokenPicture(sin) : '';
  if (picture) card.append($('<img class="cd-sin-sticker">').attr({ src: picture, alt: sin, title: sin }));
};


/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {

  const tokenPicture = await loadTokenPictures();

  let dex = await charadex.initialize.page(null, charadex.page.traits, 


  (traits) => {
    for (const trait of traits) trait.sin = String(trait.traitsin ?? '').trim();
  },

  (listData) => {


    if (listData.type == 'gallery') {
      const apply = () => {
        for (const item of listData.list.visibleItems) {
          addSticker($(item.elm).find('.card').first(), item.values().sin, tokenPicture);
        }
      };
      listData.list.on('updated', apply);
      apply();
    }

    if (listData.type == 'profile') {

      const trait = listData.profileArray[0];
      const page = $('.charadex-list');

      addSticker(page.find('.card').first(), trait.sin, tokenPicture);

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
