import React, { useState } from 'react';
import { render, useApp } from 'ink';
import { getFiles } from './getFiles';
import { Monitor } from './components/Monitor';
import { Form } from './components/From';

const DEFAULT_PATTERN = '**';

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

      const [files, setFiles] = useState<Array<string>>([]);
      const [searchRegexp, setSearchRegexp] = useState<RegExp | null>(null);
      const [replace, setReplace] = useState<string | null>(null);
      const [searchError, setSearchError] = useState<string | null>(null);
      const [patternError, setPatternError] = useState<string | null>(null);

      const updateFiles = (p: string | undefined) => {
        if (!p) p = DEFAULT_PATTERN;

        getFiles(p)
          .then((f) => {
            setPatternError(null);
            setFiles(f);
          })
          .catch((error) => {
            setPatternError(error.message);
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
                    setSearchRegexp(null);
                    setSearchError(null);
                    return;
                  }

                  try {
                    setSearchRegexp(new RegExp(newInput));
                    setSearchError(null);
                  } catch (error) {
                    setSearchError(error.message);
                  }
                },
              },
              {
                label: 'Replace',
                initialValue: initialReplace,
                onChange: (newInput) => {
                  setReplace(newInput ?? null);
                },
              },
            ]}
          ></Form>
          <Monitor
            files={files}
            searchRegexp={searchRegexp}
            replace={replace}
          />
        </>
      );
    };

    const inkRenderApi = render(<App />, { exitOnCtrlC: false });

    clear = inkRenderApi.clear;
  });
};
