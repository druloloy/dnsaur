import { DNS, DNSProvider } from './types.ts';

export function minifyString(str: string): string {
  // replace special characters with empty
  return str.replace(/[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g, '').replace(
    /\s+/g,
    '-',
  ).toLowerCase();
}

export function filterDNSProviders(dns: DNSProvider[]) {
  // filter dns providers with ipv4 and ipv6
  return dns.filter((item) => {
    return item.dns.flat().some((item: DNS) => item.dns_ipv4 || item.dns_ipv6);
  });
}
