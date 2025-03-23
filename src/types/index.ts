export interface StylelintConfig {
  extends: string[];
  fix: boolean;
  plugins: string[];
  rules: Record<string, any>; // 이상적으로는 구체적인 타입을 정의해야 함
  customSyntax?: string;
}

export interface LintOptions {
  code: string;
  config: StylelintConfig;
}

export interface LintResult {
  success: boolean;
  message: string;
  content: {
    warnings: any[]; // 이상적으로는 구체적인 타입을 정의해야 함
    output: string;
    info: {
      version: string;
      config: {
        extends: string[];
        plugins: string[];
        customSyntax?: string;
      };
    };
  } | null;
}

export interface LintRequest {
  code: string;
  syntax: string;
  config: {
    rules: Record<string, any>;
    outputStyle?: string;
  };
}
