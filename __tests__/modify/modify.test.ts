import { createTestkit } from '../utils';

const testkit = createTestkit(['*.txt', 'foo', 'bar']);

testkit.test({ fixtures: __dirname });
