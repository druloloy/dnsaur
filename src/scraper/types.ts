export type DNSType = {
  type: string;
  description: string;
  dns_ipv4?: string[];
  dns_ipv6?: string[];
  dns_https?: string;
  dns_tls?: string;
};

export type ResultsType = {
  id: number;
  description: string;
  provider: string;
  dns: DNSType[];
  dns_count: number;
};
