export type DNS = {
  type: string;
  description: string;
  dns_ipv4?: string[];
  dns_ipv6?: string[];
  dns_https?: string;
  dns_tls?: string;
};

export type DNSProvider = {
  id: number;
  description: string;
  provider: string;
  dns: DNS[];
  dns_count: number;
};
