import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { CoreConfig } from '@/core/types/core-config.type';

export const CoreConfigFilePath = resolve(
  dirname(__dirname),
  './src',
  './core',
  './core.config.json',
);
export const CoreOptions: CoreConfig = JSON.parse(
  readFileSync(CoreConfigFilePath, 'utf8'),
);
