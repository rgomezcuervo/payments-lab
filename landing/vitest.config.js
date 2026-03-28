import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.js'],
        exclude: [
          '**/*.test.js',
          'src/main.js',
          'src/js/main.js',
          'src/js/cms/content-provider.js',
          'src/js/tenant/tenant-config.js',
        ],
        thresholds: {
          'src/js/i18n/i18n.js': {
            lines: 100,
            statements: 100,
            functions: 100,
            branches: 88,
          },
          'src/js/ui/nav.js': {
            lines: 100,
            statements: 100,
            functions: 83,
            branches: 88,
          },
        },
      },
    },
  }),
);
