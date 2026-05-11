from irpf_parser.core.engine import IRPFEngine
import os

def generate_markdown_checklist(file_path):
    engine = IRPFEngine()
    res = engine.process_file(file_path)
    
    output = []
    output.append(f"# Checklist de Documentação - IRPF")
    output.append(f"**Cliente:** {res.header.nm_nome}")
    output.append(f"**CPF:** {res.header.nr_cpf}")
    output.append(f"**Exercício:** {res.header.exercicio}")
    output.append("\n---\n")
    
    output.append("## 📋 DOCUMENTOS BÁSICOS")
    output.append("- [ ] RG / CPF atualizado do titular e dependentes")
    output.append("- [ ] Comprovante de residência atualizado")
    output.append("- [ ] Dados bancários para restituição (Banco, Agência, Conta)")
    
    if res.rendimentos_pj:
        output.append("\n## 💰 RENDIMENTOS")
        seen_pj = set()
        for pj in res.rendimentos_pj:
            if pj.nm_pagador not in seen_pj:
                output.append(f"- [ ] Informe de Rendimentos de: **{pj.nm_pagador}** (CNPJ: {pj.nr_pagador})")
                seen_pj.add(pj.nm_pagador)
                
    if res.bens:
        output.append("\n## 🏠 BENS E DIREITOS (Patrimônio)")
        output.append("*Necessário extratos bancários, notas de corretora ou documentos de posse com saldo em 31/12.*")
        for i, bem in enumerate(res.bens):
            # Limitar a exibição para não ficar gigante, mas mostrar a diversidade
            desc = (bem.tx_bem[:100] + '...') if len(bem.tx_bem) > 100 else bem.tx_bem
            output.append(f"- [ ] Item {i+1} (Cód {bem.cd_bem}): {desc}")

    if res.pagamentos:
        output.append("\n## 🏥 DESPESAS E PAGAMENTOS")
        for pag in res.pagamentos:
            output.append(f"- [ ] Comprovante de pagamento para: **{pag.nm_benef}** (Cód {pag.cd_pagto})")

    return "\n".join(output)

import sys
import io

# Forçar saída UTF-8 para suportar emojis no terminal/MarkDown
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

file_path = r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\38339202898-IRPF-A-2025-2024-ORIGI.DEC'
checklist = generate_markdown_checklist(file_path)
print(checklist)
