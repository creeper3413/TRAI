// TRAİ High-Precision Math & Logic Engine
// Deterministic evaluation with human-friendly step-by-step breakdown

export interface MathSolution {
  isMath: boolean;
  expression: string;
  result: number | string;
  steps: string[];
  explanation: string;
}

export function solveMathExpression(rawText: string): MathSolution {
  if (!rawText || typeof rawText !== 'string') {
    return { isMath: false, expression: '', result: '', steps: [], explanation: '' };
  }

  const t = rawText.trim();

  // 1. Natural Turkish spoken arithmetic: e.g. "15 ile 25'i topla", "100 ile 4'ü çarp", "80'den 25 çıkar", "120'yi 4'e böl"
  const spokenAdd = t.match(/(\d+(?:\.\d+)?)\s*(?:ile|ve)\s*(\d+(?:\.\d+)?)\s*(?:'yi|'yı|'i|'ı|'si|'si)?\s*(?:topla|toplamı|toplami)/i);
  if (spokenAdd) {
    const a = parseFloat(spokenAdd[1]);
    const b = parseFloat(spokenAdd[2]);
    const res = Math.round((a + b) * 100000) / 100000;
    return {
      isMath: true,
      expression: `${a} + ${b}`,
      result: res,
      steps: [
        `İki sayıyı topluyoruz: ${a} + ${b}`,
        `Sonuç: ${res}`,
      ],
      explanation: `${a} ile ${b} sayılarının toplamı ${res} eder.`,
    };
  }

  const spokenMult = t.match(/(\d+(?:\.\d+)?)\s*(?:ile|ve)\s*(\d+(?:\.\d+)?)\s*(?:'yi|'yı|'i|'ı)?\s*(?:çarp|carp|çarpımı|carpimi)/i);
  if (spokenMult) {
    const a = parseFloat(spokenMult[1]);
    const b = parseFloat(spokenMult[2]);
    const res = Math.round((a * b) * 100000) / 100000;
    return {
      isMath: true,
      expression: `${a} × ${b}`,
      result: res,
      steps: [
        `İki sayıyı çarpıyoruz: ${a} × ${b}`,
        `Sonuç: ${res}`,
      ],
      explanation: `${a} ile ${b} sayılarının çarpımı ${res} eder.`,
    };
  }

  const spokenSub = t.match(/(\d+(?:\.\d+)?)\s*(?:'den|'dan|den|dan)\s*(\d+(?:\.\d+)?)\s*(?:'yi|'yı|'i|'ı)?\s*(?:çıkar|cikar|eksilt|farkı|farki)/i);
  if (spokenSub) {
    const a = parseFloat(spokenSub[1]);
    const b = parseFloat(spokenSub[2]);
    const res = Math.round((a - b) * 100000) / 100000;
    return {
      isMath: true,
      expression: `${a} - ${b}`,
      result: res,
      steps: [
        `${a} sayısından ${b} sayısını çıkarıyoruz`,
        `Sonuç: ${res}`,
      ],
      explanation: `${a} sayısından ${b} çıkarıldığında kalan ${res} olur.`,
    };
  }

  const spokenDiv = t.match(/(\d+(?:\.\d+)?)\s*(?:'yi|'yı|'i|'ı|'si)?\s*(\d+(?:\.\d+)?)\s*(?:'ye|'ya|'e|'a|e|a)\s*(?:böl|bol|bölümü|bolumu)/i);
  if (spokenDiv) {
    const a = parseFloat(spokenDiv[1]);
    const b = parseFloat(spokenDiv[2]);
    if (b !== 0) {
      const res = Math.round((a / b) * 100000) / 100000;
      return {
        isMath: true,
        expression: `${a} ÷ ${b}`,
        result: res,
        steps: [
          `${a} sayısını ${b} değerine bölüyoruz`,
          `Sonuç: ${res}`,
        ],
        explanation: `${a} sayısının ${b} sayısına bölümü ${res} eder.`,
      };
    }
  }

  // 2. Percentage calculations: e.g. "200'ün yüzde 15'i", "500 ün %20 si"
  const pctMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:[a-zçğıöşü\'\’]+)?\s*(?:yüzde|%)\s*(\d+(?:\.\d+)?)/i);
  if (pctMatch) {
    const total = parseFloat(pctMatch[1]);
    const pct = parseFloat(pctMatch[2]);
    const res = Math.round(((total * pct) / 100) * 10000) / 10000;
    return {
      isMath: true,
      expression: `${total} × %${pct}`,
      result: res,
      steps: [
        `Yüzde hesabı yapıyoruz: (${total} × ${pct}) ÷ 100`,
        `Önce çarpım: ${total} × ${pct} = ${total * pct}`,
        `100'e bölme: ${total * pct} ÷ 100 = ${res}`,
      ],
      explanation: `${total} sayısının %${pct}'si ${res} olarak hesaplandı.`,
    };
  }

  // 3. Factorial: e.g. "5!", "6 faktöriyel", "7 faktoriyel"
  const factMatch = t.match(/(\d+)\s*(?:!|faktöriyel|faktoriyel)/i);
  if (factMatch) {
    const n = parseInt(factMatch[1], 10);
    if (n >= 0 && n <= 100) {
      let r = 1;
      const stepItems: number[] = [];
      for (let i = n; i >= 1; i--) {
        r *= i;
        if (stepItems.length < 8) stepItems.push(i);
      }
      return {
        isMath: true,
        expression: `${n}!`,
        result: r,
        steps: [
          `Faktöriyel kuralı: 1'den ${n}'e kadar olan tüm sayıların çarpımı`,
          `${n}! = ${stepItems.join(' × ')}${n > 8 ? ' × ...' : ''} = ${r}`,
        ],
        explanation: `${n} sayısının faktöriyeli (${n}!) tam olarak ${r} eder.`,
      };
    }
  }

  // 4. Square root: e.g. "karekök 144", "sqrt(256)", "144'ün karekökü"
  const sqrtMatch =
    t.match(/(?:karekök|karekok|sqrt)\s*\(?(\d+(?:\.\d+)?)\)?/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:'ün|'in|'un|'ın|nin|nın)?\s*(?:karekökü|karekok)/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    const r = Math.round(Math.sqrt(val) * 100000) / 100000;
    return {
      isMath: true,
      expression: `√${val}`,
      result: r,
      steps: [
        `Karekök hesabı: Hangi sayının karesi ${val} eder?`,
        `√${val} = ${r} (Çünkü ${r} × ${r} = ${Math.round(r * r * 1000) / 1000})`,
      ],
      explanation: `${val} sayısının karekökü ${r} olarak bulunur.`,
    };
  }

  // 5. Power: e.g. "2 üzeri 8", "3 üssü 4", "2^10"
  const powMatch =
    t.match(/(\d+(?:\.\d+)?)\s*(?:\^|üzeri|üssü|us|uzeri)\s*(\d+(?:\.\d+)?)/i);
  if (powMatch) {
    const base = parseFloat(powMatch[1]);
    const exp = parseFloat(powMatch[2]);
    const r = Math.pow(base, exp);
    return {
      isMath: true,
      expression: `${base}^${exp}`,
      result: r,
      steps: [
        `${base} sayısını ${exp} defa kendisiyle çarpıyoruz`,
        `${base}^${exp} = ${r}`,
      ],
      explanation: `${base} üzeri ${exp} işleminin sonucu ${r} eder.`,
    };
  }

  // 6. General Arithmetic Expressions
  let normalized = t
    .replace(/artı/gi, '+')
    .replace(/eksi/gi, '-')
    .replace(/çarpı|kere/gi, '*')
    .replace(/bölü/gi, '/')
    .replace(/üzeri|üssü/gi, '^')
    .replace(/,/g, '.')
    .replace(/[xX]/g, '*');

  // Match expression that contains numbers and operators
  const exprMatch = normalized.match(/([\d\.\s\+\-\*\/\(\)\^\%]+)/);
  if (exprMatch) {
    const rawExpr = exprMatch[1].trim();
    if (/\d/.test(rawExpr) && /[\+\-\*\/^\%]/.test(rawExpr)) {
      try {
        const jsExpr = rawExpr.replace(/\^/g, '**');
        // Validate expression only contains mathematical characters
        if (/^[\d\.\s\+\-\*\/\(\)\*\%]+$/.test(jsExpr)) {
          const res = Function('"use strict"; return (' + jsExpr + ')')();
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            const rounded = Math.round(res * 1000000) / 1000000;
            return {
              isMath: true,
              expression: rawExpr,
              result: rounded,
              steps: [
                `İşlem: ${rawExpr}`,
                `Matematiksel işlem önceliğine göre hesaplandı (çarpma/bölme önce, toplama/çıkarma sonra).`,
                `Nihai Değer: ${rounded}`,
              ],
              explanation: `İşlemin sonucu: ${rawExpr} = ${rounded}`,
            };
          }
        }
      } catch {}
    }
  }

  return { isMath: false, expression: '', result: '', steps: [], explanation: '' };
}
