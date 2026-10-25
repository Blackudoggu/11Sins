/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';

const PLACEHOLDER = 'assets/placeholder.svg';


const splitLines = (text) => String(text || '')
  .split(/\r?\n/)
  .map(line => line.replace(/^\s*[-•*]\s*/, '').trim())
  .filter(line => line !== '');

const buildList = (selector, text) => {

  const element = $(`.charadex-list ${selector}`);
  const lines = splitLines(text);

  if (!lines.length) {
    element.closest('.prompt-section').hide();
    return;
  }

  const list = $('<ul class="pl-4 mb-0"></ul>');
  for (const line of lines) list.append($('<li class="mb-1"></li>').text(line));
  element.empty().append(list);

};



const parseReward = (line, itemMap) => {

  const scrub = charadex.tools.scrub;
  const attempts = [
    [line, 1],                                                        
    ...[[/^(\d+)\s*[x×]?\s+(.+)$/i, 1, 2], [/^(.+?)\s*[x×]\s*(\d+)$/i, 2, 1]] 
      .map(([regex, amountIndex, nameIndex]) => {
        const match = line.match(regex);
        return match ? [match[nameIndex].trim(), match[amountIndex]] : null;
      }),
  ];

  for (const attempt of attempts) {
    if (!attempt) continue;
    const [name, amount] = attempt;
    const item = itemMap.get(scrub(name));
    if (item) return { item, amount };
  }

  return null;

};

const buildRewards = async (text) => {

  const element = $('.charadex-list .rewards');
  const lines = splitLines(text);

  if (!lines.length) {
    element.closest('.prompt-section').hide();
    return;
  }

  const items = await charadex.importSheet(charadex.sheet.pages.items);
  const itemMap = new Map(items.map(item => [charadex.tools.scrub(item.item), item]));
  const itemsUrl = charadex.url.getPageUrl('items');

  const tiles = $('<div class="row no-gutters m-n2"></div>');
  const extras = [];

  for (const line of lines) {

    const reward = parseReward(line, itemMap);
    if (!reward) { extras.push(line); continue; }

    const { item, amount } = reward;
    const tile = $('#prompt-reward').clone().removeAttr('id');

    tile.find('.cd-ingredient-image').attr({ src: item.image || PLACEHOLDER, alt: item.item });
    tile.find('.cd-ingredient-name').text(item.item);
    tile.find('.cd-ingredient-amount').text(`×${amount}`);
    tile.find('a').attr('href', charadex.url.addUrlParameters(itemsUrl, { profile: item.item }));

    tiles.append(tile);

  }

  element.empty();
  if (tiles.children().length) element.append(tiles);

  if (extras.length) {
    const list = $(`<ul class="pl-4 mb-0 ${tiles.children().length ? 'mt-3' : ''}"></ul>`);
    for (const line of extras) list.append($('<li class="mb-1"></li>').text(line));
    element.append(list);
  }

};


/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  let dex = await charadex.initialize.page(null, charadex.page.prompts, null, 
  async (listData) => {
    let backgroundElement = $('.cd-prompt-background');
    if (listData.type == 'profile') {

      const prompt = listData.profileArray[0];

      backgroundElement.attr('style', `background-image: url(${prompt.image})`);

      if (!String(prompt.story || '').trim()) $('.charadex-list .story').closest('.prompt-section').hide();
      buildList('.requirements', prompt.requirements);
      await buildRewards(prompt.rewards);

    } else {
      backgroundElement.each(function(i) {
        const image = listData.array[i]?.image;
        $(this).attr('style', `background-image: url(${image})`);
      });
    }
  });
  charadex.tools.loadPage('.softload', 500);
});
