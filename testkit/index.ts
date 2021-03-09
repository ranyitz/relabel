process.env.NODE_ENV = 'test';

import path from 'path';
import tempy from 'tempy';
import fs from 'fs-extra';
import globby from 'globby';
import expect from 'expect';
import execa from 'execa';
import chalk from 'chalk';

export class Testkit {
  command?: string[];

  constructor({ command }: { command?: string[] }) {
    this.command = command;
  }

  /**
   * @param options.fixtures an absolute path to a fixtures directory
   * which contains \_\_before__ and \_\_after__ directories
   */
  async run({ fixtures }: { fixtures: string }): Promise<{ cwd: string }> {
    if (!fixtures) {
      throw new Error('must provide "fixtures" path');
    }

    if (!path.isAbsolute(fixtures)) {
      throw new Error(`fixtures path must be an absolute path`);
    }

    if (!fs.existsSync(fixtures)) {
      throw new Error(`fixture path ${fixtures} doesn't exist`);
    }

    const beforeDirectory = path.join(fixtures, '__before__');
    const afterDirectory = path.join(fixtures, '__after__');

    if (!fs.existsSync(beforeDirectory)) {
      throw new Error(`please create a "__before__" directory in ${fixtures}`);
    }

    if (!fs.existsSync(afterDirectory)) {
      throw new Error(
        `please create a "__after__" directory in ${afterDirectory}`
      );
    }

    const workingDir = tempy.directory();

    fs.copySync(beforeDirectory, workingDir);

    const command = this.command;

    if (command && Array.isArray(command) && command.length > 0) {
      try {
        execa.sync(command[0], command.slice(1), {
          cwd: workingDir,
          stdio: 'inherit',
        });
      } catch (error) {
        console.error(
          chalk.red(`The following command failed with errors:
${command.join(' ')}`)
        );

        // Look at the output of the command in order to understand the cause of the problem
        throw new Error(error);
      }
    }

    const expectedFiles = globby.sync('**/*', {
      cwd: afterDirectory,
      gitignore: true,
      dot: true,
      ignore: ['**/node_modules/**'],
    });

    const resultFiles = globby.sync('**/*', {
      cwd: workingDir,
      gitignore: true,
      dot: true,
      ignore: ['**/node_modules/**'],
    });

    expectedFiles.forEach((fileName) => {
      expect(resultFiles).toContain(fileName);

      const expectedFilePath = path.join(afterDirectory, fileName);
      const expectedFileContents = fs.readFileSync(expectedFilePath, 'utf-8');
      const resultFilePath = path.join(workingDir, fileName);
      const resultFileContents = fs.readFileSync(resultFilePath, 'utf-8');

      try {
        expect(resultFileContents).toBe(expectedFileContents);
      } catch (error) {
        throw new Error(`Expected file: ${expectedFilePath}
Recieved file: ${resultFilePath}

${error.toString()}`);
      }
    });

    return {
      cwd: workingDir,
    };
  }

  /**
   * @param options.fixtures an absolute path to a fixtures directory
   * which contains \_\_before__ and \_\_after__ directories
   * @param options.title test title
   */
  async test({ fixtures, title }: { fixtures: string; title?: string }) {
    const name = path.basename(fixtures);

    it(title ?? name, () => this.run({ fixtures }));
  }
}
