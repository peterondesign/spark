const fs = require('fs');

const path = '/Users/peteriyitor/Downloads/date_ideas_rows (2).csv';
const text = fs.readFileSync(path, 'utf8');

function parseCSV(input) {
  const rows = [];
  let i = 0;
  while (i < input.length) {
    const row = [];
    while (i < input.length) {
      if (input[i] === '"') {
        i++;
        let field = '';
        while (i < input.length) {
          if (input[i] === '"' && input[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (input[i] === '"') {
            i++;
            break;
          } else {
            field += input[i++];
          }
        }
        row.push(field);
      } else {
        let field = '';
        while (i < input.length && input[i] !== ',' && input[i] !== '\n' && input[i] !== '\r') {
          field += input[i++];
        }
        row.push(field);
      }
      if (i < input.length && input[i] === ',') {
        i++;
      } else {
        break;
      }
    }
    if (i < input.length && input[i] === '\r') i++;
    if (i < input.length && input[i] === '\n') i++;
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
  }
  return rows;
}

const rows = parseCSV(text);
const header = rows[0];
const idx = Object.fromEntries(header.map((k, i) => [k, i]));

const output = [];
for (let r = 1; r < rows.length; r++) {
  const id = rows[r][idx.id];
  const title = rows[r][idx.title] || '';
  const time = rows[r][idx.timeOfDay] || '';
  if (time.includes('Night')) output.push(`${id}\t${title}\t${time}`);
}

console.log(`Night-tagged rows: ${output.length}`);
console.log(output.join('\n'));
