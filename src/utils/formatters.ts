import { Root, Rule, AtRule, Comment } from 'postcss';

function formatDeclarations(declarations: string[]): string {
  return declarations.join('; ') + ';';
}

function collectDeclarations(rule: Rule | AtRule): string[] {
  const declarations: string[] = [];
  rule.walkDecls((decl) => {
    declarations.push(`${decl.prop}: ${decl.value}`);
  });
  return declarations;
}

function isInsideKeyframes(node: Rule | AtRule): boolean {
  return (
    node.parent &&
    node.parent.type === 'atrule' &&
    node.parent.name === 'keyframes'
  );
}

export function compactFormatter(root: Root): string {
  let result = '';

  root.walk((node) => {
    if (node.type === 'rule') {
      const rule = node as Rule;
      // 중복된 출력 방지를 위해 @keyframes 내부의 규칙은 무시합니다.
      if (isInsideKeyframes(rule)) {
        return;
      }
      const declarations = collectDeclarations(rule);
      result += `${rule.selector} { ${formatDeclarations(declarations)} }\n`;
    } else if (node.type === 'atrule') {
      const atRule = node as AtRule;
      
      if (atRule.name === 'charset') {
        // @charset은 하드코딩된 문자열로 처리
        result += `@charset "utf-8";\n`;
      } else if (atRule.name === 'keyframes' || atRule.name === 'media') {
        result += `@${atRule.name} ${atRule.params} {\n`;
        atRule.walkRules((rule: Rule) => {
          const declarations = collectDeclarations(rule);
          result += `  ${rule.selector} { ${formatDeclarations(declarations)} }\n`;
        });
        result += '}\n';
      } else {
        const declarations = collectDeclarations(atRule);
        result += `@${atRule.name} ${atRule.params} { ${formatDeclarations(declarations)} }\n`;
      }
    } else if (node.type === 'comment') {
      const comment = node as Comment;
      result += `/* ${comment.text.trim()} */\n`;
    }
  });

  return result.trim();
}

export function nestedFormatter(root: Root): string {
  let result = '';

  function formatRule(rule: Rule, indentLevel: number) {
    const indent = '  '.repeat(indentLevel);
    result += `${indent}${rule.selector} {\n`;

    rule.walkDecls((decl) => {
      result += `${indent}  ${decl.prop}: ${decl.value};\n`;
    });

    rule.walkRules((nestedRule: Rule) => {
      formatRule(nestedRule, indentLevel + 1);
    });

    result += `${indent}}\n`;
  }

  function formatAtRule(atRule: AtRule, indentLevel: number) {
    const indent = '  '.repeat(indentLevel);

    if (atRule.name === 'charset') {
      // @charset은 하드코딩된 문자열로 처리
      result += `${indent}@charset "utf-8";\n`;
    } else if (atRule.name === 'keyframes' || atRule.name === 'media') {
      result += `${indent}@${atRule.name} ${atRule.params} {\n`;
      atRule.walkRules((rule: Rule) => {
        formatRule(rule, indentLevel + 1);
      });
      result += `${indent}}\n`;
    } else {
      result += `${indent}@${atRule.name} ${atRule.params} {\n`;
      atRule.walkDecls((decl) => {
        result += `${indent}  ${decl.prop}: ${decl.value};\n`;
      });
      result += `${indent}}\n`;
    }
  }

  root.walk((node) => {
    if (node.type === 'rule') {
      // 중복된 출력 방지를 위해 @keyframes 내부의 규칙은 무시합니다.
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
