import { v4 as uuidv4 } from 'uuid';
import { IRPFParser } from './irpfParser';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  instruction?: string;
}

export class ChecklistEngine {
  private parser: IRPFParser;

  constructor(parser: IRPFParser) {
    this.parser = parser;
  }

  private cleanName(name: string): string {
    return name
      .replace(/^[0-9\s.\-/]{3,18}/, '') 
      .replace(/^[0-9]+/, '') // Remove qualquer dígito isolado que sobrou no início
      .replace(/CNPJ:?\s?[0-9.\-/]{14,18}$/i, '')
      .trim();

  }

  private extractAssetName(desc: string): string {
    return desc
      .replace(/ACOES DA |COTAS DE |SALDO EM |APLICACOES? EM |PARTICIPACAO NA |APLICACAO EM /gi, '')
      .split(/[,-]/)[0]
      .trim();
  }

  private getInstruction(grupo: number, codigo: string): string {
    const codInt = parseInt(codigo);
    
    const INSTRUCTIONS: Record<number, { name: string, docs: string, specifics?: Record<number, string> }> = {
      1: { 
        name: "Bens Imóveis", 
        docs: "Necessário: Escritura/Contrato, Espelho do IPTU e Matrícula Atualizada.",
        specifics: { 13: "Se Terreno: Verificar se houve construção (Alvará/Habite-se)." }
      },
      2: { 
        name: "Bens Móveis", 
        docs: "Necessário: Documento de Compra/Venda e Certificado de Registro.",
        specifics: { 1: "Veículo: Informar RENAVAM e Placa obrigatoriamente." }
      },
      3: { 
        name: "Participações Societárias", 
        docs: "Necessário: Contrato Social/Alteração e Informe de Rendimentos da Empresa.",
        specifics: { 1: "Ações: Notas de Corretagem e Informe de Custódia." }
      },
      4: { 
        name: "Aplicações e Investimentos", 
        docs: "Necessário: Informe de Rendimentos Bancários e Extrato de Custódia." 
      },
      5: { 
        name: "Créditos", 
        docs: "Necessário: Contrato de Empréstimo/Mútuo ou Comprovante de Crédito." 
      },
      6: { 
        name: "Depósito à Vista", 
        docs: "Necessário: Informe de Rendimentos com Agência e Conta." 
      },
      7: { 
        name: "Fundos", 
        docs: "Necessário: Informe de Rendimentos do Fundo (CNPJ e Qtd Quotas)." 
      },
      8: { 
        name: "Criptoativos", 
        docs: "Necessário: Extrato da Exchange ou Relatório de Custódia (Qtd e Custo)." 
      },
      99: { 
        name: "Outros Bens", 
        docs: "Documento comprobatório da posse ou direito." 
      }
    };

    const rule = INSTRUCTIONS[grupo] || { name: `Grupo ${grupo}`, docs: "Conferir Informe de Rendimentos." };
    const specific = rule.specifics?.[codInt] || "";
    
    return `${rule.docs} ${specific}`.trim();
  }


