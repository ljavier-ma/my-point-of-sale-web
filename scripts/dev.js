const { spawn } = require('node:child_process');

const nextCliPath = require.resolve('next/dist/bin/next');
const args = process.argv.slice(2);
const useLocalApi = args.includes('--local-api');
const nextArgs = args.filter((arg) => arg !== '--local-api');

const next = spawn(process.execPath, [nextCliPath, 'dev', ...nextArgs], {
  env: {
    ...process.env,
    NEXT_PUBLIC_USE_LOCAL_API: String(useLocalApi),
  },
  stdio: 'inherit',
});

next.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exitCode = 1;
});

next.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
