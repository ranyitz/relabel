import globby from 'globby';

export type Pattern = string | readonly string[];

export const getFiles = async (pattern: Pattern) => {
  return globby(pattern, {
    cwd: process.cwd(),
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: true,
  });
};
