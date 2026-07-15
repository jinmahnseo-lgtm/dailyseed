import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const files = ['english.json', 'classics.json', 'arts.json', 'worlds.json', 'whys.json'];

for (const file of files) {
  const filePath = join(dataDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  let converted = 0;
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    // Remove date field and add day field at the beginning
    if (entry.date !== undefined) {
      delete entry.date;
    }
    // Add day as first property by reconstructing the object
    data[i] = { day: i + 1, ...entry };
    converted++;
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${file}: ${converted}개 항목 date → day 전환 완료`);
}

console.log('\n모든 파일 전환 완료');
