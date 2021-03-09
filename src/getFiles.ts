import globby from "globby"

export type Pattern = string | readonly string[];

export const getFiles = (pattern: Pattern) => {
  return globby.sync(pattern, {
    cwd: process.cwd(),
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: true,
  });
}
