import dns from '../data/public-dns.json' with { type: 'json' };
import { select, Separator } from '@inquirer/prompts';
import { getActiveNetworkAdapters } from './cmd/windows.ts';
import { filterDNSProviders, minifyString } from './utils.ts';
import chalk from 'chalk';
import { DNSProvider } from './types.ts';

const theme = {
  style: {
    highlight: (text: string) => chalk.black.bgYellow(text),
  },
};

export function inquireType(provider: string) {
  const typeChoices = (dns as DNSProvider[])
    .filter((item) => minifyString(item.provider) === provider)
    .map((item) => item.dns)
    .flat()
    .map((item) => {
      return {
        name: item.type,
        value: item,
        description: item.description,
      };
    });

  const type = select({
    message: 'Select a type',
    choices: [...typeChoices, new Separator()],
    theme,
    pageSize: 15,
  });

  return type;
}

export function inquireProtocol() {
  const protocolChoices = [
    {
      name: 'IPv4',
      value: 'ipv4',
    },
    {
      name: 'IPv6',
      value: 'ipv6',
    },
  ];

  const protocol = select({
    message: 'Select a protocol',
    choices: [...protocolChoices, new Separator()],
    theme,
    pageSize: 15,
  });

  return protocol;
}

export function inquireProvider() {
  const providerChoices = filterDNSProviders(dns as DNSProvider[]).map(
    (item) => {
      return {
        name: item.provider,
        value: minifyString(item.provider),
        description: item.description,
      };
    },
  );

  const provider = select({
    message: 'Select a provider',
    choices: [...providerChoices, new Separator()],
    theme,
    pageSize: 15,
  });

  return provider;
}

export async function inquireConnection() {
  const adapters = await getActiveNetworkAdapters();

  const connectionChoices = Array.from(adapters).map((item) => {
    return {
      name: item,
      value: item,
    };
  });

  const connection = select({
    message: 'Select an adapter',
    choices: connectionChoices,
  });

  return connection;
}

export async function inquireInitialAction() {
  const initialActionChoices = [
    {
      name: 'Enable DNS Protection',
      value: 'enable_dns',
      description:
        'Select this option to enable or change DNS protection on your connection.',
    },
    {
      name: 'Disable DNS Protection',
      value: 'disable_dns',
      description:
        'Select this option to disable DNS protection and reset DNS to default on your connection.',
    },
    new Separator(),
    {
      name: 'Exit',
      value: 'exit',
      description: 'Select this option to exit the program.',
    },
  ];

  const initialAction = await select({
    message: 'What would you like to do?',
    choices: initialActionChoices,
    loop: true,
    theme,
  });

  return initialAction;
}

export async function inquireExit() {
  const exit = await select({
    message: 'What would you like to do?',
    choices: [
      {
        name: 'Exit',
        value: 'exit',
        description: 'Select this option to exit the program.',
      },
    ],
    theme,
  });

  return exit;
}
