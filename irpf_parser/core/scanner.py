from typing import List, Dict, Any
from ..layouts.definitions import ALL_LAYOUTS

class LayoutScanner:
    """
    Scanner de integridade que detecta divergências de layout antes do processamento.
    """
    def __init__(self):
        self.divergences = []
        self.stats = {"total_lines": 0, "divergent_lines": 0}

    def scan(self, lines: List[str], exercise: int) -> Dict[str, Any]:
        self.divergences = []
        self.stats = {"total_lines": len(lines), "divergent_lines": 0}
        
        expected_layout = ALL_LAYOUTS.get(exercise, ALL_LAYOUTS[2023])
        
        for i, line in enumerate(lines):
            reg_type = line[:2]
            # Caso especial para Header e Encerramento
            if line.startswith("IRPF"): reg_type = "IR"
            elif line.startswith("T9"): reg_type = "T9"
            
            expected_size = expected_layout.get(reg_type)
            actual_size = len(line.rstrip('\r\n'))
            
            if expected_size and actual_size != expected_size:
                self.divergences.append({
                    "line": i + 1,
                    "reg": reg_type,
                    "expected": expected_size,
                    "actual": actual_size,
                    "diff": actual_size - expected_size
                })
                self.stats["divergent_lines"] += 1
                
        return {
            "exercise": exercise,
            "stats": self.stats,
            "divergences": self.divergences[:50] # Top 50 para não sobrecarregar
        }
