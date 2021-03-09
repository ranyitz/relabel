import arg from 'arg';
import fs from 'fs-extra';
import { getFiles } from './getFiles';

process.on('unhandledRejection', (error) => {
  throw error;
});

const args = arg(
  {
    // Types
    '--version': Boolean,
    '--help': Boolean,
    '--verbose': Boolean,
    '--dry': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help',
    '-d': '--dry',
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
      > relabel <pattern> <old> [new]

    Remove
      > relable **/foo-bar.js foo-  =>  dir/bar.js

    Modify
      > relable **/*.spec.js spec test  => dir/file.test.js

    Options
      --version, -v   Version number
      --help, -h      Displays this message
      --dry, -d       Dry-run mode, does not modify files
`);

  process.exit(0);
}

const [pattern, old, replacement = ''] = args._.slice(0, 3);

const files = getFiles(pattern);

files.forEach((filePath) => {
  const newPath = filePath.replace(old, replacement);
  fs.moveSync(filePath, newPath);
});
