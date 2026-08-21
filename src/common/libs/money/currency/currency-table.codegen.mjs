// Rebuilds the ISO 4217 table from the list the standard's maintainer publishes.
// Run by hand; the generated file is committed and read at runtime.

import { writeFile } from 'node:fs/promises';

const SOURCE = 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml';
const OUTPUT = new URL('./currency-table.generated.ts', import.meta.url);
// The published list carries one entry per country, so far more entries than currencies.
const MINIMUM_CURRENCIES = 150;

const tag = (block, name) =>
    block
        .match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1]
        .replace(/\s+/g, ' ')
        .trim();

// Matches how the formatter picks quotes, so the written file needs no reformatting.
const quote = value => (value.includes("'") && !value.includes('"') ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`Currency list responded ${response.status}.`);
const xml = await response.text();

const published = xml.match(/Pblshd="([^"]+)"/)?.[1];
if (!published) throw new Error('Currency list carries no publication date.');

// The standard names the unit itself; the locale data names the currency in full.
const fullNames = new Intl.DisplayNames(['en'], { type: 'currency' });

const currencies = new Map();
for (const [, block] of xml.matchAll(/<CcyNtry>([\s\S]*?)<\/CcyNtry>/g)) {
    const code = tag(block, 'Ccy');
    const minorUnits = tag(block, 'CcyMnrUnts');
    const numericCode = tag(block, 'CcyNbr');
    const shortName = tag(block, 'CcyNm');
    // Skips territories that name no currency, and the fund and metal codes that define no subunit.
    if (!code || !/^\d+$/.test(minorUnits ?? '') || !/^\d{3}$/.test(numericCode ?? '')) continue;
    if (!shortName) throw new Error(`Currency list leaves ${code} unnamed.`);

    // Locale data does not reach every code, and echoing the code back is how it says so.
    const fullName = fullNames.of(code);
    const name = !fullName || fullName === code ? shortName : fullName;

    const row = { numericCode, minorUnits: Number(minorUnits), name, shortName };
    const previous = currencies.get(code);
    if (previous && JSON.stringify(previous) !== JSON.stringify(row)) {
        throw new Error(`Currency list gives ${code} conflicting definitions.`);
    }
    currencies.set(code, row);
}

if (currencies.size < MINIMUM_CURRENCIES) throw new Error(`Currency list yielded only ${currencies.size} currencies.`);

const rows = [...currencies]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([code, row]) => `    ${code}: { numericCode: ${quote(row.numericCode)}, minorUnits: ${row.minorUnits}, name: ${quote(row.name)}, shortName: ${quote(row.shortName)} },`);

await writeFile(
    OUTPUT,
    [
        `// Generated from the ISO 4217 currency list published ${published}.`,
        '// Codes that define no subunit are left out. Regenerate with currency-table.codegen.mjs.',
        '',
        'export const ISO_CURRENCY_TABLE = {',
        ...rows,
        '} as const;',
        '',
    ].join('\n'),
);

// eslint-disable-next-line no-console -- a generator run by hand reports what it wrote
console.log(`Wrote ${currencies.size} currencies.`);
