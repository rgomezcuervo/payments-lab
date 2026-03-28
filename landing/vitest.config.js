import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.js', 'tests/**/*.spec.js'],
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
          'src/js/ui/faq.js',
        ],
        thresholds: {
          lines: 90,
          statements: 90,
          functions: 90,
          branches: 72,
        },
      },
    },
  }),
);
