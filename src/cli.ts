
import arg from 'arg';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';

process.on('unhandledRejection', (error) => {
  throw error;
});

const args = arg(
  {
    // Types
    '--version': Boolean,
    '--help': Boolean,
    '--verbose': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help'
  },
  {
    permissive: false,
  }
);

if (args['--version']) {
  console.log(require('../package.json').version);
  process.exit(0);
}


if (args['--help']) {
  console.log(`
    Usage
      > relabel

    Options
      --version, -v   Version number
      --help, -h      Displays this message
`);

  process.exit(0);
}
