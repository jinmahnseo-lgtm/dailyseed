const a = require('./src/data/arts.json');
console.log('Total:', a.length);
console.log('First new:', a[202].date, a[202].title);
console.log('Last:', a[a.length-1].date, a[a.length-1].title);
const titles = a.map(e => e.title);
const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
console.log('Duplicate titles:', dupes.length > 0 ? dupes : 'none');
const missing = a.filter(e => !e.source_url || !e.source_label);
console.log('Missing source:', missing.length);
// Check date continuity
for (let i = 1; i < a.length; i++) {
  const prev = new Date(a[i-1].date);
  const curr = new Date(a[i].date);
  const diff = (curr - prev) / (1000 * 60 * 60 * 24);
  if (diff !== 1) {
    console.log('Date gap at index', i, ':', a[i-1].date, '->', a[i].date);
  }
}
console.log('Date continuity check complete');
