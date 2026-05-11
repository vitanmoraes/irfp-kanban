from .scanner import LayoutScanner
from .parsers import (
    parse_header_ir, parse_identificacao, parse_rendimento_pj,
    parse_bens, parse_totais, parse_renda_variavel, parse_encerramento
)
from ..models import registros as models

class IRPFEngine:
    """
    Motor principal 2.0 que orquestra o scan de integridade e o parse modular.
    """
    def __init__(self):
        self.scanner = LayoutScanner()
        
    def process_file(self, file_path: str) -> models.DeclaraoIRPF:
        with open(file_path, 'r', encoding='latin1') as f:
            lines = f.readlines()
            
        # 1. Identificar Exercício (via primeira linha IRPFXXXX)
        header_line = lines[0]
        exercise = int(header_line[8:12]) if "IRPF" in header_line else 2023
        
        # 2. Rodar Scan de Integridade
        scan_report = self.scanner.scan(lines, exercise)
        
        # 3. Orquestrar Parseamento
        declarao = models.DeclaraoIRPF(
            exercicio_detectado=exercise,
            scanner_report=scan_report["divergences"]
        )
        
        for line in lines:
            line = line.rstrip('\r\n')
            if line.startswith("IRPF"):
                declarao.header = parse_header_ir(line, exercise)
            elif line.startswith("16"):
                declarao.identificacao = parse_identificacao(line, exercise)
            elif line.startswith("21"):
                declarao.rendimentos_pj.append(parse_rendimento_pj(line, exercise))
            elif line.startswith("27"):
                declarao.bens.append(parse_bens(line, exercise))
            elif line.startswith("20"):
                declarao.totais = parse_totais(line, exercise)
            elif line.startswith("40"):
                declarao.renda_variavel.append(parse_renda_variavel(line, exercise))
            elif line.startswith("T9"):
                declarao.encerramento = parse_encerramento(line, exercise)
                
        return declarao
