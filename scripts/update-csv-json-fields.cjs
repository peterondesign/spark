const fs = require('fs');

const filePath = '/Users/peteriyitor/Downloads/date_ideas_rows (2).csv';
const raw = fs.readFileSync(filePath, 'utf8');

// ── Robust CSV parser (handles quoted fields containing commas/newlines) ──────
function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = '';
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += text[i++];
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++];
        }
        row.push(field);
      }
      if (i < text.length && text[i] === ',') {
        i++; // next field
      } else {
        break; // end of row
      }
    }
    // Skip \r\n or \n
    if (i < text.length && text[i] === '\r') i++;
    if (i < text.length && text[i] === '\n') i++;
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      rows.push(row);
    }
  }
  return rows;
}

// ── CSV serializer: quote fields that need it ─────────────────────────────────
function quoteField(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowToCSV(row) {
  return row.map(quoteField).join(',');
}

// ── Multi-value rules ─────────────────────────────────────────────────────────

// Keywords that make something ALWAYS night-only
const nightOnlyPatterns = [
  'night kayak', 'stargazing', 'night market', 'nighttime', 'night botanical',
  'night bar hop', 'rooftop yoga at night', 'astronomy', 'telescope', 'amphitheater',
  'late-night', 'evening roller skat', 'evening run', 'outdoor meditation',
  'perform poetry in the park', 'street mural walk', 'night',
];

// Keywords for always-daytime
const dayOnlyPatterns = [
  'farmer', 'flower market', 'sunrise', 'morning',
];

function classifyTimeOfDay(title) {
  const t = title.toLowerCase();
  if (nightOnlyPatterns.some(p => t.includes(p))) return ['Night'];
  if (dayOnlyPatterns.some(p => t.includes(p))) return ['Daytime'];
  // Most things work day or night
  return ['Daytime', 'Night'];
}

// Keywords that are always outdoor-only
const outdoorOnlyPatterns = [
  'beach', 'hike', 'hiking', 'kayak', 'park', 'waterfall', 'river', 'riverside',
  'garden', 'cliff', 'forest', 'trail', 'outdoor', 'street', 'farmer', 'flower market',
  'telescope', 'stargazing', 'cave', 'pool', 'surf', 'sailing', 'camping', 'bonfire',
  'sunrise', 'sunset walk', 'football', 'frisbee', 'volleyball', 'run club', 'hot air balloon',
  'skydiving', 'zip line', 'rock climbing', 'cycling', 'city bike', 'segway',
  'walking', 'scooter', 'mural walk', 'street food', 'amphitheater',
];

// Keywords that are strictly indoor-only
const indoorOnlyPatterns = [
  'escape room', 'bowling', 'theater', 'theatre', 'cinema', 'movie', 'museum',
  'gallery', 'cooking class', 'baking', 'ceramics', 'pottery', 'clay', 'spa', 'sauna',
  'massage', 'floatation', 'hammam', 'yoga class', 'dance class', 'boxing', 'kickbox',
  'trampolining', 'laser tag', 'arcade', 'casino', 'karaoke', 'open mic', 'comedy club',
  'wine tasting', 'whiskey', 'cocktail workshop', 'sushi workshop', 'screen printing',
  'embroidery', 'woodworking', 'dyeing workshop', 'perfume', 'piano',
  'live drawing', 'sculpting', 'indoor', 'aquarium', 'library', 'bookstore',
  'jazz club', 'rooftop bar', 'bar hop', 'private chef', 'memory exchange',
  'scent test', 'build a romantic playlist',
];

function classifyLocationType(title, currentType) {
  const t = title.toLowerCase();
  if (outdoorOnlyPatterns.some(p => t.includes(p))) return ['outdoor'];
  if (indoorOnlyPatterns.some(p => t.includes(p))) return ['indoor'];
  // Default: both
  return ['outdoor', 'indoor'];
}

// Mood: many things can blend chill+romantic; some are purely active
const activeOnlyPatterns = [
  'hiking', 'hike', 'kayak', 'surf', 'skydiving', 'zip line', 'rock climbing',
  'boxing', 'kickbox', 'trampolining', 'laser tag', 'escape room',
  'football', 'frisbee', 'volleyball', 'run club', 'cycling', 'scooter',
  'hot air balloon', 'sailing', 'dance class',
];

const romanticOnlyPatterns = [
  'private chef', 'sunset cocktails', 'beach picnic', 'indoor picnic', 'couples spa',
  'floatation', 'hammam', 'champagne', 'wine tasting', 'rooftop dinner',
];

const chillRomanticPatterns = [
  'picnic', 'riverfront', 'riverside', 'garden', 'botanical', 'sunset', 'beach',
  'canal', 'museum', 'gallery', 'bookstore', 'cafe', 'coffee', 'tea', 'spa',
  'massage', 'sauna', 'harbour', 'harbor', 'scenic', 'chill by the pool', 'pool',
  'jazz', 'live music', 'concert', 'amphitheater', 'street mural', 'memory exchange',
  'scent test', 'playlist', 'observatory', 'telescope', 'stargazing',
  'flower market', 'farmer', 'street food',
];

function classifyMood(title, currentMood) {
  const t = title.toLowerCase();
  if (activeOnlyPatterns.some(p => t.includes(p))) return ['active'];
  if (romanticOnlyPatterns.some(p => t.includes(p))) return ['romantic'];
  if (chillRomanticPatterns.some(p => t.includes(p))) return ['chill', 'romantic'];
  // Fall back to wrapping whatever was there
  return [currentMood];
}

// ── Main logic ─────────────────────────────────────────────────────────────────
const rows = parseCSV(raw);
const header = rows[0];

const COL = {};
header.forEach((h, i) => { COL[h.trim()] = i; });

console.log('Columns:', header);
console.log('Total data rows:', rows.length - 1);

const updated = [header];

for (let r = 1; r < rows.length; r++) {
  const row = [...rows[r]];
  if (row.length < 5) { updated.push(row); continue; }

  const title = row[COL['title']] || '';

  // ── timeOfDay ──
  const timeVal = row[COL['timeOfDay']] || '';
  let timeArr;
  if (timeVal.startsWith('[')) {
    timeArr = JSON.parse(timeVal); // already array
  } else {
    timeArr = classifyTimeOfDay(title);
  }
  row[COL['timeOfDay']] = JSON.stringify(timeArr);

  // ── mood ──
  const moodVal = row[COL['mood']] || '';
  let moodArr;
  if (moodVal.startsWith('[')) {
    moodArr = JSON.parse(moodVal);
  } else {
    moodArr = classifyMood(title, moodVal);
  }
  row[COL['mood']] = JSON.stringify(moodArr);

  // ── location.type ──
  const locVal = row[COL['location']] || '';
  let locObj;
  try {
    // The value looks like {type:outdoor,setting:urban} — not valid JSON, parse manually
    const cleaned = locVal
      .replace(/\{/, '')
      .replace(/\}/, '')
      .split(',')
      .reduce((acc, pair) => {
        const [k, v] = pair.split(':');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

    const typeVal = cleaned['type'] || 'outdoor';
    let typeArr;
    if (typeVal.startsWith('[')) {
      typeArr = JSON.parse(typeVal);
    } else {
      typeArr = classifyLocationType(title, typeVal);
    }

    locObj = `{type:${JSON.stringify(typeArr)},setting:${cleaned['setting'] || 'urban'}}`;
  } catch (e) {
    locObj = locVal; // leave as-is if we can't parse
  }
  row[COL['location']] = locObj;

  updated.push(row);
}

const output = updated.map(rowToCSV).join('\n') + '\n';
fs.writeFileSync(filePath, output, 'utf8');
console.log('Done. Written', updated.length - 1, 'data rows.');

// Spot-check a few rows
for (const idx of [1, 8, 15, 238, 274]) {
  const row = updated[idx];
  if (!row) continue;
  console.log(`Row ${idx}: title="${row[COL['title']]}" | timeOfDay=${row[COL['timeOfDay']]} | mood=${row[COL['mood']]} | location=${row[COL['location']]}`);
}
