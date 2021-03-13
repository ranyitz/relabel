# Relabel

<h1 align="center">🏷 Relabel</h1>
<p align="center">Interactive bulk renaming tool</p>
<p align="center">
  <img src="https://user-images.githubusercontent.com/11733036/110851019-2bc7b100-82b9-11eb-8e7f-43e23b52f568.gif" alt="relabel-example"/>
</p>
<p align="center">
  <a href="https://github.com/ranyitz/relabel/actions/workflows/node.js.yml">
   <img src="https://img.shields.io/github/workflow/status/ranyitz/relabel/Node.js%20CI?style=for-the-badge" alt="Build Status" />
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/relabel">
    <img alt="NPM version" src="https://img.shields.io/npm/v/relabel.svg?style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/ranyitz/relabel/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/npm/l/relabel.svg?style=for-the-badge">
  </a>
</p>

## Why
I missed the same search & replace the experience that we have in the IDE for code. Current solutions doesn't provide the proper feedback that you can achieve from the interactive mode

## Usage
```bash
npx relabel
```

## CLI
```
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
      --interactive, -i   Interactive Mode, automatically used when not all arguments are provided
```

## Development

* See the [Contributing Guide](CONTRIBUTING.md)
* Using [Ink](https://github.com/vadimdemedes/ink) for rendering the interactive UI.

