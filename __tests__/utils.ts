import { Testkit } from '../testkit';
import path from 'path';

const relabelBin = path.resolve(__dirname, '../bin/relabel');

export const createTestkit = (subCommand: Array<string> | string) => {
  return new Testkit({ command: [relabelBin].concat(subCommand) });
};
