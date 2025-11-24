import { Root, Rule, AtRule, Comment, Declaration } from 'postcss';
import { FORMATTING } from '../constants';

/**
 * CSS 선언들을 세미콜론으로 구분된 문자열로 포맷팅
 * @param declarations - CSS 선언 문자열 배열
 * @returns 포맷팅된 선언 문자열 (예: "color: red; margin: 0;")
 */
function formatDeclarations(declarations: string[]): string {
  if (declarations.length === 0) {
    return '';
  }
  return declarations.join('; ') + ';';
}

/**
 * 규칙 또는 At-규칙에서 모든 CSS 선언을 수집
 * @param rule - PostCSS 규칙 또는 At-규칙 노드
 * @returns CSS 선언 문자열 배열
 */
function collectDeclarations(rule: Rule | AtRule): string[] {
  const declarations: string[] = [];
  rule.walkDecls((decl: Declaration) => {
    declarations.push(`${decl.prop}: ${decl.value}`);
  });
  return declarations;
}

/**
 * 노드가 @keyframes 내부에 있는지 확인
 * @keyframes 내부의 규칙은 중복 출력을 방지하기 위해 특별 처리됨
 *
 * @param node - 검사할 PostCSS 노드
 * @returns @keyframes 내부에 있으면 true
 */
function isInsideKeyframes(node: Rule | AtRule): boolean {
  return (
    node.parent !== undefined &&
    node.parent.type === 'atrule' &&
    (node.parent as AtRule).name === 'keyframes'
  );
}

/**
 * Compact 형식으로 CSS 포맷팅
 * 모든 선언을 한 줄에 표시하여 공간을 절약
 *
 * @param root - PostCSS AST 루트 노드
 * @returns Compact 형식의 CSS 문자열
 *
 * @example
 * ```typescript
 * // 입력:
 * // body {
 * //   color: red;
 * //   margin: 0;
 * // }
 *
 * // 출력:
 * // "body { color: red; margin: 0; }"
 * ```
 */
export function compactFormatter(root: Root): string {
  let result = '';

  root.walk((node) => {
    if (node.type === 'rule') {
      const rule = node as Rule;
      if (isInsideKeyframes(rule)) {
        return;
      }
      const declarations = collectDeclarations(rule);
      if (declarations.length > 0) {
        result += `${rule.selector} { ${formatDeclarations(declarations)} }\n`;
      } else {
        result += `${rule.selector} {}\n`;
      }
    } else if (node.type === 'atrule') {
      const atRule = node as AtRule;

      if (atRule.name === 'charset') {
        result += `@charset "utf-8";\n`;
      } else if (atRule.name === 'keyframes' || atRule.name === 'media') {
        result += `@${atRule.name} ${atRule.params} {\n`;
        atRule.walkRules((rule: Rule) => {
          const declarations = collectDeclarations(rule);
          result += `${FORMATTING.INDENT}${rule.selector} { ${formatDeclarations(declarations)} }\n`;
        });
        result += '}\n';
      } else {
        const declarations = collectDeclarations(atRule);
        if (declarations.length > 0) {
          result += `@${atRule.name} ${atRule.params} { ${formatDeclarations(declarations)} }\n`;
        } else {
          result += `@${atRule.name} ${atRule.params} {}\n`;
        }
      }
    } else if (node.type === 'comment') {
      const comment = node as Comment;
      result += `/* ${comment.text.trim()} */\n`;
    }
  });

  return result.trim();
}

/**
 * Nested 형식으로 CSS 포맷팅
 * 계층 구조를 들여쓰기로 표현하여 가독성을 높임
 *
 * @param root - PostCSS AST 루트 노드
 * @returns Nested 형식의 CSS 문자열
 *
 * @example
 * ```typescript
 * // 입력:
 * // body { color: red; margin: 0; }
 *
 * // 출력:
 * // "body {
 * //   color: red;
 * //   margin: 0;
 * // }"
 * ```
 */
export function nestedFormatter(root: Root): string {
  let result = '';

  /**
   * 규칙을 중첩된 형식으로 포맷팅 (내부 함수)
   * @param rule - 포맷팅할 규칙
   * @param indentLevel - 들여쓰기 레벨
   */
  function formatRule(rule: Rule, indentLevel: number): void {
    const indent = FORMATTING.INDENT.repeat(indentLevel);
    result += `${indent}${rule.selector} {\n`;

    rule.walkDecls((decl: Declaration) => {
      result += `${indent}${FORMATTING.INDENT}${decl.prop}: ${decl.value};\n`;
    });

    rule.walkRules((nestedRule: Rule) => {
      formatRule(nestedRule, indentLevel + 1);
    });

    result += `${indent}}\n`;
  }

  /**
   * At-규칙을 중첩된 형식으로 포맷팅 (내부 함수)
   * @param atRule - 포맷팅할 At-규칙
   * @param indentLevel - 들여쓰기 레벨
   */
  function formatAtRule(atRule: AtRule, indentLevel: number): void {
    const indent = FORMATTING.INDENT.repeat(indentLevel);

    if (atRule.name === 'charset') {
      result += `${indent}@charset "utf-8";\n`;
    } else if (atRule.name === 'keyframes' || atRule.name === 'media') {
      result += `${indent}@${atRule.name} ${atRule.params} {\n`;
      atRule.walkRules((rule: Rule) => {
        formatRule(rule, indentLevel + 1);
      });
      result += `${indent}}\n`;
    } else {
      result += `${indent}@${atRule.name} ${atRule.params} {\n`;
      atRule.walkDecls((decl: Declaration) => {
        result += `${indent}${FORMATTING.INDENT}${decl.prop}: ${decl.value};\n`;
      });
      result += `${indent}}\n`;
    }
  }

  root.walk((node) => {
    if (node.type === 'rule') {
      if (isInsideKeyframes(node as Rule)) {
        return;
      }
      formatRule(node as Rule, 0);
    } else if (node.type === 'atrule') {
      formatAtRule(node as AtRule, 0);
    } else if (node.type === 'comment') {
      const comment = node as Comment;
      result += `/* ${comment.text.trim()} */\n`;
    }
  });

  return result.trim();
}
