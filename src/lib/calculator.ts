export interface CalculatorResult {
  mode: 'expression' | 'interactive';
  expression?: string;
  result?: number;
  error?: string;
}

const CALC_KEYWORD_REGEX = /^(calc(?:ulator|uladora)?|calculadora)$/i;

const SAFE_EXPR_REGEX = /^[\d+\-*/().%\s^]+$/;
const MATH_FUNC_REGEX = /^(sqrt|sin|cos|tan|log|ln|abs|floor|ceil|round)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?\s*$/i;
const TWO_OP_REGEX = /^(\d+(?:\.\d+)?)\s*([+\-*\/%^])\s*(\d+(?:\.\d+)?)$/;
const MATH_CONST_REGEX = /\b(pi|e)\b/;

function isMathExpression(query: string): boolean {
  const trimmed = query.trim();

  if (MATH_FUNC_REGEX.test(trimmed)) return true;
  if (TWO_OP_REGEX.test(trimmed)) return true;
  if (SAFE_EXPR_REGEX.test(trimmed)) return true;

  return false;
}

function safeEvaluate(expression: string): number {
  let expr = expression.trim();

  expr = expr.replace(/\bpi\b/g, String(Math.PI));
  expr = expr.replace(/\be\b/g, String(Math.E));
  expr = expr.replace(/π/g, String(Math.PI));

  const funcMatch = expr.match(MATH_FUNC_REGEX);
  if (funcMatch) {
    const funcName = funcMatch[1].toLowerCase();
    const arg = parseFloat(funcMatch[2]);
    if (isNaN(arg)) throw new Error('Invalid argument');

    switch (funcName) {
      case 'sqrt': return Math.sqrt(arg);
      case 'sin': return Math.sin(arg * Math.PI / 180);
      case 'cos': return Math.cos(arg * Math.PI / 180);
      case 'tan': return Math.tan(arg * Math.PI / 180);
      case 'log': return arg <= 0 ? NaN : Math.log10(arg);
      case 'ln': return arg <= 0 ? NaN : Math.log(arg);
      case 'abs': return Math.abs(arg);
      case 'floor': return Math.floor(arg);
      case 'ceil': return Math.ceil(arg);
      case 'round': return Math.round(arg);
      default: throw new Error('Unknown function');
    }
  }

  const twoOpMatch = expr.match(TWO_OP_REGEX);
  if (twoOpMatch) {
    const a = parseFloat(twoOpMatch[1]);
    const op = twoOpMatch[2];
    const b = parseFloat(twoOpMatch[3]);

    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/':
        if (b === 0) throw new Error('Division by zero');
        return a / b;
      case '%':
        if (b === 0) throw new Error('Division by zero');
        return a % b;
      case '^': return Math.pow(a, b);
      default: throw new Error('Unknown operator');
    }
  }

  if (SAFE_EXPR_REGEX.test(expr)) {
    expr = expr.replace(/\^/g, '**');
    try {
      const result = new Function(`"use strict"; return (${expr})`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      return result;
    } catch {
      throw new Error('Invalid expression');
    }
  }

  throw new Error('Invalid expression');
}

export function getCalculator(query: string): CalculatorResult | null {
  const trimmed = query.trim();

  if (CALC_KEYWORD_REGEX.test(trimmed)) {
    return { mode: 'interactive' };
  }

  if (!isMathExpression(trimmed)) return null;

  try {
    const result = safeEvaluate(trimmed);
    if (isNaN(result) || !isFinite(result)) {
      return { mode: 'expression', expression: trimmed, error: 'Error' };
    }
    return { mode: 'expression', expression: trimmed, result };
  } catch (err) {
    return { mode: 'expression', expression: trimmed, error: (err as Error).message };
  }
}
