import { spawn } from 'node:child_process';

const steps = [
  ['npm', ['install']],
  ['npx', ['prisma', 'generate']],
  ['npx', ['prisma', 'db', 'push']],
  ['npm', ['run', 'dev']],
];

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
      }
    });
  });

const main = async () => {
  for (const [command, args] of steps) {
    await run(command, args);
  }
};

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
