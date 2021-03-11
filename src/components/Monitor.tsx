import React from 'react';
import { Text } from 'ink';
import { getReplaceColor, getSearchColor } from './colors';

const searchColor = getSearchColor();
const replaceColor = getReplaceColor();

export const Monitor = ({
  files,
  searchRegexp,
  replace,
}: {
  files: Array<string>;
  searchRegexp: RegExp | null;
  replace: string | null;
}) => {
  const maxMonitorHeight = process.stdout.rows - 5;
  const totalFiles = files.length;

  if (totalFiles === 0) {
    return (
      <>
        <Text dimColor color="yellow">
          no matched files for pattern
        </Text>
      </>
    );
  }

  if (!searchRegexp) {
    return (
      <>
        <Text dimColor color="yellow">
          {0} / {totalFiles}
        </Text>
        {files
          .map((filePath) => {
            return <Text key={filePath}>{filePath}</Text>;
          })
          .slice(0, maxMonitorHeight)}
      </>
    );
  }

  const matches = [];

  for (const filePath of files) {
    const result = searchRegexp.exec(filePath);

    if (result) {
      const match = result[0];
      const matchStartIndex = result.index;
      matches.push({ filePath, match, matchStartIndex });
    }
  }

  return (
    <>
      <Text dimColor color="yellow">
        {matches.length} / {totalFiles}
      </Text>
      {matches
        .map(({ filePath, match, matchStartIndex }) => {
          return (
            <Text key={filePath}>
              <Text>{filePath.substr(0, matchStartIndex)}</Text>
              <Text strikethrough>{searchColor`${match}`}</Text>
              <Text color="green">{replaceColor`${replace}`}</Text>
              <Text>{filePath.substr(matchStartIndex + match.length)}</Text>
            </Text>
          );
        })
        .slice(0, maxMonitorHeight)}
    </>
  );
};
