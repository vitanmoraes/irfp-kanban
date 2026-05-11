import sys
import os

# Adiciona o diretório atual ao path para importar o motor
sys.path.append(os.getcwd())

from irpf_parser.core.engine import IRPFEngine
from irpf_parser.core.checklist import ChecklistEngine

def test_file(file_path):
    print(f"--- Testando arquivo: {os.path.basename(file_path)} ---")
    
    # 1. Carregar o arquivo
    with open(file_path, 'r', encoding='latin-1') as f:
        content = f.read()
    
    # 2. Parsear a declaração
    engine = IRPFEngine()
    declarao = engine.process_file(file_path)
    
    # 3. Gerar checklist
    checklist_engine = ChecklistEngine()
    items = checklist_engine.generate_checklist(declarao)
    
    # 4. Mostrar Pagamentos formatados
    print("\n--- CHECKLIST DE PAGAMENTOS (NOVO FORMATO) ---")
    pagamentos_found = False
    for item in items:
        # Remove emojis para evitar erro de console
        clean_title = item['titulo'].encode('ascii', 'ignore').decode('ascii')
        if item['categoria'] in ['SAUDE', 'EDUCACAO', 'PREVIDENCIA', 'PENSAO', 'HONORARIOS', 'PAGAMENTOS']:
            print(f"[{item['categoria']}] {clean_title}")

            print(f"   > {item['instrucao']}")
            pagamentos_found = True
            
    if not pagamentos_found:
        print("Nenhum pagamento encontrado neste arquivo.")

if __name__ == "__main__":
    test_file(r"c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\src\00632752955-IRPF-A-2025-2024-ORIGI.DEC")
