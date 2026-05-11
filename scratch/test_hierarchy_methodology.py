import os
import sys

# Adiciona o diretório atual ao path para importar o dec_parser
sys.path.append(os.getcwd())

try:
    from dec_parser import parse_dec_file, DeclaraoIRPF
except ImportError:
    print("Erro ao importar dec_parser. Certifique-se de que o arquivo está no diretório correto.")
    sys.exit(1)

def classify_asset(bem):
    """
    Implementa a metodologia hierárquica:
    Registro (27) -> Grupo -> Código -> Discriminação
    """
    grupo = bem.cd_grupo_bem
    codigo = bem.cd_bem
    discriminação = bem.tx_bem
    
    # Garantir que são inteiros para a busca no dicionário
    try:
        g_key = int(grupo) if grupo is not None else 0
        c_key = int(codigo) if codigo is not None else 0
    except:
        g_key, c_key = 0, 0

    regras = {
        1: { # Bens Imóveis
            "nome": "Bens Imóveis",
            "docs": ["Escritura/Contrato de Compra", "Espelho do IPTU", "Matrícula do Imóvel"],
            "especificos": {
                1: "Prédio residencial",
                2: "Prédio comercial",
                3: "Galpão",
                11: "Apartamento",
                12: "Casa",
                13: "Terreno",
                14: "Terra nua",
                15: "Sala ou conjunto",
                16: "Construção",
                19: "Garagem Avulsa (Novo)",
                99: "Outros bens imóveis"
            }
        },
        2: { # Bens Móveis
            "nome": "Bens Móveis",
            "docs": ["Documento de Compra/Venda", "Certificado de Registro/Propriedade"],
            "especificos": {
                1: "Veículo automotor terrestre (carro, moto, caminhão)",
                2: "Aeronave",
                3: "Embarcação",
                6: "Joia, quadro, objeto de arte, coleção, etc. (Novo)",
                99: "Outros bens móveis"
            }
        },
        3: { # Participações Societárias
            "nome": "Participações Societárias",
            "docs": ["Contrato Social/Alteração", "Informe de Rendimentos da Empresa"],
            "especificos": {
                1: "Ações (inclusive as listadas em bolsa)",
                2: "Quotas ou quinhões de capital (LTDA)",
                3: "Holding Patrimonial (Novo - para integralização de bens)",
                99: "Outras participações societárias"
            }
        },
        4: { # Aplicações e Investimentos
            "nome": "Aplicações e Investimentos",
            "docs": ["Informe de Rendimentos Bancários", "Extrato de Custódia"],
            "especificos": {
                1: "Depósito em conta poupança",
                2: "Títulos públicos (Tesouro Direto)",
                3: "Títulos privados (CDB, RDB, LCA, LCI)",
                4: "Ativos com ouro, joias, metais preciosos (mercado financeiro)",
                99: "Outras aplicações e investimentos"
            }
        },
        5: { # Créditos
            "nome": "Créditos",
            "docs": ["Contrato de Empréstimo/Mútuo", "Comprovante de Crédito"],
            "especificos": {
                1: "Empréstimos concedidos (pessoa física ou jurídica)",
                2: "Crédito decorrente de alienação (venda a prazo)",
                99: "Outros créditos e valores"
            }
        },
        6: { # Depósito à Vista e Numerário
            "nome": "Depósito à Vista e Numerário",
            "docs": ["Informe de Rendimentos Bancários"],
            "especificos": {
                1: "Depósito em conta corrente no Brasil",
                2: "Depósito em conta corrente no exterior",
                3: "Dinheiro em espécie (moeda nacional)",
                4: "Dinheiro em espécie (moeda estrangeira)"
            }
        },
        7: { # Fundos
            "nome": "Fundos",
            "docs": ["Informe de Rendimentos do Fundo"],
            "especificos": {
                1: "Fundos de Investimento (Ações, Renda Fixa)",
                3: "FII (Fundo de Investimento Imobiliário)",
                4: "ETFs (Fundos de Índice)",
                11: "FIP (Fundo de Investimento em Participações)",
                12: "FIEE (Empresas Emergentes)",
                13: "Fundo Multimercado"
            }
        },
        8: { # Criptoativos
            "nome": "Criptoativos",
            "docs": ["Extrato da Exchange", "Relatório de Operações"],
            "especificos": {
                1: "Bitcoin (BTC)",
                2: "Outras criptomoedas (Altcoins: ETH, SOL, etc.)",
                3: "Stablecoins (USDT, USDC, etc.)",
                10: "NFTs (Tokens não fungíveis)",
                99: "Outros criptoativos"
            }
        },
        99: { # Outros Bens e Direitos
            "nome": "Outros Bens e Direitos",
            "docs": ["Documento comprobatório da posse/direito"],
            "especificos": {
                1: "Licença e concessão especial",
                2: "Título de clube e assemelhados",
                3: "Direito de autor, invento e patente",
                6: "Leasing com opção de compra",
                99: "Outros bens e direitos"
            }
        }
    }


    info_grupo = regras.get(g_key, {"nome": f"Grupo {g_key:02d}", "docs": ["Documento comprobatório do bem"]})
    tipo_nome = info_grupo.get("especificos", {}).get(c_key, f"Código {c_key:02d}")
    
    # Resultado da classificação
    return {
        "grupo_nome": info_grupo["nome"],
        "tipo_nome": tipo_nome,
        "documentos": info_grupo["docs"],
        "resumo": f"[{info_grupo['nome']} | {tipo_nome}] {discriminação[:60]}..."
    }


def process_file(file_path):
    if not os.path.exists(file_path):
        print(f"Arquivo não encontrado: {file_path}")
        return

    print(f"\n{'='*80}")
    print(f"PROCESSANDO ARQUIVO: {os.path.basename(file_path)}")
    print(f"{'='*80}")

    with open(file_path, 'rb') as f:
        content = f.read()
    
    res = parse_dec_file(content)
    
    print(f"Cliente: {res.header_ir.nm_nome if res.header_ir else 'N/A'}")
    print(f"CPF: {res.header_ir.nr_cpf if res.header_ir else 'N/A'}")
    print("-" * 40)
    
    if not res.declaracao_bens_direitos:
        print("Nenhum bem ou direito encontrado.")
        return

    print(f"{'GRUPO':<20} | {'TIPO':<30} | {'AÇÃO CHECKLIST'}")
    print("-" * 85)
    
    for bem in res.declaracao_bens_direitos:
        classificacao = classify_asset(bem)
        docs_str = ", ".join(classificacao["documentos"])
        print(f"{classificacao['grupo_nome']:<20} | {classificacao['tipo_nome']:<30} | {docs_str}")
        print(f"   > Descrição: {bem.tx_bem[:100]}...")
        print("-" * 85)

# Lista de arquivos para teste
arquivos = [
    r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\38339202898-IRPF-A-2025-2024-ORIGI.DEC',
    r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\src\00632752955-IRPF-A-2025-2024-ORIGI.DEC'
]

for arq in arquivos:
    process_file(arq)
