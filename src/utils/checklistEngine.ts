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
      .replace(/CNPJ:?\s?[0-9.\-/]{14,18}$/i, '')
      .trim();
  }

  private extractAssetName(desc: string): string {
    return desc
      .replace(/ACOES DA |COTAS DE |SALDO EM |APLICACOES? EM |PARTICIPACAO NA |APLICACAO EM |VEICULO |ITEM /gi, '')
      .split(/[,-]/)[0]
      .trim();
  }

  private getInstruction(grupo: number, codigo: string): string {
    if (grupo === 1) return 'Necessário: Endereço, Área, Matrícula, Cartório e Inscrição Municipal (IPTU).';
    if (grupo === 2 && codigo === '01') return 'Necessário: Marca, Modelo, Placa e RENAVAM.';
    if (grupo === 3 && codigo === '01') return 'Necessário: Notas de Corretagem e Informe de Custódia.';
    if (grupo === 3 && codigo === '02') return 'Necessário: Alteração Contratual (Cotas) e Balanço Patrimonial.';
    if (grupo === 4 || grupo === 6) return 'Necessário: Informe de Rendimentos com Agência, Conta e CNPJ da Instituição.';
    if (grupo === 7) return 'Necessário: CNPJ do Fundo, Quantidade de Quotas e Custo Total pelo Informe.';
    if (grupo === 8) return 'Cripto: Quantidade, Custodiante/Carteira e Custo ORIGINAL de Aquisição.';
    return 'Conferir dados no Informe de Rendimentos ou Documento de Compra.';
  }

  public generate(lines: string[], depMap: Record<string, string>): SubTask[] {
    const subTasks: SubTask[] = [];
    
    const brokers: Record<string, { stocks: Set<string>, fiis: Set<string>, cryptos: Set<string> }> = {};
    const banks: Record<string, { assets: Set<string> }> = {};
    const overseasBrokers: Record<string, { assets: Set<string> }> = {};
    
    const incomeSources = new Set<string>();
    const medicalItems = new Set<string>();
    const educationItems = new Set<string>();
    const individualStocks = new Set<string>();
    const individualShares = new Set<string>();
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
        if (pj.nome) incomeSources.add(this.cleanName(pj.nome));
      }

      if (type === '26') {
        const cod = parseInt(line.substring(13, 15).trim()) || 99;
        const benef = this.cleanName(line.substring(34, 94).trim());
        if (benef) {
          if (cod === 1 || cod === 2) educationItems.add(benef);
          else if (cod >= 9 && cod <= 26) medicalItems.add(benef);
        }
      }

      if (type === '27') {
        const bem = this.parser.parseBens(line);
        let grupo = bem.grupo || 0;
        let cod = bem.codigo || '99';
        const desc = bem.descricao?.toUpperCase() || '';
        const assetName = this.extractAssetName(bem.descricao || '');

        // --- INTELIGÊNCIA DE AUDITORIA: CORREÇÃO DE GRUPOS POR TEXTO ---
        if (desc.includes('VEICULO') || desc.includes('PLACA') || desc.includes('CHASSI') || desc.includes('RENAVAM')) {
          grupo = 2; cod = '01';
        } else if (desc.includes('CASA') || desc.includes('APARTAMENTO') || desc.includes('TERRENO') || desc.includes('QUADRA')) {
          grupo = 1;
        } else if (desc.includes('ACOES') || desc.includes('BOLSA')) {
          grupo = 3; cod = '01';
        } else if (desc.includes('QUOTAS') || desc.includes('CAPITAL DA EMPRESA')) {
          grupo = 3; cod = '02';
        } else if (desc.includes('EQUIPAMENTO') || desc.includes('MAQUINA') || desc.includes('LASER')) {
          grupo = 2; cod = '04'; // Bem relacionado à atividade autônoma/profissional
        }

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
          const label = `${assetName} (Gr:${grupo} Cód:${cod})`;
          if (grupo === 1) individualRealEstate.add(label);
          else if (grupo === 2) individualVehicles.add(label);
          else if (grupo === 3 && cod === '01') individualStocks.add(label);
          else if (grupo === 3 && cod === '02') individualShares.add(label);
          else individualOtherAssets.add(label);
        }
      }
    });

    // --- MONTAGEM DO CHECKLIST ---
    subTasks.push(this.createTask('RG / CPF atualizado do titular e dependentes', 'CADASTRO', 'Necessário para verificação cadastral.'));
    subTasks.push(this.createTask('Comprovante de residência atualizado', 'CADASTRO', 'Deve ser recente.'));
    subTasks.push(this.createTask('Dados bancários para restituição (Banco, Agência, Conta)', 'CADASTRO', 'Para crédito da restituição.'));

    incomeSources.forEach(src => subTasks.push(this.createTask(`Informe de Rendimentos: ${src}`, 'RENDIMENTOS_PJ')));

    Object.entries(brokers).forEach(([name, data]) => {
      const parts = [];
      if (data.stocks.size > 0) parts.push(`Ativos: ${Array.from(data.stocks).slice(0, 3).join(', ')}`);
      if (data.fiis.size > 0) parts.push(`Fundos: ${Array.from(data.fiis).slice(0, 2).join(', ')}`);
      subTasks.push(this.createTask(`Extrato Consolidado ${name}`, 'BENS_BOLSA', 'Notas de Corretagem e Informe de Custódia.'));
    });

    Object.entries(overseasBrokers).forEach(([name, data]) => {
      subTasks.push(this.createTask(`Extratos Exterior: ${name}`, 'BENS_EXTERIOR', 'Relatório de Ganhos e Dividendos.'));
    });

    Object.entries(banks).forEach(([name, data]) => {
      subTasks.push(this.createTask(`Informe de Rendimentos Banco ${name}`, 'BENS_FINANCEIROS', 'Saldos de Conta Corrente, Poupança e CDBs.'));
    });

    individualStocks.forEach(s => subTasks.push(this.createTask(`Ações: ${s}`, 'BENS_SOCIOS', this.getInstruction(3, '01'))));
    individualShares.forEach(s => subTasks.push(this.createTask(`Participação Societária: ${s}`, 'BENS_SOCIOS', this.getInstruction(3, '02'))));
    individualRealEstate.forEach(re => subTasks.push(this.createTask(`Imóvel: ${re}`, 'BENS_RURAL', this.getInstruction(1, '01'))));
    individualVehicles.forEach(v => subTasks.push(this.createTask(`Veículo/Equipamento: ${v}`, 'BENS_MÓVEIS', this.getInstruction(2, '01'))));
    individualOtherAssets.forEach(o => subTasks.push(this.createTask(`Outro Bem: ${o}`, 'OUTROS')));

    medicalItems.forEach(item => subTasks.push(this.createTask(`NF Saúde: ${item}`, 'SAUDE')));
    educationItems.forEach(item => subTasks.push(this.createTask(`NF Educação: ${item}`, 'EDUCACAO')));

    return subTasks;
  }

  private createTask(title: string, category: string, instruction?: string): SubTask {
    return { id: uuidv4(), title, completed: false, category, instruction };
  }
}
