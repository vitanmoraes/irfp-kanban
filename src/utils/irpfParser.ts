import { Decimal } from 'decimal.js';

// Definições de layouts portadas do motor oficial 2.0
export const LAYOUT_DEFINITIONS: Record<number, Record<string, number>> = {
  2023: {
    "IR": 1203, "16": 881, "20": 900, "21": 170, "25": 223, "26": 668, "27": 1174, "40": 178
  },
  2025: {
    "IR": 1236, "16": 915, "20": 926, "26": 671, "27": 1250
  },
  2026: {
    "IR": 1244, "16": 930, "20": 938, "25": 224, "27": 1251, "40": 641
  }
};

export interface ParsedField {
  value: string | number | Decimal;
  raw: string;
}

export class IRPFParser {
  private exercise: number = 2023;

  constructor(content: string) {
    const firstLine = content.split(/\r?\n/)[0] || '';
    if (firstLine.startsWith('IRPF')) {
      this.exercise = parseInt(firstLine.substring(8, 12)) || 2023;
    }
  }

  private getLayout() {
    return LAYOUT_DEFINITIONS[this.exercise] || LAYOUT_DEFINITIONS[2023];
  }

  private parseField(line: string, start: number, end: number, type: 'C' | 'N' | 'D', decimals: number = 0): string | number | Decimal {
    try {
      const raw = line.substring(start - 1, end).trim();
      if (!raw) return type === 'D' ? new Decimal(0) : (type === 'N' ? 0 : '');

      if (type === 'C') return raw;
      if (type === 'N') return parseInt(raw) || 0;
      if (type === 'D') {
        const val = new Decimal(raw.replace(/\./g, '').replace(',', '.'));
        return decimals > 0 ? val.div(Math.pow(10, decimals)) : val;
      }
    } catch {
      return type === 'D' ? new Decimal(0) : 0;
    }
    return '';
  }

  public parseHeader(line: string) {
    return {
      exercicio: this.exercise,
      cpf: this.parseField(line, 22, 32, 'C'),
      nome: this.parseField(line, 40, 99, 'C'),
      impDevido: this.parseField(line, 191, 203, 'D', 2),
      isRetificadora: this.parseField(line, 21, 21, 'C') === 'S',
      versao: this.parseField(line, 37, 39, 'N')
    };
  }

  public parseBens(line: string) {
    // Calibração de corte baseada no motor 2.0
    return {
      codigo: String(this.parseField(line, 14, 15, 'C')).padStart(2, '0'),
      descricao: this.parseField(line, 20, 531, 'C'),
      valorAnterior: this.parseField(line, 532, 544, 'D', 2),
      valorAtual: this.parseField(line, 545, 557, 'D', 2),
      grupo: this.parseField(line, 1101, 1102, 'N')
    };
  }

  public parseRendimentosPJ(line: string) {
    return {
      cnpj: this.parseField(line, 14, 27, 'C'),
      nome: this.parseField(line, 28, 87, 'C'),
      valor: this.parseField(line, 88, 100, 'D', 2),
      imposto: this.parseField(line, 127, 139, 'D', 2)
    };
  }

  public parseRendimentosPJDependentes(line: string) {
    return {
      cpfBenef: this.parseField(line, 14, 24, 'C'),
      cnpj: this.parseField(line, 25, 38, 'C'),
      nome: this.parseField(line, 39, 98, 'C'),
      valor: this.parseField(line, 99, 111, 'D', 2),
      imposto: this.parseField(line, 138, 150, 'D', 2)
    };
  }

  public parseDependentes(line: string) {
    return {
      chave: this.parseField(line, 14, 18, 'C'),
      nome: this.parseField(line, 21, 80, 'C'),
      cpf: this.parseField(line, 89, 99, 'C')
    };
  }

  public parseRendaVariavel(line: string) {
    return {
      mes: this.parseField(line, 14, 15, 'N'),
      resLiquidoComum: this.parseField(line, 432, 444, 'D', 2),
      resLiquidoDayTrade: this.parseField(line, 445, 457, 'D', 2),
      impostoDevido: this.parseField(line, 548, 560, 'D', 2)
    };
  }

  public parsePagamentos(line: string) {
    return {
      codigo: String(this.parseField(line, 14, 15, 'C')).padStart(2, '0'),
      dependente: String(this.parseField(line, 16, 17, 'C')).padStart(2, '0'),
      beneficiario: this.parseField(line, 35, 94, 'C'),
      valor: this.parseField(line, 95, 107, 'D', 2)
    };
  }



  public parseTotais(line: string) {
    return {
      impostoPagar: this.parseField(line, 378, 390, 'D', 2),
      bensAtual: this.parseField(line, 418, 430, 'D', 2),
      baseCalculo: this.parseField(line, 196, 208, 'D', 2)
    };
  }
}
