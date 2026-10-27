/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from '../charadex.js';


/* ==================================================================== */
/* Traits
====================================== */


const columnKey = (title) => String(title).toLowerCase().replace(/\s/g, '');

const splitTraits = (text) => {

  const traits = [];
  let current = '';
  let depth = 0;

  for (const letter of String(text ?? '')) {
    if (letter === '(' || letter === '[') depth++;
    if (letter === ')' || letter === ']') depth = Math.max(0, depth - 1);
    if (depth === 0 && (letter === '\n' || letter === ',' || letter === ';')) {
      traits.push(current);
      current = '';
    } else {
      current += letter;
    }
  }
  traits.push(current);

  return traits.map(trait => trait.replace(/^\s*[-•*]\s*/, '').trim()).filter(trait => trait !== '');

};


const getTraitGroups = (entry) => {
  const columns = charadex.page.masterlist.traitColumns || [];
  return columns.map(label => ({ label: label, traits: splitTraits(entry[columnKey(label)]) }));
};


const buildTraits = async (entry) => {

  const container = $('.charadex-list .cd-trait-groups');
  if (!container.length) return;


  const rarities = new Map();
  try {
    const traitRows = await charadex.importSheet(charadex.sheet.pages.traits);
    for (const row of traitRows) rarities.set(charadex.tools.scrub(row.trait), row.rarity);
  } catch (err) {
    console.error(err);
  }

  container.empty();

  for (const group of getTraitGroups(entry)) {

    const block = $('<div class="cd-trait-group"></div>');
    block.append($('<b></b>').text(`${group.label}:`));

    if (!group.traits.length) {
      block.append($('<div class="cd-trait-line text-muted"></div>').text('NONE'));
    }

    for (const name of group.traits) {

      const line = $('<div class="cd-trait-line"></div>').append(document.createTextNode(name));
      const rarity = String(rarities.get(charadex.tools.scrub(name)) ?? '').trim();

      if (rarity) {
        line.append(document.createTextNode(' ('));
        line.append($('<span></span>').addClass(`trait-rarity trait-rarity-${charadex.tools.scrub(rarity)}`).text(rarity));
        line.append(document.createTextNode(')'));
      }

      block.append(line);

    }

    container.append(block);

  }

};


/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", async () => {

  let dex = await charadex.initialize.page(
    null,
    charadex.page.masterlist,

    
    (masterlist) => {
      for (const entry of masterlist) {
        entry.traits = getTraitGroups(entry).flatMap(group => group.traits).join(', ');
      }
    },

    async (listData) => {

      if (listData.type == 'profile') {

        buildTraits(listData.profileArray[0]);

        charadex.tools.buildForms(listData.profileArray[0], /^alt(ernate)?form/);

        // Create the log dex
        if (charadex.tools.checkArray(listData.profileArray[0].masterlistlog)) {
          let logs = await charadex.initialize.page(
            listData.profileArray[0].masterlistlog,
            charadex.page.masterlist.relatedData['masterlist log']
          );
        }

      }

    }
  );
  
  charadex.tools.loadPage('.softload', 500);
  
});
