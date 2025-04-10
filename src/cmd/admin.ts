export const isRunningAsAdmin = async (): Promise<boolean> => {
  if (Deno.build.os !== 'windows') {
    throw new Error('Admin elevation is only supported on Windows.');
  }

  try {
    const command = new Deno.Command('powershell', {
      args: [
        '-Command',
        'New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())',
      ].concat(
        '.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)',
      ),
    });

    const { stdout } = await command.output();
    return new TextDecoder().decode(stdout).trim() === 'True';
  } catch {
    return false;
  }
};

// Attempt to self-elevate the script
export async function elevateToAdmin(): Promise<void> {
  if (Deno.build.os !== 'windows') {
    throw new Error('Admin elevation is only supported on Windows.');
  }

  // Get the current script path
  const scriptPath = Deno.mainModule.replace('file:///', '');

  try {
    // Use PowerShell to run the script with elevated permissions
    const elevationProcess = new Deno.Command('powershell', {
      args: [
        '-Command',
        `Start-Process deno -ArgumentList "run --allow-run --allow-sys --allow-net --allow-env '${scriptPath}'" -Verb RunAs`,
      ],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { success, stderr } = await elevationProcess.output();

    if (!success) {
      console.error('Elevation failed:', new TextDecoder().decode(stderr));
      Deno.exit(1);
    }

    console.log('Script re-launched with admin privileges');
    // relaunch the script
  } catch (error) {
    console.error('Error attempting to elevate permissions:', error);
    Deno.exit(1);
  }
}

// Ensure admin rights before running sensitive commands
export async function ensureAdminRights(): Promise<void> {
  // Check if already running as admin
  if (await isRunningAsAdmin()) {
    console.log('Script is already running with admin privileges');
    return;
  }

  // Attempt to elevate
  console.log('Requesting administrator privileges...');
  await elevateToAdmin();
}
