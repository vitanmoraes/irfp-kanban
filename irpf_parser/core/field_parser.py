from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Any, Optional

def parse_field(line: str, start: int, end: int, field_type: str, decimal_places: int = 0) -> Any:
    """
    Extrai e converte um campo de uma linha de texto posicional.
    
    Args:
        line (str): A linha bruta do arquivo .DEC/.DBK.
        start (int): Posição inicial (base 1).
        end (int): Posição final (base 1, inclusive).
        field_type (str): 'C' (Char), 'N' (Numeric/Int), 'Decimal' (Monetário).
        decimal_places (int): Número de casas decimais para campos 'Decimal'.
    """
    start_idx = start - 1
    end_idx = end
    
    try:
        raw_value = line[start_idx:end_idx].strip()
    except IndexError:
        return None
        
    if not raw_value:
        if field_type == 'Decimal': return Decimal('0.00')
        if field_type == 'N': return 0
        return ""

    if field_type == 'C':
        return raw_value
        
    elif field_type == 'N':
        try:
            return int(raw_value)
        except ValueError:
            return 0
            
    elif field_type == 'Decimal':
        try:
            # Lógica compatível com o oficial: remove pontos e trata vírgulas
            clean_val = raw_value.replace('.', '').replace(',', '.')
            
            if decimal_places > 0:
                # Se o layout diz que tem 2 casas, mas o arquivo traz "1000", vira 10.00
                val = Decimal(clean_val) / (Decimal('10') ** decimal_places)
            else:
                val = Decimal(clean_val)
                
            return val.quantize(Decimal('0.' + '0' * (decimal_places or 2)), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError, TypeError):
            return Decimal('0.00')
            
    return raw_value
