import React, { useState } from 'react';
import type { IRPFAppState, IRPFCard, SubTask } from '../types';
import { FileUp, Search, User, FileText, Send, CheckCircle2, Trash2, ClipboardList, Mail, ChevronDown, ChevronUp, Copy, Check, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateComplexityScore } from '../utils/scoreCalculator';
import { generateBaseChecklist } from '../utils/checklistGenerator';
import { COLLABORATORS } from '../data/collaborators';
import { INITIAL_GATES_DIGITACAO, INITIAL_GATES_TRANSMISSAO } from '../data/irpfProcess';

interface Props {
  data: IRPFAppState;
  setData: (update: IRPFAppState | ((prev: IRPFAppState) => IRPFAppState)) => void;
}

export const PreparationTab: React.FC<Props> = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<IRPFCard | null>(null);
  const [selectedForMessage, setSelectedForMessage] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [messagePreview, setMessagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prepColumn = data.columns.find(c => c.id === 'preparacao');
  const filteredCards = prepColumn?.cards.filter(c =>
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm)
  ) || [];

  const selectCard = (card: IRPFCard) => {
    setSelectedCard(card);
    setSelectedForMessage(new Set(card.subTasks.map(t => t.id)));
    setCollapsedGroups(new Set());
    setMessagePreview(null);
  };

  const toggleMessageItem = (taskId: string) => {
    setSelectedForMessage(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleGroupItems = (key: string, taskIds: string[], include: boolean) => {
    setSelectedForMessage(prev => {
      const next = new Set(prev);
      taskIds.forEach(id => include ? next.add(id) : next.delete(id));
      return next;
    });
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllForMessage   = () => setSelectedForMessage(new Set(selectedCard?.subTasks.map(t => t.id) ?? []));
  const deselectAllForMessage = () => setSelectedForMessage(new Set());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const cpfMatch = file.name.match(/\d{11}/);
    let cpf = cpfMatch ? cpfMatch[0] : '';
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/);
      const firstLine = lines[0] || '';

      // Se não achou no nome, tenta pegar do registro 00 do .DEC (posições 1-11)
      if (!cpf && firstLine.length >= 11) {
        const potentialCpf = firstLine.substring(0, 11).replace(/\D/g, '');
        if (potentialCpf.length === 11) cpf = potentialCpf;
      }

      // Se ainda não tem CPF, usa o padrão do mock (apenas para evitar crash em arquivos inválidos)
      if (!cpf) cpf = '38339202898';

      // ── VALIDAÇÃO DE DUPLICIDADE (Normalizada) ──
      const normalizedCpf = cpf.replace(/\D/g, '');
      const allCards = data.columns.flatMap(col => col.cards);
      const existingCard = allCards.find(c => c.cpf.replace(/\D/g, '') === normalizedCpf);
      
      if (existingCard) {
        alert(`⚠️ Atenção: Já existe um card cadastrado para o CPF ${cpf} (${existingCard.clientName}).\nNão é permitido duplicar o cadastro do mesmo cliente.`);
        event.target.value = '';
        return;
      }

      // Formata o CPF para exibição (###.###.###-##)
      const formattedCpf = normalizedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

      let extractedName = firstLine.substring(17, 77).replace(/^[^a-zA-Z]+/, '').trim();
      if (!extractedName || extractedName.length < 3) extractedName = `Cliente ${formattedCpf.substring(0, 3)}...`;

      // ── Tabela de códigos de pagamento (cd_pagto) ─────────────────────────
      const PAGTO_DESC: Record<number, { doc: string; ficha: string }> = {
        1:  { doc: 'Recibo de Consulta Médica (Alopata)', ficha: 'SAUDE' },
        2:  { doc: 'Recibo de Consulta Médica (Homeopata)', ficha: 'SAUDE' },
        3:  { doc: 'Recibo de Dentista', ficha: 'SAUDE' },
        4:  { doc: 'Recibo de Fisioterapeuta', ficha: 'SAUDE' },
        5:  { doc: 'Recibo de Terapeuta Ocupacional', ficha: 'SAUDE' },
        6:  { doc: 'Recibo de Fonoaudiólogo', ficha: 'SAUDE' },
        7:  { doc: 'Recibo de Psicólogo', ficha: 'SAUDE' },
        8:  { doc: 'Recibo de Psiquiatra', ficha: 'SAUDE' },
        9:  { doc: 'Recibo de Acupunturista', ficha: 'SAUDE' },
        10: { doc: 'Nota Fiscal de Hospital / Internação', ficha: 'SAUDE' },
        11: { doc: 'Informe de Plano de Saúde', ficha: 'SAUDE' },
        12: { doc: 'Nota Fiscal de Prótese Ortopédica/Dentária', ficha: 'SAUDE' },
        13: { doc: 'Recibo de Nutricionista', ficha: 'SAUDE' },
        14: { doc: 'Recibo de Cirurgião Plástico', ficha: 'SAUDE' },
        15: { doc: 'Recibo de Profissional de Saúde', ficha: 'SAUDE' },
        16: { doc: 'Comprovante de Mensalidade (Ensino Fundamental)', ficha: 'EDUCACAO' },
        17: { doc: 'Comprovante de Mensalidade (Ensino Médio)', ficha: 'EDUCACAO' },
        18: { doc: 'Comprovante de Mensalidade (Ensino Técnico)', ficha: 'EDUCACAO' },
        19: { doc: 'Comprovante de Mensalidade (Ensino Superior)', ficha: 'EDUCACAO' },
        20: { doc: 'Comprovante de Mensalidade (Pós-Graduação)', ficha: 'EDUCACAO' },
        21: { doc: 'Comprovante de Mensalidade (Especialização)', ficha: 'EDUCACAO' },
        22: { doc: 'Comprovante de Mensalidade (MBA)', ficha: 'EDUCACAO' },
        23: { doc: 'Comprovante de Mensalidade (Doutorado)', ficha: 'EDUCACAO' },
        24: { doc: 'Comprovante de Mensalidade (Mestrado)', ficha: 'EDUCACAO' },
        25: { doc: 'Comprovante de Instrução', ficha: 'EDUCACAO' },
        26: { doc: 'Comprovante de Previdência Social Oficial (INSS)', ficha: 'PREVIDENCIA' },
        27: { doc: 'Informe de Previdência Privada (PGBL/VGBL)', ficha: 'PREVIDENCIA' },
        28: { doc: 'Informe de FAPI', ficha: 'PREVIDENCIA' },
        29: { doc: 'Comprovante de Pensão Alimentícia (Judicial)', ficha: 'PENSAO' },
        30: { doc: 'Comprovante de Pensão (Cônjuge/Companheiro)', ficha: 'PENSAO' },
        36: { doc: 'Informe de Previdência Complementar (PGBL/FUNPRESP)', ficha: 'PREVIDENCIA' },
        41: { doc: 'Comprovante de Alimentos Compensatórios', ficha: 'PENSAO' },
        43: { doc: 'Recibo de Doação a Partido Político', ficha: 'DOACOES' },
        50: { doc: 'Recibo de Doação ao ECA', ficha: 'DOACOES' },
        51: { doc: 'Recibo de Doação ao Fundo do Idoso', ficha: 'DOACOES' },
        52: { doc: 'Recibo de Doação à Cultura', ficha: 'DOACOES' },
        53: { doc: 'Recibo de Doação ao Esporte', ficha: 'DOACOES' },
        54: { doc: 'Recibo de Doação à Saúde', ficha: 'DOACOES' },
        55: { doc: 'Recibo de Doação Diretamente na Declaração', ficha: 'DOACOES' },
        60: { doc: 'Recibo de Empregada Doméstica (INSS)', ficha: 'OUTROS' },
        99: { doc: 'Comprovante de Pagamento', ficha: 'OUTROS' },
      };

      // ── Tabela de grupos de bens (cd_bem) ─────────────────────────────────
      const BEM_GRUPO: Record<string, { label: string; ficha: string }> = {
        '01': { label: 'Ações/FIIs/Cotas em Bolsa', ficha: 'BENS_BOLSA' },
        '02': { label: 'Aplicação Financeira (CDB/RDB/Poupança)', ficha: 'BENS_FINANCEIROS' },
        '03': { label: 'Renda Fixa (LCI/LCA/CRI/CRA/Tesouro)', ficha: 'BENS_FINANCEIROS' },
        '04': { label: 'Bens Móveis (Veículo/Embarcação)', ficha: 'BENS_MOVEIS' },
        '05': { label: 'Participação Societária (Empresa)', ficha: 'BENS_SOCIOS' },
        '07': { label: 'JCP/Dividendos a Receber', ficha: 'BENS_JCP' },
        '08': { label: 'Ativo Exterior', ficha: 'BENS_EXTERIOR' },
        '09': { label: 'Saldo em Moeda Estrangeira', ficha: 'BENS_EXTERIOR' },
        '10': { label: 'Dinheiro em Espécie', ficha: 'BENS_OUTROS' },
        '11': { label: 'Ativo Financeiro no Exterior', ficha: 'BENS_EXTERIOR' },
        '12': { label: 'Propriedade Intelectual', ficha: 'BENS_OUTROS' },
        '14': { label: 'Imóvel Rural', ficha: 'BENS_RURAL' },
        '99': { label: 'Outro Bem no Exterior', ficha: 'BENS_EXTERIOR' },
      };

      // ── PASSO 1: pré-carregar mapa de dependentes chave→nome ─────────────
      const depMap: Record<string, string> = {};
      lines.forEach(line => {
        if (line.length < 13 || line.substring(0, 2) !== '25') return;
        // nr_chave pos 14-18 (idx 13-18), nm_depend pos 21-80 (idx 20-80)
        const chave = line.substring(13, 18).trim();
        const nome  = line.substring(20, 80).trim();
        if (chave && nome) depMap[chave] = nome;
      });

      // ── PASSO 2: Itens fixos de CADASTRO ─────────────────────────────────
      const subTasks: SubTask[] = [
        { id: uuidv4(), title: 'RG / CPF atualizado do titular', completed: false, category: 'CADASTRO' },
        { id: uuidv4(), title: 'Comprovante de Residência atualizado', completed: false, category: 'CADASTRO' },
        { id: uuidv4(), title: 'Cópia da Declaração e Recibo do ano anterior', completed: false, category: 'CADASTRO' },
        { id: uuidv4(), title: 'Título de Eleitor (para verificar domicílio eleitoral)', completed: false, category: 'CADASTRO' },
        { id: uuidv4(), title: 'Dados bancários para restituição (banco, agência, conta)', completed: false, category: 'CADASTRO' },
      ];

      const seen = new Set<string>();
      const addTask = (title: string, category: string) => {
        const key = `${category}::${title}`;
        if (!seen.has(key) && title.trim().length > 4) {
          seen.add(key);
          subTasks.push({ id: uuidv4(), title, completed: false, category });
        }
      };

      // ── PASSO 3: Percorrer linhas e extrair registros ─────────────────────
      lines.forEach(line => {
        if (line.length < 13) return;
        const type = line.substring(0, 2);

        // REG 25 - Dependentes
        if (type === '25') {
          const nome = line.substring(20, 80).trim();
          if (nome) addTask(`RG / CPF / Certidão de nascimento de: ${nome}`, 'DEPENDENTES');
        }

        // REG 21 - Rendimentos PJ (Titular)
        if (type === '21') {
          const nome = line.substring(27, 87).trim();
          if (nome) addTask(`Informe de Rendimentos do Empregador/PJ: ${nome}`, 'RENDIMENTOS_PJ');
        }

        // REG 32 - Rendimentos PJ (Dependentes)
        if (type === '32') {
          const nome = line.substring(38, 98).trim();
          if (nome) addTask(`Informe de Rendimentos (Dependente) do empregador: ${nome}`, 'RENDIMENTOS_PJ');
        }

        // REG 22 - Carnê-Leão / PF / Exterior
        if (type === '22') {
          addTask('Livro Caixa e Carnê-Leão (aluguéis, serviços a PF, exterior)', 'RENDIMENTOS_PF');
        }

        // REG 26 - Pagamentos
        if (type === '26') {
          // cd_pagto: pos 14-15 → idx 13-15 (2 chars)
          const cod = parseInt(line.substring(13, 15).trim()) || 99;
          // nr_chave_depend: pos 16-20 → idx 15-20 (5 chars)
          const chaveDepInt = parseInt(line.substring(15, 20).trim()) || 0;
          // nm_benef: pos 35-94 → idx 34-94
          const benef = line.substring(34, 94).trim();

          const info = PAGTO_DESC[cod] || { doc: 'Comprovante de Pagamento', ficha: 'OUTROS' };
          const paraQuem = chaveDepInt > 0
            ? ` — para dependente: ${depMap[String(chaveDepInt).padStart(5, '0')] || `Dep.${chaveDepInt}`}`
            : '';

          if (benef) addTask(`${info.doc} — ${benef}${paraQuem}`, info.ficha);
        }

        // REG 27 - Bens e Direitos
        if (type === '27') {
          const cdBem = line.substring(13, 15).trim().padStart(2, '0');
          const desc  = line.substring(19, 531).trim();
          if (!desc) return;

          const g = BEM_GRUPO[cdBem] || { label: 'Outros Bens', ficha: 'BENS_OUTROS' };
          let solicitacao = '';

          if (cdBem === '01')        solicitacao = `Extrato/Nota de Corretora: ${desc}`;
          else if (cdBem === '02')   solicitacao = `Extrato Bancário/CDB: ${desc}`;
          else if (cdBem === '03')   solicitacao = `Extrato de Renda Fixa (LCI/LCA/CRA/Tesouro): ${desc}`;
          else if (cdBem === '04')   solicitacao = `CRLV / Documento do Veículo: ${desc}`;
          else if (cdBem === '05')   solicitacao = `Contrato Social / Informe da Empresa: ${desc}`;
          else if (cdBem === '07')   solicitacao = `Informe de JCP/Dividendos: ${desc}`;
          else if (cdBem === '08')   solicitacao = `Extrato de Ativo Exterior: ${desc}`;
          else if (cdBem === '09')   solicitacao = `Comprovante de Saldo em Moeda Estrangeira: ${desc}`;
          else if (cdBem === '10')   solicitacao = `Declaração de Dinheiro em Espécie: ${desc}`;
          else if (cdBem === '11')   solicitacao = `Extrato de Ativo Financeiro no Exterior: ${desc}`;
          else if (cdBem === '14')   solicitacao = `ITR / Documentação do Imóvel Rural: ${desc}`;
          else if (cdBem === '99')   solicitacao = `Extrato/Doc. de Bem no Exterior: ${desc}`;
          else                       solicitacao = `Documentação de ${g.label}: ${desc}`;

          addTask(solicitacao.substring(0, 130), g.ficha);
        }

        // REG 84 - Informes DEDINF (8A - Ações/Fundos)
        if (type === '84') {
          const nome = line.substring(37, 97).trim();
          if (nome) addTask(`Informe de Rendimentos (Corretora/Ação): ${nome}`, 'RENDIMENTOS_RV');
        }

        // REG 86 - FII DEDINF (8F)
        if (type === '86') {
          const nome = line.substring(37, 97).trim();
          if (nome) addTask(`Informe de Rendimentos de FII: ${nome}`, 'RENDIMENTOS_RV');
        }

        // REG 88 - JCP/Dividendos DEDINF (8H)
        if (type === '88') {
          const nome = line.substring(37, 97).trim();
          if (nome) addTask(`Informe de JCP / Dividendos: ${nome}`, 'RENDIMENTOS_RV');
        }

        // REG 89 - Rendimentos Isentos DEDINF (8I)
        if (type === '89') {
          const nome = line.substring(37, 97).trim();
          if (nome) addTask(`Comprovante de Rendimento Isento: ${nome}`, 'RENDIMENTOS_ISENTOS');
        }

        // REG 90 - Doações Incentivadas
        if (type === '90') {
          const nome = line.substring(27, 67).trim();
          if (nome) addTask(`Recibo de Doação Incentivada: ${nome}`, 'DOACOES');
        }
      });

      // Itens padrão sempre solicitados
      addTask('Extratos de todas as contas bancárias (saldo em 31/12)', 'RENDIMENTOS_PF');

      // ── PASSO 4: Criar Perfil do Cliente Extraído ─────────────────────────
      const clientProfile = {
        hasForeignIncome: lines.some(l => l.substring(0, 2) === '22'),
        hasStockMarket: lines.some(l => ['27', '84', '86', '88'].includes(l.substring(0, 2))),
        hasRentalIncome: lines.some(l => l.substring(0, 2) === '22'), // simplificado
        hasRuralActivity: lines.some(l => l.substring(0, 2) === '27' && l.substring(13, 15) === '14'),
        hasForeignAssets: lines.some(l => l.substring(0, 2) === '27' && ['08', '09', '11', '99'].includes(l.substring(13, 15))),
        hasDependents: lines.some(l => l.substring(0, 2) === '25'),
        isHighNetWorth: false, // seria calculado por valor total de bens
        isComplexityManuallySet: false
      };

      // ── PASSO 5: Gerar Checklist Base + Itens Extraídos ───────────────────
      const baseChecklist = generateBaseChecklist(clientProfile);
      const combinedTasks = [...baseChecklist, ...subTasks];

      // ── PASSO 6: Inicializar Novo Card com Inteligência ───────────────────
      const newCard: IRPFCard = {
        id: uuidv4(),
        clientName: extractedName,
        cpf: formattedCpf,
        phone: '', // Pode ser preenchido manualmente
        type: 'COMPLETA',
        complexityScore: calculateComplexityScore(clientProfile),
        riskLevel: 'BAIXO',
        statusDoc: 'PENDENTE',
        statusTech: 'NAO_INICIADO',
        statusClient: 'AGUARDANDO',
        statusFinancial: 'NAO_GERADO',
        daysActive: 0,
        responsible: 'Sistema',
        tags: [{ id: uuidv4(), label: 'Importado', color: '#10b981' }],
        subTasks: combinedTasks,
        clientProfile,
        gatesDigitacao: INITIAL_GATES_DIGITACAO,
        gatesTransmissao: INITIAL_GATES_TRANSMISSAO,
        fiscalAnalysis: {
          autoAlerts: [],
          technicalNotes: '',
          previousYearAssets: 0,
          currentYearAssets: 0
        },
        financial: {
          modality: 'COMPLETA',
          status: 'NAO_GERADO',
          previousYearValue: 350,
          approvedValue: 0
        },
        communications: [],
        auditTrail: [{
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          userId: 'Sistema',
          userName: 'Antigravity AI',
          action: 'IMPORT_DEC',
          details: 'Card criado via importação de arquivo .DEC'
        }]
      };

      setData(prev => ({
        ...prev,
        columns: prev.columns.map(col =>
          col.id === 'preparacao' ? { ...col, cards: [newCard, ...col.cards] } : col
        ),
      }));
      event.target.value = '';
    };
    reader.readAsText(file);
  };




  const FICHAS_CONFIG = [
    { key: 'CADASTRO',           label: '📋 Ficha Cadastral' },
    { key: 'DEPENDENTES',        label: '👨‍👩‍👧 Dependentes' },
    { key: 'RENDIMENTOS_PJ',     label: '🏢 Rendimentos de Pessoa Jurídica' },
    { key: 'RENDIMENTOS_PF',     label: '🤝 Rendimentos de PF / Carnê-Leão' },
    { key: 'RENDIMENTOS_RV',     label: '📈 Renda Variável (Ações/FIIs/Dividendos)' },
    { key: 'RENDIMENTOS_ISENTOS',label: '🟢 Rendimentos Isentos' },
    { key: 'SAUDE',              label: '🏥 Despesas Médicas e de Saúde' },
    { key: 'EDUCACAO',           label: '📚 Despesas de Educação / Instrução' },
    { key: 'PREVIDENCIA',        label: '🛡️ Previdência Social e Privada' },
    { key: 'PENSAO',             label: '⚖️ Pensão Alimentícia' },
    { key: 'DOACOES',            label: '❤️ Doações Incentivadas' },
    { key: 'BENS_BOLSA',         label: '📊 Bens — Ações, FIIs e Cotas em Bolsa' },
    { key: 'BENS_FINANCEIROS',   label: '🏦 Bens — Aplicações Financeiras' },
    { key: 'BENS_SOCIOS',        label: '🏭 Bens — Participação Societária' },
    { key: 'BENS_JCP',           label: '💸 Bens — JCP / Dividendos a Receber' },
    { key: 'BENS_MOVEIS',        label: '🚗 Bens — Bens Móveis (Veículos)' },
    { key: 'BENS_RURAL',         label: '🌾 Bens — Imóvel Rural' },
    { key: 'BENS_EXTERIOR',      label: '🌎 Bens — Ativos no Exterior' },
    { key: 'BENS_OUTROS',        label: '🗂️ Bens — Outros Bens e Direitos' },
    { key: 'BASICO',             label: '📑 Dados Cadastrais' },
    { key: 'RENDIMENTOS',        label: '💰 Rendimentos' },
    { key: 'BENS',               label: '🏠 Bens e Direitos' },
    { key: 'PAGAMENTOS',         label: '🏥 Pagamentos Efetuados' },
    { key: 'OUTROS',             label: '📎 Outros' },
  ] as const;

  const buildMessage = (card: IRPFCard): string | null => {
    const toSend = card.subTasks.filter(t => selectedForMessage.has(t.id));
    if (toSend.length === 0) return null;
    let msg = `Olá *${card.clientName}*! 👋\n\nEstamos preparando sua declaração de IR e precisamos dos seguintes documentos:\n`;
    FICHAS_CONFIG.forEach(({ key, label }) => {
      const items = toSend.filter(t => t.category === key);
      if (items.length === 0) return;
      msg += `\n${label}\n`;
      items.forEach(t => { msg += `• ${t.title}\n`; });
    });
    msg += `\nPor favor, envie o mais breve possível. 🙏\n\n_Atenciosamente, equipe ViTan Contabilidade_`;
    return msg;
  };

  const handleGenerateMessage = (card: IRPFCard) => {
    const msg = buildMessage(card);
    if (!msg) { alert('Selecione pelo menos um item para a mensagem.'); return; }
    setMessagePreview(msg);
  };

  const promoteToKanban = (card: IRPFCard) => {
    if (!window.confirm(`Mover ${card.clientName} para Aguardando Documentação?`)) return;
    setData({
      ...data,
      columns: data.columns.map(col => {
        if (col.id === 'preparacao') return { ...col, cards: col.cards.filter(c => c.id !== card.id) };
        if (col.id === 'aguardando')  return { ...col, cards: [card, ...col.cards] };
        return col;
      })
    });
    setSelectedCard(null);
    setMessagePreview(null);
  };

  const deleteFromPrep = (cardId: string) => {
    if (!window.confirm('Excluir este cliente da preparação?')) return;
    setData({
      ...data,
      columns: data.columns.map(col => 
        col.id === 'preparacao' ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
      )
    });
    setSelectedCard(null);
  };

  return (
    <>
    {/* ───── Modal de Preview da Mensagem ───── */}
    {messagePreview && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Mail size={16} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Mensagem para o Cliente</h3>
                <p className="text-[11px] text-slate-500">Copie e cole diretamente no WhatsApp</p>
              </div>
            </div>
            <button onClick={() => setMessagePreview(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Texto formatado */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <pre
              className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed"
              style={{ fontFamily: 'inherit' }}
            >
              {messagePreview}
            </pre>
          </div>

          {/* Footer com botão copiar */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {messagePreview.split('\n').filter(l => l.startsWith('•')).length} itens incluídos
            </span>
            <button
              onClick={() => copyToClipboard(messagePreview)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(34,197,94,0.15)',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(34,197,94,0.25)'}`,
                color: copied ? '#10b981' : '#22c55e',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
        </motion.div>
      </div>
    )}

    <div className="flex-1 flex overflow-hidden">
      {/* Lista de Clientes em Preparação */}
      <div className="w-80 lg:w-96 border-r border-white/5 flex flex-col bg-slate-900/30">
        <div className="p-4 border-b border-white/5 space-y-4">
          <label 
            htmlFor="file-import"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer relative z-10"
          >
            <FileUp size={20} />
            Importar .DEC / .REC
          </label>
          <input 
            id="file-import" 
            type="file" 
            onChange={handleFileUpload} 
            className="absolute opacity-0 pointer-events-none" 
            accept=".dec,.rec" 
          />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar na preparação..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredCards.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Nenhum cliente na fila de preparação</p>
            </div>
          )}
          {filteredCards.map(card => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              onClick={() => selectCard(card)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedCard?.id === card.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm truncate pr-2">{card.clientName}</h4>
                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">PREP</div>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-mono">{card.cpf}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {card.subTasks.length} itens</span>
                <span>{card.responsible}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detalhes da Preparação */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <AnimatePresence mode="wait">
          {selectedCard ? (
            <motion.div
              key={selectedCard.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCard.clientName}</h2>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="font-mono">{selectedCard.cpf}</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-xs">{selectedCard.type}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteFromPrep(selectedCard.id)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                    title="Excluir da Preparação"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => handleGenerateMessage(selectedCard)}
                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold transition-all border border-green-500/30"
                    title={`Gerar texto com ${selectedForMessage.size} itens selecionados`}
                  >
                    <Mail size={18} />
                    Gerar Mensagem ({selectedForMessage.size})
                  </button>
                  <button
                    onClick={() => promoteToKanban(selectedCard)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={20} />
                    Mover para Kanban
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-morphism p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Perfil Auditor</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 size={16} /> Estrutura .DEC Analisada
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User size={16} className="text-blue-400" /> {selectedCard.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <FileText size={16} className="text-purple-400" /> Safra 2026
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 glass-morphism p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resumo do Checklist Gerado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from(new Set(selectedCard.subTasks.map(t => t.category))).map(cat => (
                      <div key={cat} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-3xl border border-white/5 overflow-hidden">
                {/* Cabeçalho com contador e controles de seleção */}
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold flex items-center gap-2">
                      <ClipboardList size={20} className="text-emerald-400" />
                      Checklist de Documentação
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllForMessage}
                        className="text-[11px] px-3 py-1 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 font-bold transition-all"
                      >
                        Selecionar Todos
                      </button>
                      <button
                        onClick={deselectAllForMessage}
                        className="text-[11px] px-3 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10 font-bold transition-all"
                      >
                        Desmarcar Todos
                      </button>
                    </div>
                  </div>
                  {/* Barra de status de seleção para mensagem */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-green-500/8 border border-green-500/15">
                      <Mail size={13} className="text-green-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300">
                        <span className="text-green-400 font-bold">{selectedForMessage.size}</span>
                        <span className="text-slate-500"> de {selectedCard.subTasks.length} itens irão na mensagem WhatsApp</span>
                      </span>
                    </div>
                    {(() => {
                      const total = selectedCard.subTasks.length;
                      const done  = selectedCard.subTasks.filter(t => t.completed).length;
                      return (
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {done}/{total} concluídos
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Barra de progresso */}
                {(() => {
                  const total = selectedCard.subTasks.length;
                  const done  = selectedCard.subTasks.filter(t => t.completed).length;
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div className="h-1.5 bg-white/5">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  );
                })()}

                <div className="p-6 space-y-8">
                  {[
                    { key: 'CADASTRO',            label: '📋 Ficha Cadastral',                          color: '#6366f1' },
                    { key: 'DEPENDENTES',          label: '👨‍👩‍👧 Dependentes',                           color: '#a78bfa' },
                    { key: 'RENDIMENTOS_PJ',       label: '🏢 Rendimentos de Pessoa Jurídica',           color: '#10b981' },
                    { key: 'RENDIMENTOS_PF',       label: '🤝 Rendimentos de PF / Carnê-Leão',          color: '#10b981' },
                    { key: 'RENDIMENTOS_RV',       label: '📈 Renda Variável (Ações/FIIs/Dividendos)',   color: '#10b981' },
                    { key: 'RENDIMENTOS_ISENTOS',  label: '🟢 Rendimentos Isentos',                      color: '#10b981' },
                    { key: 'SAUDE',                label: '🏥 Despesas Médicas e de Saúde',              color: '#f43f5e' },
                    { key: 'EDUCACAO',             label: '📚 Despesas de Educação / Instrução',         color: '#3b82f6' },
                    { key: 'PREVIDENCIA',          label: '🛡️ Previdência Social e Privada',             color: '#0ea5e9' },
                    { key: 'PENSAO',               label: '⚖️ Pensão Alimentícia',                       color: '#f59e0b' },
                    { key: 'DOACOES',              label: '❤️ Doações Incentivadas',                     color: '#ec4899' },
                    { key: 'BENS_BOLSA',           label: '📊 Bens — Ações, FIIs e Cotas em Bolsa',     color: '#f97316' },
                    { key: 'BENS_FINANCEIROS',     label: '🏦 Bens — Aplicações Financeiras',            color: '#14b8a6' },
                    { key: 'BENS_SOCIOS',          label: '🏭 Bens — Participação Societária',           color: '#8b5cf6' },
                    { key: 'BENS_JCP',             label: '💸 Bens — JCP / Dividendos a Receber',       color: '#eab308' },
                    { key: 'BENS_MOVEIS',          label: '🚗 Bens — Bens Móveis (Veículos)',            color: '#64748b' },
                    { key: 'BENS_RURAL',           label: '🌾 Bens — Imóvel Rural',                      color: '#22c55e' },
                    { key: 'BENS_EXTERIOR',        label: '🌎 Bens — Ativos no Exterior',                color: '#06b6d4' },
                    { key: 'BENS_OUTROS',          label: '🗂️ Bens — Outros Bens e Direitos',            color: '#94a3b8' },
                    // legados
                    { key: 'BASICO',               label: '📑 Dados Cadastrais',                         color: '#6366f1' },
                    { key: 'RENDIMENTOS',          label: '💰 Rendimentos',                              color: '#10b981' },
                    { key: 'BENS',                 label: '🏠 Bens e Direitos',                          color: '#f97316' },
                    { key: 'PAGAMENTOS',           label: '🏥 Pagamentos Efetuados',                     color: '#f43f5e' },
                    { key: 'OUTROS',               label: '📎 Outros',                                   color: '#94a3b8' },
                  ].map(({ key, label, color }) => {
                    const groupTasks = selectedCard.subTasks.filter(t => t.category === key);
                    if (groupTasks.length === 0) return null;

                    const groupIds   = groupTasks.map(t => t.id);
                    const inMsgCount = groupIds.filter(id => selectedForMessage.has(id)).length;
                    const isCollapsed = collapsedGroups.has(key);
                    const pending    = groupTasks.filter(t => !t.completed).length;
                    const doneG      = groupTasks.filter(t => t.completed).length;

                    return (
                      <div key={key}>
                        {/* ── Cabeçalho do Grupo ── */}
                        <div
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2"
                          style={{ background: `${color}18`, borderLeft: `4px solid ${color}` }}
                        >
                          {/* Collapse toggle */}
                          <button
                            onClick={() => toggleGroupCollapse(key)}
                            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-all"
                            title={isCollapsed ? 'Expandir' : 'Recolher'}
                          >
                            {isCollapsed
                              ? <ChevronDown size={15} className="text-slate-400" />
                              : <ChevronUp size={15} className="text-slate-400" />}
                          </button>

                          {/* Label */}
                          <span className="text-sm font-bold text-white tracking-wide flex-1">{label}</span>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5">
                            {doneG > 0 && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">{doneG} ok</span>
                            )}
                            {pending > 0 && (
                              <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{pending} pend.</span>
                            )}
                            <span className="text-[10px] text-green-400 font-bold px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20">
                              ✉ {inMsgCount}/{groupTasks.length}
                            </span>
                          </div>

                          {/* Selecionar todos do grupo */}
                          <button
                            onClick={() => toggleGroupItems(key, groupIds, true)}
                            title="Incluir todos na mensagem"
                            className="text-[10px] px-2 py-1 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 font-bold transition-all flex-shrink-0"
                          >
                            ✉ Todos
                          </button>

                          {/* Desmarcar todos do grupo */}
                          <button
                            onClick={() => toggleGroupItems(key, groupIds, false)}
                            title="Remover todos da mensagem"
                            className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-slate-500 hover:bg-white/10 border border-white/10 font-bold transition-all flex-shrink-0"
                          >
                            ✕ Nenhum
                          </button>
                        </div>

                        {/* ── Itens do Grupo (colapsável) ── */}
                        {!isCollapsed && (
                          <div className="flex flex-col gap-1.5 pl-2 mb-2">
                            {groupTasks.map(task => {
                              const inMsg = selectedForMessage.has(task.id);
                              return (
                                <div
                                  key={task.id}
                                  className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                                  style={{
                                    background: task.completed ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.03)',
                                    borderColor: task.completed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                                    opacity: inMsg ? 1 : 0.45,
                                  }}
                                >
                                  {/* Checkbox visual */}
                                  <div
                                    className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center"
                                    style={{
                                      background: task.completed ? color : 'transparent',
                                      borderColor: task.completed ? color : '#475569',
                                    }}
                                  >
                                    {task.completed && (
                                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  {/* Texto */}
                                  <span
                                    className="text-sm leading-relaxed flex-1"
                                    style={{
                                      color: task.completed ? '#64748b' : '#e2e8f0',
                                      textDecoration: task.completed ? 'line-through' : 'none',
                                    }}
                                  >
                                    {task.title}
                                  </span>
                                  {/* Toggle de mensagem */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleMessageItem(task.id); }}
                                    title={inMsg ? 'Remover da mensagem' : 'Incluir na mensagem'}
                                    className="ml-auto flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-all"
                                    style={{
                                      background: inMsg ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                                      border: `1px solid ${inMsg ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                    }}
                                  >
                                    <Mail size={12} style={{ color: inMsg ? '#22c55e' : '#475569' }} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <div className="p-8 bg-emerald-500/5 rounded-full mb-6">
                <ClipboardList size={80} className="opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Selecione um cliente para preparar</h3>
              <p className="max-w-xs text-center text-sm">Importe o arquivo .DEC para que o auditor analise a estrutura e gere o checklist automático.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

