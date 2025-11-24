import { describe, test, expect } from 'bun:test';
import postcss from 'postcss';
import { compactFormatter, nestedFormatter } from '../../src/utils/formatters';

describe('formatters', () => {
  describe('compactFormatter', () => {
    test('should format simple CSS rules in compact style', () => {
      const css = `
        body {
          color: red;
          margin: 0;
        }
      `;
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toBe('body { color: red; margin: 0; }');
    });

    test('should format multiple rules', () => {
      const css = `
        body { color: red; }
        .header { background: blue; }
      `;
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toContain('body { color: red; }');
      expect(result).toContain('.header { background: blue; }');
    });

    test('should handle @charset directive', () => {
      const css = '@charset "UTF-8";';
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toBe('@charset "utf-8";');
    });

    test('should handle @media queries', () => {
      const css = `
        @media screen and (max-width: 600px) {
          body { font-size: 14px; }
        }
      `;
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toContain('@media screen and (max-width: 600px)');
      expect(result).toContain('body { font-size: 14px; }');
    });

    test('should handle @keyframes', () => {
      const css = `
        @keyframes fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toContain('@keyframes fade');
      expect(result).toContain('0% { opacity: 0; }');
      expect(result).toContain('100% { opacity: 1; }');
    });

    test('should preserve CSS comments', () => {
      const css = `
        /* Main styles */
        body { color: red; }
      `;
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toContain('/* Main styles */');
      expect(result).toContain('body { color: red; }');
    });

    test('should handle empty rules', () => {
      const css = 'body {}';
      const root = postcss.parse(css);
      const result = compactFormatter(root);

      expect(result).toBe('body {}');
    });
  });

  describe('nestedFormatter', () => {
    test('should format simple CSS rules in nested style', () => {
      const css = `
        body {
          color: red;
          margin: 0;
        }
      `;
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toContain('body {');
      expect(result).toContain('  color: red;');
      expect(result).toContain('  margin: 0;');
      expect(result).toContain('}');
    });

    test('should format multiple rules', () => {
      const css = `
        body { color: red; }
        .header { background: blue; }
      `;
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toContain('body {');
      expect(result).toContain('  color: red;');
      expect(result).toContain('.header {');
      expect(result).toContain('  background: blue;');
    });

    test('should handle @charset directive', () => {
      const css = '@charset "UTF-8";';
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toBe('@charset "utf-8";');
    });

    test('should handle @media queries with proper indentation', () => {
      const css = `
        @media screen and (max-width: 600px) {
          body { font-size: 14px; }
        }
      `;
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toContain('@media screen and (max-width: 600px) {');
      expect(result).toContain('  body {');
      expect(result).toContain('    font-size: 14px;');
    });

    test('should handle @keyframes with proper indentation', () => {
      const css = `
        @keyframes fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toContain('@keyframes fade {');
      expect(result).toContain('  0% {');
      expect(result).toContain('    opacity: 0;');
      expect(result).toContain('  100% {');
      expect(result).toContain('    opacity: 1;');
    });

    test('should preserve CSS comments', () => {
      const css = `
        /* Main styles */
        body { color: red; }
      `;
      const root = postcss.parse(css);
      const result = nestedFormatter(root);

      expect(result).toContain('/* Main styles */');
      expect(result).toContain('body {');
      expect(result).toContain('  color: red;');
    });
  });
});
