import React, { useRef } from 'react';
import { Text } from 'ink';
import { getReplaceColor, getSearchColor } from './colors';

export type Match = {
  filePath: string;
  match: string;
  matchStartIndex: number;
};

const confirmText = '- Press "Enter" to confirm';
const searchColor = getSearchColor();
const replaceColor = getReplaceColor();

export const Monitor = ({
  files,
  replace,
  searchRegExp,
  matches,
}: {
  files: Array<string>;
  matches: Array<Match>;
  searchRegExp: RegExp | null;
  replace: string | null;
}) => {
  const maxMonitorHeight = process.stdout.rows - 7;
  const totalFiles = files.length;

  const notInitialRender = useRef(false);

  // Prevent flickering on the no matched files
  // Warning (since we get the files after a few miliseconds)
  if (!notInitialRender.current) {
    notInitialRender.current = true;
    return <></>;
  }

  if (totalFiles === 0) {
    return (
      <>
        <Text dimColor color="yellow">
          no matched files for pattern
        </Text>
      </>
    );
  }

  if (!searchRegExp || matches.length === 0) {
    return (
      <>
        <Text dimColor color="yellow">
          {0} / {totalFiles}
          {replace ? <Text> {confirmText}</Text> : null}
        </Text>
        {files
          .map((filePath) => {
            return (
              <Text key={filePath}>
                {filePath}
                {replace ? <Text>{replaceColor`${replace}`}</Text> : null}
              </Text>
            );
          })
          .slice(0, maxMonitorHeight)}
      </>
    );
  }

  return (
    <>
      <Text dimColor color="yellow">
        {matches.length} / {totalFiles} <Text>{confirmText}</Text>
      </Text>
      {matches
        .map(({ filePath, match, matchStartIndex }) => {
          return (
            <Text key={filePath}>
              <Text>{filePath.substr(0, matchStartIndex)}</Text>
              <Text strikethrough>{searchColor`${match}`}</Text>
              {replace ? <Text>{replaceColor`${replace}`}</Text> : null}
              <Text>{filePath.substr(matchStartIndex + match.length)}</Text>
            </Text>
          );
        })
        .slice(0, maxMonitorHeight)}
    </>
  );
};
