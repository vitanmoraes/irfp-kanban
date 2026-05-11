import zipfile
import io
import os
from irpf_parser.core.engine import IRPFEngine

def process_dbk(file_path):
    engine = IRPFEngine()
    with zipfile.ZipFile(file_path, 'r') as z:
        # Procurar pelo arquivo .DEC dentro do backup
        dec_files = [f for f in z.namelist() if f.endswith('.DEC')]
        if not dec_files:
            print("Nenhum arquivo .DEC encontrado no backup.")
            return
        
        dec_filename = dec_files[0]
        with z.open(dec_filename) as f:
            content = f.read().decode('latin1')
            
        # Simular o processamento de linhas (já que o engine espera um path)
        lines = content.splitlines(keepends=True)
        
        # Como o engine.process_file espera um path, vou salvar temporariamente
        temp_path = "temp_2026.dec"
        with open(temp_path, "w", encoding="latin1") as tmp:
            tmp.write(content)
            
        result = engine.process_file(temp_path)
        os.remove(temp_path)
        return result

dbk_path = r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\38339202898-IRPF-A-2026-2025-ORIGI.DBK'
res = process_dbk(dbk_path)

if res:
    print(f"Exercício: {res.header.exercicio}")
    print(f"Contribuinte: {res.header.nm_nome}")
    print(f"Bens: {len(res.bens)} itens")
    if res.totais:
        print(f"Patrimônio Total: R$ {res.totais.vr_bensatual}")
        print(f"Imposto a Pagar: R$ {res.totais.vr_imppagar}")
    else:
        print("Totais não encontrados no arquivo de 2026.")
