import sys
import os
from decimal import Decimal

# Adiciona o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from irpf_parser.core.engine import IRPFEngine

def run_parse(filepath):
    print(f"\n{'='*70}")
    print(f"PROCESSANDO DECLARAÇÃO: {os.path.basename(filepath)}")
    print(f"{'='*70}")
    
    if not os.path.exists(filepath):
        print(f"ERRO: Arquivo não encontrado em {filepath}")
        return

    with open(filepath, 'rb') as f:
        content = f.read()
        
    engine = IRPFEngine(content)
    declaracao = engine.run()
    
    # 1. Dados Cadastrais
    header = declaracao.header
    ident = declaracao.identificacao
    
    print(f"CLIENTE: {header.nm_nome if header else 'Não encontrado'}")
    print(f"EXERCÍCIO: {declaracao.exercicio_detectado}")
    print(f"CPF: {header.nr_cpf if header else '---'}")
    print(f"TIPO: {'Completa' if header and header.in_completa == 'S' else 'Simplificada'}")
    
    # 2. Resumo Financeiro
    print(f"\nRESUMO FINANCEIRO:")
    if declaracao.totais:
        t = declaracao.totais
        print(f"  - Rendimentos Tributáveis: R$ {t.vr_tottrib:>15}")
        print(f"  - Base de Cálculo:        R$ {t.vr_basecalc:>15}")
        print(f"  - Imposto Devido:         R$ {t.vr_impdevido:>15}")
        print(f"  - Imposto a Pagar:        R$ {t.vr_imppagar:>15}")
        print(f"  - Total de Bens (Atual):  R$ {t.vr_bensatual:>15}")
    else:
        print("  [!] Registro de totais (20) não encontrado ou não parseado.")
        
    # 3. Detalhamento de Rendimentos PJ (Top 3)
    print(f"\nRENDIMENTOS PJ (Amostra):")
    for r in declaracao.rendimentos_pj[:3]:
        print(f"  - {r.nm_pagador[:30]:<30} | R$ {r.vr_rendto:>12}")
        
    # 4. Detalhamento de Bens (Amostra)
    print(f"\nBENS E DIREITOS (Amostra):")
    for b in declaracao.bens[:3]:
        print(f"  - [{b.cd_bem}] {b.tx_bem[:50]}...")
        print(f"    Valor Atual: R$ {b.vr_atual:>15}")
        if b.raw_tail:
            print(f"    [INFO] Detectados {len(b.raw_tail)} caracteres extras no layout {b.layout_version}")

if __name__ == "__main__":
    files = [
        "38339202898-IRPF-A-2025-2024-ORIGI.DEC",
        "38339202898-IRPF-A-2026-2025-ORIGI.DBK"
    ]
    
    for f in files:
        run_parse(f)
