import { disableDNSWindows, setDNSWindows } from './cmd/windows.ts';
import { DNS } from './types.ts';
import {
  inquireConnection,
  inquireExit,
  inquireInitialAction,
  inquireProtocol,
  inquireProvider,
  inquireType,
} from './inquire.ts';
import chalk from 'chalk';
import { isRunningAsAdmin } from './cmd/admin.ts';

const isAdmin = await isRunningAsAdmin();

if (!isAdmin) {
  console.info(
    chalk.bgRed.bold(
      'Script is not running with admin privileges. Functions may not work. Please run again with admin privileges.',
    ),
  );
}

async function enableDNS(
  type: DNS,
  adapter: string,
  protocol: 'ipv4' | 'ipv6',
) {
  await setDNSWindows({
    dns: type,
    connectionType: adapter,
    protocol,
  });
}

async function disableDNS(adapter: string) {
  await disableDNSWindows(adapter);
}

function close() {
  console.info(chalk.green.bold('Goodbye!'));
  Deno.exit(0);
}

const initialAction = await inquireInitialAction();

switch (initialAction) {
  case 'enable_dns': {
    try {
      const adapter = await inquireConnection() as string;
      const provider = await inquireProvider() as string;
      const type: DNS = await inquireType(provider as string);
      const protocol = await inquireProtocol() as 'ipv4' | 'ipv6';

      await enableDNS(type, adapter, protocol).finally(() => {
        inquireExit().finally(() => close());
      });
    } catch (error) {
      console.log(error);
    }

    break;
  }
  case 'disable_dns': {
    const adapter = await inquireConnection() as string;
    await disableDNS(adapter).finally(() => {
      inquireExit().finally(() => close());
    });
    break;
  }

  case 'exit':
    close();
    break;
}
