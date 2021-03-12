import React, { useEffect, useState } from 'react';
import { render, useApp } from 'ink';
import { getFiles } from './getFiles';
import { Monitor, Match } from './components/Monitor';
import { Form } from './components/From';
import { memoize } from './utils';

const DEFAULT_PATTERN = '**';
const memoizedGetFiles = memoize(getFiles);

type State = {
  files: Array<string>;
  searchRegExp: RegExp | null;
  replace: string | null;
  searchError: string | null;
  patternError: string | null;
};

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

      const [state, setState] = useState<State>({
        files: [],
        searchRegExp: null,
        replace: null,
        searchError: null,
        patternError: null,
      });

      const { files, searchRegExp, replace, searchError, patternError } = state;
      const matches = getMatches(files, searchRegExp);

      useEffect(() => {
        updateFiles(initialPattern);
      }, []);

      const updateFiles = (p: string | undefined) => {
        if (!p) p = DEFAULT_PATTERN;

        memoizedGetFiles(p)
          .then((f) => {
            setState({ ...state, patternError: null, files: f });
          })
          .catch((error) => {
            setState({ ...state, patternError: error.message, files: [] });
          });
      };

      return (
        <>
          <Form
            onExit={() => {
              clear();
              exit();
              reject('abort');
            }}
            onSubmit={({ inputs }) => {
              clear();
              exit();
              const [pattern, search, replace] = inputs;
              resolve({ pattern, search, replace });
            }}
            inputs={[
              {
                placeholder: '**',
                label: 'Pattern',
                initialValue: initialPattern,
                validationError: patternError,
                onChange: (newInput) => {
                  updateFiles(newInput);
                },
              },
              {
                label: 'Search ',
                initialValue: initialSearch,
                validationError: searchError,
                onChange: (newInput) => {
                  if (!newInput) {
                    setState({
                      ...state,
                      searchRegExp: null,
                      searchError: null,
                    });
                    return;
                  }

                  try {
                    setState({
                      ...state,
                      searchRegExp: new RegExp(newInput),
                      searchError: null,
                    });
                  } catch (error) {
                    setState({
                      ...state,
                      searchRegExp: null,
                      searchError: error.message,
                    });
                  }
                },
              },
              {
                label: 'Replace',
                initialValue: initialReplace,
                onChange: (newInput) => {
                  setState({
                    ...state,
                    replace: newInput ?? null,
                  });
                },
              },
            ]}
          ></Form>
          <Monitor
            files={files}
            searchRegExp={searchRegExp}
            matches={matches}
            replace={replace}
          />
        </>
      );
    };

    const inkRenderApi = render(<App />, { exitOnCtrlC: false });

    clear = inkRenderApi.clear;
  });
};

const getMatches = (files: Array<string>, searchRegexp?: RegExp | null) => {
  if (!searchRegexp) return [];

  const matches: Array<Match> = [];

  for (const filePath of files) {
    const result = searchRegexp.exec(filePath);

    if (result) {
      const match = result[0];
      const matchStartIndex = result.index;
      matches.push({ filePath, match, matchStartIndex });
    }
  }

  return matches;
};
