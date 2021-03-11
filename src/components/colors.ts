import chalk from 'chalk';

export const getReplaceColor = () => {
  const level = chalk.level;

  if (level === 3) {
    return chalk.bgHex('#5f8700').hex('#eeeeee');
  }

  if (level === 2) {
    return chalk.ansi256(255).bgAnsi256(64);
  }

  return chalk.white.bgGreen;
};

export const getSearchColor = () => {
  const level = chalk.level;

  if (level === 3) {
    return chalk.bgHex('#af0000').hex('#eeeeee');
  }

  if (level === 2) {
    return chalk.ansi256(255).bgAnsi256(124);
  }

  return chalk.white.bgRed;
};
