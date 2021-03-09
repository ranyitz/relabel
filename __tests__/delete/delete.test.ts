import { createTestkit } from '../utils';

const testkit = createTestkit(['*.txt', 'foo.']);

testkit.test({ fixtures: __dirname });
