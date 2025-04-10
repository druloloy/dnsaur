import { DNS } from '../types.ts';

export async function setDNSWindows(
  { dns, protocol, connectionType }: {
    dns: DNS;
    connectionType: string;
    protocol: 'ipv4' | 'ipv6';
  },
) {
  try {
    const ip = protocol === 'ipv4' ? dns.dns_ipv4 : dns.dns_ipv6;

    const primaryDNS = ip![0];

    const primary = new Deno.Command('netsh', {
      args: [
        'interface',
        'ip',
        'set',
        'dns',
        `name=${connectionType}`,
        'static',
        primaryDNS,
        'primary',
      ],
    });

    await primary.output();

    if (ip!.length > 1) {
      const alternativeDNS = ip![1];

      const alternative = new Deno.Command('netsh', {
        args: [
          'interface',
          'ip',
          'add',
          'dns',
          `name=${connectionType}`,
          alternativeDNS,
          'index=2',
        ],
      });

      await alternative.output();
      console.info(
        `DNS has been set to ${primaryDNS} and ${alternativeDNS} for ${connectionType}.`,
      );

      if (dns.dns_https) {
        await configureDOH(ip!, dns.dns_https);
      }
    }
  } catch (error) {
    console.error('Error setting DNS:', error);
    Deno.exit(1);
  }
}

async function configureDOH(ips: string[], dohUrl: string) {
  for (const ip of ips) {
    try {
      const dohProcess = new Deno.Command('powershell', {
        args: [
          '-Command',
          `Add-DnsClientDohServerAddress -ServerAddress "${ip}" -DohTemplate "${dohUrl}"`,
        ],
      });

      await dohProcess.output();
      console.log(`Configured DoH for ${ip}`);
    } catch (error) {
      console.warn(`Could not configure DoH for ${ip}:`, error);
    }
  }
}

export function setDNSLinux() {
}

export async function getActiveNetworkAdapters() {
  const command = new Deno.Command('powershell', {
    args: [
      '-Command',
      "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object Name, InterfaceDescription",
    ],
  });

  const { stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  const connections: string[] = [];
  const lines = output.trim().split('\n').slice(2); // Skip header lines

  lines.forEach((line) => {
    const [name] = line.trim().split(/\s+(?=\w+\/)/);

    // Common WiFi indicators
    const isWiFi = name.toLowerCase().includes('wifi') ||
      name.toLowerCase().includes('wi-fi') ||
      name.toLowerCase().includes('wireless');
    // Common Ethernet indicators
    const isEthernet = name.toLowerCase().includes('ethernet');

    if (isWiFi) {
      connections.push('Wi-Fi');
    }
    if (isEthernet) {
      connections.push('Ethernet');
    }
  });

  return new Set(connections);
}

export async function disableDNSWindows(connectionType: string) {
  try {
    const command = new Deno.Command('netsh', {
      args: ['interface', 'ip', 'set', 'dns', `name=${connectionType}`, 'dhcp'],
    });

    const flush = new Deno.Command('ipconfig', {
      args: ['/flushdns'],
    });

    await command.output();
    await flush.output();

    console.info(`DNS has been reset to automatic for ${connectionType}.`);
  } catch (error) {
    console.error('Error disabling DNS:', error);
  }
}
