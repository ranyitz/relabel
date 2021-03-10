import arg from 'arg';
import { interactive } from './interactive';
import { execute } from './execute';

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
    '--interactive': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help',
    '-d': '--dry',
    '-i': '--interactive',
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
      > relabel [pattern] [old] [new]

    Interactive Mode
      > relabel

    Modify
      > relabel '**/*.spec.js' spec test  => dir/file.test.js

    Remove
      > relabel '**/foo-bar.js' foo-  =>  dir/bar.js

    Options
      --version, -v       Version number
      --help, -h          Displays this message
      --dry, -d           Dry-run mode, does not modify files
      --interactive, -i   Interactive Mode, automatically used when not all argument are provided
`);

  process.exit(0);
}

const [pattern, search, replace = ''] = args._.slice(0, 3);

if (args['--interactive'] || !pattern || !search) {
  interactive({
    initialPattern: pattern,
    initialSearch: search,
    initialReplace: replace,
  })
    .then((result) => {
      execute({ ...result, dry: !!args['--dry'] });
    })
    .catch((error) => {
      if (error === 'abort') {
        process.exit(1);
      }

      throw error;
    });
} else {
  execute({ pattern, search, replace, dry: !!args['--dry'] });
}
