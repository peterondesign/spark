const fs = require('fs');

const filePath = '/Users/peteriyitor/Downloads/date_ideas_rows (2).csv';
const input = fs.readFileSync(filePath, 'utf8');

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      if (text[i] === '"') {
        i++;
        let field = '';
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++;
            break;
          } else {
            field += text[i++];
          }
        }
        row.push(field);
      } else {
        let field = '';
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++];
        }
        row.push(field);
      }
      if (i < text.length && text[i] === ',') {
        i++;
      } else {
        break;
      }
    }
    if (i < text.length && text[i] === '\r') i++;
    if (i < text.length && text[i] === '\n') i++;
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
  }
  return rows;
}

function quoteField(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCSV(rows) {
  return rows.map((row) => row.map(quoteField).join(',')).join('\n') + '\n';
}

const dayOnlyPatterns = [
  'brunch',
  'farmer',
  'flower market',
  'market',
  'library',
  'bookstore',
  'book reading',
  'bookstore readings',
  'comic book shop',
  'art museum',
  'history museum',
  'museum',
  'thrift store',
  'record store',
  'plant shop',
  'animal shelter',
  'feed ducks',
  'beach clean-up',
  'vintage shops',
  'local boutiques',
  'window shopping',
  'shopping',
  'grocery store + cook together',
  'ferry ride',
  'amphibious tour',
  'historical city attractions',
  'private art gallery walkthrough',
  'interior and architecture studio visit',
  'photo session with theme',
  'screen printing workshop',
  'ceramics workshop',
  'dyeing workshop',
  'embroidery workshop',
  'woodworking workshop',
  'live drawing',
  'sushi workshop',
  'clay sculpting',
  'beach with caves',
  'chill by the pool',
  'pool',
  'beach swim',
  'lake dip',
  'park jog',
  'trail run',
  'rent bikes',
  'city bike',
  'bike ride',
  'cycling',
  'running / jogging',
  'street food stalls',
  'picnic',
  'park bench',
  'people-watching in park',
  'blanket and lie down in park',
  'outdoor yoga',
  'photo walk',
  'forest trail',
  'coastal cliff hike',
  'viewpoint picnic',
  'marina watching boats',
  'beach sit + walk',
  'beach picnic',
  'feed ducks',
  'draw/sketch together',
  'draw / sketch together',
  'sketch together',
  'animal shelter visit',
  'people-watching',
  'park',
  'beach',
  'trail',
  'hike',
  'swim',
  'lake',
  'marina',
  'viewpoint',
  'caves',
  'botanical garden',
  'street mural walk',
  'city panoramic view',
  'walking with no destination',
  'outdoor meditation',
  'evening run club',
];

const explicitNightPatterns = [
  'night ',
  'night-',
  ' at night',
  'nighttime',
  'late-night',
  'evening ',
  'stargazing',
  'telescope',
  'sunset cocktails',
  'rooftop yoga at night',
  'evening roller skating',
  'night kayaking',
  'night botanical garden',
  'amphitheater',
  'beach at night',
  'park at night',
  'photo walk at night',
  'street mural walk',
  'outdoor meditation',
  'evening run club',
  'perform poetry in the park',
  'late night drive',
];

const rows = parseCSV(input);
const header = rows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const changed = [];

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const title = (row[idx.title] || '').toLowerCase();
  const id = row[idx.id];
  const rawTime = row[idx.timeOfDay] || '';

  let time;
  try {
    time = rawTime.trim().startsWith('[') ? JSON.parse(rawTime) : [rawTime];
  } catch {
    time = [rawTime];
  }

  const hasNight = Array.isArray(time) && time.some((v) => String(v).toLowerCase() === 'night');
  const explicitNight = explicitNightPatterns.some((p) => title.includes(p));
  const dayOnly = dayOnlyPatterns.some((p) => title.includes(p));

  if (hasNight && dayOnly && !explicitNight) {
    row[idx.timeOfDay] = JSON.stringify(['Daytime']);
    changed.push({ id, title: row[idx.title], before: rawTime, after: row[idx.timeOfDay] });
  }
}

fs.writeFileSync(filePath, toCSV(rows), 'utf8');

console.log(`Changed rows: ${changed.length}`);
for (const c of changed) {
  console.log(`${c.id}\t${c.title}\t${c.before} -> ${c.after}`);
}
