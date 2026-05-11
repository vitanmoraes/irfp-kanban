from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict
from decimal import Decimal

@dataclass
class BaseRegistro:
    raw_line: str = ""
    raw_tail: str = ""
    layout_version: str = "2023"

@dataclass
class HeaderIR(BaseRegistro):
    sistema: str = ""
    exercicio: int = 0
    ano_base: int = 0
    codigo_recnet: int = 0
    in_retificadora: str = ""
    nr_cpf: str = ""
    ni_filler: Optional[str] = None
    tipo_ni: int = 0
    nr_versao: int = 0
    nm_nome: str = ""
    sg_uf: str = ""
    nr_hash: str = ""
    in_certificavel: int = 0
    dt_nascim: int = 0
    in_completa: str = ""
    in_resultado_imposto: str = ""
    in_gerada: str = ""
    nr_recibo_ultima_dec_ex_atual: Optional[str] = None
    vr_impdevido: Decimal = Decimal('0.00')
    vr_soma_imposto_pagar: Decimal = Decimal('0.00')

@dataclass
class IdentificacaoDeclarante(BaseRegistro):
    nr_reg: int = 16
    nr_cpf: str = ""
    nm_nome: str = ""
    tip_logra: Optional[str] = None
    nm_logra: Optional[str] = None
    nr_numero: Optional[str] = None
    nm_bairro: Optional[str] = None
    nr_cep: Optional[str] = None
    cd_municip: Optional[int] = None
    nm_municip: Optional[str] = None
    sg_uf: Optional[str] = None

@dataclass
class RendimentoPJ(BaseRegistro):
    nr_reg: int = 21
    nr_cpf: str = ""
    nr_pagador: str = ""
    nm_pagador: str = ""
    vr_rendto: Decimal = Decimal('0.00')
    vr_contrib: Decimal = Decimal('0.00')
    vr_decterc: Decimal = Decimal('0.00')
    vr_imposto: Decimal = Decimal('0.00')
    vr_irrf13salario: Decimal = Decimal('0.00')

@dataclass
class RendimentoIsento(BaseRegistro):
    nr_reg: int = 23
    nr_cpf: str = ""
    nr_cod_isento: int = 0
    vr_valor: Decimal = Decimal('0.00')

@dataclass
class RendimentosSujeitosTributacaoExclusiva(BaseRegistro):
    nr_reg: int = 24
    nr_cpf: str = ""
    nr_cod_exclusivo: int = 0
    vr_valor: Decimal = Decimal('0.00')

@dataclass
class Dependentes(BaseRegistro):
    nr_reg: int = 25
    nr_cpf: str = ""
    nr_chave: int = 0
    cd_depend: int = 0
    nm_depend: str = ""
    dt_nascim: int = 0

@dataclass
class PagamentosEfetuados(BaseRegistro):
    nr_reg: int = 26
    nr_cpf: str = ""
    cd_pagto: int = 0
    nr_benef: str = ""
    nm_benef: str = ""
    vr_pagto: Decimal = Decimal('0.00')

@dataclass
class DeclaracaoBensDireitos(BaseRegistro):
    nr_reg: int = 27
    nr_cpf: str = ""
    cd_bem: int = 0
    in_exterior: int = 0
    tx_bem: str = ""
    vr_anter: Decimal = Decimal('0.00')
    vr_atual: Decimal = Decimal('0.00')
    cd_grupo_bem: Optional[int] = None

@dataclass
class RendaVariavelMensal(BaseRegistro):
    nr_reg: int = 40
    nr_cpf: str = ""
    nr_mes: int = 0
    vr_res_liquido_comum: Decimal = Decimal('0.00')
    vr_res_liquido_daytrade: Decimal = Decimal('0.00')
    vr_imposto_devido: Decimal = Decimal('0.00')
    vr_imposto_pago: Decimal = Decimal('0.00')

@dataclass
class TotaisDeclaracao(BaseRegistro):
    nr_reg: int = 20
    nr_cpf: str = ""
    vr_rendjur: Decimal = Decimal('0.00')
    vr_tottrib: Decimal = Decimal('0.00')
    vr_basecalc: Decimal = Decimal('0.00')
    vr_imposto: Decimal = Decimal('0.00')
    vr_impdevido: Decimal = Decimal('0.00')
    vr_imppagar: Decimal = Decimal('0.00')
    vr_bensatual: Decimal = Decimal('0.00')

@dataclass
class RegistroTipoEncerramento(BaseRegistro):
    nr_reg: str = "T9"
    nr_cpf: str = ""
    qt_regs: int = 0

@dataclass
class DeclaraoIRPF:
    header: Optional[HeaderIR] = None
    identificacao: Optional[IdentificacaoDeclarante] = None
    rendimentos_pj: List[RendimentoPJ] = field(default_factory=list)
    rendimentos_isentos: List[RendimentoIsento] = field(default_factory=list)
    rendimentos_exclusivos: List[RendimentosSujeitosTributacaoExclusiva] = field(default_factory=list)
    dependentes: List[Dependentes] = field(default_factory=list)
    pagamentos: List[PagamentosEfetuados] = field(default_factory=list)
    bens: List[DeclaracaoBensDireitos] = field(default_factory=list)
    renda_variavel: List[RendaVariavelMensal] = field(default_factory=list)
    totais: Optional[TotaisDeclaracao] = None
    encerramento: Optional[RegistroTipoEncerramento] = None
    
    # Auditoria e Metadados
    scanner_report: List[Dict[str, Any]] = field(default_factory=list)
    exercicio_detectado: int = 0
