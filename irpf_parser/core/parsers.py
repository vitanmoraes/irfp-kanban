from .field_parser import parse_field
from ..models import registros as models

def parse_header_ir(line: str, version: int) -> models.HeaderIR:
    reg = models.HeaderIR(raw_line=line, layout_version=str(version))
    reg.sistema = parse_field(line, 1, 8, 'C')
    reg.exercicio = parse_field(line, 9, 12, 'N')
    reg.ano_base = parse_field(line, 13, 16, 'N')
    reg.codigo_recnet = parse_field(line, 17, 20, 'N')
    reg.in_retificadora = parse_field(line, 21, 21, 'C')
    reg.nr_cpf = parse_field(line, 22, 32, 'C')
    reg.nm_nome = parse_field(line, 40, 99, 'C')
    reg.sg_uf = parse_field(line, 100, 101, 'C')
    reg.nr_versao = parse_field(line, 37, 39, 'N')
    reg.dt_nascim = parse_field(line, 113, 120, 'N')
    reg.in_completa = parse_field(line, 121, 121, 'C')
    reg.vr_impdevido = parse_field(line, 191, 203, 'Decimal', 2)
    reg.vr_soma_imposto_pagar = parse_field(line, 244, 256, 'Decimal', 2)
    
    # Detecção de cauda para o Header (Layout base 1203)
    if len(line) > 1203:
        reg.raw_tail = line[1203:]
    return reg

def parse_identificacao(line: str, version: int) -> models.IdentificacaoDeclarante:
    reg = models.IdentificacaoDeclarante(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.nm_nome = parse_field(line, 14, 73, 'C')
    reg.nm_logra = parse_field(line, 89, 128, 'C')
    reg.nr_numero = parse_field(line, 129, 134, 'C')
    reg.nm_bairro = parse_field(line, 156, 174, 'C')
    reg.nr_cep = parse_field(line, 175, 183, 'C')
    reg.nm_municip = parse_field(line, 188, 227, 'C')
    reg.sg_uf = parse_field(line, 228, 229, 'C')
    
    if len(line) > 881:
        reg.raw_tail = line[881:]
    return reg

def parse_rendimento_pj(line: str, version: int) -> models.RendimentoPJ:
    reg = models.RendimentoPJ(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.nr_pagador = parse_field(line, 14, 27, 'C')
    reg.nm_pagador = parse_field(line, 28, 87, 'C')
    reg.vr_rendto = parse_field(line, 88, 100, 'Decimal', 2)
    reg.vr_contrib = parse_field(line, 101, 113, 'Decimal', 2)
    reg.vr_decterc = parse_field(line, 114, 126, 'Decimal', 2)
    reg.vr_imposto = parse_field(line, 127, 139, 'Decimal', 2)
    reg.vr_irrf13salario = parse_field(line, 148, 160, 'Decimal', 2)
    return reg

def parse_bens(line: str, version: int) -> models.DeclaracaoBensDireitos:
    reg = models.DeclaracaoBensDireitos(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.cd_bem = parse_field(line, 14, 15, 'N')
    reg.in_exterior = parse_field(line, 16, 16, 'N')
    reg.cd_pais = parse_field(line, 17, 19, 'N')
    reg.tx_bem = parse_field(line, 20, 531, 'C')
    reg.vr_anter = parse_field(line, 532, 544, 'Decimal', 2)
    reg.vr_atual = parse_field(line, 545, 557, 'Decimal', 2)
    reg.cd_grupo_bem = parse_field(line, 1101, 1102, 'N')
    
    # Detecção de cauda para Bens (Layout base 1174)
    if len(line) > 1174:
        reg.raw_tail = line[1174:]
    return reg

def parse_totais(line: str, version: int) -> models.TotaisDeclaracao:
    reg = models.TotaisDeclaracao(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.vr_rendjur = parse_field(line, 14, 26, 'Decimal', 2)
    reg.vr_tottrib = parse_field(line, 66, 78, 'Decimal', 2)
    reg.vr_basecalc = parse_field(line, 196, 208, 'Decimal', 2)
    reg.vr_imposto = parse_field(line, 209, 221, 'Decimal', 2)
    reg.vr_impdevido = parse_field(line, 235, 247, 'Decimal', 2)
    reg.vr_imppagar = parse_field(line, 378, 390, 'Decimal', 2)
    reg.vr_bensatual = parse_field(line, 418, 430, 'Decimal', 2)
    
    if len(line) > 900:
        reg.raw_tail = line[900:]
    return reg

def parse_renda_variavel(line: str, version: int) -> models.RendaVariavelMensal:
    reg = models.RendaVariavelMensal(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.nr_mes = parse_field(line, 26, 27, 'N')
    reg.vr_res_liquido_comum = parse_field(line, 726, 738, 'Decimal', 2) # Exemplo baseado no oficial
    reg.vr_res_liquido_daytrade = parse_field(line, 727, 739, 'Decimal', 2) # Posições reais do oficial
    reg.vr_imposto_devido = parse_field(line, 730, 742, 'Decimal', 2)
    reg.vr_imposto_pago = parse_field(line, 731, 743, 'Decimal', 2)
    
    if len(line) > 178: # 178 era o original, mas no oficial parece maior
        reg.raw_tail = line[178:]
    return reg

def parse_dependente(line: str, version: int) -> models.Dependentes:
    reg = models.Dependentes(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.nr_chave = parse_field(line, 14, 18, 'N')
    reg.nm_depend = parse_field(line, 21, 80, 'C')
    return reg

def parse_pagamento(line: str, version: int) -> models.PagamentosEfetuados:
    reg = models.PagamentosEfetuados(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.cd_pagto = parse_field(line, 14, 15, 'N')
    reg.cd_dependente = parse_field(line, 16, 17, 'C')
    reg.nr_benef = parse_field(line, 18, 31, 'C')
    reg.nm_benef = parse_field(line, 35, 94, 'C')
    reg.vr_pagto = parse_field(line, 95, 107, 'Decimal', 2)
    return reg




def parse_encerramento(line: str, version: int) -> models.RegistroTipoEncerramento:
    reg = models.RegistroTipoEncerramento(raw_line=line, layout_version=str(version))
    reg.nr_cpf = parse_field(line, 3, 13, 'C')
    reg.qt_regs = parse_field(line, 14, 19, 'N')
    return reg
