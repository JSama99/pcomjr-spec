import { readFileSync } from 'fs';
import { resolve } from 'path';
import { canonicalize, hash } from '../src/hash.js';

const fixturesPath = resolve(import.meta.dirname, '../../fixtures/hash-vectors.json');
const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8'));
let pass = 0, fail = 0;

for (const vec of fixtures.vectors) {
  const tsCanonical = canonicalize(vec.input);
  const tsHash = hash(vec.input);
  
  const canonMatch = tsCanonical === vec.canonical;
  const hashMatch = tsHash === vec.hash;
  
  if (canonMatch && hashMatch) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${vec.name}`);
    if (!canonMatch) {
      console.log(`  canonical expected: ${vec.canonical}`);
      console.log(`  canonical got:      ${tsCanonical}`);
    }
    if (!hashMatch) {
      console.log(`  hash expected: ${vec.hash}`);
      console.log(`  hash got:      ${tsHash}`);
    }
  }
}

console.log(`\n✓ Cross-language hash verification: ${pass}/${fixtures.vectors.length} passed`);
if (fail > 0) process.exit(1);
