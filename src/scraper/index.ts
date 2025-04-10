import { processResults } from './dns.ts';
import { ResultsType } from './types.ts';
import { fetchSource, writeJSON } from './utils.ts';
import * as cheerio from 'cheerio';

const source = 'https://adguard-dns.io/kb/general/dns-providers/';

async function scrape() {
  const html = await fetchSource(source);
  const $ = cheerio.load(html);
  let results: ResultsType[] = [];
  let ctr = 0;

  $('h3, h4, p, tbody').each((_index, element) => {
    const {
      results: r,
      ctr: c,
    } = processResults({
      $,
      element,
      results,
      ctr,
    });

    results = r;
    ctr = c;
  });

  await writeJSON(results);
}

await scrape();

Deno.exit(0);
