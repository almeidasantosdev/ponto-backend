const { spawn } = require('node:child_process');

const flags = ['--experimental-vm-modules', '--disable-warning=ExperimentalWarning'];
const current = new Set((process.env.NODE_OPTIONS ?? '').split(/\s+/).filter(Boolean));
for (const flag of flags) {
  current.add(flag);
}
process.env.NODE_OPTIONS = [...current].join(' ');

const child = spawn(
  process.execPath,
  [require.resolve('jest/bin/jest'), '--runInBand', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: process.env,
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
