import fs from 'fs-extra';
import { getFiles } from './getFiles';

export const execute = ({
  pattern,
  search,
  replace,
  dry,
}: {
  pattern: string;
  search: string;
  replace: string;
  dry: boolean;
}) => {
  const files = getFiles(pattern);

  files.forEach((filePath) => {
    const searchRegexp = new RegExp(search);
    const result = searchRegexp.exec(filePath);

    if (result) {
      const newPath = filePath.replace(searchRegexp, replace);

      if (newPath === filePath) return;

      if (!dry) {
        fs.moveSync(filePath, newPath);
      } else {
        console.log(`${filePath} -> ${newPath}`);
      }
    }
  });
};