  public generate(lines: string[], depMap: Record<string, string>): SubTask[] {
    const subTasks: SubTask[] = [];
    
    const brokers: Record<string, { stocks: Set<string>, fiis: Set<string>, cryptos: Set<string> }> = {};
    const banks: Record<string, { assets: Set<string> }> = {};
    const overseasBrokers: Record<string, { assets: Set<string> }> = {};
    
    const incomeSources = new Set<string>();
    const individualStocks = new Set<string>(); // Gr:3 Cod:01
    const individualShares = new Set<string>(); // Gr:3 Cod:02
    const individualRealEstate = new Set<string>();
    const individualVehicles = new Set<string>();
    const individualOtherAssets = new Set<string>();

    const INSTITUTIONS = [
      'XP INVESTIMENTOS', 'BTG PACTUAL', 'SANTANDER', 'NUBANK', 'AVENUE', 
      'DRIVEWEALTH', 'ITAU', 'BRADESCO', 'BANCO DO BRASIL', 'CAIXA', 'CEF'
    ];

    lines.forEach(line => {
      if (line.length < 13) return;
      const type = line.substring(0, 2);

      if (type === '21' || type === '32') {
        const pj = type === '21' ? this.parser.parseRendimentosPJ(line) : this.parser.parseRendimentosPJDependentes(line);
        if (pj.nome) incomeSources.add(this.cleanName(String(pj.nome)));
      }

      if (type === '26') {
        const pagto = this.parser.parsePagamentos(line);
        const cod = parseInt(pagto.codigo);
        const depKey = pagto.dependente === '00' ? 'TITULAR' : pagto.dependente;
        const benefNome = depKey === 'TITULAR' ? 'TITULAR' : (depMap[depKey] || `Dependente ${depKey}`);
        
        // Mapeamento de Grupos sugeridos pelo usuário
        let grupoTxt = "❤️ Doações e Outros";
        let category = "PAGAMENTOS";

        if ([1, 2].includes(cod)) {
          grupoTxt = "📚 Instrução (Educação)";
          category = "EDUCACAO";
        } else if ((cod >= 10 && cod <= 26) || [80, 81].includes(cod)) {
          grupoTxt = "🩺 Saúde (Despesas Médicas)";
          category = "SAUDE";
        } else if ([36, 37].includes(cod)) {
          grupoTxt = "🛡️ Previdência e Pensão";
          category = "PREVIDENCIA";
        } else if ([29, 30, 31, 33, 34, 41].includes(cod)) {
          grupoTxt = "🛡️ Previdência e Pensão"; // Agrupado conforme solicitado
          category = "PENSAO";
        } else if (cod >= 60 && cod <= 71) {
          grupoTxt = "⚖️ Honorários e Aluguéis";
          category = "HONORARIOS";
        }


        const taskTitle = `${benefNome} — Comprovante de pagamento: ${grupoTxt} - ${this.cleanName(String(pagto.beneficiario))}`;
        subTasks.push(this.createTask(taskTitle, category, `Conferir se o valor de R$ ${pagto.valor} possui documento comprobatório.`));
      }


      if (type === '27') {
        const bem = this.parser.parseBens(line);
        const grupo = bem.grupo || 0;
        const cod = bem.codigo || '99';
        const codInt = parseInt(cod);
        const desc = String(bem.descricao || '').toUpperCase();
        const assetName = this.extractAssetName(String(bem.descricao || ''));

        // Mapeamento de nomes oficiais para exibição no checklist
        const OFFICIAL_NAMES: Record<number, Record<number, string>> = {
          1: { 1: "Prédio residencial", 2: "Prédio comercial", 3: "Galpão", 11: "Apartamento", 12: "Casa", 13: "Terreno", 14: "Terra nua", 15: "Sala ou conjunto", 16: "Construção", 19: "Garagem Avulsa", 99: "Outros bens imóveis" },
          2: { 1: "Veículo automotor", 2: "Aeronave", 3: "Embarcação", 6: "Joia/Objeto de Arte", 99: "Outros bens móveis" },
          3: { 1: "Ações", 2: "Quotas de Capital", 3: "Holding Patrimonial", 99: "Outras participações" },
          4: { 1: "Poupança", 2: "Títulos Públicos", 3: "CDB/LCI/LCA", 4: "Ouro/Metais Preciosos", 99: "Outros investimentos" },
          5: { 1: "Empréstimo Concedido", 2: "Crédito de Alienação", 99: "Outros créditos" },
          6: { 1: "Conta Corrente BR", 2: "Conta Corrente Ext", 3: "Dinheiro Espécie BR", 4: "Dinheiro Espécie Ext" },
          7: { 1: "Fundo de Investimento", 3: "Fundo Imobiliário (FII)", 4: "ETFs", 11: "FIP", 12: "FIEE", 13: "Fundo Multimercado" },
          8: { 1: "Bitcoin (BTC)", 2: "Altcoins", 3: "Stablecoins", 10: "NFTs", 99: "Outros criptoativos" },
          99: { 1: "Licença Especial", 2: "Título de Clube", 3: "Direito Autoral/Patente", 6: "Leasing", 99: "Outros bens" }
        };

        const tipoNome = OFFICIAL_NAMES[Number(grupo)]?.[Number(codInt)] || `Bem (Cód:${cod})`;
        let foundInst = INSTITUTIONS.find(inst => desc.includes(inst));

        if (foundInst) {
          if (foundInst === 'AVENUE' || foundInst === 'DRIVEWEALTH') {
            if (!overseasBrokers[foundInst]) overseasBrokers[foundInst] = { assets: new Set() };
            overseasBrokers[foundInst].assets.add(assetName);
          } else if (foundInst === 'XP INVESTIMENTOS' || foundInst === 'BTG PACTUAL' || desc.includes('CORRETORA')) {
            const brokerName = foundInst || 'CORRETORA';
            if (!brokers[brokerName]) brokers[brokerName] = { stocks: new Set(), fiis: new Set(), cryptos: new Set() };
            if (grupo === 3 && cod === '01') brokers[brokerName].stocks.add(assetName);
            else if (grupo === 7) brokers[brokerName].fiis.add(assetName);
            else if (grupo === 8) brokers[brokerName].cryptos.add(assetName);
            else brokers[brokerName].stocks.add(assetName);
          } else {
            if (!banks[foundInst]) banks[foundInst] = { assets: new Set() };
            banks[foundInst].assets.add(assetName);
          }
        } else {
          const label = `${tipoNome}: ${assetName}`;
          if (grupo === 1) individualRealEstate.add(label);
          else if (grupo === 2) individualVehicles.add(label);
          else if (grupo === 3 && cod === '01') individualStocks.add(label);
          else if (grupo === 3 && cod === '02') individualShares.add(label);
          else individualOtherAssets.add(label);
        }
      }

    });

    // --- GERAÇÃO DO CHECKLIST ---

    subTasks.push(this.createTask('RG / CPF atualizado do titular e dependentes', 'CADASTRO', 'Necessário para verificação cadastral.'));
    subTasks.push(this.createTask('Comprovante de residência atualizado', 'CADASTRO', 'Deve ser recente.'));
    subTasks.push(this.createTask('Dados bancários para restituição (Banco, Agência, Conta)', 'CADASTRO', 'Para crédito da restituição.'));

    incomeSources.forEach(src => subTasks.push(this.createTask(`Informe de Rendimentos: ${src}`, 'RENDIMENTOS_PJ')));

    Object.entries(brokers).forEach(([name, data]) => {
      const parts = [];
      if (data.stocks.size > 0) parts.push(`Ações: ${Array.from(data.stocks).slice(0, 3).join(', ')}`);
      if (data.fiis.size > 0) parts.push(`Fundos: ${Array.from(data.fiis).slice(0, 2).join(', ')}`);
      subTasks.push(this.createTask(`Extrato de Custódia ${name}`, 'BENS_BOLSA', 'Notas de Corretagem e Informe de Rendimentos.'));
    });

    Object.entries(overseasBrokers).forEach(([name, _data]) => {
      subTasks.push(this.createTask(`Extratos Exterior: ${name}`, 'BENS_EXTERIOR', 'Relatório de Ganhos e Dividendos.'));
    });

    Object.entries(banks).forEach(([name, _data]) => {
      subTasks.push(this.createTask(`Informe de Rendimentos Banco ${name}`, 'BENS_FINANCEIROS'));
    });

    // Diferenciação Solicitada: Ações vs Participação Societária
    individualStocks.forEach(s => subTasks.push(this.createTask(`Ações: ${s}`, 'BENS_SOCIOS', this.getInstruction(3, '01'))));
    individualShares.forEach(s => subTasks.push(this.createTask(`Participação Societária: ${s}`, 'BENS_SOCIOS', this.getInstruction(3, '02'))));
    
    individualRealEstate.forEach(re => {
      // Se for terra nua (14) ou se a descrição sugerir rural, cai em BENS_RURAL, senão BENS_IMOVEIS
      const isRural = re.includes('Terra nua') || re.includes('RURAL') || re.includes('FAZENDA') || re.includes('SITIO');
      const category = isRural ? 'BENS_RURAL' : 'BENS_IMOVEIS';
      subTasks.push(this.createTask(`Imóvel: ${re}`, category, this.getInstruction(1, '01')));
    });


    individualVehicles.forEach(v => subTasks.push(this.createTask(`Veículo: ${v}`, 'BENS_MOVEIS', this.getInstruction(2, '01'))));
    individualOtherAssets.forEach(o => subTasks.push(this.createTask(`Outro Bem: ${o}`, 'BENS_OUTROS')));


    return subTasks;
  }

  private createTask(title: string, category: string, instruction?: string): SubTask {
    return { id: uuidv4(), title, completed: false, category, instruction };
  }
}
