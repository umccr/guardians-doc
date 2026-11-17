// Downloads the SATRE specification YAML for one release tag into src/data/satre/.
//
// The SATRE map reads the requirement text from this file. Taking it straight from the SATRE repository at a fixed tag
// means the site quotes SATRE exactly, and a future release can be compared
// line by line before the site moves to it.
//
// Usage: node scripts/satre/fetch-specification.mjs [tag]
// The tag defaults to v2.0.1. The script writes specification-<version>.yaml,
// for example specification-v2.0.1.yaml, and prints its SHA-256 checksum.

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const tag = process.argv[2] ?? 'v2.0.1';
const url = `https://raw.githubusercontent.com/sa-tre/satre-specification/${tag}/docs/source/spec/specification.yaml`;

const response = await fetch(url);
if (!response.ok) {
	console.error(`Could not download ${url}: HTTP ${response.status}`);
	process.exit(1);
}
const text = await response.text();

// Parse the file before saving it, so that a broken or unexpected download
// fails here rather than at the next site build.
const spec = parse(text);
if (!Array.isArray(spec?.specification) || spec.specification.length === 0) {
	console.error('The downloaded file has no "specification" list of requirements.');
	process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../src/data/satre', `specification-${tag}.yaml`);
writeFileSync(out, text);

const sha256 = createHash('sha256').update(text).digest('hex');
console.log(`Wrote ${out}`);
console.log(`${spec.specification.length} requirements, sha256 ${sha256}`);
