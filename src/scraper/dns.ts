import * as cheerio from 'cheerio';
import type { Element } from '../../../../../AppData/Local/deno/npm/registry.npmjs.org/domhandler/5.0.3/lib/esm/node.d.ts';
import type { DNSType, ResultsType } from './types.ts';

import {
  createEmptyDNS,
  getHTTPSOnly,
  getIPV4Only,
  getIPV6Only,
  getTLSOnly,
} from './utils.ts';

export function processType(type: string) {
  return type.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '-').toLowerCase()
    .trim();
}

export function processDNS({
  element,
  $,
  resultsProviderDNS,
}: {
  element: Element;
  $: cheerio.CheerioAPI;
  resultsProviderDNS: DNSType;
}) {
  const td = $(element).find('td');

  if (td.text().includes('DNS, IPv4')) {
    const ipv4 = td.next('td').first().text().split('and');

    resultsProviderDNS.dns_ipv4 = ipv4.map((ip) => getIPV4Only(ip.trim()));
  }

  if (td.text().includes('DNS, IPv6')) {
    const ipv6 = td.next('td').first().text().split('and');

    resultsProviderDNS.dns_ipv6 = ipv6.map((ip) => getIPV6Only(ip.trim()));
  }
  if (td.text().includes('DNS-over-HTTPS')) {
    const https = td.next('td').first().text().trim();
    resultsProviderDNS.dns_https = getHTTPSOnly(https);
  }

  if (td.text().includes('DNS-over-TLS')) {
    const tls = td.next('td').first().text().trim();
    resultsProviderDNS.dns_tls = getTLSOnly(tls);
  }

  return resultsProviderDNS;
}

export function processResults({
  element,
  $,
  results,
  ctr = 0,
}: {
  element: Element;
  $: cheerio.CheerioAPI;
  results: ResultsType[];
  ctr?: number;
}) {
  if ($(element).is('h3')) {
    ctr++;
    results.push({
      id: ctr,
      description: $(element).next('p').text().trim(),
      provider: $(element).text().trim(),
      dns: [],
      dns_count: 0,
    });
  }

  const currentProvider = ctr - 1;

  if ($(element).is('h4')) {
    results[currentProvider]?.dns?.push({
      type: $(element).attr('id')?.trim() || processType($(element).text()),
      description: $(element).next('p').text().trim(),
    });

    results[currentProvider].dns_count++;
  }

  if ($(element).is('tbody')) {
    if (results[currentProvider].dns_count === 0) {
      results[currentProvider].dns.push(createEmptyDNS());
      results[currentProvider].dns_count++;
    }

    $(element)
      .find('tr')
      .each((_index, element) => {
        const currentDNSCollection = results[currentProvider].dns_count - 1;

        results[currentProvider]
          .dns[currentDNSCollection] = processDNS({
            element,
            $,
            resultsProviderDNS: results[currentProvider]
              .dns[currentDNSCollection],
          });
      });
  }

  return {
    results,
    ctr,
  };
}
