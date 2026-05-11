import sys
import os
import json

# Adiciona o diretório pai ao path para permitir imports relativos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from irpf_parser.core.scanner import IRPFScanner

def test_file(filepath):
    print(f"\n{'='*60}")
    print(f"ANALISANDO: {os.path.basename(filepath)}")
    print(f"{'='*60}")
    
    if not os.path.exists(filepath):
        print(f"ERRO: Arquivo não encontrado em {filepath}")
        return

    with open(filepath, 'rb') as f:
        content = f.read()
        
    scanner = IRPFScanner(content)
    scanner.scan()
    summary = scanner.get_summary()
    
    print(f"Exercício Detectado: {summary['exercicio']}")
    print(f"Total de Linhas: {summary['total_linhas']}")
    print(f"Linhas Divergentes: {summary['linhas_divergentes']}")
    print(f"Aderência ao Layout: {summary['percentual_aderencia']:.2f}%")
    
    if summary['linhas_divergentes'] > 0:
        print("\nTOP DIVERGÊNCIAS ENCONTRADAS:")
        print(f"{'Linha':<6} | {'Reg':<4} | {'Real':<5} | {'Esp':<5} | {'Diff':<5} | {'Status'}")
        print("-" * 60)
        for d in summary['detalhes_divergencia']:
            print(f"{d['line_nr']:<6} | {d['reg']:<4} | {d['actual']:<5} | {d['expected']:<5} | {d['diff']:<5} | {d['status']}")

if __name__ == "__main__":
    # Arquivos fornecidos pelo usuário
    files = [
        "38339202898-IRPF-A-2025-2024-ORIGI.DEC",
        "38339202898-IRPF-A-2026-2025-ORIGI.DBK"
    ]
    
    for f in files:
        test_file(f)
