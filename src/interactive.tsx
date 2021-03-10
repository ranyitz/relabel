import React, { useState } from 'react';
import { render, useInput, useApp, Box, Text } from 'ink';
import { getFiles } from './getFiles';

export const interactive = async ({
  initialPattern,
  initialSearch,
  initialReplace,
}: {
  initialPattern?: string;
  initialSearch?: string;
  initialReplace?: string;
}): Promise<{ pattern: string; search: string; replace: string }> => {
  return new Promise((resolve, reject) => {
    let clear: () => void;

    const App = () => {
      const { exit } = useApp();

      const [pattern, setPattern] = useState<string>(initialPattern || '');
      const [search, setSearch] = useState<string>(initialSearch || '');
      const [replace, setReplace] = useState<string>(initialReplace || '');
      const [cursur, setCursor] = useState({ cursorOffset: 0, activeInput: 0 });
      const { activeInput, cursorOffset } = cursur;
      const [files, setFiles] = useState<Array<string>>([]);

      const setCursorOffset = (offset: number) =>
        setCursor({ cursorOffset: offset, activeInput });

      const getInput = (index: number) => {
        if (index === 0) {
          return {
            value: pattern,
            setValue: (p: string) => {
              if (!p) {
                setFiles([]);
              } else {
                getFiles(p).then((f) => {
                  setFiles(f);
                });
              }

              setPattern(p);
            },
          };
        }

        if (index === 1) {
          return { value: search, setValue: setSearch };
        }

        if (index === 2) {
          return { value: replace, setValue: setReplace };
        }

        throw new Error(`activeInput ${activeInput} is invalid`);
      };

      useInput((input, key) => {
        const { value, setValue } = getInput(activeInput);

        if (key.escape || (key.ctrl && (input === 'c' || input === 'd'))) {
          clear();
          exit();
          reject('abort');
          return;
        } else if (key.ctrl && input === 'u') {
          setValue('');
          setCursorOffset(0);
        } else if (key.ctrl && input === 'a') {
          setCursorOffset(0);
        } else if (key.ctrl && input === 'e') {
          setCursorOffset(value.length);
        } else if (key.leftArrow) {
          if (cursorOffset > 0) {
            setCursorOffset(cursorOffset - 1);
          }
        } else if (key.rightArrow) {
          if (cursorOffset < value.length) {
            setCursorOffset(cursorOffset + 1);
          }
        } else if (key.return) {
          clear();
          exit();
          resolve({ pattern, search, replace });
          return;
        } else if (key.upArrow || (key.tab && key.shift)) {
          const newInput = (activeInput + 3 - 1) % 3;

          setCursor({
            activeInput: newInput,
            cursorOffset: key.tab
              ? 0
              : Math.min(cursorOffset, getInput(newInput).value.length),
          });
        } else if (key.downArrow || key.tab) {
          const newInput = (activeInput + 3 + 1) % 3;

          setCursor({
            activeInput: newInput,
            cursorOffset: key.tab
              ? 0
              : Math.min(cursorOffset, getInput(newInput).value.length),
          });
        } else {
          if (key.delete || key.backspace) {
            if (cursorOffset > 0) {
              setCursorOffset(cursorOffset - 1);
              setValue(
                value.slice(0, cursorOffset - 1) + value.slice(cursorOffset)
              );
            }
          } else {
            setValue(
              value.slice(0, cursorOffset) + input + value.slice(cursorOffset)
            );

            setCursorOffset(cursorOffset + input.length);
          }
        }
      });

      let searchRegexp: RegExp | undefined;
      let searchError = '';

      try {
        searchRegexp = new RegExp(search);
      } catch (error) {
        searchError = error.message;
      }

      return (
        <>
          <Box flexDirection="column">
            <Input
              placeholder="Pattern"
              active={activeInput === 0}
              value={pattern}
              cursorOffset={cursorOffset}
            />
            <Input
              placeholder="Search "
              active={activeInput === 1}
              value={search}
              errorMessage={searchError}
              cursorOffset={cursorOffset}
            />
            <Input
              placeholder="Replace"
              active={activeInput === 2}
              value={replace}
              cursorOffset={cursorOffset}
            />
          </Box>
          <Monitor
            files={files}
            searchRegexp={searchRegexp}
            replace={replace}
          />
        </>
      );
    };

    const Input = ({
      placeholder,
      active,
      value,
      cursorOffset,
      errorMessage,
    }: {
      placeholder: string;
      active: boolean;
      value: string;
      cursorOffset: number;
      errorMessage?: string;
    }) => {
      const textWithCursor = (text: string) => {
        if (cursorOffset === text.length) {
          return (
            <Text>
              {text}
              <Text inverse> </Text>
            </Text>
          );
        }

        return (
          <>
            <Text>{text.substr(0, cursorOffset)}</Text>
            <Text inverse>{text.substr(cursorOffset, 1)}</Text>
            <Text>{text.substr(cursorOffset + 1)}</Text>
          </>
        );
      };

      return (
        <Text>
          {<Text color={active ? 'magenta' : 'white'}>{'| '}</Text>}
          {!value ? (
            <Text color="dim">
              {active ? textWithCursor(placeholder) : placeholder}
            </Text>
          ) : (
            <Text>
              {active ? textWithCursor(value) : value}
              <Text color="red"> {errorMessage}</Text>
            </Text>
          )}
        </Text>
      );
    };

    const Monitor = ({
      files,
      searchRegexp,
      replace,
    }: {
      files: Array<string>;
      searchRegexp?: RegExp;
      replace: string;
    }) => {
      if (files.length === 0) {
        return <></>;
      }

      return (
        <>
          {files
            .map((filePath) => {
              if (!searchRegexp) {
                return <Text key={filePath}>{filePath}</Text>;
              }

              let result = searchRegexp.exec(filePath);

              if (result === null) {
                return <Text key={filePath}>{filePath}</Text>;
              }

              const match = result[0];
              const matchStartIndex = result.index;

              return (
                <Text key={filePath}>
                  <Text>{filePath.substr(0, matchStartIndex)}</Text>
                  <Text strikethrough color="red">
                    {match}
                  </Text>
                  <Text color="green">{replace}</Text>
                  <Text>{filePath.substr(matchStartIndex + match.length)}</Text>
                </Text>
              );
            })
            .slice(0, process.stdout.rows - 5)}
        </>
      );
    };

    const inkRenderApi = render(<App />, { exitOnCtrlC: false });

    clear = inkRenderApi.clear;
  });
};
