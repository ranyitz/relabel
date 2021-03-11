import React from 'react';
import chalk from 'chalk';
import { Text } from 'ink';

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
              <Text strikethrough>{getSearchColor()(match)}</Text>
              <Text color="green">{getReplaceColor()(replace)}</Text>
              <Text>{filePath.substr(matchStartIndex + match.length)}</Text>
            </Text>
          );
        })
        .slice(0, maxMonitorHeight)}
    </>
  );
};

const getReplaceColor = () => {
  const level = chalk.level;

  if (level === 3) {
    return chalk.bgHex('#5f8700').white;
  }

  if (level === 2) {
    return chalk.ansi256(aForeground2).bgAnsi256(aBackground2);
  }

  return chalk.magenta.bgYellowBright;
};

const getSearchColor = () => {
  const level = chalk.level;

  if (level === 3) {
    return chalk.bgHex('#af0000').white;
  }

  if (level === 2) {
    return chalk.ansi256(bForeground2).bgAnsi256(bBackground2);
  }

  return chalk.cyan.bgWhiteBright; // also known as teal
};

// https://jonasjacek.github.io/colors/

// 64	Chartreuse4	#5f8700	rgb(95,135,0)	hsl(7,100%,26%)
export const aForeground2 = 15;
export const aBackground2 = 64;

//130	DarkOrange3	#af5f00	rgb(175,95,0)	hsl(2,100%,34%)
export const bForeground2 = 15;
export const bBackground2 = 130;

export type RGB = [number, number, number];

export const aForeground3: RGB = [0x80, 0, 0x80];
export const aBackground3: RGB = [0xff, 0xd7, 0xff];

export const bForeground3: RGB = [0, 0x5f, 0x5f];
export const bBackground3: RGB = [0xd7, 0xff, 0xff];
