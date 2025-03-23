import { StylelintConfig } from '../types';

export const DEFAULT_EXTENDS = [
  'stylelint-config-standard',
  'stylelint-config-recommended-scss',
  'stylelint-config-recommended-vue',
];

export const DEFAULT_PLUGINS = ['stylelint-order', 'stylelint-stylistic'];

export function createStylelintConfig(rules: Record<string, any>, syntax: string): StylelintConfig {
  const config: StylelintConfig = {
    extends: DEFAULT_EXTENDS,
    fix: true,
    plugins: DEFAULT_PLUGINS,
    rules: { ...rules },
  };

  if (syntax === 'html') {
    config.customSyntax = 'postcss-html';
  }

  return config;
}
