from typing import List, Dict, Any
from .engine import IRPFEngine
from ..models import registros as models

class ChecklistEngine:
    """
    Motor de Checklist Inteligente do IRPF-Kanban.
    Implementa a metodologia hierárquica e agrupamento por beneficiário.
    """
    
    def clean_name(self, name: str) -> str:
        import re
        name = re.sub(r'^[0-9\s.\-/]{3,18}', '', name)
        name = re.sub(r'^[0-9]+', '', name) # Remove dígitos isolados no início
        name = re.sub(r'CNPJ:?\s?[0-9.\-/]{14,18}$', '', name, flags=re.I)
        return name.strip()


    def generate_checklist(self, declarao: models.DeclaraoIRPF) -> List[Dict[str, Any]]:
        checklist = []
        
        # 1. Documentos Cadastrais
        checklist.append({
            "categoria": "CADASTRO",
            "titulo": "RG / CPF atualizado do titular e dependentes",
            "instrucao": "Necessário para verificação cadastral."
        })

        # 2. Rendimentos PJ
        for pj in declarao.rendimentos_pj:
            checklist.append({
                "categoria": "RENDIMENTOS_PJ",
                "titulo": f"Informe de Rendimentos: {pj.nm_pagador}",
                "instrucao": f"CNPJ: {pj.nr_pagador}"
            })

        # 3. Pagamentos Efetuados (Nova Lógica Hierárquica)
        # Criar mapa de nomes de dependentes
        dep_map = {str(dep.nr_chave).zfill(2): self.clean_name(dep.nm_depend) for dep in declarao.dependentes}

        for pagto in declarao.pagamentos:
            cod = int(pagto.cd_pagto)
            dep_key = pagto.cd_dependente
            benef_nome = "TITULAR" if dep_key == "00" else dep_map.get(dep_key.zfill(2), f"Dependente {dep_key}")
            
            grupo_txt = "❤️ Doações e Outros"
            category = "PAGAMENTOS"

            if cod in [1, 2]:
                grupo_txt = "📚 Instrução (Educação)"
                category = "EDUCACAO"
            elif (10 <= cod <= 26) or cod in [80, 81]:
                grupo_txt = "🩺 Saúde (Despesas Médicas)"
                category = "SAUDE"
            elif cod in [36, 37]:
                grupo_txt = "🛡️ Previdência e Pensão"
                category = "PREVIDENCIA"
            elif cod in [29, 30, 31, 33, 34, 41]:
                grupo_txt = "🛡️ Previdência e Pensão"
                category = "PENSAO"
            elif 60 <= cod <= 71:
                grupo_txt = "⚖️ Honorários e Aluguéis"
                category = "HONORARIOS"


            task_title = f"{benef_nome} — Comprovante de pagamento: {grupo_txt} - {self.clean_name(pagto.nm_benef)}"
            checklist.append({
                "categoria": category,
                "titulo": task_title,
                "instrucao": f"Conferir se o valor de R$ {pagto.vr_pagto} possui documento comprobatório."
            })


        # 4. Bens e Direitos
        for bem in declarao.bens:
            # Lógica simplificada para o teste
            checklist.append({
                "categoria": "BENS",
                "titulo": f"Bem: {bem.tx_bem[:50]}...",
                "instrucao": "Conferir documento de posse."
            })
            
        return checklist
