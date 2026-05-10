import streamlit as st
from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict # <-- CORREÇÃO AQUI: Adicionado Optional
import pandas as pd
import re

# Helper function to parse fields from a line
def parse_field(line: str, start: int, end: int, field_type: str, decimal_places: int = 0) -> Any:
    """
    Extrai e converte um campo de uma linha de texto.

    Args:
        line (str): A linha de texto completa do registro.
        start (int): Posição inicial do campo (base 1).
        end (int): Posição final do campo (base 1).
        field_type (str): Tipo esperado do campo ('N' para Numérico, 'C' para Caractere,
                          'Decimal' para numérico com casas decimais).
        decimal_places (int): Número de casas decimais para campos 'Decimal'.

    Returns:
        Any: O valor convertido do campo, ou None se o campo for vazio/inválido.
    """
    # Ajusta para índice base 0
    start_idx = start - 1
    end_idx = end

    # Extrai o valor bruto do campo
    raw_value = line[start_idx:end_idx].strip()

    if not raw_value:
        return None

    if field_type == 'N':
        try:
            return int(raw_value)
        except ValueError:
            return None
    elif field_type == 'Decimal':
        try:
            # Remove separador de milhar se houver, assume vírgula como separador decimal para entrada
            cleaned_value = raw_value.replace('.', '').replace(',', '.')
            return float(cleaned_value) / (10 ** decimal_places) if decimal_places > 0 else float(cleaned_value)
        except ValueError:
            return None
    elif field_type == 'C':
        return raw_value
    return raw_value

# ==================================================================================================
# DATACLASSES PARA CADA TIPO DE REGISTRO
# ==================================================================================================

@dataclass
class HeaderIR: # REG IR - HEADER - IDENTIFICAÇÃO DA DECLARAÇÂO
    sistema: str
    exercicio: int
    ano_base: int
    codigo_recnet: int
    in_retificadora: str
    nr_cpf: str
    ni_filler: Optional[str]
    tipo_ni: int
    nr_versao: int
    nm_nome: str
    sg_uf: str
    nr_hash: str
    in_certificavel: int
    dt_nascim: int
    in_completa: str
    in_resultado_imposto: str
    in_gerada: str
    nr_recibo_ultima_dec_ex_atual: Optional[str]
    filler: Optional[str]
    nome_so: Optional[str]
    versao_so: Optional[str]
    versao_jvm: Optional[str]
    nr_recibo_declaracao_transmitida: Optional[str]
    cd_municip: Optional[int]
    nr_conj: Optional[str]
    in_obrigat_entrega: Optional[str]
    vr_impdevido: Optional[float]
    nr_recibo_ultima_dec_ex_anterior: Optional[str]
    in_seguranca: Optional[int]
    in_imposto_pago: Optional[int]
    in_imposto_antecipado: Optional[int]
    in_muda_endereco: Optional[int]
    nr_cep: Optional[int]
    in_debito_primeira_quota: Optional[int]
    nr_banco: Optional[int]
    nr_agencia: Optional[int]
    in_sobrepartilha: Optional[str]
    data_transito_julgado_lavratura: Optional[int]
    vr_soma_imposto_pagar: Optional[float]
    in_opcao_tributacao_beneficiario_um_rra: Optional[str]
    cpf_beneficiario_um_rra: Optional[str]
    in_opcao_tributacao_beneficiario_dois_rra: Optional[str]
    cpf_beneficiario_dois_rra: Optional[str]
    in_opcao_tributacao_beneficiario_tres_rra: Optional[str]
    cpf_beneficiario_tres_rra: Optional[str]
    in_opcao_tributacao_beneficiario_quatro_rra: Optional[str]
    cpf_beneficiario_quatro_rra: Optional[str]
    vr_doacao_eca: Optional[float]
    vr_doacao_idoso: Optional[float]
    nr_base_fonte_maior: Optional[str]
    nr_base_fonte_dois: Optional[str]
    nr_base_fonte_tres: Optional[str]
    nr_base_fonte_quatro: Optional[str]
    nr_cpf_depe_rend_maior: Optional[str]
    dt_nasc_depe_rend_maior: Optional[int]
    nr_cpf_depe_rend_dois: Optional[str]
    dt_nasc_depe_rend_dois: Optional[int]
    nr_cpf_depe_rend_tres: Optional[str]
    dt_nasc_depe_rend_tres: Optional[int]
    nr_cpf_depe_rend_quatro: Optional[str]
    dt_nasc_depe_rend_quatro: Optional[int]
    nr_cpf_depe_rend_cinco: Optional[str]
    dt_nasc_depe_rend_cinco: Optional[int]
    nr_cpf_depe_rend_seis: Optional[str]
    dt_nasc_depe_rend_seis: Optional[int]
    nr_base_benef_desp_med_maior: Optional[str]
    nr_base_benef_desp_med_dois: Optional[str]
    nr_cpf_dest_pensao_aliment_maior: Optional[str]
    nr_cpf_inventariante: Optional[str]
    nm_municipio: Optional[str]
    nm_contribuinte_header: Optional[str]
    filler_mac: Optional[str]
    endereco_mac: Optional[str]
    dt_cond_nao_residente: Optional[int]
    nr_cpf_procurador: Optional[str]
    in_crit_obrigat: Optional[int]
    vr_total_rendtrib_pfpj_titdep: Optional[float]
    filler_confiabilidade: Optional[str]
    in_confiabilidade: Optional[int]
    tp_iniciada: Optional[int]
    in_transmitida: Optional[int]
    nr_cpf_transmissao: Optional[str]
    in_cpf_transmissao_perfil: Optional[int]
    vr_totisentos: Optional[float]
    vr_totexclusivo: Optional[float]
    vr_total_pagamentos: Optional[float]
    filler_dv: Optional[str]
    nr_dv_conta: Optional[str]
    in_dv_conta: Optional[int]
    cd_natur: Optional[int]
    nr_cpf_empregada_domestica_maior: Optional[str]
    nr_nit_emp_dom_maior: Optional[str]
    nr_cpf_empregada_domestica_dois: Optional[str]
    nr_nit_emp_dom_dois: Optional[str]
    nr_cpf_empregada_domestica_tres: Optional[str]
    nr_nit_emp_dom_tres: Optional[str]
    filler_utilizacao: Optional[str]
    in_utilizou_pgd: Optional[int]
    in_utilizou_app: Optional[int]
    in_utilizou_online: Optional[int]
    in_utilizou_rascunho: Optional[int]
    in_utilizou_pre_preenchida: Optional[int]
    in_utilizou_assistida_fonte_pagadora: Optional[int]
    in_utilizou_assistida_plano_saude: Optional[int]
    in_utilizou_salvar_recuperar_online: Optional[int]
    filler_pagamentos_dedutiveis: Optional[str]
    nr_pagamento_dedutivel_maior_um: Optional[str]
    nr_pagamento_dedutivel_maior_dois: Optional[str]
    nr_pagamento_dedutivel_maior_tres: Optional[str]
    nr_pagamento_dedutivel_maior_quatro: Optional[str]
    nr_pagamento_dedutivel_maior_cinco: Optional[str]
    nr_pagamento_dedutivel_maior_seis: Optional[str]
    filler_cnpj_funpresp: Optional[str]
    nr_titeleitor: Optional[str]
    in_tipo_conta: Optional[int]
    nr_conta: Optional[str]
    in_social: Optional[int]
    in_clweb: Optional[int]
    in_isencao_gcap_titular: Optional[int]
    in_isencao_gcap_maior: Optional[int]
    in_isencao_gcap_dois: Optional[int]
    in_isencao_gcap_tres: Optional[int]
    in_isencao_gcap_quatro: Optional[int]
    in_isencao_gcap_cinco: Optional[int]
    in_isencao_gcap_seis: Optional[int]
    in_ficha_1: Optional[int]
    in_cod_ficha_1: Optional[int]
    cnpj_maior_valor_1: Optional[str]
    in_ficha_2: Optional[int]
    in_cod_ficha_2: Optional[int]
    cnpj_maior_valor_2: Optional[str]
    in_ficha_3: Optional[int]
    in_cod_ficha_3: Optional[int]
    cnpj_maior_valor_3: Optional[str]
    in_ficha_4: Optional[int]
    in_cod_ficha_4: Optional[int]
    cnpj_maior_valor_4: Optional[str]
    in_ficha_5: Optional[int]
    in_cod_ficha_5: Optional[int]
    cnpj_maior_valor_5: Optional[str]
    in_ficha_6: Optional[int]
    in_cod_ficha_6: Optional[int]
    cnpj_maior_valor_6: Optional[str]
    in_ficha_7: Optional[int]
    in_cod_ficha_7: Optional[int]
    cnpj_maior_valor_7: Optional[str]
    in_ficha_8: Optional[int]
    in_cod_ficha_8: Optional[int]
    cnpj_maior_valor_8: Optional[str]
    in_ficha_9: Optional[int]
    in_cod_ficha_9: Optional[int]
    cnpj_maior_valor_9: Optional[str]
    in_ficha_10: Optional[int]
    in_cod_ficha_10: Optional[int]
    cnpj_maior_valor_10: Optional[str]
    versaotestepgd: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class IdentificacaoComplementar: # REG 01 - DADOS DE ENDEREÇO E OCUPAÇÃO
    nr_reg: int
    nr_cpf: str
    nm_logradouro: str
    nr_logradouro: str
    nm_complemento: str
    nm_bairro: str
    nr_cep: str
    nm_municipio: str
    sg_uf: str
    nr_telefone: str
    nr_titulo_eleitor: str
    cd_natureza_ocupacao: int
    cd_ocupacao_principal: int
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class IdentificacaoDeclarante: # REG 16 - IDENTIFICAÇÃO DO DECLARANTE
    nr_reg: int
    nr_cpf: str
    nm_nome: str
    tip_logra: Optional[str]
    nm_logra: Optional[str]
    nr_numero: Optional[str]
    nm_complem: Optional[str]
    nm_bairro: Optional[str]
    nr_cep: Optional[str]
    cd_municip: Optional[int]
    nm_municip: Optional[str]
    sg_uf: Optional[str]
    cd_ex: Optional[str]
    cd_pais: Optional[str]
    nm_email: Optional[str]
    nr_nitpispasep: Optional[str]
    nr_cpf_conjuge: Optional[str]
    nr_ddd_telefone: Optional[str]
    filler_ddd: Optional[str]
    dt_nascim: Optional[int]
    nr_titeleitor: Optional[str]
    cd_ocup: Optional[str]
    cd_natur: Optional[str]
    nr_quotas: Optional[int]
    in_completa: Optional[str]
    in_retificadora: Optional[str]
    in_gerado: Optional[str]
    in_endereco: Optional[str]
    nr_controle_original: Optional[str]
    nr_banco: Optional[int]
    nr_agencia: Optional[int]
    in_doenca_deficiencia: Optional[str]
    in_prepreenchida: Optional[int]
    dt_dia_util_recibo: Optional[int]
    filler_dia_util: Optional[str]
    nr_dv_conta: Optional[str]
    in_debito_autom: Optional[int]
    in_debito_primeira_quota: Optional[int]
    nr_fonte_principal: Optional[str]
    nr_recibo_ultima_dec_ano_anterior: Optional[str]
    in_tipodeclaracao: Optional[str]
    nr_cpf_procurador: Optional[str]
    nr_registro_profissional: Optional[str]
    nr_ddd_celular: Optional[str]
    nr_celular: Optional[str]
    in_conjuge: Optional[str]
    nr_telefone: Optional[str]
    in_tipo_conta: Optional[int]
    nr_conta: Optional[str]
    in_social: Optional[int]
    in_clweb: Optional[int]
    nr_numero_processo: Optional[str]
    cpf_responsavel: Optional[str]
    nr_data_original_retificadora: Optional[int]
    nr_hora_original_retificadora: Optional[int]
    tx_mensagem_recibo: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class DemaisRendimentosImpostoPagoSimplificado: # REG 17 - DEMAIS RENDIMENTOS E IMPOSTO PAGO (DESCONTO SIMPLIFICADO)
    nr_reg: int
    nr_cpf: str
    vr_impcomp: Optional[float]
    vr_lucrostit: Optional[float]
    vr_isentos: Optional[float]
    vr_exclusivos: Optional[float]
    vr_total13: Optional[float]
    vr_irfontelei11033: Optional[float]
    vr_total13depend: Optional[float]
    vr_lucrosdepend: Optional[float]
    vr_isentosdepend: Optional[float]
    vr_exclusivosdepend: Optional[float]
    filler_impcomp_depend: Optional[str]
    filler_irf_depend: Optional[str]
    vr_rendpf_tit: Optional[float]
    vr_rendpf_depend: Optional[float]
    vr_rendext_tit: Optional[float]
    vr_rendext_depend: Optional[float]
    vr_carneleao_tit: Optional[float]
    vr_carneleao_depend: Optional[float]
    vr_depen: Optional[float]
    vr_tot_prevofc_ac_tit: Optional[float]
    vr_tot_prevofc_ac_dep: Optional[float]
    vr_tot_pensali_ac_tit: Optional[float]
    vr_tot_pensali_ac_dep: Optional[float]
    vr_impext: Optional[float]
    vr_impdevido_sem_rend_ext: Optional[float]
    vr_limite_imp_pago_ext: Optional[float]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class TotaisCalculadosDeclaracaoSimplificado: # REG 18 - TOTAIS CALCULADOS DA DECLARAÇÂO COM DESC. SIMPLIFICADO
    nr_reg: int
    nr_cpf: str
    vr_rendtrib: Optional[float]
    vr_descsimp: Optional[float]
    vr_basecalc: Optional[float]
    vr_impdevido: Optional[float]
    vr_imposto: Optional[float]
    vr_impcomp: Optional[float]
    vr_leao: Optional[float]
    vr_irfontelei11033: Optional[float]
    vr_imprestit: Optional[float]
    vr_imppagar: Optional[float]
    nr_quotas: Optional[int]
    vr_quota: Optional[float]
    vr_totisento: Optional[float]
    vr_totexclusivo: Optional[float]
    filler: Optional[str]
    vr_rendtribdependente: Optional[float]
    vr_impostodependente: Optional[float]
    vr_imppagarespecie: Optional[float]
    vr_totrendtribpjtitular: Optional[float]
    vr_rendtribarural: Optional[float]
    vr_totfontetitular: Optional[float]
    vr_totbensanobaseanterior: Optional[float]
    vr_totbensanobase: Optional[float]
    vr_rendisentotitular: Optional[float]
    vr_rendisentodependentes: Optional[float]
    vr_totrendexclustitular: Optional[float]
    vr_rendexclusdependentes: Optional[float]
    vr_resnaotrib_ar: Optional[float]
    vr_totdividaanobaseanterior: Optional[float]
    vr_totdividaanobase: Optional[float]
    vr_totirfontelei11033: Optional[float]
    vr_subtotalisentotransporte: Optional[float]
    vr_subtotalexclusivotransporte: Optional[float]
    vr_ganholiquidorvtransporte: Optional[float]
    vr_rendisentogctransporte: Optional[float]
    vr_rendpfext: Optional[float]
    vr_rendpfextdepen: Optional[float]
    vr_totdoacoesampanha: Optional[float]
    vr_totrendpj_exib_susptitular: Optional[float]
    vr_totrendpj_exib_suspdependen: Optional[float]
    vr_totdepjudic_titular: Optional[float]
    vr_totdepjudic_dependen: Optional[float]
    vr_totrend_ac_tit: Optional[float]
    vr_tot_irf_ac_tit: Optional[float]
    vr_tot_imposto_rra_tit: Optional[float]
    vr_totrend_ac_dep: Optional[float]
    vr_tot_irf_ac_dep: Optional[float]
    vr_tot_imposto_rra_dep: Optional[float]
    vr_tot_imposto_devido: Optional[float]
    vr_imposto_diferido_gcap: Optional[float]
    vr_imposto_devido_gcap: Optional[float]
    vr_imposto_ganholiq_rvar: Optional[float]
    vr_imposto_devido_gcme: Optional[float]
    vr_impext: Optional[float]
    vr_aliquota_efetiva: Optional[float]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class CompletaDeclaracaoDescCalculado: # REG 19 - COMPLETA - DECLARAÇÃO COM DESC. CALCULADO
    nr_reg: int
    nr_cpf: str
    nr_fonte: Optional[str]
    vr_impext: Optional[float]
    vr_impcomp: Optional[float]
    vr_irfontelei11033: Optional[float]
    vr_recex_tit: Optional[float]
    vr_livcaix_tit: Optional[float]
    vr_carneleao_tit: Optional[float]
    vr_recex_dep: Optional[float]
    vr_livcaix_dep: Optional[float]
    vr_carneleao_dep: Optional[float]
    vr_prevpriv: Optional[float]
    vr_fapi: Optional[float]
    vr_prevofitular: Optional[float]
    vr_prevofdependente: Optional[float]
    vr_total13titular: Optional[float]
    vr_total13dependente: Optional[float]
    nr_dependente_desp_instrucao: Optional[int]
    nr_alimentando_desp_instrucao: Optional[int]
    vr_rendpf_tit: Optional[float]
    vr_rendpf_depend: Optional[float]
    vr_rendext_tit: Optional[float]
    vr_rendext_depend: Optional[float]
    vr_impdevido_sem_rend_ext: Optional[float]
    vr_limite_imp_pago_ext: Optional[float]
    vr_ate_limite_funpresp: Optional[float]
    vr_acima_limite_funpresp: Optional[float]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class TotaisDeclaracaoDescCalculado: # REG 20 - TOTAIS DA DECLARAÇÂO COM DESC. CALCULADO
    nr_reg: int
    nr_cpf: str
    vr_rendjur: Optional[float]
    vr_rendpfext: Optional[float]
    vr_rendpfextdepen: Optional[float]
    vr_resar: Optional[float]
    vr_tottrib: Optional[float]
    vr_prevof_funpresp_limite: Optional[float]
    vr_totprivada_fapi_funpresp: Optional[float]
    vr_depen: Optional[float]
    vr_despinst: Optional[float]
    vr_despmedic: Optional[float]
    vr_pensao: Optional[float]
    vr_pensao_cartorio: Optional[float]
    vr_livcaix: Optional[float]
    vr_deduc: Optional[float]
    vr_basecalc: Optional[float]
    vr_imposto: Optional[float]
    vr_dedimposto: Optional[float]
    vr_impdev1: Optional[float]
    vr_contribprev: Optional[float]
    vr_impdev2: Optional[float]
    vr_impdev3: Optional[float]
    vr_impfonte: Optional[float]
    vr_carneleao: Optional[float]
    vr_impcompl: Optional[float]
    vr_impext: Optional[float]
    vr_irfontelei11033: Optional[float]
    vr_totimppago: Optional[float]
    vr_imprest: Optional[float]
    vr_imppagar: Optional[float]
    nr_quotas: Optional[int]
    vr_quota: Optional[float]
    vr_bensant: Optional[float]
    vr_bensatual: Optional[float]
    vr_dividaant: Optional[float]
    vr_dividaatual: Optional[float]
    filler: Optional[str]
    vr_totisentos: Optional[float]
    vr_totexclus: Optional[float]
    vr_imgc: Optional[float]
    vr_totirfontelei11033: Optional[float]
    vr_imprv: Optional[float]
    vr_rendjurdependente: Optional[float]
    vr_impfontedependente: Optional[float]
    vr_imppagovcbens: Optional[float]
    vr_imppagovcespecie: Optional[float]
    vr_totrendisentositular: Optional[float]
    vr_totrendisentosdependente: Optional[float]
    vr_totrendexcltitular: Optional[float]
    vr_totrendexcldependente: Optional[float]
    vr_totdoacoesampanha: Optional[float]
    vr_totrendpj_exib_susptitular: Optional[float]
    vr_totrendpj_exib_suspdependen: Optional[float]
    vr_totdepjudic_titular: Optional[float]
    vr_totdepjudic_dependen: Optional[float]
    vr_totrend_ac_tit: Optional[float]
    vr_tot_prevofc_ac_tit: Optional[float]
    vr_tot_pensali_ac_tit: Optional[float]
    vr_tot_irf_ac_tit: Optional[float]
    vr_tot_imposto_rra_tit: Optional[float]
    vr_totrend_ac_dep: Optional[float]
    vr_tot_prevofc_ac_dep: Optional[float]
    vr_tot_pensali_ac_dep: Optional[float]
    vr_tot_irf_ac_dep: Optional[float]
    vr_tot_imposto_rra_dep: Optional[float]
    vr_imposto_diferido_gcap: Optional[float]
    vr_imposto_devido_gcap: Optional[float]
    vr_imposto_ganholiq_rvar: Optional[float]
    vr_imposto_devido_gcme: Optional[float]
    vr_aliquota_efetiva: Optional[float]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendimentoPJ: # REG 21 - RENDIMENTOS TRIBUTÁVEIS RECEBIDOS DE PESSOAS JURÍDICAS
    nr_reg: int
    nr_cpf: str
    nr_pagador: str
    nm_pagador: str
    vr_rendto: float
    vr_contrib: float
    vr_decterc: float
    vr_imposto: float
    dt_comunicacao_saida: Optional[int]
    vr_irrf13salario: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendimentosPFExteriorCarneLeao: # REG 22 - REND. TRIB. RECEBIDOS DE PESSOAS FÍSICAS, EXTERIOR E CARNÊ-LEÃO
    nr_reg: int
    nr_cpf: str
    e_dependente: str
    nr_cpf_depen: Optional[str]
    nr_mes: int
    vr_rendto: float
    vr_alugueis: float
    vr_outros: float
    vr_exter: float
    vr_livcaix: float
    vr_aliment: float
    vr_deduc: float
    vr_previd: float
    vr_basecalculo: float
    vr_imposto: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendimentoIsento: # REG 23 - RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS (Totalizador)
    nr_reg: int
    nr_cpf: str
    nr_cod_isento: int
    vr_valor: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendimentosSujeitosTributacaoExclusiva: # REG 24 - RENDIMENTOS SUJEITOS A TRIBUTAÇÂO EXCLUSIVA (Totalizador)
    nr_reg: int
    nr_cpf: str
    nr_cod_exclusivo: int
    vr_valor: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class Dependentes: # REG 25 - DEPENDENTES
    nr_reg: int
    nr_cpf: str
    nr_chave: int
    cd_depend: int
    nm_depend: str
    dt_nascim: int
    ni_depend: Optional[str]
    in_saida: Optional[int]
    nr_nitpispasep: Optional[str]
    in_endereco_titular: Optional[int]
    nm_email: Optional[str]
    nr_ddd_celular: Optional[str]
    nr_celular: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class PagamentosEfetuados: # REG 26 - RELAÇÃO DE PAGAMENTOS EFETUADOS
    nr_reg: int
    nr_cpf: str
    cd_pagto: int
    nr_chave_depend: Optional[int]
    nr_benef: str
    nm_benef: str
    nr_nit_emp_dom: Optional[str]
    vr_pagto: float
    vr_reduc: float
    vr_efpc: float
    in_tipo_cpf_cnpj: int
    in_tipo_pgto: Optional[str]
    nm_descricao: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class DeclaracaoBensDireitos: # REG 27 - DECLARAÇÃO DE BENS E DIREITOS
    nr_reg: int
    nr_cpf: str
    cd_bem: int
    in_exterior: int
    cd_pais: Optional[int]
    tx_bem: str
    vr_anter: float
    vr_atual: float
    nm_logra: Optional[str]
    nr_numero: Optional[str]
    nm_complem: Optional[str]
    nm_bairro: Optional[str]
    nr_cep: Optional[str]
    sg_uf: Optional[str]
    cd_municip: Optional[int]
    nm_municip: Optional[str]
    nm_ind_reg_imov: Optional[int]
    matric_imov: Optional[str]
    filler: Optional[str]
    area: Optional[float]
    nm_unid: Optional[int]
    nm_cartorio: Optional[str]
    nr_chave_bem: Optional[str]
    dt_aquisicao: Optional[int]
    filler_reserva: Optional[str]
    filler_renavan: Optional[str]
    nr_renavan: Optional[str]
    nr_dep_aviaca_civil: Optional[str]
    nr_capitania_portos: Optional[str]
    nr_agencia: Optional[str]
    filler_dv_conta: Optional[str]
    nr_dv_conta: Optional[str]
    nm_cpf_cnpj: Optional[str]
    nr_iptu: Optional[str]
    nr_banco: Optional[str]
    in_tipo_benefic: Optional[str]
    nr_cpf_benefic: Optional[str]
    cd_grupo_bem: Optional[int]
    in_bem_inventariar: Optional[int]
    nr_conta: Optional[str]
    nr_cib: Optional[str]
    nr_cei_cno: Optional[str]
    in_bolsa: Optional[int]
    nr_cod_negociacao_bolsa: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class DividasOnusReais: # REG 28 - DÍVIDAS E ÔNUS REAIS
    nr_reg: int
    nr_cpf: str
    cd_div: int
    tx_div: str
    vr_anter: float
    vr_atual: float
    vr_pagamentoanual: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class InformacoesInventariante: # REG 30 - INFORMAÇÕES DO INVENTARIANTE # REG 30 - ESPÓLIO
    nr_reg: int
    nr_cpf: str
    nr_invent: str
    nm_invent: str
    in_sobrepartilha: int
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendimentoSocioEmpresa: # REG 31 (Isento) e REG 33 (Exclusivo)
    nr_reg: int
    nr_cpf: str
    nr_cnpj_empresa: str
    nm_empresa: str
    vr_rendimento: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendTribRecebidosPJDependentes: # REG 32 - REND. TRIB. RECEBIDOS DE PESSOAS JURÍDICAS DOS DEPENDENTES
    nr_reg: int
    nr_cpf: str
    cpf_benef: str
    nr_pagador: str
    nm_pagador: str
    vr_rendto: float
    vr_contrib: float
    vr_decterc: float
    vr_imposto: float
    dt_comunicacao_saida: Optional[int]
    vr_irrf13salario: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class DoacoesPartidos: # REG 34 - DOAÇÕES A PARTIDOS
    nr_reg: int
    nr_cpf: str
    nr_partido: str
    nm_partido: str
    vr_doacao: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class Alimentando: # REG 35 - ALIMENTANDO
    nr_reg: int
    nr_cpf: str
    indicador_residencia: int
    nr_chave: int
    nm_nome: str
    dt_nascim: int
    ni_alimentando: str
    nr_cpf_vinculado: str
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class ImpostoPagoControle: # REG 37 (Mensal) e REG 38 (Exterior)
    nr_reg: int
    nr_cpf: str
    vr_imposto_pago: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendaVariavelMensal: # REG 40 - APURAÇÃO MENSAL (Ações e Opções)
    nr_reg: int
    nr_cpf: str
    nr_mes: int
    # Operações Comuns
    vr_comum_vista_acoes: float
    vr_comum_opcoes_acoes: float
    # Day-Trade
    vr_daytrade_vista_acoes: float
    vr_daytrade_opcoes_acoes: float
    # Resultados e Impostos
    vr_res_liquido_comum: float
    vr_res_liquido_daytrade: float
    vr_prej_anterior_comum: float
    vr_prej_anterior_daytrade: float
    vr_imposto_devido: float # Total devido (Comum + Day-Trade)
    vr_imposto_pago: float
    e_dependente: str
    nr_cpf_depen: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendaVariavelAnual: # REG 41 - CONSOLIDADO ANUAL
    nr_reg: int
    nr_cpf: str
    vr_total_res_liquido: float
    vr_total_prej_compensar: float
    vr_total_imposto_devido: float
    vr_total_imposto_pago: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendavarFiiMensal: # REG 42 - RENDA VARIÁVEL – FII (Mensal)
    nr_reg: int
    nr_cpf: str
    nr_mes: int
    vr_resliquido_mes: float
    vrresult_neg_mesant: float
    vr_basecalculo_mes: float
    vr_prejacompensar_mes: float
    vr_aliquota_imposto: float
    vr_impostodevido_mes: float
    vr_imposto_retido_meses_ant: float
    vr_imposto_retido_fonte: float
    vr_imposto_retido_compensar: float
    vr_imposto_pagar: float
    vr_impostopago: float
    e_dependente: str
    nr_cpf_depen: Optional[str]
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RendavarFiiAnual: # REG 43 - RENDA VARIÁVEL - FII (Anual)
    nr_reg: int
    nr_cpf: str
    vr_total_resliquido: float
    vr_total_resnegativo_ant: float
    vr_total_basecalculo: float
    vr_total_prejuizo_compensar: float
    vr_total_impostodevido: float
    vr_total_impostopago: float
    vr_total_ir_retido_fonte: float
    nr_controle: Optional[int]
    fim_reg: str


@dataclass
class RendRecebidosAcumuladamenteTitular: # REG 45 - REND RECEBIDOS ACUMULADAMENTE TITULAR
    nr_reg: int
    nr_cpf: str
    cd_rra_titular: Optional[int] # Código de RRA Titular
    nr_pagador: Optional[str] # CPF ou CNPJ da fonte pagadora
    nm_pagador: Optional[str] # Nome fonte pagadora
    vr_rendto: Optional[float] # Valor rendimento recebido
    vr_contrib: Optional[float] # Valor contribuição previdenciária oficial
    vr_pensao: Optional[float] # Valor da pensão alimenticia
    vr_imposto: Optional[float] # Valor imposto retido na fonte
    nr_mes_recebimento: Optional[int] # Mês do recebimento
    filler: Optional[str] # Espaços em branco
    opcao_tributacao: Optional[int] # Opção de tributação escolhida (0 - Ajuste, 1 - Exclusiva)
    num_meses: Optional[int] # Numero de meses
    imposto_rra: Optional[float] # Imposto RRA
    vr_isento_65: Optional[float] # Valor isento de 65 anos
    vr_valor_tributavel: Optional[float] # Valor tributável
    vr_juros: Optional[float] # Valor do pagamento de juros
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RelacaoPensaoRRATitular: # REG 46 - RELAÇÃO DE PENSAO RRA TITULAR
    nr_reg: int
    nr_cpf: str
    cd_rra_titular: Optional[int] # Código de RRA Titular
    nr_chave_aliment: Optional[int] # Numero de chave do alimentando
    vr_pagto: Optional[float] # Valor do pagamento de pensão
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendRecebidosAcumuladamenteDependente: # REG 47 - REND RECEBIDOS ACUMULADAMENTE DEPENDENTE
    nr_reg: int
    nr_cpf: str
    cd_rra_dependente: Optional[int] # Código de RRA Dependente
    cpf_benef: Optional[str] # CPF do Dependente
    nr_pagador: Optional[str] # CPF ou CNPJ fonte pagadora
    nm_pagador: Optional[str] # Nome fonte pagadora
    vr_rendto: Optional[float] # Valor rendimento recebido
    vr_contrib: Optional[float] # Valor contribuição previdenciária oficial
    vr_pensao: Optional[float] # Valor da pensão alimenticia
    vr_imposto: Optional[float] # Valor imposto retido na fonte
    nr_mes_recebimento: Optional[int] # Mês do recebimento
    filler: Optional[str] # Espaços em branco
    opcao_tributacao: Optional[int] # Opção de tributação escolhida (0 - Ajuste, 1 - Exclusiva)
    num_meses: Optional[int] # Numero de meses
    imposto_rra: Optional[float] # Imposto RRA
    vr_isento_65: Optional[float] # Valor isento de 65 anos
    vr_valor_tributavel: Optional[float] # Valor tributável
    vr_juros: Optional[float] # Valor do pagamento de juros
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RelacaoPensaoRRADependente: # REG 48 - RELAÇÃO DE PENSÃO RRA DEPENDENTE
    nr_reg: int
    nr_cpf: str
    cd_rra_depend: Optional[int] # Código de RRA DEPENDENTE
    nr_chave_aliment: Optional[int] # Numero de chave do alimentando
    vr_pagto: Optional[float] # Valor do pagamento de pensão
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class LancamentosPessoasFisicasExteriorCarneLeao: # REG 49 - LANÇAMENTOS PESSOAS FÍSICAS E EXTERIOR (CARNÊ-LEÃO)
    nr_reg: int
    nr_cpf_titular: str
    nr_cpf_dependente: Optional[str] # CPF dependente
    nr_mes: Optional[int] # Mês de ocorrência
    nr_cpf_titular_pagamento: Optional[str] # CPF do titular do pagamento
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_valor: Optional[float] # valor do pagamento
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class AtividadeRuralImovel: # REG 50 - IDENTIFICAÇÃO DO CONTRIBUINTE (ATIVIDADE RURAL)
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[int] # 0=Brasil, 1=Exterior
    filler: Optional[str]
    nm_imovel: Optional[str]
    nm_local: Optional[str] # Localização do imóvel
    qt_area: Optional[float] # Área do imóvel (ha)
    pc_partic: Optional[float] # Percentual de participação
    cd_explor: Optional[str] # Código da condição de exploração
    cd_ativ: Optional[str] # Código atividade Rural
    nr_incra: Optional[str] # Número do Imóvel na RFB
    nr_chave_ar: Optional[int] # Chave de identificação do imóvel rural
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class AtividadeRuralReceitaDespesa: # REG 51 - RECEITAS E DESPESAS - BRASIL
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[int] # Somente "0" - imóvel no Brasil
    nr_mes: Optional[int]
    vr_desp: Optional[float] # Valor das despesas
    vr_rec: Optional[float] # Valor das receitas
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class AtividadeRuralApuracao: # REG 52 - APURAÇÃO DO RESULTADO TRIBUTÁVEL
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[int] # 0=Brasil, 1=Exterior
    vr_rectotal: Optional[float] # Receita Bruta Total
    vr_desptotal: Optional[float] # Despesas de custeio
    vr_res1real: Optional[float] # Resultado 1
    vr_prejexercant: Optional[float] # Prejuízo do exercício anterior
    vr_comp_prej_exerc_ant: Optional[float] # Compensação de prejuízo
    vr_opcao: Optional[float] # Limite de 20% sobre a receita bruta
    vr_restrib: Optional[float] # Resultado Tributável
    vr_prejuizo: Optional[float] # Prejuízo a compensar
    vr_recvendafutura: Optional[float] # Receita recebida por conta de venda futura
    vr_adiant: Optional[float] # Valor do adiantamento
    vr_resnaotribar: Optional[float] # Resultado não tributável
    vr_res1dolar: Optional[float] # Resultado I - US$
    in_opc_apurrestrib: Optional[int] # Opção pela forma de apuração
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class AtividadeRuralResumo: # REG 56 - RESUMO DO RESULTADO DA ATIVIDADE RURAL
    nr_reg: int
    nr_cpf: str
    vr_tot_receita: float
    vr_tot_despesa: float
    vr_resultado_bruto: float
    vr_prej_anterior: float
    vr_base_calculo: float
    vr_prej_compensar: float
    vr_resultado_tributavel: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class GanhosCapitalImovel: # REG 61 - APURAÇÃO DE BENS IMÓVEIS
    nr_reg: int
    nr_cpf: str
    vr_alien: float # Valor da alienação
    vr_custo: float # Custo de aquisição
    vr_ganho: float # Ganho de capital
    vr_impdev: float # Imposto devido
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class GanhosCapitalMovel: # REG 65 - BENS MÓVEIS
    nr_reg: int
    nr_cpf: str
    vr_alien: float
    vr_custo: float
    vr_ganho: float
    vr_impdev: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class GanhosCapitalParticipacoes: # REG 70 - PARTICIPAÇÕES SOCIETÁRIAS
    nr_reg: int
    nr_cpf: str
    vr_alien: float
    vr_custo: float
    vr_ganho: float
    vr_impdev: float
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class GanhosCapitalMoedaEstrangeira: # REG 75 - MOEDA ESTRANGEIRA
    nr_reg: int
    nr_cpf: str
    vr_ganho: float
    vr_impdev: float
    nr_controle: Optional[int]
    fim_reg: str

# =================== NOVOS DATACLASSES - REGISTROS FALTANTES ===================

@dataclass
class FinalEspolio: # REG 38 - FINAL DE ESPÓLIO
    nr_reg: int
    nr_cpf: str
    nr_anoobito: Optional[int]
    filler1: Optional[str]
    nr_cpf_invent: Optional[str]
    nm_invent: Optional[str]
    filler2: Optional[str]
    in_sobrepartilha: Optional[str]
    in_status_sobrepartilha: Optional[str]
    in_tipo_processo: Optional[str] # J-Judicial, C-Cartório
    nr_processojudicial: Optional[str]
    nr_identificacaovaracivil: Optional[str]
    nm_comarca: Optional[str]
    dt_decjudicialpartilha: Optional[int]
    dt_transitojulgado: Optional[int]
    sg_ufcomarca: Optional[str]
    nr_cnpj_cartorio: Optional[str]
    nm_cartorio: Optional[str]
    nm_livro: Optional[str]
    nm_folha: Optional[str]
    nm_municipio: Optional[str]
    sg_ufcartorio: Optional[str]
    dt_lavratura: Optional[int]
    in_morteambosconjuges: Optional[str]
    nm_conjuge: Optional[str]
    in_bens_inventariar: Optional[str]
    filler3: Optional[str]
    in_meeiro: Optional[str]
    in_inventarioconjunto: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class SaidaDefinitiva: # REG 39 - SAÍDA DEFINITIVA DO PAÍS
    nr_reg: int
    nr_cpf: str
    nr_procurador: Optional[str]
    nm_procurador: Optional[str]
    nm_end_procurador: Optional[str]
    dt_naoresidente: Optional[int]
    dt_residente: Optional[int]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class MovimentacaoRebanho: # REG 53 - MOVIMENTAÇÃO DO REBANHO
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[int]
    cd_espec: Optional[int] # 1 a 5
    qt_inic: Optional[float]
    qt_compra: Optional[float]
    qt_nascim: Optional[float]
    qt_perda: Optional[float]
    qt_venda: Optional[float]
    qt_estfinal: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class AtividadeRuralBens: # REG 54 - BENS DA ATIVIDADE RURAL
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[int]
    cd_pais: Optional[int]
    cd_bemar: Optional[int]
    tx_bem: Optional[str]
    vr_bem: Optional[float]
    vr_bem_anterior: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class AtividadeRuralDivida: # REG 55 - DÍVIDA DA ATIVIDADE RURAL
    nr_reg: int
    nr_cpf: str
    in_exterior: Optional[str]
    tx_divida: Optional[str]
    vr_divate: Optional[float]
    vr_divatu: Optional[float]
    vr_pagamentoanual: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class AtividadeRuralExterior: # REG 56 - RECEITAS E DESPESAS EXTERIOR
    nr_reg: int
    nr_cpf: str
    cd_pais: Optional[int]
    recbruta: Optional[float]
    despcusteio: Optional[float]
    resoriginal: Optional[float]
    resdolar: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class ProprietarioImovelRural: # REG 57 - PROPRIETÁRIO DO IMÓVEL RURAL
    nr_reg: int
    nr_cpf: str
    nr_cpf_cnpj_proprietario: Optional[str]
    nm_nome_proprietario: Optional[str]
    in_exterior: Optional[str]
    nr_chave_ar: Optional[int]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class Herdeiros: # REG 58 - HERDEIROS (ESPÓLIO)
    nr_reg: int
    nr_cpf: str
    nr_chave_herdeiro: Optional[int]
    nm_nome: Optional[str]
    nr_cpf_cnpj: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class PercentualBem: # REG 59 - PERCENTUAL DO BEM (ESPÓLIO)
    nr_reg: int
    nr_cpf: str
    nr_chave_bem: Optional[int]
    nr_chave_herdeiro: Optional[int]
    vr_percentual: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapConsolidado: # REG 60 - GANHO DE CAPITAL CONSOLIDADO
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    dt_inicio: Optional[int]
    dt_fim: Optional[int]
    cd_pais: Optional[str]
    nm_pais: Optional[str]
    gc_transp_vr_exclusivo_brasil: Optional[float]
    gc_transp_vr_pequeno: Optional[float]
    gc_transp_vr_unicoimovel: Optional[float]
    gc_transp_vr_reducao: Optional[float]
    gc_transp_vr_impostopago_brasil: Optional[float]
    gc_transp_vr_impostodevido: Optional[float]
    gc_transp_vr_isentrib: Optional[float]
    gc_transp_vr_impostodiferidonosposteriores: Optional[float]
    gc_gcap_moeda: Optional[float]
    gc_imposto_devido_moeda: Optional[float]
    gc_moeda_aliquota_media: Optional[float]
    gc_transp_vr_exclusivo_exterior: Optional[float]
    gc_transp_vr_impostopago_exterior: Optional[float]
    gc_transp_vr_isento_exterior: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapBemImovelDetalhado: # REG 61 - GCAP BEM IMÓVEL (DETALHADO)
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_brasil_exterior: Optional[int]
    nm_imovel_descricao: Optional[str]
    end_tipo_logradouro: Optional[str]
    end_logradouro: Optional[str]
    end_numero: Optional[str]
    end_complemento: Optional[str]
    end_bairro: Optional[str]
    end_cep: Optional[str]
    end_cd_municipio: Optional[str]
    end_municipio: Optional[str]
    end_uf: Optional[str]
    end_cod_pais: Optional[str]
    end_nome_pais: Optional[str]
    dt_aquisicao: Optional[int]
    vr_aquisicao: Optional[float]
    in_reforma: Optional[str]
    in_pequeno_valor: Optional[str]
    in_propr_outro_imovel: Optional[str]
    in_outra_alienacao: Optional[str]
    in_residencial: Optional[str]
    in_utilizazaooutroimovel: Optional[str]
    vr_utilizazaooutroimovel: Optional[float]
    cd_operacao: Optional[str]
    nm_operacao: Optional[str]
    in_decisao_judicial: Optional[str]
    dt_alienacao: Optional[int]
    dt_decisao_judicial: Optional[int]
    dt_lavratura: Optional[int]
    dt_transito_julgado: Optional[int]
    in_alienprazo: Optional[str]
    vr_operacao: Optional[float]
    vr_corretagem: Optional[float]
    vr_torna: Optional[float]
    in_gcap_anterior: Optional[str]
    vr_gcap_anterior: Optional[float]
    vr_operacao_bruto_ant: Optional[float]
    vr_corretagem_ant: Optional[float]
    vr_gcap_ci_ant_liquido: Optional[float]
    vr_gcap_ci: Optional[float]
    vr_aliquota_media_ci: Optional[float]
    vr_imposto_devido_ci: Optional[float]
    vr_imposto_pago_ci: Optional[float]
    vr_recebido_cl: Optional[float]
    vr_corretagem_cl: Optional[float]
    vr_valor_liquido: Optional[float]
    vr_aquisicao_proporcional_cl: Optional[float]
    vr_diferido_anteriores_cb: Optional[float]
    vr_exercicio_cb: Optional[float]
    vr_total_cb: Optional[float]
    vr_ir_cb: Optional[float]
    vr_ir_devido_cb: Optional[float]
    vr_diferido_posterior_cb: Optional[float]
    vr_imposto_pago_cb: Optional[float]
    vr_isento_cb: Optional[float]
    vr_exclusivo_cb: Optional[float]
    dt_data_darf_tcm: Optional[int]
    dt_data_ultima_parcela: Optional[int]
    ind_ter_paraiso_fiscal: Optional[str]
    cd_pais_paraiso_fiscal: Optional[str]
    in_multiplo_imovel: Optional[str]
    dt_data_multiplo_imovel: Optional[int]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapBemMovelDetalhado: # REG 62 - GCAP BEM MÓVEL (DETALHADO)
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_brasil_exterior: Optional[str]
    nm_movel_descricao: Optional[str]
    in_registro_publico: Optional[str]
    dt_aquisicao: Optional[int]
    vr_aquisicao: Optional[float]
    in_pequeno_valor: Optional[str]
    cd_operacao: Optional[str]
    nm_operacao: Optional[str]
    in_decisao_judicial: Optional[str]
    dt_alienacao: Optional[int]
    dt_decisao_judicial: Optional[int]
    dt_lavratura: Optional[int]
    dt_transito_julgado: Optional[int]
    in_alienprazo: Optional[str]
    vr_operacao: Optional[float]
    vr_corretagem: Optional[float]
    in_gcap_anterior: Optional[str]
    vr_gcap_anterior: Optional[float]
    vr_operacao_bruto_ant: Optional[float]
    vr_corretagem_ant: Optional[float]
    vr_gcap_ci_ant_liquido: Optional[float]
    vr_gcap_ci: Optional[float]
    vr_aliquota_media_ci: Optional[float]
    vr_imposto_devido_ci: Optional[float]
    vr_imposto_pago_ci: Optional[float]
    vr_recebido_cl: Optional[float]
    vr_corretagem_cl: Optional[float]
    vr_valor_liquido: Optional[float]
    vr_aquisicao_proporcional_cl: Optional[float]
    vr_diferido_anteriores_cb: Optional[float]
    vr_exercicio_cb: Optional[float]
    vr_total_cb: Optional[float]
    vr_ir_cb: Optional[float]
    vr_ir_devido_cb: Optional[float]
    vr_diferido_posterior_cb: Optional[float]
    vr_imposto_pago_cb: Optional[float]
    vr_isento_cb: Optional[float]
    vr_exclusivo_cb: Optional[float]
    dt_data_darf_tcm: Optional[int]
    dt_data_ultima_parcela: Optional[int]
    ind_ter_paraiso_fiscal: Optional[str]
    cd_pais_paraiso_fiscal: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapParticipacaoSocietariaDetalhada: # REG 63 - GCAP PARTICIPAÇÃO SOCIETÁRIA
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    nm_sociedade: Optional[str]
    nr_cnpj: Optional[str]
    cd_municipio: Optional[str]
    nm_municipio: Optional[str]
    nm_uf: Optional[str]
    cd_operacao: Optional[str]
    nm_operacao: Optional[str]
    cd_especie: Optional[str]
    nm_especie: Optional[str]
    in_decisao_judicial: Optional[str]
    dt_alienacao: Optional[int]
    dt_decisao_judicial: Optional[int]
    dt_lavratura: Optional[int]
    dt_transito_julgado: Optional[int]
    in_alienprazo: Optional[str]
    vr_operacao: Optional[float]
    vr_corretagem: Optional[float]
    in_pequeno_valor: Optional[str]
    in_gcap_anterior: Optional[str]
    vr_gcap_anterior: Optional[float]
    vr_valor_alienacao_ap: Optional[float]
    vr_custo_corretagem_ap: Optional[float]
    vr_liquido_alienacao_ap: Optional[float]
    vr_custo_aquisicao_ap: Optional[float]
    vr_gcap_ap: Optional[float]
    vr_operacao_bruto_ant: Optional[float]
    vr_corretagem_ant: Optional[float]
    vr_gcap_ci_ant_liquido: Optional[float]
    vr_gcap_ci: Optional[float]
    vr_aliquota_media_ci: Optional[float]
    vr_imposto_devido_ci: Optional[float]
    vr_irrf_ci: Optional[float]
    vr_imposto_devido_apos_compensacao_ci: Optional[float]
    vr_imposto_pago_ci: Optional[float]
    vr_recebido_cl: Optional[float]
    vr_corretagem_cl: Optional[float]
    vr_valor_liquido: Optional[float]
    vr_aquisicao_proporcional_cl: Optional[float]
    vr_diferido_anteriores_cb: Optional[float]
    vr_exercicio_cb: Optional[float]
    vr_total_cb: Optional[float]
    vr_ir_cb: Optional[float]
    vr_ir_devido_cb: Optional[float]
    vr_diferido_posterior_cb: Optional[float]
    vr_imposto_pago_cb: Optional[float]
    vr_isento_cb: Optional[float]
    vr_exclusivo_cb: Optional[float]
    vr_custo_total_aquisicao: Optional[float]
    dt_data_darf_tcm: Optional[int]
    dt_data_ultima_parcela: Optional[int]
    ind_ter_paraiso_fiscal: Optional[str]
    cd_pais_paraiso_fiscal: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapDeclaracaoExterior: # REG 64 - GCAP DECLARAÇÃO EXTERIOR
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_tipo: Optional[int] # 1=Imóvel, 2=Móvel
    vr_cotacao_op: Optional[float]
    vr_operacao_dolar: Optional[float]
    vr_corretagem_dolar: Optional[float]
    vr_torna_me_dolar: Optional[float]
    vr_torna_mn_dolar: Optional[float]
    vr_valor_alienacao_ap_ambas: Optional[float]
    vr_custo_corretagem_ap_ambas: Optional[float]
    vr_liquido_alienacao_ap_ambas: Optional[float]
    vr_gcap_total_ap_ambas: Optional[float]
    in_origem_rend: Optional[str]
    nm_origem_rend_desc: Optional[str]
    vr_cotacao_aquisicao: Optional[float]
    vr_bem_aquisicao_dolar: Optional[float]
    vr_bem_aquisicao_rmn: Optional[float]
    ft_bem_aquisicao_rmn: Optional[float]
    vr_bem_aquisicao_rme: Optional[float]
    ft_bem_aquisicao_rme: Optional[float]
    cod_pais_acordo: Optional[str]
    nm_cod_pais_acordo: Optional[str]
    vr_imposto_real_acordo: Optional[float]
    vr_gcap_total_ajuste: Optional[float]
    ft_aliquota_media_ajuste: Optional[float]
    vr_imposto_total_ajuste: Optional[float]
    vr_imposto_pago_compensacao: Optional[float]
    vr_saldo_imposto_devido: Optional[float]
    vr_imposto_parcela_ajuste: Optional[float]
    vr_saldo_imposto_ajuste: Optional[float]
    vr_imposto_pago_ajuste: Optional[float]
    in_cobranca: Optional[str]
    vr_total_recebido_dolar: Optional[float]
    vr_total_corretagem_dolar: Optional[float]
    vr_total_liquido_recebido_dolar: Optional[float]
    vr_total_liquido_recebido_real: Optional[float]
    vr_total_aquisicao_dolar: Optional[float]
    vr_total_aquisicao_real: Optional[float]
    vr_total_aquisicao_torna_dolar: Optional[float]
    vr_total_aquisicao_torna_real: Optional[float]
    vr_total_resultado1: Optional[float]
    vr_total_reducao: Optional[float]
    vr_total_gcap_dolar: Optional[float]
    vr_total_ir: Optional[float]
    vr_total_ir_pago: Optional[float]
    nm_mensagem: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapAdquirentes: # REG 65 - GCAP ADQUIRENTES
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_tipo: Optional[int] # 1=Imóvel, 2=Móvel, 3=Participação
    nr_cpfcnpj: Optional[str]
    nr_nome: Optional[str]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapAmpliacaoReforma: # REG 66 - GCAP AMPLIAÇÃO/REFORMA
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    dt_data: Optional[int]
    vr_valor_reais: Optional[float]
    vr_porcentagem_parcela_reais: Optional[float]
    vr_valor_reducao: Optional[float]
    vr_porcentagem_red7713: Optional[float]
    vr_porcentagem_redfr1: Optional[float]
    vr_porcentagem_redfr2: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapAmpliacaoExterior: # REG 67 - GCAP AMPLIAÇÃO/REFORMA EXTERIOR
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    dt_data: Optional[int]
    vr_valor_rmn_reais: Optional[float]
    vr_porcentagem_parcela_rmn: Optional[float]
    vr_cotacao_ampliacao: Optional[float]
    vr_valor_rmn_dolar: Optional[float]
    vr_valor_rme_dolar: Optional[float]
    vr_total_parcela_dolar: Optional[float]
    vr_porcentagem_parcela_rme: Optional[float]
    vr_valor_reducao_rmn: Optional[float]
    vr_valor_reducao_rme: Optional[float]
    vr_porcentagem_red7713: Optional[float]
    vr_porcentagem_redfr1: Optional[float]
    vr_porcentagem_redfr2: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapApuracaoImovel: # REG 68 - GCAP APURAÇÃO IMÓVEL
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    nr_tipo_apuracao: Optional[int]
    # Campos financeiros da apuração (genéricos para cobrir todas as variações)
    dados_apuracao: Optional[str] # Armazena o restante da linha para flexibilidade
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapFaixaGanho: # REG 75 - GCAP FAIXA DE GANHO
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    # Campos financeiros das faixas
    dados_faixa: Optional[str] # Armazena o restante da linha
    nr_controle: Optional[int]
    fim_reg: Optional[str]

# =================== NOVOS DATACLASSES - GCAP DETALHES ===================

@dataclass
class GcapApuracaoMovel: # REG 69 - GCAP APURAÇÃO MÓVEL
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    nr_tipo_apuracao: Optional[int]
    vr_valor: Optional[float]
    vr_corretagem: Optional[float]
    vr_liquido_apuracao: Optional[float]
    vr_liquido_apuracao_dolar: Optional[float]
    vr_custo_apuracao: Optional[float]
    vr_resultado_1_apuracao: Optional[float]
    vr_resultado_1_apuracao_dolar: Optional[float]
    vr_cotacao_apuracao: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapParcelaAmbas: # REG 70 - GANHO DE CAPITAL PARCELA AMBAS
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_tipo: Optional[int]
    dt_parcela: Optional[int]
    vr_valor: Optional[float]
    vr_corretagem: Optional[float]
    vr_liquido: Optional[float]
    vr_aplica_outro_informado_parcela: Optional[float]
    vr_gcap_total: Optional[float]
    vr_imposto_devido_parcela: Optional[float]
    vr_imposto_pago_compensacao: Optional[float]
    vr_imposto_devido_brasil: Optional[float]
    vr_imposto_pago_parcela_brasil: Optional[float]
    vr_total_reducao: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapParcelaImovel: # REG 71 - GCAP PARCELA IMÓVEL
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    nr_tipo_parcela: Optional[int]
    in_ultima_parcela: Optional[str]
    dt_parcela: Optional[int]
    vr_liquido_parcela_ambas: Optional[float]
    vr_valor: Optional[float]
    vr_corretagem: Optional[float]
    vr_liquido_parcela: Optional[float]
    vr_liquido_parcela_dolar: Optional[float]
    vr_custo_parcela: Optional[float]
    vr_resultado_1_parcela: Optional[float]
    vr_resultado_1_parcela_dolar: Optional[float]
    ft_reducao_lei7713_parcela: Optional[float]
    vr_reducao_lei7713_parcela: Optional[float]
    vr_resultado_2_parcela: Optional[float]
    ft_reducao_lei11196fr1: Optional[float]
    vr_reducao_lei11196fr1: Optional[float]
    vr_resultado_3_parcela: Optional[float]
    ft_reducao_lei11196fr2: Optional[float]
    vr_reducao_lei11196fr2: Optional[float]
    vr_resultado_4_parcela: Optional[float]
    vr_aplica_outro_informado_parcela: Optional[float]
    ft_aplica_outro_parcela: Optional[float]
    vr_aplica_outro_parcela: Optional[float]
    ft_aplica_pequeno_apuracao: Optional[float]
    vr_aplica_pequeno_apuracao: Optional[float]
    ft_aplica_unico_apuracao: Optional[float]
    vr_aplica_unico_apuracao: Optional[float]
    vr_resultado_5_parcela: Optional[float]
    vr_total_reducao: Optional[float]
    vr_aliquota_media_parcela: Optional[float]
    vr_imposto_devido_parcela: Optional[float]
    vr_imposto_pago_compensacao: Optional[float]
    vr_imposto_devido_brasil: Optional[float]
    vr_imposto_pago_parcela_brasil: Optional[float]
    vr_cotacao_parcela: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapParcelaMovel: # REG 72 - GCAP PARCELA MÓVEL / PARTICIPAÇÕES
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    in_tipo: Optional[int]
    nr_tipo_parcela: Optional[int]
    in_ultima_parcela: Optional[str]
    dt_parcela: Optional[int]
    vr_liquido_parcela_ambas: Optional[float]
    vr_valor: Optional[float]
    vr_corretagem: Optional[float]
    vr_liquido_parcela: Optional[float]
    vr_liquido_parcela_dolar: Optional[float]
    vr_custo_parcela: Optional[float]
    vr_resultado_1_parcela: Optional[float]
    vr_resultado_1_parcela_dolar: Optional[float]
    vr_aliquota_media_parcela: Optional[float]
    vr_imposto_devido_parcela: Optional[float]
    vr_imposto_pago_compensacao: Optional[float]
    vr_imposto_devido_brasil: Optional[float]
    vr_imposto_pago_parcela_brasil: Optional[float]
    vr_cotacao_parcela: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapCustoAcao: # REG 73 - GCAP CUSTO DE APURAÇÃO AÇÕES
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_operacao: Optional[int]
    nr_item: Optional[str]
    in_especie: Optional[int]
    nm_descricao_especie: Optional[str]
    vr_quantidade_alienada: Optional[int]
    vr_custo_medio: Optional[float]
    vr_custo_total: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class GcapMoedaEspecie: # REG 74 - GCAP MOEDA EM ESPÉCIE
    nr_reg: int
    nr_cpf: str
    nr_cpf_beneficiario: Optional[str]
    nr_identificacao: Optional[int]
    nr_item: Optional[str]
    pais: Optional[str]
    nm_moeda: Optional[str]
    tipo_operacao: Optional[str]
    nm_operacao: Optional[str]
    nm_adquir: Optional[str]
    nr_adquir: Optional[str]
    dta_operacao: Optional[int]
    vr_operacao: Optional[float]
    nr_quantidade: Optional[float]
    vr_custo: Optional[float]
    vr_custototaquis: Optional[float]
    vr_ganhocapital: Optional[float]
    vr_saldo_reais: Optional[float]
    vr_me: Optional[float]
    nr_controle: Optional[int]
    fim_reg: Optional[str]

# =================== FIM NOVOS DATACLASSES - GCAP DETALHES ===================

@dataclass
class RendTribRecebidosPJExigibilidadeSuspensaTitular: # REG 80 - REND TRIB RECEBIDOS DE PJ EXIGIBILIDADE SUSPENSA TITULAR
    nr_reg: int
    nr_cpf: str
    nr_pagador: Optional[str] # CNPJ fonte pagadora
    nm_pagador: Optional[str] # Nome fonte pagadora
    vr_rendto: Optional[float] # Valor rendimento recebido
    vr_dep_judicial: Optional[float] # Valor depósito judicial
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendTribRecebidosPJExigibilidadeSuspensaDependentes: # REG 81 - REND. TRIB. RECEBIDOS DE PJ EXIGIBILIDADE SUSPENSA DEPENDENTES
    nr_reg: int
    nr_cpf: str
    cpf_benef: Optional[str] # CPF do Dependente
    nr_pagador: Optional[str] # CNPJ da fonte pagadora
    nm_pagador: Optional[str] # Nome da fonte pagadora
    vr_rendto: Optional[float] # Valor do rendimento recebido
    vr_dep_judicial: Optional[float] # Valor depósito judicial
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoIsentoTipo02: # REG 83 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 2
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (19=Transferências..., 20=Ganhos líquidos ações..., 21=Ganhos líquidos ouro...)
    vr_valor: Optional[float] # valor recebido
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoIsentoTipo03: # REG 84 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 3
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (1=Bolsas..., 2=Bolsas médico-residente..., 4=Indenizações..., etc.)
    nr_pagadora: Optional[str] # CPF/CNPJ da fonte pagadora
    nm_nome: Optional[str] # Nome da fonte pagadora
    vr_valor: Optional[float] # valor recebido
    vr_valor_13: Optional[float] # valor recebido de 13 (disponivel apenas para o código 10)
    nr_chave_bem: Optional[int] # Chave do bem
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoIsentoTipo04: # REG 85 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 4
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (11=Pensão, aposentadoria ou reforma por doença grave ou por acidente)
    nr_pagadora: Optional[str] # CNPJ da fonte pagadora
    nm_nome: Optional[str] # Nome da fonte pagadora
    vr_receb: Optional[float] # Rendimento
    vr_13salario: Optional[float] # Valor do 13 Salario
    vr_irrf: Optional[float] # Valor do IRRF
    vr_irrf13salario: Optional[float] # Valor do IRRF sobre 13 Salario
    vr_previdencia: Optional[float] # Contribuição previdenciária oficial
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoIsentoTipo05: # REG 86 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 5
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (26=Outros)
    nr_pagadora: Optional[str] # CPF/CNPJ da fonte pagadora
    nm_nome: Optional[str] # Nome da fonte pagadora
    vr_valor: Optional[float] # valor recebido
    nm_descricao: Optional[str] # Descrição
    nr_chave_bem: Optional[int] # Chave do bem
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoIsentoTipo06: # REG 87 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 6
    nr_reg: int
    nr_cpf: str
    nr_cod: Optional[int] # 05=Lucro na alienação de bens de pequeno valor, 06=Lucro na alienação do único imóvel, 07=Lucro na alienação de outros bens imóvel.
    vr_valor: Optional[float] # valor recebido
    vr_valorgcap: Optional[float] # valores transportados do registro 67 (GANHOS DE CAPITAL - TRANPORTES)
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoExclusivoTipo02: # REG 88 - RENDIMENTO EXCLUSIVO TIPO DE INFORMAÇÃO 2
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (6=Aplicações Financeiras, 10=Juros sobre Capital, 11=Participação Lucros)
    nr_pagadora: Optional[str] # CPF/CNPJ da fonte pagadora
    nm_nome: Optional[str] # Nome da fonte pagadora
    vr_valor: Optional[float] # Valor recebido
    nr_chave_bem: Optional[int] # Chave do bem
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RendimentoExclusivoTipo03: # REG 89 - RENDIMENTO EXCLUSIVO TIPO DE INFORMAÇÃO 3
    nr_reg: int
    nr_cpf: str
    in_tipo: Optional[str] # Indicador se o registro é do (T)Titular ou do (D)Dependente
    nr_cpf_benefic: Optional[str] # CPF do beneficiário
    nr_cod: Optional[int] # Código do rendimento (12 = Outros)
    nr_pagadora: Optional[str] # CPF/CNPJ da fonte pagadora
    nm_nome: Optional[str] # Nome da fonte pagadora
    vr_valor: Optional[float] # Valor recebido
    nm_descricao: Optional[str] # Descrição
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class RelacaoDoacoesEfetuadas: # REG 90 - RELAÇÃO DE DOAÇÕES EFETUADAS
    nr_reg: int
    nr_cpf: str
    cd_doacao: Optional[int] # Código de doações
    nr_benef: Optional[str] # CNPJ-CPF do beneficiário
    nm_benef: Optional[str] # Nome do beneficiário
    vr_doacao: Optional[float] # Valor da doação
    vr_parc_nao_dedut: Optional[float] # Valor da parcela não dedutível ou reembolsada
    in_tipo_cpf_cnpj: Optional[int] # 0-Nenhum, 1-CPF, 2-CNPJ
    nr_controle: Optional[int]
    fim_reg: Optional[str]

@dataclass
class DoacoesDiretamenteDeclaracao: # REG 91 - DOAÇÕES ECA / IDOSO
    nr_reg: int
    nr_cpf: str
    in_tipo_fundo: str # N - Nacional; E- Estadual; M- Municipal
    sg_uf: str
    nm_municipio: str
    vr_doacao: float
    nr_cnpj_fundo: str
    nr_controle: Optional[int]
    fim_reg: str
@dataclass
class DoacoesIdoso: # REG 92 - DOAÇÕES ESTATUTO DO IDOSO
    nr_reg: int
    nr_cpf: str
    in_tipo_fundo: str # N - Nacional; E- Estadual; M- Municipal
    sg_uf: str
    nm_municipio: str
    vr_doacao: float
    nr_cnpj_fundo: str
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class InformacoesComplementares: # REG 95 - TEXTO LIVRE
    nr_reg: int
    nr_cpf: str
    tx_informacao: str
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class RegistroTipoEncerramento: # REG T9 - ENCERRAMENTO DO ARQUIVO
    nr_reg: str
    nr_cpf: str
    qt_regs: int # Quantidade total de registros no arquivo
    nr_controle: Optional[int]
    fim_reg: str

@dataclass
class DeclaraoIRPF:
    header_ir: Optional[HeaderIR] = None
    identificacao_declarante: Optional[IdentificacaoDeclarante] = None
    demais_rendimentos_imposto_pago_simplificado: Optional[DemaisRendimentosImpostoPagoSimplificado] = None
    totais_calculados_declaracao_simplificado: Optional[TotaisCalculadosDeclaracaoSimplificado] = None
    completa_declaracao_desc_calculado: Optional[CompletaDeclaracaoDescCalculado] = None
    totais_declaracao_desc_calculado: Optional[TotaisDeclaracaoDescCalculado] = None
    rendimentos_pj: List[RendimentoPJ] = field(default_factory=list)
    rendimentos_pf_exterior_carne_leao: List[RendimentosPFExteriorCarneLeao] = field(default_factory=list)
    rendimentos_isentos: List[RendimentoIsento] = field(default_factory=list)
    rendimentos_sujeitos_tributacao_exclusiva: List[RendimentosSujeitosTributacaoExclusiva] = field(default_factory=list)
    dependentes: List[Dependentes] = field(default_factory=list)
    pagamentos_efetuados: List[PagamentosEfetuados] = field(default_factory=list)
    declaracao_bens_direitos: List[DeclaracaoBensDireitos] = field(default_factory=list)
    dividas_onus_reais: List[DividasOnusReais] = field(default_factory=list)
    rend_trib_recebidos_pj_dependentes: List[RendTribRecebidosPJDependentes] = field(default_factory=list)
    doacoes_partidos: List[DoacoesPartidos] = field(default_factory=list)
    alimentandos: List[Alimentando] = field(default_factory=list)
    rend_recebidos_acumuladamente_titular: List[RendRecebidosAcumuladamenteTitular] = field(default_factory=list)
    relacao_pensao_rra_titular: List[RelacaoPensaoRRATitular] = field(default_factory=list)
    rend_recebidos_acumuladamente_dependente: List[RendRecebidosAcumuladamenteDependente] = field(default_factory=list)
    relacao_pensao_rra_dependente: List[RelacaoPensaoRRADependente] = field(default_factory=list)
    lancamentos_pf_exterior_carne_leao: List[LancamentosPessoasFisicasExteriorCarneLeao] = field(default_factory=list)
    rend_trib_recebidos_pj_exigibilidade_suspensa_titular: List[RendTribRecebidosPJExigibilidadeSuspensaTitular] = field(default_factory=list)
    rend_trib_recebidos_pj_exigibilidade_suspensa_dependentes: List[RendTribRecebidosPJExigibilidadeSuspensaDependentes] = field(default_factory=list)
    rendimentos_isentos_tipo02: List[RendimentoIsentoTipo02] = field(default_factory=list)
    rendimentos_isentos_tipo03: List[RendimentoIsentoTipo03] = field(default_factory=list)
    rendimentos_isentos_tipo04: List[RendimentoIsentoTipo04] = field(default_factory=list)
    rendimentos_isentos_tipo05: List[RendimentoIsentoTipo05] = field(default_factory=list)
    rendimentos_isentos_tipo06: List[RendimentoIsentoTipo06] = field(default_factory=list)
    rendimento_exclusivo_tipo02: List[RendimentoExclusivoTipo02] = field(default_factory=list)
    rendimento_exclusivo_tipo03: List[RendimentoExclusivoTipo03] = field(default_factory=list)
    relacao_doacoes_efetuadas: List[RelacaoDoacoesEfetuadas] = field(default_factory=list)
    informacoes_inventariante: Optional[InformacoesInventariante] = None
    rendavar_fii_mensal: List[RendavarFiiMensal] = field(default_factory=list)
    rendavar_fii_anual: List[RendavarFiiAnual] = field(default_factory=list)
    doacoes_diretamente_declaracao: List[DoacoesDiretamenteDeclaracao] = field(default_factory=list)
    registro_encerramento: Optional[RegistroTipoEncerramento] = None
    atividade_rural_imoveis: List[AtividadeRuralImovel] = field(default_factory=list)
    atividade_rural_lancamentos: List[AtividadeRuralReceitaDespesa] = field(default_factory=list)
    atividade_rural_resumo: List[AtividadeRuralResumo] = field(default_factory=list)
    gcap_imoveis: List[GanhosCapitalImovel] = field(default_factory=list)
    gcap_moveis: List[GanhosCapitalMovel] = field(default_factory=list)
    gcap_participacoes: List[GanhosCapitalParticipacoes] = field(default_factory=list)
    gcap_moeda_estrangeira: List[GanhosCapitalMoedaEstrangeira] = field(default_factory=list)
    renda_variavel_mensal: List[RendaVariavelMensal] = field(default_factory=list)
    renda_variavel_anual: List[RendaVariavelAnual] = field(default_factory=list)
    identificacao_complementar: Optional[IdentificacaoComplementar] = None
    informacoes_inventariante: Optional[InformacoesInventariante] = None
    rendimentos_socio_empresa: List[RendimentoSocioEmpresa] = field(default_factory=list)
    impostos_pagos_controle: List[ImpostoPagoControle] = field(default_factory=list)
    informacoes_complementares: List[InformacoesComplementares] = field(default_factory=list)
    
    # Novos campos GCAP
    gcap_apuracao_movel: List[GcapApuracaoMovel] = field(default_factory=list)
    gcap_parcela_ambas: List[GcapParcelaAmbas] = field(default_factory=list)
    gcap_parcela_imovel: List[GcapParcelaImovel] = field(default_factory=list)
    gcap_parcela_movel: List[GcapParcelaMovel] = field(default_factory=list)
    gcap_custo_acao: List[GcapCustoAcao] = field(default_factory=list)
    gcap_moeda_especie: List[GcapMoedaEspecie] = field(default_factory=list)
    
    # Novos campos Doações e Trailer
    doacoes_idoso: List[DoacoesIdoso] = field(default_factory=list)
    
    rendimentos_pj: List[Any] = field(default_factory=list)
    rendimentos_pf_exterior_carne_leao: List[Any] = field(default_factory=list)
    # Gaveta para os dados da fazenda
    atividade_rural_apuracao: List[AtividadeRuralApuracao] = field(default_factory=list) # NOVA GAVETA
    totais_declaracao_desc_calculado: Any = None
    totais_calculados_declaracao_simplificado: Any = None
    # --- NOVOS CAMPOS: Registros faltantes ---
    final_espolio: Optional[FinalEspolio] = None # REG 38
    saida_definitiva: Optional[SaidaDefinitiva] = None # REG 39
    movimentacao_rebanho: List[MovimentacaoRebanho] = field(default_factory=list) # REG 53
    atividade_rural_bens: List[AtividadeRuralBens] = field(default_factory=list) # REG 54
    atividade_rural_dividas: List[AtividadeRuralDivida] = field(default_factory=list) # REG 55
    atividade_rural_exterior: List[AtividadeRuralExterior] = field(default_factory=list) # REG 56 Exterior
    proprietario_imovel_rural: List[ProprietarioImovelRural] = field(default_factory=list) # REG 57
    herdeiros: List[Herdeiros] = field(default_factory=list) # REG 58
    percentual_bem: List[PercentualBem] = field(default_factory=list) # REG 59
    gcap_consolidado: List[GcapConsolidado] = field(default_factory=list) # REG 60
    gcap_imovel_detalhado: List[GcapBemImovelDetalhado] = field(default_factory=list) # REG 61
    gcap_movel_detalhado: List[GcapBemMovelDetalhado] = field(default_factory=list) # REG 62
    gcap_participacao_societaria_detalhada: List[GcapParticipacaoSocietariaDetalhada] = field(default_factory=list) # REG 63
    gcap_declaracao_exterior: List[GcapDeclaracaoExterior] = field(default_factory=list) # REG 64
    gcap_adquirentes: List[GcapAdquirentes] = field(default_factory=list) # REG 65
    gcap_ampliacao_reforma: List[GcapAmpliacaoReforma] = field(default_factory=list) # REG 66
    gcap_ampliacao_exterior: List[GcapAmpliacaoExterior] = field(default_factory=list) # REG 67
    gcap_apuracao_imovel: List[GcapApuracaoImovel] = field(default_factory=list) # REG 68
    gcap_faixa_ganho: List[GcapFaixaGanho] = field(default_factory=list) # REG 75


# ==================================================================================================
# FUNÇÕES DE PARSEAMENTO PARA CADA TIPO DE REGISTRO
# ==================================================================================================

def parse_header_ir(line: str) -> HeaderIR:
    """Parses a line corresponding to REG IR - HEADER - IDENTIFICAÇÃO DA DECLARAÇÂO."""
    return HeaderIR(
        sistema=parse_field(line, 1, 8, 'C'),
        exercicio=parse_field(line, 9, 12, 'N'),
        ano_base=parse_field(line, 13, 16, 'N'),
        codigo_recnet=parse_field(line, 17, 20, 'N'),
        in_retificadora=parse_field(line, 21, 21, 'C'),
        nr_cpf=parse_field(line, 22, 32, 'C'),
        ni_filler=parse_field(line, 33, 35, 'C'),
        tipo_ni=parse_field(line, 36, 36, 'N'),
        nr_versao=parse_field(line, 37, 39, 'N'),
        nm_nome=parse_field(line, 40, 99, 'C'),
        sg_uf=parse_field(line, 100, 101, 'C'),
        nr_hash=parse_field(line, 102, 111, 'C'),
        in_certificavel=parse_field(line, 112, 112, 'N'),
        dt_nascim=parse_field(line, 113, 120, 'N'),
        in_completa=parse_field(line, 121, 121, 'C'),
        in_resultado_imposto=parse_field(line, 122, 122, 'C'),
        in_gerada=parse_field(line, 123, 123, 'C'),
        nr_recibo_ultima_dec_ex_atual=parse_field(line, 124, 133, 'C'),
        filler=parse_field(line, 134, 134, 'C'),
        nome_so=parse_field(line, 135, 148, 'C'),
        versao_so=parse_field(line, 149, 155, 'C'),
        versao_jvm=parse_field(line, 156, 164, 'C'),
        nr_recibo_declaracao_transmitida=parse_field(line, 165, 174, 'C'),
        cd_municip=parse_field(line, 175, 178, 'N'),
        nr_conj=parse_field(line, 179, 189, 'C'),
        in_obrigat_entrega=parse_field(line, 190, 190, 'C'),
        vr_impdevido=parse_field(line, 191, 203, 'Decimal', 2),
        nr_recibo_ultima_dec_ex_anterior=parse_field(line, 204, 213, 'C'),
        in_seguranca=parse_field(line, 214, 214, 'N'),
        in_imposto_pago=parse_field(line, 215, 216, 'N'),
        in_imposto_antecipado=parse_field(line, 217, 217, 'N'),
        in_muda_endereco=parse_field(line, 218, 218, 'N'),
        nr_cep=parse_field(line, 219, 226, 'N'),
        in_debito_primeira_quota=parse_field(line, 227, 227, 'N'),
        nr_banco=parse_field(line, 228, 230, 'N'),
        nr_agencia=parse_field(line, 231, 234, 'N'),
        in_sobrepartilha=parse_field(line, 235, 235, 'C'),
        data_transito_julgado_lavratura=parse_field(line, 236, 243, 'N'),
        vr_soma_imposto_pagar=parse_field(line, 244, 256, 'Decimal', 2),
        in_opcao_tributacao_beneficiario_um_rra=parse_field(line, 257, 257, 'C'),
        cpf_beneficiario_um_rra=parse_field(line, 258, 268, 'C'),
        in_opcao_tributacao_beneficiario_dois_rra=parse_field(line, 269, 269, 'C'),
        cpf_beneficiario_dois_rra=parse_field(line, 270, 280, 'C'),
        in_opcao_tributacao_beneficiario_tres_rra=parse_field(line, 281, 281, 'C'),
        cpf_beneficiario_tres_rra=parse_field(line, 282, 292, 'C'),
        in_opcao_tributacao_beneficiario_quatro_rra=parse_field(line, 293, 293, 'C'),
        cpf_beneficiario_quatro_rra=parse_field(line, 294, 304, 'C'),
        vr_doacao_eca=parse_field(line, 305, 317, 'Decimal', 2),
        vr_doacao_idoso=parse_field(line, 318, 330, 'Decimal', 2),
        nr_base_fonte_maior=parse_field(line, 331, 344, 'C'),
        nr_base_fonte_dois=parse_field(line, 345, 358, 'C'),
        nr_base_fonte_tres=parse_field(line, 359, 372, 'C'),
        nr_base_fonte_quatro=parse_field(line, 373, 386, 'C'),
        nr_cpf_depe_rend_maior=parse_field(line, 387, 397, 'C'),
        dt_nasc_depe_rend_maior=parse_field(line, 398, 405, 'N'),
        nr_cpf_depe_rend_dois=parse_field(line, 406, 416, 'C'),
        dt_nasc_depe_rend_dois=parse_field(line, 417, 424, 'N'),
        nr_cpf_depe_rend_tres=parse_field(line, 425, 435, 'C'),
        dt_nasc_depe_rend_tres=parse_field(line, 436, 443, 'N'),
        nr_cpf_depe_rend_quatro=parse_field(line, 444, 454, 'C'),
        dt_nasc_depe_rend_quatro=parse_field(line, 455, 462, 'N'),
        nr_cpf_depe_rend_cinco=parse_field(line, 463, 473, 'C'),
        dt_nasc_depe_rend_cinco=parse_field(line, 474, 481, 'N'),
        nr_cpf_depe_rend_seis=parse_field(line, 482, 492, 'C'),
        dt_nasc_depe_rend_seis=parse_field(line, 493, 500, 'N'),
        nr_base_benef_desp_med_maior=parse_field(line, 501, 514, 'C'),
        nr_base_benef_desp_med_dois=parse_field(line, 515, 528, 'C'),
        nr_cpf_dest_pensao_aliment_maior=parse_field(line, 529, 539, 'C'),
        nr_cpf_inventariante=parse_field(line, 540, 550, 'C'),
        nm_municipio=parse_field(line, 551, 590, 'C'),
        nm_contribuinte_header=parse_field(line, 591, 650, 'C'),
        filler_mac=parse_field(line, 651, 661, 'C'),
        endereco_mac=parse_field(line, 662, 673, 'C'),
        dt_cond_nao_residente=parse_field(line, 674, 681, 'N'),
        nr_cpf_procurador=parse_field(line, 682, 692, 'C'),
        in_crit_obrigat=parse_field(line, 693, 695, 'N'),
        vr_total_rendtrib_pfpj_titdep=parse_field(line, 696, 708, 'Decimal', 2),
        filler_confiabilidade=parse_field(line, 709, 719, 'C'),
        in_confiabilidade=parse_field(line, 720, 720, 'N'),
        tp_iniciada=parse_field(line, 721, 722, 'N'),
        in_transmitida=parse_field(line, 723, 724, 'N'),
        nr_cpf_transmissao=parse_field(line, 725, 735, 'C'),
        in_cpf_transmissao_perfil=parse_field(line, 736, 736, 'N'),
        vr_totisentos=parse_field(line, 737, 749, 'Decimal', 2),
        vr_totexclusivo=parse_field(line, 750, 762, 'Decimal', 2),
        vr_total_pagamentos=parse_field(line, 763, 775, 'Decimal', 2),
        filler_dv=parse_field(line, 776, 788, 'C'),
        nr_dv_conta=parse_field(line, 789, 790, 'C'),
        in_dv_conta=parse_field(line, 791, 791, 'N'),
        cd_natur=parse_field(line, 792, 793, 'N'),
        nr_cpf_empregada_domestica_maior=parse_field(line, 794, 804, 'C'),
        nr_nit_emp_dom_maior=parse_field(line, 805, 815, 'C'),
        nr_cpf_empregada_domestica_dois=parse_field(line, 816, 826, 'C'),
        nr_nit_emp_dom_dois=parse_field(line, 827, 837, 'C'),
        nr_cpf_empregada_domestica_tres=parse_field(line, 838, 848, 'C'),
        nr_nit_emp_dom_tres=parse_field(line, 849, 859, 'C'),
        filler_utilizacao=parse_field(line, 860, 860, 'C'),
        in_utilizou_pgd=parse_field(line, 861, 861, 'N'),
        in_utilizou_app=parse_field(line, 862, 862, 'N'),
        in_utilizou_online=parse_field(line, 863, 863, 'N'),
        in_utilizou_rascunho=parse_field(line, 864, 864, 'N'),
        in_utilizou_pre_preenchida=parse_field(line, 865, 865, 'N'),
        in_utilizou_assistida_fonte_pagadora=parse_field(line, 866, 866, 'N'),
        in_utilizou_assistida_plano_saude=parse_field(line, 867, 867, 'N'),
        in_utilizou_salvar_recuperar_online=parse_field(line, 868, 868, 'N'),
        filler_pagamentos_dedutiveis=parse_field(line, 869, 869, 'C'),
        nr_pagamento_dedutivel_maior_um=parse_field(line, 870, 883, 'C'),
        nr_pagamento_dedutivel_maior_dois=parse_field(line, 884, 897, 'C'),
        nr_pagamento_dedutivel_maior_tres=parse_field(line, 898, 911, 'C'),
        nr_pagamento_dedutivel_maior_quatro=parse_field(line, 912, 925, 'C'),
        nr_pagamento_dedutivel_maior_cinco=parse_field(line, 926, 939, 'C'),
        nr_pagamento_dedutivel_maior_seis=parse_field(line, 940, 953, 'C'),
        filler_cnpj_funpresp=parse_field(line, 954, 967, 'C'),
        nr_titeleitor=parse_field(line, 968, 980, 'C'),
        in_tipo_conta=parse_field(line, 981, 981, 'N'),
        nr_conta=parse_field(line, 982, 1001, 'C'),
        in_social=parse_field(line, 1002, 1002, 'N'),
        in_clweb=parse_field(line, 1003, 1003, 'N'),
        in_isencao_gcap_titular=parse_field(line, 1004, 1004, 'N'),
        in_isencao_gcap_maior=parse_field(line, 1005, 1005, 'N'),
        in_isencao_gcap_dois=parse_field(line, 1006, 1006, 'N'),
        in_isencao_gcap_tres=parse_field(line, 1007, 1007, 'N'),
        in_isencao_gcap_quatro=parse_field(line, 1008, 1008, 'N'),
        in_isencao_gcap_cinco=parse_field(line, 1009, 1009, 'N'),
        in_isencao_gcap_seis=parse_field(line, 1010, 1010, 'N'),
        in_ficha_1=parse_field(line, 1011, 1012, 'N'),
        in_cod_ficha_1=parse_field(line, 1013, 1014, 'N'),
        cnpj_maior_valor_1=parse_field(line, 1015, 1028, 'C'),
        in_ficha_2=parse_field(line, 1029, 1030, 'N'),
        in_cod_ficha_2=parse_field(line, 1031, 1032, 'N'),
        cnpj_maior_valor_2=parse_field(line, 1033, 1046, 'C'),
        in_ficha_3=parse_field(line, 1047, 1048, 'N'),
        in_cod_ficha_3=parse_field(line, 1049, 1050, 'N'),
        cnpj_maior_valor_3=parse_field(line, 1051, 1064, 'C'),
        in_ficha_4=parse_field(line, 1065, 1066, 'N'),
        in_cod_ficha_4=parse_field(line, 1067, 1068, 'N'),
        cnpj_maior_valor_4=parse_field(line, 1069, 1082, 'C'),
        in_ficha_5=parse_field(line, 1083, 1084, 'N'),
        in_cod_ficha_5=parse_field(line, 1085, 1086, 'N'),
        cnpj_maior_valor_5=parse_field(line, 1087, 1100, 'C'),
        in_ficha_6=parse_field(line, 1101, 1102, 'N'),
        in_cod_ficha_6=parse_field(line, 1103, 1104, 'N'),
        cnpj_maior_valor_6=parse_field(line, 1105, 1118, 'C'),
        in_ficha_7=parse_field(line, 1119, 1120, 'N'),
        in_cod_ficha_7=parse_field(line, 1121, 1122, 'N'),
        cnpj_maior_valor_7=parse_field(line, 1123, 1136, 'C'),
        in_ficha_8=parse_field(line, 1137, 1138, 'N'),
        in_cod_ficha_8=parse_field(line, 1139, 1140, 'N'),
        cnpj_maior_valor_8=parse_field(line, 1141, 1154, 'C'),
        in_ficha_9=parse_field(line, 1155, 1156, 'N'),
        in_cod_ficha_9=parse_field(line, 1157, 1158, 'N'),
        cnpj_maior_valor_9=parse_field(line, 1159, 1172, 'C'),
        in_ficha_10=parse_field(line, 1173, 1174, 'N'),
        in_cod_ficha_10=parse_field(line, 1175, 1176, 'N'),
        cnpj_maior_valor_10=parse_field(line, 1177, 1190, 'C'),
        versaotestepgd=parse_field(line, 1191, 1193, 'C'),
        nr_controle=parse_field(line, 1194, 1203, 'N'),
        fim_reg=line[1203:].strip()
    )

def parse_identificacao_declarante(line: str) -> IdentificacaoDeclarante:
    """Parses a line corresponding to REG 16 - IDENTIFICAÇÃO DO DECLARANTE."""
    return IdentificacaoDeclarante(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nm_nome=parse_field(line, 14, 73, 'C'),
        tip_logra=parse_field(line, 74, 88, 'C'),
        nm_logra=parse_field(line, 89, 128, 'C'),
        nr_numero=parse_field(line, 129, 134, 'C'),
        nm_complem=parse_field(line, 135, 155, 'C'),
        nm_bairro=parse_field(line, 156, 174, 'C'),
        nr_cep=parse_field(line, 175, 183, 'C'),
        cd_municip=parse_field(line, 184, 187, 'N'),
        nm_municip=parse_field(line, 188, 227, 'C'),
        sg_uf=parse_field(line, 228, 229, 'C'),
        cd_ex=parse_field(line, 230, 232, 'C'),
        cd_pais=parse_field(line, 233, 235, 'C'),
        nm_email=parse_field(line, 236, 325, 'C'),
        nr_nitpispasep=parse_field(line, 326, 336, 'C'),
        nr_cpf_conjuge=parse_field(line, 337, 347, 'C'),
        nr_ddd_telefone=parse_field(line, 348, 351, 'C'),
        filler_ddd=parse_field(line, 352, 360, 'C'),
        dt_nascim=parse_field(line, 361, 368, 'N'),
        nr_titeleitor=parse_field(line, 369, 381, 'C'),
        cd_ocup=parse_field(line, 382, 384, 'C'),
        cd_natur=parse_field(line, 385, 386, 'C'),
        nr_quotas=parse_field(line, 387, 387, 'N'),
        in_completa=parse_field(line, 388, 388, 'C'),
        in_retificadora=parse_field(line, 389, 389, 'C'),
        in_gerado=parse_field(line, 390, 390, 'C'),
        in_endereco=parse_field(line, 391, 391, 'C'),
        nr_controle_original=parse_field(line, 392, 403, 'C'),
        nr_banco=parse_field(line, 404, 406, 'N'),
        nr_agencia=parse_field(line, 407, 410, 'N'),
        in_doenca_deficiencia=parse_field(line, 411, 411, 'C'),
        in_prepreenchida=parse_field(line, 412, 412, 'N'),
        dt_dia_util_recibo=parse_field(line, 413, 420, 'N'),
        filler_dia_util=parse_field(line, 421, 425, 'C'),
        nr_dv_conta=parse_field(line, 426, 427, 'C'),
        in_debito_autom=parse_field(line, 428, 428, 'N'),
        in_debito_primeira_quota=parse_field(line, 429, 429, 'N'),
        nr_fonte_principal=parse_field(line, 430, 443, 'C'),
        nr_recibo_ultima_dec_ano_anterior=parse_field(line, 444, 453, 'C'),
        in_tipodeclaracao=parse_field(line, 454, 454, 'C'),
        nr_cpf_procurador=parse_field(line, 455, 465, 'C'),
        nr_registro_profissional=parse_field(line, 466, 485, 'C'),
        nr_ddd_celular=parse_field(line, 486, 487, 'C'),
        nr_celular=parse_field(line, 488, 496, 'C'),
        in_conjuge=parse_field(line, 497, 497, 'C'),
        nr_telefone=parse_field(line, 498, 508, 'C'),
        in_tipo_conta=parse_field(line, 509, 509, 'N'),
        nr_conta=parse_field(line, 510, 529, 'C'),
        in_social=parse_field(line, 530, 530, 'C'),
        in_clweb=parse_field(line, 531, 531, 'C'),
        nr_numero_processo=parse_field(line, 532, 546, 'C'),
        cpf_responsavel=parse_field(line, 547, 557, 'C'),
        nr_data_original_retificadora=parse_field(line, 558, 565, 'N'),
        nr_hora_original_retificadora=parse_field(line, 566, 571, 'N'),
        tx_mensagem_recibo=parse_field(line, 572, 871, 'C'),
        nr_controle=parse_field(line, 872, 881, 'N'),
        fim_reg=line[881:].strip()
    )

def parse_identificacao_complementar(line: str) -> IdentificacaoComplementar:
    """Parses a line corresponding to REG 01 - IDENTIFICAÇÃO COMPLEMENTAR DO DECLARANTE."""
    return IdentificacaoComplementar(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nm_logradouro=parse_field(line, 14, 53, 'C'),
        nr_logradouro=parse_field(line, 54, 59, 'C'),
        nm_complemento=parse_field(line, 60, 79, 'C'),
        nm_bairro=parse_field(line, 80, 99, 'C'),
        nr_cep=parse_field(line, 100, 107, 'C'),
        nm_municipio=parse_field(line, 108, 147, 'C'),
        sg_uf=parse_field(line, 148, 149, 'C'),
        nr_telefone=parse_field(line, 150, 160, 'C'),
        nr_titulo_eleitor=parse_field(line, 161, 173, 'C'),
        cd_natureza_ocupacao=parse_field(line, 174, 176, 'N'),
        cd_ocupacao_principal=parse_field(line, 177, 179, 'N'),
        nr_controle=parse_field(line, 180, 189, 'N'),
        fim_reg=line[189:].strip()
    )

def parse_demais_rendimentos_imposto_pago_simplificado(line: str) -> DemaisRendimentosImpostoPagoSimplificado:
    """Parses a line corresponding to REG 17 - DEMAIS RENDIMENTOS E IMPOSTO PAGO (DESCONTO SIMPLIFICADO)."""
    return DemaisRendimentosImpostoPagoSimplificado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_impcomp=parse_field(line, 14, 26, 'Decimal', 2),
        vr_lucrostit=parse_field(line, 27, 39, 'Decimal', 2),
        vr_isentos=parse_field(line, 40, 52, 'Decimal', 2),
        vr_exclusivos=parse_field(line, 53, 65, 'Decimal', 2),
        vr_total13=parse_field(line, 66, 78, 'Decimal', 2),
        vr_irfontelei11033=parse_field(line, 79, 91, 'Decimal', 2),
        vr_total13depend=parse_field(line, 92, 104, 'Decimal', 2),
        vr_lucrosdepend=parse_field(line, 105, 117, 'Decimal', 2),
        vr_isentosdepend=parse_field(line, 118, 130, 'Decimal', 2),
        vr_exclusivosdepend=parse_field(line, 131, 143, 'Decimal', 2),
        filler_impcomp_depend=parse_field(line, 144, 156, 'C'),
        filler_irf_depend=parse_field(line, 157, 169, 'C'),
        vr_rendpf_tit=parse_field(line, 170, 182, 'Decimal', 2),
        vr_rendpf_depend=parse_field(line, 183, 195, 'Decimal', 2),
        vr_rendext_tit=parse_field(line, 196, 208, 'Decimal', 2),
        vr_rendext_depend=parse_field(line, 209, 221, 'Decimal', 2),
        vr_carneleao_tit=parse_field(line, 222, 234, 'Decimal', 2),
        vr_carneleao_depend=parse_field(line, 235, 247, 'Decimal', 2),
        vr_depen=parse_field(line, 248, 260, 'Decimal', 2),
        vr_tot_prevofc_ac_tit=parse_field(line, 261, 273, 'Decimal', 2),
        vr_tot_prevofc_ac_dep=parse_field(line, 274, 286, 'Decimal', 2),
        vr_tot_pensali_ac_tit=parse_field(line, 287, 299, 'Decimal', 2),
        vr_tot_pensali_ac_dep=parse_field(line, 300, 312, 'Decimal', 2),
        vr_impext=parse_field(line, 313, 325, 'Decimal', 2),
        vr_impdevido_sem_rend_ext=parse_field(line, 326, 338, 'Decimal', 2),
        vr_limite_imp_pago_ext=parse_field(line, 339, 351, 'Decimal', 2),
        nr_controle=parse_field(line, 352, 361, 'N'),
        fim_reg=line[361:].strip()
    )

def parse_totais_calculados_declaracao_simplificado(line: str) -> TotaisCalculadosDeclaracaoSimplificado:
    """Parses a line corresponding to REG 18 - TOTAIS CALCULADOS DA DECLARAÇÂO COM DESC. SIMPLIFICADO."""
    return TotaisCalculadosDeclaracaoSimplificado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_rendtrib=parse_field(line, 14, 26, 'Decimal', 2),
        vr_descsimp=parse_field(line, 27, 39, 'Decimal', 2),
        vr_basecalc=parse_field(line, 40, 52, 'Decimal', 2),
        vr_impdevido=parse_field(line, 53, 65, 'Decimal', 2),
        vr_imposto=parse_field(line, 66, 78, 'Decimal', 2),
        vr_impcomp=parse_field(line, 79, 91, 'Decimal', 2),
        vr_leao=parse_field(line, 92, 104, 'Decimal', 2),
        vr_irfontelei11033=parse_field(line, 105, 117, 'Decimal', 2),
        vr_imprestit=parse_field(line, 118, 130, 'Decimal', 2),
        vr_imppagar=parse_field(line, 131, 143, 'Decimal', 2),
        nr_quotas=parse_field(line, 144, 144, 'N'),
        vr_quota=parse_field(line, 145, 157, 'Decimal', 2),
        vr_totisento=parse_field(line, 158, 170, 'Decimal', 2),
        vr_totexclusivo=parse_field(line, 171, 183, 'Decimal', 2),
        filler=parse_field(line, 184, 196, 'C'),
        vr_rendtribdependente=parse_field(line, 197, 209, 'Decimal', 2),
        vr_impostodependente=parse_field(line, 210, 222, 'Decimal', 2),
        vr_imppagarespecie=parse_field(line, 223, 235, 'Decimal', 2),
        vr_totrendtribpjtitular=parse_field(line, 236, 248, 'Decimal', 2),
        vr_rendtribarural=parse_field(line, 249, 261, 'Decimal', 2),
        vr_totfontetitular=parse_field(line, 262, 274, 'Decimal', 2),
        vr_totbensanobaseanterior=parse_field(line, 275, 287, 'Decimal', 2),
        vr_totbensanobase=parse_field(line, 288, 300, 'Decimal', 2),
        vr_rendisentotitular=parse_field(line, 301, 313, 'Decimal', 2),
        vr_rendisentodependentes=parse_field(line, 314, 326, 'Decimal', 2),
        vr_totrendexclustitular=parse_field(line, 327, 339, 'Decimal', 2),
        vr_rendexclusdependentes=parse_field(line, 340, 352, 'Decimal', 2),
        vr_resnaotrib_ar=parse_field(line, 353, 365, 'Decimal', 2),
        vr_totdividaanobaseanterior=parse_field(line, 366, 378, 'Decimal', 2),
        vr_totdividaanobase=parse_field(line, 379, 391, 'Decimal', 2),
        vr_totirfontelei11033=parse_field(line, 392, 404, 'Decimal', 2),
        vr_subtotalisentotransporte=parse_field(line, 405, 417, 'Decimal', 2),
        vr_subtotalexclusivotransporte=parse_field(line, 418, 430, 'Decimal', 2),
        vr_ganholiquidorvtransporte=parse_field(line, 431, 443, 'Decimal', 2),
        vr_rendisentogctransporte=parse_field(line, 444, 456, 'Decimal', 2),
        vr_rendpfext=parse_field(line, 457, 469, 'Decimal', 2),
        vr_rendpfextdepen=parse_field(line, 470, 482, 'Decimal', 2),
        vr_totdoacoesampanha=parse_field(line, 483, 495, 'Decimal', 2),
        vr_totrendpj_exib_susptitular=parse_field(line, 496, 508, 'Decimal', 2),
        vr_totrendpj_exib_suspdependen=parse_field(line, 509, 521, 'Decimal', 2),
        vr_totdepjudic_titular=parse_field(line, 522, 534, 'Decimal', 2),
        vr_totdepjudic_dependen=parse_field(line, 535, 547, 'Decimal', 2),
        vr_totrend_ac_tit=parse_field(line, 548, 560, 'Decimal', 2),
        vr_tot_irf_ac_tit=parse_field(line, 561, 573, 'Decimal', 2),
        vr_tot_imposto_rra_tit=parse_field(line, 574, 586, 'Decimal', 2),
        vr_totrend_ac_dep=parse_field(line, 587, 599, 'Decimal', 2),
        vr_tot_irf_ac_dep=parse_field(line, 600, 612, 'Decimal', 2),
        vr_tot_imposto_rra_dep=parse_field(line, 613, 625, 'Decimal', 2),
        vr_tot_imposto_devido=parse_field(line, 626, 638, 'Decimal', 2),
        vr_imposto_diferido_gcap=parse_field(line, 639, 651, 'Decimal', 2),
        vr_imposto_devido_gcap=parse_field(line, 652, 664, 'Decimal', 2),
        vr_imposto_ganholiq_rvar=parse_field(line, 665, 677, 'Decimal', 2),
        vr_imposto_devido_gcme=parse_field(line, 678, 690, 'Decimal', 2),
        vr_impext=parse_field(line, 691, 703, 'Decimal', 2),
        vr_aliquota_efetiva=parse_field(line, 704, 708, 'Decimal', 2), # Note: 5 length, 2 decimal places in layout
        nr_controle=parse_field(line, 709, 718, 'N'),
        fim_reg=line[718:].strip()
    )

def parse_completa_declaracao_desc_calculado(line: str) -> CompletaDeclaracaoDescCalculado:
    """Parses a line corresponding to REG 19 - COMPLETA - DECLARAÇÃO COM DESC. CALCULADO."""
    return CompletaDeclaracaoDescCalculado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_fonte=parse_field(line, 14, 27, 'C'),
        vr_impext=parse_field(line, 28, 40, 'Decimal', 2),
        vr_impcomp=parse_field(line, 41, 53, 'Decimal', 2),
        vr_irfontelei11033=parse_field(line, 54, 66, 'Decimal', 2),
        vr_recex_tit=parse_field(line, 67, 79, 'Decimal', 2),
        vr_livcaix_tit=parse_field(line, 80, 92, 'Decimal', 2),
        vr_carneleao_tit=parse_field(line, 93, 105, 'Decimal', 2),
        vr_recex_dep=parse_field(line, 106, 118, 'Decimal', 2),
        vr_livcaix_dep=parse_field(line, 119, 131, 'Decimal', 2),
        vr_carneleao_dep=parse_field(line, 132, 144, 'Decimal', 2),
        vr_prevpriv=parse_field(line, 145, 157, 'Decimal', 2),
        vr_fapi=parse_field(line, 158, 170, 'Decimal', 2),
        vr_prevofitular=parse_field(line, 171, 183, 'Decimal', 2),
        vr_prevofdependente=parse_field(line, 184, 196, 'Decimal', 2),
        vr_total13titular=parse_field(line, 197, 209, 'Decimal', 2),
        vr_total13dependente=parse_field(line, 210, 222, 'Decimal', 2),
        nr_dependente_desp_instrucao=parse_field(line, 223, 227, 'N'),
        nr_alimentando_desp_instrucao=parse_field(line, 228, 232, 'N'),
        vr_rendpf_tit=parse_field(line, 233, 245, 'Decimal', 2),
        vr_rendpf_depend=parse_field(line, 246, 258, 'Decimal', 2),
        vr_rendext_tit=parse_field(line, 259, 271, 'Decimal', 2),
        vr_rendext_depend=parse_field(line, 272, 284, 'Decimal', 2),
        vr_impdevido_sem_rend_ext=parse_field(line, 285, 297, 'Decimal', 2),
        vr_limite_imp_pago_ext=parse_field(line, 298, 310, 'Decimal', 2),
        vr_ate_limite_funpresp=parse_field(line, 311, 323, 'Decimal', 2),
        vr_acima_limite_funpresp=parse_field(line, 324, 336, 'Decimal', 2),
        nr_controle=parse_field(line, 337, 346, 'N'),
        fim_reg=line[346:].strip()
    )

def parse_totais_declaracao_desc_calculado(line: str) -> TotaisDeclaracaoDescCalculado:
    """Parses a line corresponding to REG 20 - TOTAIS DA DECLARAÇÂO COM DESC. CALCULADO."""
    return TotaisDeclaracaoDescCalculado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_rendjur=parse_field(line, 14, 26, 'Decimal', 2),
        vr_rendpfext=parse_field(line, 27, 39, 'Decimal', 2),
        vr_rendpfextdepen=parse_field(line, 40, 52, 'Decimal', 2),
        vr_resar=parse_field(line, 53, 65, 'Decimal', 2),
        vr_tottrib=parse_field(line, 66, 78, 'Decimal', 2),
        vr_prevof_funpresp_limite=parse_field(line, 79, 91, 'Decimal', 2),
        vr_totprivada_fapi_funpresp=parse_field(line, 92, 104, 'Decimal', 2),
        vr_depen=parse_field(line, 105, 117, 'Decimal', 2),
        vr_despinst=parse_field(line, 118, 130, 'Decimal', 2),
        vr_despmedic=parse_field(line, 131, 143, 'Decimal', 2),
        vr_pensao=parse_field(line, 144, 156, 'Decimal', 2),
        vr_pensao_cartorio=parse_field(line, 157, 169, 'Decimal', 2),
        vr_livcaix=parse_field(line, 170, 182, 'Decimal', 2),
        vr_deduc=parse_field(line, 183, 195, 'Decimal', 2),
        vr_basecalc=parse_field(line, 196, 208, 'Decimal', 2),
        vr_imposto=parse_field(line, 209, 221, 'Decimal', 2),
        vr_dedimposto=parse_field(line, 222, 234, 'Decimal', 2),
        vr_impdev1=parse_field(line, 235, 247, 'Decimal', 2),
        vr_contribprev=parse_field(line, 248, 260, 'Decimal', 2),
        vr_impdev2=parse_field(line, 261, 273, 'Decimal', 2),
        vr_impdev3=parse_field(line, 274, 286, 'Decimal', 2),
        vr_impfonte=parse_field(line, 287, 299, 'Decimal', 2),
        vr_carneleao=parse_field(line, 300, 312, 'Decimal', 2),
        vr_impcompl=parse_field(line, 313, 325, 'Decimal', 2),
        vr_impext=parse_field(line, 326, 338, 'Decimal', 2),
        vr_irfontelei11033=parse_field(line, 339, 351, 'Decimal', 2),
        vr_totimppago=parse_field(line, 352, 364, 'Decimal', 2),
        vr_imprest=parse_field(line, 365, 377, 'Decimal', 2),
        vr_imppagar=parse_field(line, 378, 390, 'Decimal', 2),
        nr_quotas=parse_field(line, 391, 391, 'N'),
        vr_quota=parse_field(line, 392, 404, 'Decimal', 2),
        vr_bensant=parse_field(line, 405, 417, 'Decimal', 2),
        vr_bensatual=parse_field(line, 418, 430, 'Decimal', 2),
        vr_dividaant=parse_field(line, 431, 443, 'Decimal', 2),
        vr_dividaatual=parse_field(line, 444, 456, 'Decimal', 2),
        filler=parse_field(line, 457, 469, 'C'),
        vr_totisentos=parse_field(line, 470, 482, 'Decimal', 2),
        vr_totexclus=parse_field(line, 483, 495, 'Decimal', 2),
        vr_imgc=parse_field(line, 496, 508, 'Decimal', 2),
        vr_totirfontelei11033=parse_field(line, 509, 521, 'Decimal', 2),
        vr_imprv=parse_field(line, 522, 534, 'Decimal', 2),
        vr_rendjurdependente=parse_field(line, 535, 547, 'Decimal', 2),
        vr_impfontedependente=parse_field(line, 548, 560, 'Decimal', 2),
        vr_imppagovcbens=parse_field(line, 561, 573, 'Decimal', 2),
        vr_imppagovcespecie=parse_field(line, 574, 586, 'Decimal', 2),
        vr_totrendisentositular=parse_field(line, 587, 599, 'Decimal', 2),
        vr_totrendisentosdependente=parse_field(line, 600, 612, 'Decimal', 2),
        vr_totrendexcltitular=parse_field(line, 613, 625, 'Decimal', 2),
        vr_totrendexcldependente=parse_field(line, 626, 638, 'Decimal', 2),
        vr_totdoacoesampanha=parse_field(line, 639, 651, 'Decimal', 2),
        vr_totrendpj_exib_susptitular=parse_field(line, 652, 664, 'Decimal', 2),
        vr_totrendpj_exib_suspdependen=parse_field(line, 665, 677, 'Decimal', 2),
        vr_totdepjudic_titular=parse_field(line, 678, 690, 'Decimal', 2),
        vr_totdepjudic_dependen=parse_field(line, 691, 703, 'Decimal', 2),
        vr_totrend_ac_tit=parse_field(line, 704, 716, 'Decimal', 2),
        vr_tot_prevofc_ac_tit=parse_field(line, 717, 729, 'Decimal', 2),
        vr_tot_pensali_ac_tit=parse_field(line, 730, 742, 'Decimal', 2),
        vr_tot_irf_ac_tit=parse_field(line, 743, 755, 'Decimal', 2),
        vr_tot_imposto_rra_tit=parse_field(line, 756, 768, 'Decimal', 2),
        vr_totrend_ac_dep=parse_field(line, 769, 781, 'Decimal', 2),
        vr_tot_prevofc_ac_dep=parse_field(line, 782, 794, 'Decimal', 2),
        vr_tot_pensali_ac_dep=parse_field(line, 795, 807, 'Decimal', 2),
        vr_tot_irf_ac_dep=parse_field(line, 808, 820, 'Decimal', 2),
        vr_tot_imposto_rra_dep=parse_field(line, 821, 833, 'Decimal', 2),
        vr_imposto_diferido_gcap=parse_field(line, 834, 846, 'Decimal', 2),
        vr_imposto_devido_gcap=parse_field(line, 847, 859, 'Decimal', 2),
        vr_imposto_ganholiq_rvar=parse_field(line, 860, 872, 'Decimal', 2),
        vr_imposto_devido_gcme=parse_field(line, 873, 885, 'Decimal', 2),
        vr_aliquota_efetiva=parse_field(line, 886, 890, 'Decimal', 2), # Note: 5 length, 2 decimal places in layout
        nr_controle=parse_field(line, 891, 900, 'N'),
        fim_reg=line[900:].strip()
    )

def parse_rendimento_pj(line: str) -> RendimentoPJ:
    """Parses a line corresponding to REG 21 - RENDIMENTOS TRIBUTÁVEIS RECEBIDOS DE PESSOAS JURÍDICAS."""
    return RendimentoPJ(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_pagador=parse_field(line, 14, 27, 'C'),
        nm_pagador=parse_field(line, 28, 87, 'C'),
        vr_rendto=parse_field(line, 88, 100, 'Decimal', 2),
        vr_contrib=parse_field(line, 101, 113, 'Decimal', 2),
        vr_decterc=parse_field(line, 114, 126, 'Decimal', 2),
        vr_imposto=parse_field(line, 127, 139, 'Decimal', 2),
        dt_comunicacao_saida=parse_field(line, 140, 147, 'N'),
        vr_irrf13salario=parse_field(line, 148, 160, 'Decimal', 2),
        nr_controle=parse_field(line, 161, 170, 'N'),
        fim_reg=line[170:].strip()
    )

def parse_rendimentos_pf_exterior_carne_leao(line: str) -> RendimentosPFExteriorCarneLeao:
    """Parses a line corresponding to REG 22 - REND. TRIB. RECEBIDOS DE PESSOAS FÍSICAS, EXTERIOR E CARNÊ-LEÃO."""
    return RendimentosPFExteriorCarneLeao(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        e_dependente=parse_field(line, 14, 14, 'C'),
        nr_cpf_depen=parse_field(line, 15, 25, 'C'),
        nr_mes=parse_field(line, 26, 27, 'N'),
        vr_rendto=parse_field(line, 28, 40, 'Decimal', 2),
        vr_alugueis=parse_field(line, 41, 53, 'Decimal', 2),
        vr_outros=parse_field(line, 54, 66, 'Decimal', 2),
        vr_exter=parse_field(line, 67, 79, 'Decimal', 2),
        vr_livcaix=parse_field(line, 80, 92, 'Decimal', 2),
        vr_aliment=parse_field(line, 93, 105, 'Decimal', 2),
        vr_deduc=parse_field(line, 106, 118, 'Decimal', 2),
        vr_previd=parse_field(line, 119, 131, 'Decimal', 2),
        vr_basecalculo=parse_field(line, 132, 144, 'Decimal', 2),
        vr_imposto=parse_field(line, 145, 157, 'Decimal', 2),
        nr_controle=parse_field(line, 158, 167, 'N'),
        fim_reg=line[167:].strip()
    )

def parse_rendimento_isento(line: str) -> RendimentoIsento:
    """Parses a line corresponding to REG 23 - RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS."""
    return RendimentoIsento(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cod_isento=parse_field(line, 14, 17, 'N'),
        vr_valor=parse_field(line, 18, 30, 'Decimal', 2),
        nr_controle=parse_field(line, 31, 40, 'N'),
        fim_reg=line[40:].strip()
    )

def parse_rendimentos_sujeitos_tributacao_exclusiva(line: str) -> RendimentosSujeitosTributacaoExclusiva:
    """Parses a line corresponding to REG 24 - RENDIMENTOS SUJEITOS A TRIBUTAÇÂO EXCLUSIVA."""
    return RendimentosSujeitosTributacaoExclusiva(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cod_exclusivo=parse_field(line, 14, 17, 'N'),
        vr_valor=parse_field(line, 18, 30, 'Decimal', 2),
        nr_controle=parse_field(line, 31, 40, 'N'),
        fim_reg=line[40:].strip()
    )

def parse_dependentes(line: str) -> Dependentes:
    """Parses a line corresponding to REG 25 - DEPENDENTES."""
    return Dependentes(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_chave=parse_field(line, 14, 18, 'N'),
        cd_depend=parse_field(line, 19, 20, 'N'),
        nm_depend=parse_field(line, 21, 80, 'C'),
        dt_nascim=parse_field(line, 81, 88, 'N'),
        ni_depend=parse_field(line, 89, 99, 'C'),
        in_saida=parse_field(line, 100, 100, 'N'),
        nr_nitpispasep=parse_field(line, 101, 111, 'C'),
        in_endereco_titular=parse_field(line, 112, 112, 'N'),
        nm_email=parse_field(line, 113, 202, 'C'),
        nr_ddd_celular=parse_field(line, 203, 204, 'C'),
        nr_celular=parse_field(line, 205, 213, 'C'),
        nr_controle=parse_field(line, 214, 223, 'N'),
        fim_reg=line[223:].strip()
    )

def parse_pagamentos_efetuados(line: str) -> PagamentosEfetuados:
    """Parses a line corresponding to REG 26 - RELAÇÃO DE PAGAMENTOS EFETUADOS."""
    return PagamentosEfetuados(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_pagto=parse_field(line, 14, 15, 'N'),
        nr_chave_depend=parse_field(line, 16, 20, 'N'),
        nr_benef=parse_field(line, 21, 34, 'C'),
        nm_benef=parse_field(line, 35, 94, 'C'),
        nr_nit_emp_dom=parse_field(line, 95, 105, 'C'),
        vr_pagto=parse_field(line, 106, 118, 'Decimal', 2),
        vr_reduc=parse_field(line, 119, 131, 'Decimal', 2),
        vr_efpc=parse_field(line, 132, 144, 'Decimal', 2),
        in_tipo_cpf_cnpj=parse_field(line, 145, 145, 'N'),
        in_tipo_pgto=parse_field(line, 146, 146, 'C'),
        nm_descricao=parse_field(line, 147, 658, 'C'),
        nr_controle=parse_field(line, 659, 668, 'N'),
        fim_reg=line[668:].strip()
    )

def parse_declaracao_bens_direitos(line: str) -> DeclaracaoBensDireitos:
    """Parses a line corresponding to REG 27 - DECLARAÇÃO DE BENS E DIREITOS."""
    return DeclaracaoBensDireitos(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_bem=parse_field(line, 14, 15, 'N'),
        in_exterior=parse_field(line, 16, 16, 'N'),
        cd_pais=parse_field(line, 17, 19, 'N'),
        tx_bem=parse_field(line, 20, 531, 'C'),
        vr_anter=parse_field(line, 532, 544, 'Decimal', 2),
        vr_atual=parse_field(line, 545, 557, 'Decimal', 2),
        nm_logra=parse_field(line, 558, 597, 'C'),
        nr_numero=parse_field(line, 598, 603, 'C'),
        nm_complem=parse_field(line, 604, 643, 'C'),
        nm_bairro=parse_field(line, 644, 683, 'C'),
        nr_cep=parse_field(line, 684, 692, 'C'),
        sg_uf=parse_field(line, 693, 694, 'C'),
        cd_municip=parse_field(line, 695, 698, 'N'),
        nm_municip=parse_field(line, 699, 738, 'C'),
        nm_ind_reg_imov=parse_field(line, 739, 739, 'N'),
        matric_imov=parse_field(line, 740, 779, 'C'),
        filler=parse_field(line, 780, 819, 'C'),
        area=parse_field(line, 820, 830, 'Decimal', 2),
        nm_unid=parse_field(line, 831, 831, 'N'),
        nm_cartorio=parse_field(line, 832, 891, 'C'),
        nr_chave_bem=parse_field(line, 892, 896, 'C'), # Originalmente N, mas chaves podem ter letras? Deixando como C por segurança
        dt_aquisicao=parse_field(line, 897, 904, 'N'),
        filler_reserva=parse_field(line, 905, 924, 'C'),
        filler_renavan=parse_field(line, 925, 932, 'C'),
        nr_renavan=parse_field(line, 933, 962, 'C'),
        nr_dep_aviaca_civil=parse_field(line, 963, 992, 'C'),
        nr_capitania_portos=parse_field(line, 993, 1022, 'C'),
        nr_agencia=parse_field(line, 1023, 1026, 'N'),
        filler_dv_conta=parse_field(line, 1027, 1039, 'C'),
        nr_dv_conta=parse_field(line, 1040, 1041, 'C'),
        nm_cpf_cnpj=parse_field(line, 1042, 1055, 'C'),
        nr_iptu=parse_field(line, 1056, 1085, 'C'),
        nr_banco=parse_field(line, 1086, 1088, 'N'),
        in_tipo_benefic=parse_field(line, 1089, 1089, 'C'),
        nr_cpf_benefic=parse_field(line, 1090, 1100, 'C'),
        cd_grupo_bem=parse_field(line, 1101, 1102, 'N'),
        in_bem_inventariar=parse_field(line, 1103, 1103, 'N'),
        nr_conta=parse_field(line, 1104, 1123, 'C'),
        nr_cib=parse_field(line, 1124, 1131, 'C'),
        nr_cei_cno=parse_field(line, 1132, 1143, 'C'),
        in_bolsa=parse_field(line, 1144, 1144, 'N'),
        nr_cod_negociacao_bolsa=parse_field(line, 1145, 1164, 'C'),
        nr_controle=parse_field(line, 1165, 1174, 'N'),
        fim_reg=line[1174:].strip()
    )

def parse_dividas_onus_reais(line: str) -> DividasOnusReais:
    """Parses a line corresponding to REG 28 - DÍVIDAS E ÔNUS REAIS."""
    return DividasOnusReais(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_div=parse_field(line, 14, 15, 'N'),
        tx_div=parse_field(line, 16, 527, 'C'),
        vr_anter=parse_field(line, 528, 540, 'Decimal', 2),
        vr_atual=parse_field(line, 541, 553, 'Decimal', 2),
        vr_pagamentoanual=parse_field(line, 554, 566, 'Decimal', 2),
        nr_controle=parse_field(line, 567, 576, 'N'),
        fim_reg=line[576:].strip()
    )

def parse_informacoes_inventariante(line: str) -> InformacoesInventariante:
    """Parses a line corresponding to REG 30 - INFORMAÇÕES DO INVENTARIANTE."""
    return InformacoesInventariante(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_inventariante=parse_field(line, 14, 24, 'C'),
        nm_inventariante=parse_field(line, 25, 84, 'C'),
        in_sobrepartilha=parse_field(line, 85, 85, 'N'),
        nr_controle=parse_field(line, 86, 95, 'N'),
        fim_reg=line[95:].strip()
    )

def parse_informacoes_inventariante(line: str) -> InformacoesInventariante:
    """Parses a line corresponding to REG 30 - INFORMAÇÕES DO INVENTARIANTE."""
    return InformacoesInventariante(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_invent=parse_field(line, 14, 24, 'C'),
        nm_invent=parse_field(line, 25, 84, 'C'),
        in_sobrepartilha=parse_field(line, 85, 85, 'N'),
        nr_controle=parse_field(line, 86, 95, 'N'),
        fim_reg=line[95:].strip()
    )

def parse_rendimento_socio(line: str) -> RendimentoSocioEmpresa:
    """Parses a line corresponding to REG 31 - RENDIMENTO DE SÓCIO DE EMPRESA.# REG 31 (Isento) e REG 33 (Exclusivo)"""
    return RendimentoSocioEmpresa(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cnpj_empresa=parse_field(line, 14, 27, 'C'),
        nm_empresa=parse_field(line, 28, 87, 'C'),
        vr_rendimento=parse_field(line, 88, 100, 'Decimal', 2),
        nr_controle=parse_field(line, 101, 110, 'N'),
        fim_reg=line[110:].strip()
    )

def parse_rend_trib_recebidos_pj_dependentes(line: str) -> RendTribRecebidosPJDependentes:
    """Parses a line corresponding to REG 32 - REND. TRIB. RECEBIDOS DE PESSOAS JURÍDICAS DOS DEPENDENTES."""
    return RendTribRecebidosPJDependentes(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cpf_benef=parse_field(line, 14, 24, 'C'),
        nr_pagador=parse_field(line, 25, 38, 'C'),
        nm_pagador=parse_field(line, 39, 98, 'C'),
        vr_rendto=parse_field(line, 99, 111, 'Decimal', 2),
        vr_contrib=parse_field(line, 112, 124, 'Decimal', 2),
        vr_decterc=parse_field(line, 125, 137, 'Decimal', 2),
        vr_imposto=parse_field(line, 138, 150, 'Decimal', 2),
        dt_comunicacao_saida=parse_field(line, 151, 158, 'N'),
        vr_irrf13salario=parse_field(line, 159, 171, 'Decimal', 2),
        nr_controle=parse_field(line, 172, 181, 'N'),
        fim_reg=line[181:].strip()
    )

def parse_doacoes_partidos(line: str) -> DoacoesPartidos:
    """Parses a line corresponding to REG 34 - DOAÇÕES A PARTIDOS."""
    return DoacoesPartidos(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_partido=parse_field(line, 14, 27, 'C'),
        nm_partido=parse_field(line, 28, 87, 'C'),
        vr_doacao=parse_field(line, 88, 100, 'Decimal', 2),
        nr_controle=parse_field(line, 101, 110, 'N'),
        fim_reg=line[110:].strip()
    )

def parse_alimentando(line: str) -> Alimentando:
    """Parses a line corresponding to REG 35 - ALIMENTANDO."""
    return Alimentando(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        indicador_residencia=parse_field(line, 14, 14, 'N'),
        nr_chave=parse_field(line, 15, 19, 'N'),
        nm_nome=parse_field(line, 20, 79, 'C'),
        dt_nascim=parse_field(line, 80, 87, 'N'),
        ni_alimentando=parse_field(line, 88, 98, 'C'),
        nr_cpf_vinculado=parse_field(line, 99, 109, 'C'),
        nr_controle=parse_field(line, 110, 119, 'N'),
        fim_reg=line[119:].strip()
    )

def parse_imposto_pago(line: str) -> ImpostoPagoControle:
    """Parses a line corresponding to # REG 37 (Mensal) e REG 38 (Exterior) - IMPOSTO PAGO E CONTROLE."""
    return ImpostoPagoControle(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_imposto_pago=parse_field(line, 14, 26, 'Decimal', 2),
        nr_controle=parse_field(line, 27, 36, 'N'),
        fim_reg=line[36:].strip()
    )

def parse_renda_variavel_mensal(line: str) -> RendaVariavelMensal:
    """Parses a line corresponding to REG 40  - RENDA VARIÁVEL MENSAL."""
    return RendaVariavelMensal(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_mes=parse_field(line, 14, 15, 'N'),
        # Posições calculadas com base no deslocamento de 13 caracteres por campo
        vr_comum_vista_acoes=parse_field(line, 16, 28, 'Decimal', 2),
        vr_comum_opcoes_acoes=parse_field(line, 55, 67, 'Decimal', 2),
        vr_daytrade_vista_acoes=parse_field(line, 185, 197, 'Decimal', 2),
        vr_daytrade_opcoes_acoes=parse_field(line, 224, 236, 'Decimal', 2),
        # Resultados consolidados no final do registro
        vr_res_liquido_comum=parse_field(line, 432, 444, 'Decimal', 2),
        vr_res_liquido_daytrade=parse_field(line, 445, 457, 'Decimal', 2),
        vr_prej_anterior_comum=parse_field(line, 393, 405, 'Decimal', 2),
        vr_prej_anterior_daytrade=parse_field(line, 406, 418, 'Decimal', 2),
        vr_imposto_devido=parse_field(line, 548, 560, 'Decimal', 2),
        vr_imposto_pago=parse_field(line, 406, 418, 'Decimal', 2), # Posição varia conforme versão, ajuste se necessário
        e_dependente=parse_field(line, 626, 626, 'C'),
        nr_cpf_depen=parse_field(line, 627, 637, 'C'),
        nr_controle=parse_field(line, 638, 647, 'N'),
        fim_reg=line[647:].strip()
    )

def parse_renda_variavel_anual(line: str) -> RendaVariavelAnual:
    """Parses a line corresponding to REG 41 - RENDA VARIÁVEL ANUAL."""
    return RendaVariavelAnual(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_total_res_liquido=parse_field(line, 14, 26, 'Decimal', 2),
        vr_total_prej_compensar=parse_field(line, 53, 65, 'Decimal', 2),
        vr_total_imposto_devido=parse_field(line, 66, 78, 'Decimal', 2),
        vr_total_imposto_pago=parse_field(line, 79, 91, 'Decimal', 2),
        nr_controle=parse_field(line, 105, 114, 'N'),
        fim_reg=line[114:].strip()
    )

def parse_rendavar_fii_mensal(line: str) -> RendavarFiiMensal:
    """Parses a line corresponding to REG 42 e REG 43 - RENDAVAR FII MENSAL."""
    return RendavarFiiMensal(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_mes=parse_field(line, 14, 15, 'N'),
        vr_resliquido_mes=parse_field(line, 16, 28, 'Decimal', 2),
        vrresult_neg_mesant=parse_field(line, 29, 41, 'Decimal', 2),
        vr_basecalculo_mes=parse_field(line, 42, 54, 'Decimal', 2),
        vr_prejacompensar_mes=parse_field(line, 55, 67, 'Decimal', 2),
        vr_aliquota_imposto=parse_field(line, 68, 72, 'Decimal', 2),
        vr_impostodevido_mes=parse_field(line, 73, 85, 'Decimal', 2),
        vr_imposto_retido_meses_ant=parse_field(line, 86, 98, 'Decimal', 2),
        vr_imposto_retido_fonte=parse_field(line, 99, 111, 'Decimal', 2),
        vr_imposto_retido_compensar=parse_field(line, 112, 124, 'Decimal', 2),
        vr_imposto_pagar=parse_field(line, 125, 137, 'Decimal', 2),
        vr_impostopago=parse_field(line, 138, 150, 'Decimal', 2),
        e_dependente=parse_field(line, 151, 151, 'C'),
        nr_cpf_depen=parse_field(line, 152, 162, 'C'),
        nr_controle=parse_field(line, 163, 172, 'N'),
        fim_reg=line[172:].strip()
    )

def parse_rendavar_fii_anual(line: str) -> RendavarFiiAnual:
    """Parses a line corresponding to REG 43 - RENDA VARIÁVEL - FII (Anual)."""
    return RendavarFiiAnual(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_total_resliquido=parse_field(line, 14, 26, 'Decimal', 2),
        vr_total_resnegativo_ant=parse_field(line, 27, 39, 'Decimal', 2),
        vr_total_basecalculo=parse_field(line, 40, 52, 'Decimal', 2),
        vr_total_prejuizo_compensar=parse_field(line, 53, 65, 'Decimal', 2),
        vr_total_impostodevido=parse_field(line, 66, 78, 'Decimal', 2),
        vr_total_impostopago=parse_field(line, 79, 91, 'Decimal', 2),
        vr_total_ir_retido_fonte=parse_field(line, 92, 104, 'Decimal', 2),
        nr_controle=parse_field(line, 105, 114, 'N'),
        fim_reg=line[114:].strip() if len(line) > 114 else None
    )
def parse_rend_recebidos_acumuladamente_titular(line: str) -> RendRecebidosAcumuladamenteTitular:
    """Parses a line corresponding to REG 45 - REND RECEBIDOS ACUMULADAMENTE TITULAR."""
    return RendRecebidosAcumuladamenteTitular(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_rra_titular=parse_field(line, 14, 15, 'N'),
        nr_pagador=parse_field(line, 16, 29, 'C'),
        nm_pagador=parse_field(line, 30, 89, 'C'),
        vr_rendto=parse_field(line, 90, 102, 'Decimal', 2),
        vr_contrib=parse_field(line, 103, 115, 'Decimal', 2),
        vr_pensao=parse_field(line, 116, 128, 'Decimal', 2),
        vr_imposto=parse_field(line, 129, 141, 'Decimal', 2),
        nr_mes_recebimento=parse_field(line, 142, 143, 'N'),
        filler=parse_field(line, 144, 149, 'C'),
        opcao_tributacao=parse_field(line, 150, 150, 'N'),
        num_meses=parse_field(line, 151, 154, 'N'),
        imposto_rra=parse_field(line, 155, 167, 'Decimal', 2),
        vr_isento_65=parse_field(line, 168, 180, 'Decimal', 2),
        vr_valor_tributavel=parse_field(line, 181, 193, 'Decimal', 2),
        vr_juros=parse_field(line, 194, 206, 'Decimal', 2),
        nr_controle=parse_field(line, 207, 216, 'N'),
        fim_reg=line[216:].strip() # EOL
    )

def parse_relacao_pensao_rra_titular(line: str) -> RelacaoPensaoRRATitular:
    """Parses a line corresponding to REG 46 - RELAÇÃO DE PENSAO RRA TITULAR."""
    return RelacaoPensaoRRATitular(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_rra_titular=parse_field(line, 14, 15, 'N'),
        nr_chave_aliment=parse_field(line, 16, 20, 'N'),
        vr_pagto=parse_field(line, 21, 33, 'Decimal', 2),
        nr_controle=parse_field(line, 34, 43, 'N'),
        fim_reg=line[43:].strip() # EOL
    )

def parse_rend_recebidos_acumuladamente_dependente(line: str) -> RendRecebidosAcumuladamenteDependente:
    """Parses a line corresponding to REG 47 - REND RECEBIDOS ACUMULADAMENTE DEPENDENTE."""
    return RendRecebidosAcumuladamenteDependente(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_rra_dependente=parse_field(line, 14, 15, 'N'),
        cpf_benef=parse_field(line, 16, 26, 'C'),
        nr_pagador=parse_field(line, 27, 40, 'C'),
        nm_pagador=parse_field(line, 41, 100, 'C'),
        vr_rendto=parse_field(line, 101, 113, 'Decimal', 2),
        vr_contrib=parse_field(line, 114, 126, 'Decimal', 2),
        vr_pensao=parse_field(line, 127, 139, 'Decimal', 2),
        vr_imposto=parse_field(line, 140, 152, 'Decimal', 2),
        nr_mes_recebimento=parse_field(line, 153, 154, 'N'),
        filler=parse_field(line, 155, 160, 'C'),
        opcao_tributacao=parse_field(line, 161, 161, 'N'),
        num_meses=parse_field(line, 162, 165, 'N'),
        imposto_rra=parse_field(line, 166, 178, 'Decimal', 2),
        vr_isento_65=parse_field(line, 179, 191, 'Decimal', 2),
        vr_valor_tributavel=parse_field(line, 192, 204, 'Decimal', 2),
        vr_juros=parse_field(line, 205, 217, 'Decimal', 2),
        nr_controle=parse_field(line, 218, 227, 'N'),
        fim_reg=line[227:].strip() # EOL
    )

def parse_relacao_pensao_rra_dependente(line: str) -> RelacaoPensaoRRADependente:
    """Parses a line corresponding to REG 48 - RELAÇÃO DE PENSÃO RRA DEPENDENTE."""
    return RelacaoPensaoRRADependente(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_rra_depend=parse_field(line, 14, 15, 'N'),
        nr_chave_aliment=parse_field(line, 16, 20, 'N'),
        vr_pagto=parse_field(line, 21, 33, 'Decimal', 2),
        nr_controle=parse_field(line, 34, 43, 'N'),
        fim_reg=line[43:].strip() # EOL
    )

def parse_lancamentos_pf_exterior_carne_leao(line: str) -> LancamentosPessoasFisicasExteriorCarneLeao:
    """Parses a line corresponding to REG 49 - LANÇAMENTOS PESSOAS FÍSICAS E EXTERIOR (CARNÊ-LEÃO)."""
    return LancamentosPessoasFisicasExteriorCarneLeao(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf_titular=parse_field(line, 3, 13, 'C'),
        nr_cpf_dependente=parse_field(line, 14, 24, 'C'),
        nr_mes=parse_field(line, 25, 26, 'N'),
        nr_cpf_titular_pagamento=parse_field(line, 27, 37, 'C'),
        nr_cpf_benefic=parse_field(line, 38, 48, 'C'),
        nr_valor=parse_field(line, 49, 61, 'Decimal', 2),
        nr_controle=parse_field(line, 62, 71, 'N'),
        fim_reg=line[71:].strip() # EOL
    )
def parse_atividade_rural_imovel(line: str) -> AtividadeRuralImovel:
    """Parses a line corresponding to REG 50 - ATIVIDADE RURAL IMÓVEL (expandido)."""
    return AtividadeRuralImovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'N'),
        filler=parse_field(line, 15, 17, 'C'),
        nm_imovel=parse_field(line, 18, 77, 'C'),
        nm_local=parse_field(line, 78, 137, 'C'),
        qt_area=parse_field(line, 138, 147, 'Decimal', 4),
        pc_partic=parse_field(line, 148, 152, 'Decimal', 2),
        cd_explor=parse_field(line, 153, 153, 'C'),
        cd_ativ=parse_field(line, 154, 154, 'C'),
        nr_incra=parse_field(line, 155, 167, 'C'),
        nr_chave_ar=parse_field(line, 168, 172, 'N'),
        nr_controle=parse_field(line, 173, 182, 'N'),
        fim_reg=line[182:].strip()
    )

def parse_atividade_rural_receita_despesa(line: str) -> AtividadeRuralReceitaDespesa:
    """Parses a line corresponding to REG 51 - RECEITAS E DESPESAS - BRASIL."""
    return AtividadeRuralReceitaDespesa(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'N'),
        nr_mes=parse_field(line, 15, 16, 'N'),
        vr_desp=parse_field(line, 17, 29, 'Decimal', 2),
        vr_rec=parse_field(line, 30, 42, 'Decimal', 2),
        nr_controle=parse_field(line, 43, 52, 'N'),
        fim_reg=line[52:].strip()
    )

def parse_atividade_rural_apuracao(line: str) -> AtividadeRuralApuracao:
    """Parses a line corresponding to REG 52 - APURAÇÃO DO RESULTADO TRIBUTÁVEL (expandido)."""
    return AtividadeRuralApuracao(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'N'),
        vr_rectotal=parse_field(line, 15, 27, 'Decimal', 2),
        vr_desptotal=parse_field(line, 28, 40, 'Decimal', 2),
        vr_res1real=parse_field(line, 41, 53, 'Decimal', 2),
        vr_prejexercant=parse_field(line, 54, 66, 'Decimal', 2),
        vr_comp_prej_exerc_ant=parse_field(line, 67, 79, 'Decimal', 2),
        vr_opcao=parse_field(line, 80, 92, 'Decimal', 2),
        vr_restrib=parse_field(line, 93, 105, 'Decimal', 2),
        vr_prejuizo=parse_field(line, 106, 118, 'Decimal', 2),
        vr_recvendafutura=parse_field(line, 119, 131, 'Decimal', 2),
        vr_adiant=parse_field(line, 132, 144, 'Decimal', 2),
        vr_resnaotribar=parse_field(line, 145, 157, 'Decimal', 2),
        vr_res1dolar=parse_field(line, 158, 170, 'Decimal', 2),
        in_opc_apurrestrib=parse_field(line, 171, 171, 'N'),
        nr_controle=parse_field(line, 172, 181, 'N'),
        fim_reg=line[181:].strip() if len(line) > 181 else None
    )

# =================== NOVAS FUNÇÕES DE PARSE ===================

def parse_final_espolio(line: str) -> FinalEspolio:
    """Parses a line corresponding to REG 38 - FINAL DE ESPÓLIO."""
    return FinalEspolio(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_anoobito=parse_field(line, 14, 17, 'N'),
        filler1=parse_field(line, 18, 28, 'C'),
        nr_cpf_invent=parse_field(line, 29, 39, 'C'),
        nm_invent=parse_field(line, 40, 99, 'C'),
        filler2=parse_field(line, 100, 102, 'C'),
        in_sobrepartilha=parse_field(line, 103, 103, 'C'),
        in_status_sobrepartilha=parse_field(line, 104, 104, 'C'),
        in_tipo_processo=parse_field(line, 105, 105, 'C'),
        nr_processojudicial=parse_field(line, 106, 125, 'C'),
        nr_identificacaovaracivil=parse_field(line, 126, 130, 'C'),
        nm_comarca=parse_field(line, 131, 190, 'C'),
        dt_decjudicialpartilha=parse_field(line, 191, 198, 'N'),
        dt_transitojulgado=parse_field(line, 199, 206, 'N'),
        sg_ufcomarca=parse_field(line, 207, 208, 'C'),
        nr_cnpj_cartorio=parse_field(line, 209, 222, 'C'),
        nm_cartorio=parse_field(line, 223, 282, 'C'),
        nm_livro=parse_field(line, 283, 292, 'C'),
        nm_folha=parse_field(line, 293, 302, 'C'),
        nm_municipio=parse_field(line, 303, 342, 'C'),
        sg_ufcartorio=parse_field(line, 343, 344, 'C'),
        dt_lavratura=parse_field(line, 345, 352, 'N'),
        in_morteambosconjuges=parse_field(line, 353, 353, 'C'),
        nm_conjuge=parse_field(line, 354, 413, 'C'),
        in_bens_inventariar=parse_field(line, 414, 414, 'C'),
        filler3=parse_field(line, 415, 425, 'C'),
        in_meeiro=parse_field(line, 426, 426, 'C'),
        in_inventarioconjunto=parse_field(line, 427, 427, 'C'),
        nr_controle=parse_field(line, 428, 437, 'N'),
        fim_reg=line[437:].strip() if len(line) > 437 else None
    )

def parse_saida_definitiva(line: str) -> SaidaDefinitiva:
    """Parses a line corresponding to REG 39 - SAÍDA DEFINITIVA DO PAÍS."""
    return SaidaDefinitiva(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_procurador=parse_field(line, 14, 24, 'C'),
        nm_procurador=parse_field(line, 25, 84, 'C'),
        nm_end_procurador=parse_field(line, 85, 184, 'C'),
        dt_naoresidente=parse_field(line, 185, 192, 'N'),
        dt_residente=parse_field(line, 193, 200, 'N'),
        nr_controle=parse_field(line, 201, 210, 'N'),
        fim_reg=line[210:].strip() if len(line) > 210 else None
    )

def parse_movimentacao_rebanho(line: str) -> MovimentacaoRebanho:
    """Parses a line corresponding to REG 53 - MOVIMENTAÇÃO DO REBANHO."""
    return MovimentacaoRebanho(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'N'),
        cd_espec=parse_field(line, 15, 15, 'N'),
        qt_inic=parse_field(line, 16, 28, 'Decimal', 2),
        qt_compra=parse_field(line, 29, 41, 'Decimal', 2),
        qt_nascim=parse_field(line, 42, 54, 'Decimal', 2),
        qt_perda=parse_field(line, 55, 67, 'Decimal', 2),
        qt_venda=parse_field(line, 68, 80, 'Decimal', 2),
        qt_estfinal=parse_field(line, 81, 93, 'Decimal', 2),
        nr_controle=parse_field(line, 94, 103, 'N'),
        fim_reg=line[103:].strip() if len(line) > 103 else None
    )

def parse_atividade_rural_bens(line: str) -> AtividadeRuralBens:
    """Parses a line corresponding to REG 54 - BENS DA ATIVIDADE RURAL."""
    return AtividadeRuralBens(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'N'),
        cd_pais=parse_field(line, 15, 17, 'N'),
        cd_bemar=parse_field(line, 18, 19, 'N'),
        tx_bem=parse_field(line, 20, 531, 'C'),
        vr_bem=parse_field(line, 532, 544, 'Decimal', 2),
        vr_bem_anterior=parse_field(line, 545, 557, 'Decimal', 2),
        nr_controle=parse_field(line, 558, 567, 'N'),
        fim_reg=line[567:].strip() if len(line) > 567 else None
    )

def parse_atividade_rural_divida(line: str) -> AtividadeRuralDivida:
    """Parses a line corresponding to REG 55 - DÍVIDA DA ATIVIDADE RURAL."""
    return AtividadeRuralDivida(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_exterior=parse_field(line, 14, 14, 'C'),
        tx_divida=parse_field(line, 15, 526, 'C'),
        vr_divate=parse_field(line, 527, 539, 'Decimal', 2),
        vr_divatu=parse_field(line, 540, 552, 'Decimal', 2),
        vr_pagamentoanual=parse_field(line, 553, 565, 'Decimal', 2),
        nr_controle=parse_field(line, 566, 575, 'N'),
        fim_reg=line[575:].strip() if len(line) > 575 else None
    )

def parse_atividade_rural_exterior(line: str) -> AtividadeRuralExterior:
    """Parses a line corresponding to REG 56 (Exterior) - RECEITAS E DESPESAS NO EXTERIOR."""
    return AtividadeRuralExterior(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_pais=parse_field(line, 14, 16, 'N'),
        recbruta=parse_field(line, 17, 29, 'Decimal', 2),
        despcusteio=parse_field(line, 30, 42, 'Decimal', 2),
        resoriginal=parse_field(line, 43, 55, 'Decimal', 2),
        resdolar=parse_field(line, 56, 68, 'Decimal', 2),
        nr_controle=parse_field(line, 69, 78, 'N'),
        fim_reg=line[78:].strip() if len(line) > 78 else None
    )

def parse_proprietario_imovel_rural(line: str) -> ProprietarioImovelRural:
    """Parses a line corresponding to REG 57 - PROPRIETÁRIO DO IMÓVEL RURAL."""
    return ProprietarioImovelRural(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_cnpj_proprietario=parse_field(line, 14, 27, 'C'),
        nm_nome_proprietario=parse_field(line, 28, 87, 'C'),
        in_exterior=parse_field(line, 88, 88, 'C'),
        nr_chave_ar=parse_field(line, 89, 93, 'N'),
        nr_controle=parse_field(line, 94, 103, 'N'),
        fim_reg=line[103:].strip() if len(line) > 103 else None
    )

def parse_herdeiros(line: str) -> Herdeiros:
    """Parses a line corresponding to REG 58 - HERDEIROS (ESPÓLIO)."""
    return Herdeiros(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_chave_herdeiro=parse_field(line, 14, 18, 'N'),
        nm_nome=parse_field(line, 19, 78, 'C'),
        nr_cpf_cnpj=parse_field(line, 79, 92, 'C'),
        nr_controle=parse_field(line, 93, 102, 'N'),
        fim_reg=line[102:].strip() if len(line) > 102 else None
    )

def parse_percentual_bem(line: str) -> PercentualBem:
    """Parses a line corresponding to REG 59 - PERCENTUAL DO BEM (ESPÓLIO)."""
    return PercentualBem(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_chave_bem=parse_field(line, 14, 18, 'N'),
        nr_chave_herdeiro=parse_field(line, 19, 23, 'N'),
        vr_percentual=parse_field(line, 24, 30, 'Decimal', 4),
        nr_controle=parse_field(line, 31, 40, 'N'),
        fim_reg=line[40:].strip() if len(line) > 40 else None
    )

def parse_gcap_consolidado(line: str) -> GcapConsolidado:
    """Parses a line corresponding to REG 60 - GANHO DE CAPITAL CONSOLIDADO."""
    return GcapConsolidado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        dt_inicio=parse_field(line, 33, 40, 'N'),
        dt_fim=parse_field(line, 41, 48, 'N'),
        cd_pais=parse_field(line, 49, 51, 'C'),
        nm_pais=parse_field(line, 52, 111, 'C'),
        gc_transp_vr_exclusivo_brasil=parse_field(line, 112, 124, 'Decimal', 2),
        gc_transp_vr_pequeno=parse_field(line, 125, 137, 'Decimal', 2),
        gc_transp_vr_unicoimovel=parse_field(line, 138, 150, 'Decimal', 2),
        gc_transp_vr_reducao=parse_field(line, 151, 163, 'Decimal', 2),
        gc_transp_vr_impostopago_brasil=parse_field(line, 164, 176, 'Decimal', 2),
        gc_transp_vr_impostodevido=parse_field(line, 177, 189, 'Decimal', 2),
        gc_transp_vr_isentrib=parse_field(line, 190, 202, 'Decimal', 2),
        gc_transp_vr_impostodiferidonosposteriores=parse_field(line, 203, 215, 'Decimal', 2),
        gc_gcap_moeda=parse_field(line, 216, 228, 'Decimal', 2),
        gc_imposto_devido_moeda=parse_field(line, 229, 241, 'Decimal', 2),
        gc_moeda_aliquota_media=parse_field(line, 242, 250, 'Decimal', 6),
        gc_transp_vr_exclusivo_exterior=parse_field(line, 251, 263, 'Decimal', 2),
        gc_transp_vr_impostopago_exterior=parse_field(line, 264, 276, 'Decimal', 2),
        gc_transp_vr_isento_exterior=parse_field(line, 277, 289, 'Decimal', 2),
        nr_controle=parse_field(line, 290, 299, 'N'),
        fim_reg=line[299:].strip() if len(line) > 299 else None
    )

def parse_gcap_imovel_detalhado(line: str) -> GcapBemImovelDetalhado:
    """Parses a line corresponding to REG 61 - GCAP BEM IMÓVEL (DETALHADO)."""
    return GcapBemImovelDetalhado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_brasil_exterior=parse_field(line, 37, 37, 'N'),
        nm_imovel_descricao=parse_field(line, 38, 189, 'C'),
        end_tipo_logradouro=parse_field(line, 190, 193, 'C'),
        end_logradouro=parse_field(line, 194, 233, 'C'),
        end_numero=parse_field(line, 234, 239, 'C'),
        end_complemento=parse_field(line, 240, 260, 'C'),
        end_bairro=parse_field(line, 261, 280, 'C'),
        end_cep=parse_field(line, 281, 288, 'C'),
        end_cd_municipio=parse_field(line, 289, 292, 'C'),
        end_municipio=parse_field(line, 293, 332, 'C'),
        end_uf=parse_field(line, 333, 334, 'C'),
        end_cod_pais=parse_field(line, 335, 337, 'C'),
        end_nome_pais=parse_field(line, 338, 397, 'C'),
        dt_aquisicao=parse_field(line, 398, 405, 'N'),
        vr_aquisicao=parse_field(line, 406, 418, 'Decimal', 2),
        in_reforma=parse_field(line, 419, 419, 'C'),
        in_pequeno_valor=parse_field(line, 420, 420, 'C'),
        in_propr_outro_imovel=parse_field(line, 421, 421, 'C'),
        in_outra_alienacao=parse_field(line, 422, 422, 'C'),
        in_residencial=parse_field(line, 423, 423, 'C'),
        in_utilizazaooutroimovel=parse_field(line, 424, 424, 'C'),
        vr_utilizazaooutroimovel=parse_field(line, 425, 437, 'Decimal', 2),
        cd_operacao=parse_field(line, 438, 439, 'C'),
        nm_operacao=parse_field(line, 440, 509, 'C'),
        in_decisao_judicial=parse_field(line, 510, 510, 'C'),
        dt_alienacao=parse_field(line, 511, 518, 'N'),
        dt_decisao_judicial=parse_field(line, 519, 526, 'N'),
        dt_lavratura=parse_field(line, 527, 534, 'N'),
        dt_transito_julgado=parse_field(line, 535, 542, 'N'),
        in_alienprazo=parse_field(line, 543, 543, 'C'),
        vr_operacao=parse_field(line, 544, 556, 'Decimal', 2),
        vr_corretagem=parse_field(line, 557, 569, 'Decimal', 2),
        vr_torna=parse_field(line, 570, 582, 'Decimal', 2),
        in_gcap_anterior=parse_field(line, 583, 583, 'C'),
        vr_gcap_anterior=parse_field(line, 584, 596, 'Decimal', 2),
        vr_operacao_bruto_ant=parse_field(line, 597, 609, 'Decimal', 2),
        vr_corretagem_ant=parse_field(line, 610, 622, 'Decimal', 2),
        vr_gcap_ci_ant_liquido=parse_field(line, 623, 635, 'Decimal', 2),
        vr_gcap_ci=parse_field(line, 636, 648, 'Decimal', 2),
        vr_aliquota_media_ci=parse_field(line, 649, 657, 'Decimal', 6),
        vr_imposto_devido_ci=parse_field(line, 658, 670, 'Decimal', 2),
        vr_imposto_pago_ci=parse_field(line, 671, 683, 'Decimal', 2),
        vr_recebido_cl=parse_field(line, 684, 696, 'Decimal', 2),
        vr_corretagem_cl=parse_field(line, 697, 709, 'Decimal', 2),
        vr_valor_liquido=parse_field(line, 710, 722, 'Decimal', 2),
        vr_aquisicao_proporcional_cl=parse_field(line, 723, 735, 'Decimal', 2),
        vr_diferido_anteriores_cb=parse_field(line, 736, 748, 'Decimal', 2),
        vr_exercicio_cb=parse_field(line, 749, 761, 'Decimal', 2),
        vr_total_cb=parse_field(line, 762, 774, 'Decimal', 2),
        vr_ir_cb=parse_field(line, 775, 787, 'Decimal', 2),
        vr_ir_devido_cb=parse_field(line, 788, 800, 'Decimal', 2),
        vr_diferido_posterior_cb=parse_field(line, 801, 813, 'Decimal', 2),
        vr_imposto_pago_cb=parse_field(line, 814, 826, 'Decimal', 2),
        vr_isento_cb=parse_field(line, 827, 839, 'Decimal', 2),
        vr_exclusivo_cb=parse_field(line, 840, 852, 'Decimal', 2),
        dt_data_darf_tcm=parse_field(line, 853, 860, 'N'),
        dt_data_ultima_parcela=parse_field(line, 861, 868, 'N'),
        ind_ter_paraiso_fiscal=parse_field(line, 869, 869, 'C'),
        cd_pais_paraiso_fiscal=parse_field(line, 870, 872, 'C'),
        in_multiplo_imovel=parse_field(line, 873, 873, 'C'),
        dt_data_multiplo_imovel=parse_field(line, 874, 881, 'N'),
        nr_controle=parse_field(line, 882, 891, 'N'),
        fim_reg=line[891:].strip() if len(line) > 891 else None
    )

def parse_gcap_movel_detalhado(line: str) -> GcapBemMovelDetalhado:
    """Parses a line corresponding to REG 62 - GCAP BEM MÓVEL (DETALHADO)."""
    return GcapBemMovelDetalhado(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_brasil_exterior=parse_field(line, 37, 37, 'C'),
        nm_movel_descricao=parse_field(line, 38, 189, 'C'),
        in_registro_publico=parse_field(line, 190, 190, 'C'),
        dt_aquisicao=parse_field(line, 191, 198, 'N'),
        vr_aquisicao=parse_field(line, 199, 211, 'Decimal', 2),
        in_pequeno_valor=parse_field(line, 212, 212, 'C'),
        cd_operacao=parse_field(line, 213, 214, 'C'),
        nm_operacao=parse_field(line, 215, 284, 'C'),
        in_decisao_judicial=parse_field(line, 285, 285, 'C'),
        dt_alienacao=parse_field(line, 286, 293, 'N'),
        dt_decisao_judicial=parse_field(line, 294, 301, 'N'),
        dt_lavratura=parse_field(line, 302, 309, 'N'),
        dt_transito_julgado=parse_field(line, 310, 317, 'N'),
        in_alienprazo=parse_field(line, 318, 318, 'C'),
        vr_operacao=parse_field(line, 319, 331, 'Decimal', 2),
        vr_corretagem=parse_field(line, 332, 344, 'Decimal', 2),
        in_gcap_anterior=parse_field(line, 345, 345, 'C'),
        vr_gcap_anterior=parse_field(line, 346, 358, 'Decimal', 2),
        vr_operacao_bruto_ant=parse_field(line, 359, 371, 'Decimal', 2),
        vr_corretagem_ant=parse_field(line, 372, 384, 'Decimal', 2),
        vr_gcap_ci_ant_liquido=parse_field(line, 385, 397, 'Decimal', 2),
        vr_gcap_ci=parse_field(line, 398, 410, 'Decimal', 2),
        vr_aliquota_media_ci=parse_field(line, 411, 419, 'Decimal', 6),
        vr_imposto_devido_ci=parse_field(line, 420, 432, 'Decimal', 2),
        vr_imposto_pago_ci=parse_field(line, 433, 445, 'Decimal', 2),
        vr_recebido_cl=parse_field(line, 446, 458, 'Decimal', 2),
        vr_corretagem_cl=parse_field(line, 459, 471, 'Decimal', 2),
        vr_valor_liquido=parse_field(line, 472, 484, 'Decimal', 2),
        vr_aquisicao_proporcional_cl=parse_field(line, 485, 497, 'Decimal', 2),
        vr_diferido_anteriores_cb=parse_field(line, 498, 510, 'Decimal', 2),
        vr_exercicio_cb=parse_field(line, 511, 523, 'Decimal', 2),
        vr_total_cb=parse_field(line, 524, 536, 'Decimal', 2),
        vr_ir_cb=parse_field(line, 537, 549, 'Decimal', 2),
        vr_ir_devido_cb=parse_field(line, 550, 562, 'Decimal', 2),
        vr_diferido_posterior_cb=parse_field(line, 563, 575, 'Decimal', 2),
        vr_imposto_pago_cb=parse_field(line, 576, 588, 'Decimal', 2),
        vr_isento_cb=parse_field(line, 589, 601, 'Decimal', 2),
        vr_exclusivo_cb=parse_field(line, 602, 614, 'Decimal', 2),
        dt_data_darf_tcm=parse_field(line, 615, 622, 'N'),
        dt_data_ultima_parcela=parse_field(line, 623, 630, 'N'),
        ind_ter_paraiso_fiscal=parse_field(line, 631, 631, 'C'),
        cd_pais_paraiso_fiscal=parse_field(line, 632, 634, 'C'),
        nr_controle=parse_field(line, 635, 644, 'N'),
        fim_reg=line[644:].strip() if len(line) > 644 else None
    )

def parse_gcap_participacao_societaria_detalhada(line: str) -> GcapParticipacaoSocietariaDetalhada:
    """Parses a line corresponding to REG 63 - GCAP PARTICIPAÇÃO SOCIETÁRIA (DETALHADA)."""
    return GcapParticipacaoSocietariaDetalhada(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        nm_sociedade=parse_field(line, 37, 188, 'C'),
        nr_cnpj=parse_field(line, 189, 202, 'C'),
        cd_municipio=parse_field(line, 203, 206, 'C'),
        nm_municipio=parse_field(line, 207, 246, 'C'),
        nm_uf=parse_field(line, 247, 248, 'C'),
        cd_operacao=parse_field(line, 249, 250, 'C'),
        nm_operacao=parse_field(line, 251, 320, 'C'),
        cd_especie=parse_field(line, 321, 321, 'C'),
        nm_especie=parse_field(line, 322, 411, 'C'),
        in_decisao_judicial=parse_field(line, 412, 412, 'C'),
        dt_alienacao=parse_field(line, 413, 420, 'N'),
        dt_decisao_judicial=parse_field(line, 421, 428, 'N'),
        dt_lavratura=parse_field(line, 429, 436, 'N'),
        dt_transito_julgado=parse_field(line, 437, 444, 'N'),
        in_alienprazo=parse_field(line, 445, 445, 'C'),
        vr_operacao=parse_field(line, 446, 458, 'Decimal', 2),
        vr_corretagem=parse_field(line, 459, 471, 'Decimal', 2),
        in_pequeno_valor=parse_field(line, 472, 472, 'C'),
        in_gcap_anterior=parse_field(line, 473, 473, 'C'),
        vr_gcap_anterior=parse_field(line, 474, 486, 'Decimal', 2),
        vr_valor_alienacao_ap=parse_field(line, 487, 499, 'Decimal', 2),
        vr_custo_corretagem_ap=parse_field(line, 500, 512, 'Decimal', 2),
        vr_liquido_alienacao_ap=parse_field(line, 513, 525, 'Decimal', 2),
        vr_custo_aquisicao_ap=parse_field(line, 526, 538, 'Decimal', 2),
        vr_gcap_ap=parse_field(line, 539, 551, 'Decimal', 2),
        vr_operacao_bruto_ant=parse_field(line, 552, 564, 'Decimal', 2),
        vr_corretagem_ant=parse_field(line, 565, 577, 'Decimal', 2),
        vr_gcap_ci_ant_liquido=parse_field(line, 578, 590, 'Decimal', 2),
        vr_gcap_ci=parse_field(line, 591, 603, 'Decimal', 2),
        vr_aliquota_media_ci=parse_field(line, 604, 612, 'Decimal', 6),
        vr_imposto_devido_ci=parse_field(line, 613, 625, 'Decimal', 2),
        vr_irrf_ci=parse_field(line, 626, 638, 'Decimal', 2),
        vr_imposto_devido_apos_compensacao_ci=parse_field(line, 639, 651, 'Decimal', 2),
        vr_imposto_pago_ci=parse_field(line, 652, 664, 'Decimal', 2),
        vr_recebido_cl=parse_field(line, 665, 677, 'Decimal', 2),
        vr_corretagem_cl=parse_field(line, 678, 690, 'Decimal', 2),
        vr_valor_liquido=parse_field(line, 691, 703, 'Decimal', 2),
        vr_aquisicao_proporcional_cl=parse_field(line, 704, 716, 'Decimal', 2),
        vr_diferido_anteriores_cb=parse_field(line, 717, 729, 'Decimal', 2),
        vr_exercicio_cb=parse_field(line, 730, 742, 'Decimal', 2),
        vr_total_cb=parse_field(line, 743, 755, 'Decimal', 2),
        vr_ir_cb=parse_field(line, 756, 768, 'Decimal', 2),
        vr_ir_devido_cb=parse_field(line, 769, 781, 'Decimal', 2),
        vr_diferido_posterior_cb=parse_field(line, 782, 794, 'Decimal', 2),
        vr_imposto_pago_cb=parse_field(line, 795, 807, 'Decimal', 2),
        vr_isento_cb=parse_field(line, 808, 820, 'Decimal', 2),
        vr_exclusivo_cb=parse_field(line, 821, 833, 'Decimal', 2),
        vr_custo_total_aquisicao=parse_field(line, 834, 846, 'Decimal', 2),
        dt_data_darf_tcm=parse_field(line, 847, 854, 'N'),
        dt_data_ultima_parcela=parse_field(line, 855, 862, 'N'),
        ind_ter_paraiso_fiscal=parse_field(line, 863, 863, 'C'),
        cd_pais_paraiso_fiscal=parse_field(line, 864, 866, 'C'),
        nr_controle=parse_field(line, 867, 876, 'N'),
        fim_reg=line[876:].strip() if len(line) > 876 else None
    )

def parse_gcap_declaracao_exterior(line: str) -> GcapDeclaracaoExterior:
    """Parses a line corresponding to REG 64 - GCAP DECLARAÇÃO EXTERIOR."""
    return GcapDeclaracaoExterior(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_tipo=parse_field(line, 37, 37, 'N'),
        vr_cotacao_op=parse_field(line, 38, 50, 'Decimal', 4),
        vr_operacao_dolar=parse_field(line, 51, 63, 'Decimal', 2),
        vr_corretagem_dolar=parse_field(line, 64, 76, 'Decimal', 2),
        vr_torna_me_dolar=parse_field(line, 77, 89, 'Decimal', 2),
        vr_torna_mn_dolar=parse_field(line, 90, 102, 'Decimal', 2),
        vr_valor_alienacao_ap_ambas=parse_field(line, 103, 115, 'Decimal', 2),
        vr_custo_corretagem_ap_ambas=parse_field(line, 116, 128, 'Decimal', 2),
        vr_liquido_alienacao_ap_ambas=parse_field(line, 129, 141, 'Decimal', 2),
        vr_gcap_total_ap_ambas=parse_field(line, 142, 154, 'Decimal', 2),
        in_origem_rend=parse_field(line, 155, 155, 'C'),
        nm_origem_rend_desc=parse_field(line, 156, 215, 'C'),
        vr_cotacao_aquisicao=parse_field(line, 216, 228, 'Decimal', 4),
        vr_bem_aquisicao_dolar=parse_field(line, 229, 241, 'Decimal', 2),
        vr_bem_aquisicao_rmn=parse_field(line, 242, 254, 'Decimal', 2),
        ft_bem_aquisicao_rmn=parse_field(line, 255, 259, 'Decimal', 2),
        vr_bem_aquisicao_rme=parse_field(line, 260, 272, 'Decimal', 2),
        ft_bem_aquisicao_rme=parse_field(line, 273, 277, 'Decimal', 2),
        cod_pais_acordo=parse_field(line, 278, 280, 'C'),
        nm_cod_pais_acordo=parse_field(line, 281, 340, 'C'),
        vr_imposto_real_acordo=parse_field(line, 341, 353, 'Decimal', 2),
        vr_gcap_total_ajuste=parse_field(line, 354, 366, 'Decimal', 2),
        ft_aliquota_media_ajuste=parse_field(line, 367, 375, 'Decimal', 6),
        vr_imposto_total_ajuste=parse_field(line, 376, 388, 'Decimal', 2),
        vr_imposto_pago_compensacao=parse_field(line, 389, 401, 'Decimal', 2),
        vr_saldo_imposto_devido=parse_field(line, 402, 414, 'Decimal', 2),
        vr_imposto_parcela_ajuste=parse_field(line, 415, 427, 'Decimal', 2),
        vr_saldo_imposto_ajuste=parse_field(line, 428, 440, 'Decimal', 2),
        vr_imposto_pago_ajuste=parse_field(line, 441, 453, 'Decimal', 2),
        in_cobranca=parse_field(line, 454, 454, 'C'),
        vr_total_recebido_dolar=parse_field(line, 455, 467, 'Decimal', 2),
        vr_total_corretagem_dolar=parse_field(line, 468, 480, 'Decimal', 2),
        vr_total_liquido_recebido_dolar=parse_field(line, 481, 493, 'Decimal', 2),
        vr_total_liquido_recebido_real=parse_field(line, 494, 506, 'Decimal', 2),
        vr_total_aquisicao_dolar=parse_field(line, 507, 519, 'Decimal', 2),
        vr_total_aquisicao_real=parse_field(line, 520, 532, 'Decimal', 2),
        vr_total_aquisicao_torna_dolar=parse_field(line, 533, 545, 'Decimal', 2),
        vr_total_aquisicao_torna_real=parse_field(line, 546, 558, 'Decimal', 2),
        vr_total_resultado1=parse_field(line, 559, 571, 'Decimal', 2),
        vr_total_reducao=parse_field(line, 572, 584, 'Decimal', 2),
        vr_total_gcap_dolar=parse_field(line, 585, 597, 'Decimal', 2),
        vr_total_ir=parse_field(line, 598, 610, 'Decimal', 2),
        vr_total_ir_pago=parse_field(line, 611, 623, 'Decimal', 2),
        nm_mensagem=parse_field(line, 624, 823, 'C'),
        nr_controle=parse_field(line, 824, 833, 'N'),
        fim_reg=line[833:].strip() if len(line) > 833 else None
    )

def parse_gcap_adquirentes(line: str) -> GcapAdquirentes:
    """Parses a line corresponding to REG 65 - GCAP ADQUIRENTES."""
    return GcapAdquirentes(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_tipo=parse_field(line, 37, 37, 'N'),
        nr_cpfcnpj=parse_field(line, 38, 51, 'C'),
        nr_nome=parse_field(line, 52, 111, 'C'),
        nr_controle=parse_field(line, 112, 121, 'N'),
        fim_reg=line[121:].strip() if len(line) > 121 else None
    )

def parse_gcap_ampliacao_reforma(line: str) -> GcapAmpliacaoReforma:
    """Parses a line corresponding to REG 66 - GCAP AMPLIAÇÃO/REFORMA."""
    return GcapAmpliacaoReforma(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        dt_data=parse_field(line, 37, 44, 'N'),
        vr_valor_reais=parse_field(line, 45, 57, 'Decimal', 2),
        vr_porcentagem_parcela_reais=parse_field(line, 58, 66, 'Decimal', 6),
        vr_valor_reducao=parse_field(line, 67, 79, 'Decimal', 2),
        vr_porcentagem_red7713=parse_field(line, 80, 88, 'Decimal', 6),
        vr_porcentagem_redfr1=parse_field(line, 89, 97, 'Decimal', 6),
        vr_porcentagem_redfr2=parse_field(line, 98, 106, 'Decimal', 6),
        nr_controle=parse_field(line, 107, 116, 'N'),
        fim_reg=line[116:].strip() if len(line) > 116 else None
    )

def parse_gcap_ampliacao_exterior(line: str) -> GcapAmpliacaoExterior:
    """Parses a line corresponding to REG 67 - GCAP AMPLIAÇÃO/REFORMA EXTERIOR."""
    return GcapAmpliacaoExterior(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        dt_data=parse_field(line, 37, 44, 'N'),
        vr_valor_rmn_reais=parse_field(line, 45, 57, 'Decimal', 2),
        vr_porcentagem_parcela_rmn=parse_field(line, 58, 66, 'Decimal', 6),
        vr_cotacao_ampliacao=parse_field(line, 67, 79, 'Decimal', 4),
        vr_valor_rmn_dolar=parse_field(line, 80, 92, 'Decimal', 2),
        vr_valor_rme_dolar=parse_field(line, 93, 105, 'Decimal', 2),
        vr_total_parcela_dolar=parse_field(line, 106, 118, 'Decimal', 2),
        vr_porcentagem_parcela_rme=parse_field(line, 119, 127, 'Decimal', 6),
        vr_valor_reducao_rmn=parse_field(line, 128, 140, 'Decimal', 2),
        vr_valor_reducao_rme=parse_field(line, 141, 153, 'Decimal', 2),
        vr_porcentagem_red7713=parse_field(line, 154, 162, 'Decimal', 6),
        vr_porcentagem_redfr1=parse_field(line, 163, 171, 'Decimal', 6),
        vr_porcentagem_redfr2=parse_field(line, 172, 180, 'Decimal', 6),
        nr_controle=parse_field(line, 181, 190, 'N'),
        fim_reg=line[190:].strip() if len(line) > 190 else None
    )

def parse_gcap_apuracao_imovel(line: str) -> GcapApuracaoImovel:
    """Parses a line corresponding to REG 68 - GCAP APURAÇÃO IMÓVEL."""
    return GcapApuracaoImovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        nr_tipo_apuracao=parse_field(line, 37, 37, 'N'),
        dados_apuracao=parse_field(line, 38, min(len(line), 400), 'C'),
        nr_controle=parse_field(line, max(37, len(line)-12), max(37, len(line)-3), 'N') if len(line) > 50 else None,
        fim_reg=line[-2:].strip() if len(line) > 2 else None
    )

def parse_gcap_faixa_ganho(line: str) -> GcapFaixaGanho:
    """Parses a line corresponding to REG 75 - GCAP FAIXA DE GANHO."""
    return GcapFaixaGanho(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        dados_faixa=parse_field(line, 37, min(len(line), 300), 'C'),
        nr_controle=parse_field(line, max(37, len(line)-12), max(37, len(line)-3), 'N') if len(line) > 50 else None,
        fim_reg=line[-2:].strip() if len(line) > 2 else None
    )

# =================== FIM NOVAS FUNÇÕES DE PARSE ===================

def parse_atividade_rural_resumo(line: str) -> AtividadeRuralResumo:
    """Parses a line corresponding to REG 56 - ATIVIDADE RURAL RESUMO."""
    return AtividadeRuralResumo(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_tot_receita=parse_field(line, 14, 26, 'Decimal', 2),
        vr_tot_despesa=parse_field(line, 27, 39, 'Decimal', 2),
        vr_resultado_bruto=parse_field(line, 40, 52, 'Decimal', 2),
        vr_prej_anterior=parse_field(line, 53, 65, 'Decimal', 2),
        vr_base_calculo=parse_field(line, 66, 78, 'Decimal', 2),
        vr_prej_compensar=parse_field(line, 79, 91, 'Decimal', 2),
        vr_resultado_tributavel=parse_field(line, 92, 104, 'Decimal', 2),
        nr_controle=parse_field(line, 105, 114, 'N'),
        fim_reg=line[114:].strip()
    )

def parse_gcap_imovel(line: str) -> GanhosCapitalImovel:
    """Parses a line corresponding to REG 61 - APURAÇÃO DE BENS IMÓVEIS"""
    return GanhosCapitalImovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_alien=parse_field(line, 69, 81, 'Decimal', 2),
        vr_custo=parse_field(line, 82, 94, 'Decimal', 2),
        vr_ganho=parse_field(line, 108, 120, 'Decimal', 2),
        vr_impdev=parse_field(line, 147, 159, 'Decimal', 2),
        nr_controle=parse_field(line, 160, 169, 'N'),
        fim_reg=line[169:].strip()
    )

def parse_gcap_movel(line: str) -> GanhosCapitalMovel:
    """Parses a line corresponding to REG 65 - APURAÇÃO DE BENS MÓVEIS"""
    return GanhosCapitalMovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_alien=parse_field(line, 110, 122, 'Decimal', 2),
        vr_custo=parse_field(line, 123, 135, 'Decimal', 2),
        vr_ganho=parse_field(line, 149, 161, 'Decimal', 2),
        vr_impdev=parse_field(line, 188, 200, 'Decimal', 2),
        nr_controle=parse_field(line, 201, 210, 'N'),
        fim_reg=line[210:].strip()
    )

def parse_gcap_participacoes(line: str) -> GanhosCapitalParticipacoes:
    """Parses a line corresponding to REG 70 - APURAÇÃO DE PARTICIPAÇÕES SOCIETÁRIAS"""
    return GanhosCapitalParticipacoes(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_alien=parse_field(line, 110, 122, 'Decimal', 2),
        vr_custo=parse_field(line, 123, 135, 'Decimal', 2),
        vr_ganho=parse_field(line, 149, 161, 'Decimal', 2),
        vr_impdev=parse_field(line, 188, 200, 'Decimal', 2),
        nr_controle=parse_field(line, 201, 210, 'N'),
        fim_reg=line[210:].strip()
    )

def parse_gcap_moeda_estrangeira(line: str) -> GanhosCapitalMoedaEstrangeira:
    """Parses a line corresponding to REG 75 - APURAÇÃO DE MOEDA ESTRANGEIRA"""
    return GanhosCapitalMoedaEstrangeira(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        vr_ganho=parse_field(line, 82, 94, 'Decimal', 2),
        vr_impdev=parse_field(line, 95, 107, 'Decimal', 2),
        nr_controle=parse_field(line, 108, 117, 'N'),
        fim_reg=line[117:].strip()
    )

def parse_rend_trib_recebidos_pj_exigibilidade_suspensa_titular(line: str) -> RendTribRecebidosPJExigibilidadeSuspensaTitular:
    """Parses a line corresponding to REG 80 - REND TRIB RECEBIDOS DE PJ EXIGIBILIDADE SUSPENSA TITULAR."""
    return RendTribRecebidosPJExigibilidadeSuspensaTitular(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_pagador=parse_field(line, 14, 27, 'C'),
        nm_pagador=parse_field(line, 28, 87, 'C'),
        vr_rendto=parse_field(line, 88, 100, 'Decimal', 2),
        vr_dep_judicial=parse_field(line, 101, 113, 'Decimal', 2),
        nr_controle=parse_field(line, 114, 123, 'N'),
        fim_reg=line[123:].strip() # EOL
    )

def parse_rend_trib_recebidos_pj_exigibilidade_suspensa_dependentes(line: str) -> RendTribRecebidosPJExigibilidadeSuspensaDependentes:
    """Parses a line corresponding to REG 81 - REND. TRIB. RECEBIDOS DE PJ EXIGIBILIDADE SUSPENSA DEPENDENTES."""
    return RendTribRecebidosPJExigibilidadeSuspensaDependentes(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cpf_benef=parse_field(line, 14, 24, 'C'),
        nr_pagador=parse_field(line, 25, 38, 'C'),
        nm_pagador=parse_field(line, 39, 98, 'C'),
        vr_rendto=parse_field(line, 99, 111, 'Decimal', 2),
        vr_dep_judicial=parse_field(line, 112, 124, 'Decimal', 2),
        nr_controle=parse_field(line, 125, 134, 'N'),
        fim_reg=line[134:].strip() # EOL
    )

def parse_rendimento_isento_tipo02(line: str) -> RendimentoIsentoTipo02:
    """Parses a line corresponding to REG 83 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 2."""
    return RendimentoIsentoTipo02(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        vr_valor=parse_field(line, 30, 42, 'Decimal', 2),
        nr_controle=parse_field(line, 43, 52, 'N'),
        fim_reg=line[52:].strip() # EOL
    )

def parse_rendimento_isento_tipo03(line: str) -> RendimentoIsentoTipo03:
    """Parses a line corresponding to REG 84 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 3."""
    return RendimentoIsentoTipo03(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        nr_pagadora=parse_field(line, 30, 43, 'C'),
        nm_nome=parse_field(line, 44, 103, 'C'),
        vr_valor=parse_field(line, 104, 116, 'Decimal', 2),
        vr_valor_13=parse_field(line, 117, 129, 'Decimal', 2),
        nr_chave_bem=parse_field(line, 130, 134, 'N'),
        nr_controle=parse_field(line, 135, 144, 'N'),
        fim_reg=line[144:].strip() # EOL
    )

def parse_rendimento_isento_tipo04(line: str) -> RendimentoIsentoTipo04:
    """Parses a line corresponding to REG 85 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 4."""
    return RendimentoIsentoTipo04(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        nr_pagadora=parse_field(line, 30, 43, 'C'),
        nm_nome=parse_field(line, 44, 103, 'C'),
        vr_receb=parse_field(line, 104, 116, 'Decimal', 2),
        vr_13salario=parse_field(line, 117, 129, 'Decimal', 2),
        vr_irrf=parse_field(line, 130, 142, 'Decimal', 2),
        vr_irrf13salario=parse_field(line, 143, 155, 'Decimal', 2),
        vr_previdencia=parse_field(line, 156, 168, 'Decimal', 2),
        nr_controle=parse_field(line, 169, 178, 'N'),
        fim_reg=line[178:].strip() # EOL
    )

def parse_rendimento_isento_tipo05(line: str) -> RendimentoIsentoTipo05:
    """Parses a line corresponding to REG 86 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 5."""
    return RendimentoIsentoTipo05(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        nr_pagadora=parse_field(line, 30, 43, 'C'),
        nm_nome=parse_field(line, 44, 103, 'C'),
        vr_valor=parse_field(line, 104, 116, 'Decimal', 2),
        nm_descricao=parse_field(line, 117, 176, 'C'),
        nr_chave_bem=parse_field(line, 177, 181, 'N'),
        nr_controle=parse_field(line, 182, 191, 'N'),
        fim_reg=line[191:].strip() # EOL
    )

def parse_rendimento_isento_tipo06(line: str) -> RendimentoIsentoTipo06:
    """Parses a line corresponding to REG 87 - RENDIMENTOS ISENTOS TIPO DE INFORMAÇÃO 6."""
    return RendimentoIsentoTipo06(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cod=parse_field(line, 14, 17, 'N'),
        vr_valor=parse_field(line, 18, 30, 'Decimal', 2),
        vr_valorgcap=parse_field(line, 31, 43, 'Decimal', 2),
        nr_controle=parse_field(line, 44, 53, 'N'),
        fim_reg=line[53:].strip() # EOL
    )

def parse_rendimento_exclusivo_tipo02(line: str) -> RendimentoExclusivoTipo02:
    """Parses a line corresponding to REG 88 - RENDIMENTO EXCLUSIVO TIPO DE INFORMAÇÃO 2."""
    return RendimentoExclusivoTipo02(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        nr_pagadora=parse_field(line, 30, 43, 'C'),
        nm_nome=parse_field(line, 44, 103, 'C'),
        vr_valor=parse_field(line, 104, 116, 'Decimal', 2),
        nr_chave_bem=parse_field(line, 117, 121, 'N'),
        nr_controle=parse_field(line, 122, 131, 'N'),
        fim_reg=line[131:].strip() # EOL
    )

def parse_rendimento_exclusivo_tipo03(line: str) -> RendimentoExclusivoTipo03:
    """Parses a line corresponding to REG 89 - RENDIMENTO EXCLUSIVO TIPO DE INFORMAÇÃO 3."""
    return RendimentoExclusivoTipo03(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo=parse_field(line, 14, 14, 'C'),
        nr_cpf_benefic=parse_field(line, 15, 25, 'C'),
        nr_cod=parse_field(line, 26, 29, 'N'),
        nr_pagadora=parse_field(line, 30, 43, 'C'),
        nm_nome=parse_field(line, 44, 103, 'C'),
        vr_valor=parse_field(line, 104, 116, 'Decimal', 2),
        nm_descricao=parse_field(line, 117, 176, 'C'),
        nr_controle=parse_field(line, 177, 186, 'N'),
        fim_reg=line[186:].strip() # EOL
    )

def parse_relacao_doacoes_efetuadas(line: str) -> RelacaoDoacoesEfetuadas:
    """Parses a line corresponding to REG 90 - RELAÇÃO DE DOAÇÕES EFETUADAS."""
    return RelacaoDoacoesEfetuadas(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        cd_doacao=parse_field(line, 14, 15, 'N'),
        nr_benef=parse_field(line, 16, 29, 'C'),
        nm_benef=parse_field(line, 30, 89, 'C'),
        vr_doacao=parse_field(line, 90, 102, 'Decimal', 2),
        vr_parc_nao_dedut=parse_field(line, 103, 115, 'Decimal', 2),
        in_tipo_cpf_cnpj=parse_field(line, 116, 116, 'N'),
        nr_controle=parse_field(line, 117, 126, 'N'),
        fim_reg=line[126:].strip() # EOL
    )

def parse_doacoes_diretamente_declaracao(line: str) -> DoacoesDiretamenteDeclaracao:
    """Parses a line corresponding to REG 91 -  DOAÇÕES ECA / IDOSO DOAÇÕES DIRETAMENTE NA DECLARAÇÃO. """
    return DoacoesDiretamenteDeclaracao(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo_fundo=parse_field(line, 14, 14, 'C'),
        sg_uf=parse_field(line, 15, 16, 'C'),
        nm_municipio=parse_field(line, 17, 56, 'C'),
        vr_doacao=parse_field(line, 57, 69, 'Decimal', 2),
        nr_cnpj_fundo=parse_field(line, 70, 83, 'C'),
        nr_controle=parse_field(line, 84, 93, 'N'),
        fim_reg=line[93:].strip()
    )

def parse_gcap_apuracao_movel(line: str) -> GcapApuracaoMovel:
    """Parses a line corresponding to REG 69 - GCAP APURAÇÃO MÓVEL."""
    return GcapApuracaoMovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        nr_tipo_apuracao=parse_field(line, 37, 37, 'N'),
        vr_valor=parse_field(line, 38, 50, 'Decimal', 2),
        vr_corretagem=parse_field(line, 51, 63, 'Decimal', 2),
        vr_liquido_apuracao=parse_field(line, 64, 76, 'Decimal', 2),
        vr_liquido_apuracao_dolar=parse_field(line, 77, 89, 'Decimal', 2),
        vr_custo_apuracao=parse_field(line, 90, 102, 'Decimal', 2),
        vr_resultado_1_apuracao=parse_field(line, 103, 115, 'Decimal', 2),
        vr_resultado_1_apuracao_dolar=parse_field(line, 116, 128, 'Decimal', 2),
        vr_cotacao_apuracao=parse_field(line, 129, 141, 'Decimal', 2),
        nr_controle=parse_field(line, 142, 151, 'N'),
        fim_reg=line[151:].strip() if len(line) > 151 else None
    )

def parse_gcap_parcela_ambas(line: str) -> GcapParcelaAmbas:
    """Parses a line corresponding to REG 70 - GANHO DE CAPITAL PARCELA AMBAS."""
    return GcapParcelaAmbas(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_tipo=parse_field(line, 37, 37, 'N'),
        dt_parcela=parse_field(line, 38, 45, 'N'),
        vr_valor=parse_field(line, 46, 58, 'Decimal', 2),
        vr_corretagem=parse_field(line, 59, 71, 'Decimal', 2),
        vr_liquido=parse_field(line, 72, 84, 'Decimal', 2),
        vr_aplica_outro_informado_parcela=parse_field(line, 85, 97, 'Decimal', 2),
        vr_gcap_total=parse_field(line, 98, 110, 'Decimal', 2),
        vr_imposto_devido_parcela=parse_field(line, 111, 123, 'Decimal', 2),
        vr_imposto_pago_compensacao=parse_field(line, 124, 136, 'Decimal', 2),
        vr_imposto_devido_brasil=parse_field(line, 137, 149, 'Decimal', 2),
        vr_imposto_pago_parcela_brasil=parse_field(line, 150, 162, 'Decimal', 2),
        vr_total_reducao=parse_field(line, 163, 175, 'Decimal', 2),
        nr_controle=parse_field(line, 176, 185, 'N'),
        fim_reg=line[185:].strip() if len(line) > 185 else None
    )

def parse_gcap_parcela_imovel(line: str) -> GcapParcelaImovel:
    """Parses a line corresponding to REG 71 - GCAP PARCELA IMÓVEL."""
    return GcapParcelaImovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        nr_tipo_parcela=parse_field(line, 37, 37, 'N'),
        in_ultima_parcela=parse_field(line, 38, 38, 'C'),
        dt_parcela=parse_field(line, 39, 46, 'N'),
        vr_liquido_parcela_ambas=parse_field(line, 47, 59, 'Decimal', 2),
        vr_valor=parse_field(line, 60, 72, 'Decimal', 2),
        vr_corretagem=parse_field(line, 73, 85, 'Decimal', 2),
        vr_liquido_parcela=parse_field(line, 86, 98, 'Decimal', 2),
        vr_liquido_parcela_dolar=parse_field(line, 99, 111, 'Decimal', 2),
        vr_custo_parcela=parse_field(line, 112, 124, 'Decimal', 2),
        vr_resultado_1_parcela=parse_field(line, 125, 137, 'Decimal', 2),
        vr_resultado_1_parcela_dolar=parse_field(line, 138, 150, 'Decimal', 2),
        ft_reducao_lei7713_parcela=parse_field(line, 151, 159, 'Decimal', 6),
        vr_reducao_lei7713_parcela=parse_field(line, 160, 172, 'Decimal', 2),
        vr_resultado_2_parcela=parse_field(line, 173, 185, 'Decimal', 2),
        ft_reducao_lei11196fr1=parse_field(line, 186, 194, 'Decimal', 6),
        vr_reducao_lei11196fr1=parse_field(line, 195, 207, 'Decimal', 2),
        vr_resultado_3_parcela=parse_field(line, 208, 220, 'Decimal', 2),
        ft_reducao_lei11196fr2=parse_field(line, 221, 229, 'Decimal', 6),
        vr_reducao_lei11196fr2=parse_field(line, 230, 242, 'Decimal', 2),
        vr_resultado_4_parcela=parse_field(line, 243, 255, 'Decimal', 2),
        vr_aplica_outro_informado_parcela=parse_field(line, 256, 268, 'Decimal', 2),
        ft_aplica_outro_parcela=parse_field(line, 269, 277, 'Decimal', 6),
        vr_aplica_outro_parcela=parse_field(line, 278, 290, 'Decimal', 2),
        ft_aplica_pequeno_apuracao=parse_field(line, 291, 299, 'Decimal', 6),
        vr_aplica_pequeno_apuracao=parse_field(line, 300, 312, 'Decimal', 2),
        ft_aplica_unico_apuracao=parse_field(line, 313, 321, 'Decimal', 6),
        vr_aplica_unico_apuracao=parse_field(line, 322, 334, 'Decimal', 2),
        vr_resultado_5_parcela=parse_field(line, 335, 347, 'Decimal', 2),
        vr_total_reducao=parse_field(line, 348, 360, 'Decimal', 2),
        vr_aliquota_media_parcela=parse_field(line, 361, 369, 'Decimal', 6),
        vr_imposto_devido_parcela=parse_field(line, 370, 382, 'Decimal', 2),
        vr_imposto_pago_compensacao=parse_field(line, 383, 395, 'Decimal', 2),
        vr_imposto_devido_brasil=parse_field(line, 396, 408, 'Decimal', 2),
        vr_imposto_pago_parcela_brasil=parse_field(line, 409, 421, 'Decimal', 2),
        vr_cotacao_parcela=parse_field(line, 422, 434, 'Decimal', 4),
        nr_controle=parse_field(line, 435, 444, 'N'),
        fim_reg=line[444:].strip() if len(line) > 444 else None
    )

def parse_gcap_parcela_movel(line: str) -> GcapParcelaMovel:
    """Parses a line corresponding to REG 72 - GCAP PARCELA MÓVEL / PARTICIPAÇÕES."""
    return GcapParcelaMovel(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        in_tipo=parse_field(line, 37, 37, 'N'),
        nr_tipo_parcela=parse_field(line, 38, 38, 'N'),
        in_ultima_parcela=parse_field(line, 39, 39, 'C'),
        dt_parcela=parse_field(line, 40, 47, 'N'),
        vr_liquido_parcela_ambas=parse_field(line, 48, 60, 'Decimal', 2),
        vr_valor=parse_field(line, 61, 73, 'Decimal', 2),
        vr_corretagem=parse_field(line, 74, 86, 'Decimal', 2),
        vr_liquido_parcela=parse_field(line, 87, 99, 'Decimal', 2),
        vr_liquido_parcela_dolar=parse_field(line, 100, 112, 'Decimal', 2),
        vr_custo_parcela=parse_field(line, 113, 125, 'Decimal', 2),
        vr_resultado_1_parcela=parse_field(line, 126, 138, 'Decimal', 2),
        vr_resultado_1_parcela_dolar=parse_field(line, 139, 151, 'Decimal', 2),
        vr_aliquota_media_parcela=parse_field(line, 152, 160, 'Decimal', 6),
        vr_imposto_devido_parcela=parse_field(line, 161, 173, 'Decimal', 2),
        vr_imposto_pago_compensacao=parse_field(line, 174, 186, 'Decimal', 2),
        vr_imposto_devido_brasil=parse_field(line, 187, 199, 'Decimal', 2),
        vr_imposto_pago_parcela_brasil=parse_field(line, 200, 212, 'Decimal', 2),
        vr_cotacao_parcela=parse_field(line, 213, 225, 'Decimal', 4),
        nr_controle=parse_field(line, 226, 235, 'N'),
        fim_reg=line[235:].strip() if len(line) > 235 else None
    )

def parse_gcap_custo_acao(line: str) -> GcapCustoAcao:
    """Parses a line corresponding to REG 73 - GCAP CUSTO DE APURAÇÃO AÇÕES."""
    return GcapCustoAcao(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_operacao=parse_field(line, 33, 36, 'N'),
        nr_item=parse_field(line, 37, 40, 'C'),
        in_especie=parse_field(line, 41, 41, 'N'),
        nm_descricao_especie=parse_field(line, 42, 101, 'C'),
        vr_quantidade_alienada=parse_field(line, 102, 112, 'N'),
        vr_custo_medio=parse_field(line, 113, 129, 'Decimal', 6),
        vr_custo_total=parse_field(line, 130, 142, 'Decimal', 2),
        nr_controle=parse_field(line, 143, 152, 'N'),
        fim_reg=line[152:].strip() if len(line) > 152 else None
    )

def parse_gcap_moeda_especie_detalhado(line: str) -> GcapMoedaEspecie:
    """Parses a line corresponding to REG 74 - GCAP MOEDA EM ESPÉCIE."""
    return GcapMoedaEspecie(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        nr_cpf_beneficiario=parse_field(line, 14, 24, 'C'),
        nr_identificacao=parse_field(line, 25, 32, 'N'),
        nr_item=parse_field(line, 33, 36, 'C'),
        pais=parse_field(line, 37, 43, 'C'),
        nm_moeda=parse_field(line, 44, 83, 'C'),
        tipo_operacao=parse_field(line, 84, 84, 'C'),
        nm_operacao=parse_field(line, 85, 99, 'C'),
        nm_adquir=parse_field(line, 100, 159, 'C'),
        nr_adquir=parse_field(line, 160, 173, 'C'),
        dta_operacao=parse_field(line, 174, 181, 'N'),
        vr_operacao=parse_field(line, 182, 194, 'Decimal', 2),
        nr_quantidade=parse_field(line, 195, 207, 'Decimal', 2),
        vr_custo=parse_field(line, 208, 224, 'Decimal', 6),
        vr_custototaquis=parse_field(line, 225, 237, 'Decimal', 2),
        vr_ganhocapital=parse_field(line, 238, 250, 'Decimal', 2),
        vr_saldo_reais=parse_field(line, 251, 263, 'Decimal', 2),
        vr_me=parse_field(line, 264, 276, 'Decimal', 2),
        nr_controle=parse_field(line, 277, 286, 'N'),
        fim_reg=line[286:].strip() if len(line) > 286 else None
    )

def parse_doacoes_idoso(line: str) -> DoacoesIdoso:
    """Parses a line corresponding to REG 92 - DOAÇÕES ESTATUTO DO IDOSO."""
    return DoacoesIdoso(
        nr_reg=parse_field(line, 1, 2, 'N'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        in_tipo_fundo=parse_field(line, 14, 14, 'C'),
        sg_uf=parse_field(line, 15, 16, 'C'),
        nm_municipio=parse_field(line, 17, 56, 'C'),
        vr_doacao=parse_field(line, 57, 69, 'Decimal', 2),
        nr_cnpj_fundo=parse_field(line, 70, 83, 'C'),
        nr_controle=parse_field(line, 84, 93, 'N'),
        fim_reg=line[93:].strip()
    )

def parse_trailer_t9(line: str) -> RegistroTipoEncerramento:
    """Parses a line corresponding to REG T9 - ENCERRAMENTO DO ARQUIVO."""
    return RegistroTipoEncerramento(
        nr_reg=parse_field(line, 1, 2, 'C'),
        nr_cpf=parse_field(line, 3, 13, 'C'),
        qt_regs=parse_field(line, 14, 19, 'N'),
        nr_controle=parse_field(line, 440, 449, 'N'),
        fim_reg=line[449:].strip() if len(line) > 449 else ""
    )

def parse_field(line: str, start: int, end: int, dtype: str = 'str', decimals: int = 0) -> Any:
    """
    Explicação para Leigo: Esta função é a 'régua' que mede a linha.
    Ela vai até a posição que você mandou (ex: 93 até 105) e corta o pedaço do texto.
    """
    try:
        # No Python, a contagem começa em 0, por isso fazemos start-1
        val = line[start-1:end].strip()
        if not val:
            return 0.0 if dtype == 'Decimal' else ""
        if dtype == 'Decimal':
            # Transforma o texto em número e coloca a vírgula no lugar certo
            return float(val) / (10 ** decimals)
        return val
    except:
        return 0.0 if dtype == 'Decimal' else ""


# ==================================================================================================
# FUNÇÃO PRINCIPAL DE PARSEAMENTO
# ==================================================================================================

def parse_dec_file(dec_file_content: bytes, encoding: str = 'latin-1') -> DeclaraoIRPF:
    """
    Parses a .DEC file content and returns a DeclaraoIRPF object.
    Esta versão inclui o mapeamento para Renda Variável, Atividade Rural e GCAP completo.
    """
    declaracao_data = DeclaraoIRPF()
    lines = dec_file_content.decode(encoding).splitlines()

    for line in lines:
        if len(line) < 2:  # Pula linhas vazias
            continue

        registro_type = line[0:2]
        
        # O Header 'IR' é o único registro não numérico no início
        if registro_type == 'IR':
            declaracao_data.header_ir = parse_header_ir(line)
            continue

        try:
            registro_type_int = int(registro_type)
        except ValueError:
            # Se não for numérico e não for 'IR', ignora a linha
            # Mas verifica se é o Trailer T9
            if registro_type == 'T9':
                declaracao_data.registro_encerramento = parse_trailer_t9(line)
            continue

        # --- MAPEAMENTO DE REGISTROS ---
        
        # Identificação e Totais
        if registro_type_int == 1:
            declaracao_data.identificacao_complementar = parse_identificacao_complementar(line)
        elif registro_type_int == 16:
            declaracao_data.identificacao_declarante = parse_identificacao_declarante(line)
        elif registro_type_int == 17:
            declaracao_data.demais_rendimentos_imposto_pago_simplificado = parse_demais_rendimentos_imposto_pago_simplificado(line)
        elif registro_type_int == 18:
            declaracao_data.totais_calculados_declaracao_simplificado = parse_totais_calculados_declaracao_simplificado(line)
        elif registro_type_int == 19:
            declaracao_data.completa_declaracao_desc_calculado = parse_completa_declaracao_desc_calculado(line)
        elif registro_type_int == 20:
            declaracao_data.totais_declaracao_desc_calculado = parse_totais_declaracao_desc_calculado(line)

        # Rendimentos e Dependentes
        elif registro_type_int == 21:
            declaracao_data.rendimentos_pj.append(parse_rendimento_pj(line))
        elif registro_type_int == 22:
            declaracao_data.rendimentos_pf_exterior_carne_leao.append(parse_rendimentos_pf_exterior_carne_leao(line))
        elif registro_type_int == 23:
            declaracao_data.rendimentos_isentos.append(parse_rendimento_isento(line))
        elif registro_type_int == 24:
            declaracao_data.rendimentos_sujeitos_tributacao_exclusiva.append(parse_rendimentos_sujeitos_tributacao_exclusiva(line))
        elif registro_type_int == 25:
            declaracao_data.dependentes.append(parse_dependentes(line))
        elif registro_type_int == 30:
            declaracao_data.informacoes_inventariante = parse_informacoes_inventariante(line)
        elif registro_type_int in [31, 33]:
            declaracao_data.rendimentos_socio_empresa.append(parse_rendimento_socio(line))
        elif registro_type_int == 32:
            declaracao_data.rend_trib_recebidos_pj_dependentes.append(parse_rend_trib_recebidos_pj_dependentes(line))

        # Pagamentos, Bens e Dívidas
        elif registro_type_int == 26:
            declaracao_data.pagamentos_efetuados.append(parse_pagamentos_efetuados(line))
        elif registro_type_int == 27:
            declaracao_data.declaracao_bens_direitos.append(parse_declaracao_bens_direitos(line))
        elif registro_type_int == 28:
            declaracao_data.dividas_onus_reais.append(parse_dividas_onus_reais(line))
        elif registro_type_int == 34:
            declaracao_data.doacoes_partidos.append(parse_doacoes_partidos(line))
        elif registro_type_int == 35:
            declaracao_data.alimentandos.append(parse_alimentando(line))
        elif registro_type_int == 37:
            declaracao_data.impostos_pagos_controle.append(parse_imposto_pago(line))
        elif registro_type_int == 38:
            declaracao_data.final_espolio = parse_final_espolio(line)
        elif registro_type_int == 39:
            declaracao_data.saida_definitiva = parse_saida_definitiva(line)
        elif registro_type_int == 90:
            declaracao_data.relacao_doacoes_efetuadas.append(parse_relacao_doacoes_efetuadas(line))
        elif registro_type_int == 91:
            declaracao_data.doacoes_diretamente_declaracao.append(parse_doacoes_diretamente_declaracao(line))
        elif registro_type_int == 92:
            declaracao_data.doacoes_idoso.append(parse_doacoes_idoso(line))

        # --- BLOCOS DE RENDA VARIÁVEL ---
        elif registro_type_int == 40:
            declaracao_data.renda_variavel_mensal.append(parse_renda_variavel_mensal(line))
        elif registro_type_int == 41:
            declaracao_data.renda_variavel_anual.append(parse_renda_variavel_anual(line))
        elif registro_type_int == 42:
            declaracao_data.rendavar_fii_mensal.append(parse_rendavar_fii_mensal(line))
        elif registro_type_int == 43:
            declaracao_data.rendavar_fii_anual.append(parse_rendavar_fii_anual(line))

        # Atividade Rural
        elif registro_type_int == 50:
            declaracao_data.atividade_rural_imoveis.append(parse_atividade_rural_imovel(line))
        elif registro_type_int == 51:
            declaracao_data.atividade_rural_lancamentos.append(parse_atividade_rural_receita_despesa(line))
        elif registro_type_int == 52:
            declaracao_data.atividade_rural_apuracao.append(parse_atividade_rural_apuracao(line))
        elif registro_type_int == 53:
            declaracao_data.movimentacao_rebanho.append(parse_movimentacao_rebanho(line))
        elif registro_type_int == 54:
            declaracao_data.atividade_rural_bens.append(parse_atividade_rural_bens(line))
        elif registro_type_int == 55:
            declaracao_data.atividade_rural_dividas.append(parse_atividade_rural_divida(line))
        elif registro_type_int == 56:
            declaracao_data.atividade_rural_resumo.append(parse_atividade_rural_resumo(line))
        elif registro_type_int == 57:
            declaracao_data.proprietario_imovel_rural.append(parse_proprietario_imovel_rural(line))

        # Espólio - Herdeiros
        elif registro_type_int == 58:
            declaracao_data.herdeiros.append(parse_herdeiros(line))
        elif registro_type_int == 59:
            declaracao_data.percentual_bem.append(parse_percentual_bem(line))

        # GCAP Detalhado
        elif registro_type_int == 60:
            declaracao_data.gcap_consolidado.append(parse_gcap_consolidado(line))
        elif registro_type_int == 61:
            declaracao_data.gcap_imovel_detalhado.append(parse_gcap_imovel_detalhado(line))
        elif registro_type_int == 62:
            declaracao_data.gcap_movel_detalhado.append(parse_gcap_movel_detalhado(line))
        elif registro_type_int == 63:
            declaracao_data.gcap_participacao_societaria_detalhada.append(parse_gcap_participacao_societaria_detalhada(line))
        elif registro_type_int == 64:
            declaracao_data.gcap_declaracao_exterior.append(parse_gcap_declaracao_exterior(line))
        elif registro_type_int == 65:
            declaracao_data.gcap_adquirentes.append(parse_gcap_adquirentes(line))
        elif registro_type_int == 66:
            declaracao_data.gcap_ampliacao_reforma.append(parse_gcap_ampliacao_reforma(line))
        elif registro_type_int == 67:
            declaracao_data.gcap_ampliacao_exterior.append(parse_gcap_ampliacao_exterior(line))
        elif registro_type_int == 68:
            declaracao_data.gcap_apuracao_imovel.append(parse_gcap_apuracao_imovel(line))
        elif registro_type_int == 69:
            declaracao_data.gcap_apuracao_movel.append(parse_gcap_apuracao_movel(line))
        elif registro_type_int == 70:
            declaracao_data.gcap_parcela_ambas.append(parse_gcap_parcela_ambas(line))
        elif registro_type_int == 71:
            declaracao_data.gcap_parcela_imovel.append(parse_gcap_parcela_imovel(line))
        elif registro_type_int == 72:
            declaracao_data.gcap_parcela_movel.append(parse_gcap_parcela_movel(line))
        elif registro_type_int == 73:
            declaracao_data.gcap_custo_acao.append(parse_gcap_custo_acao(line))
        elif registro_type_int == 74:
            declaracao_data.gcap_moeda_especie.append(parse_gcap_moeda_especie_detalhado(line))
        elif registro_type_int == 75:
            declaracao_data.gcap_faixa_ganho.append(parse_gcap_faixa_ganho(line))

        # RRA (Rendimentos Recebidos Acumuladamente)
        elif registro_type_int == 45:
            declaracao_data.rend_recebidos_acumuladamente_titular.append(parse_rend_recebidos_acumuladamente_titular(line))
        elif registro_type_int == 46:
            declaracao_data.relacao_pensao_rra_titular.append(parse_relacao_pensao_rra_titular(line))
        elif registro_type_int == 47:
            declaracao_data.rend_recebidos_acumuladamente_dependente.append(parse_rend_recebidos_acumuladamente_dependente(line))
        elif registro_type_int == 48:
            declaracao_data.relacao_pensao_rra_dependente.append(parse_relacao_pensao_rra_dependente(line))
        elif registro_type_int == 49:
            declaracao_data.lancamentos_pf_exterior_carne_leao.append(parse_lancamentos_pf_exterior_carne_leao(line))

        # Exigibilidade Suspensa e Detalhamento de Isentos
        elif registro_type_int == 80:
            declaracao_data.rend_trib_recebidos_pj_exigibilidade_suspensa_titular.append(parse_rend_trib_recebidos_pj_exigibilidade_suspensa_titular(line))
        elif registro_type_int == 81:
            declaracao_data.rend_trib_recebidos_pj_exigibilidade_suspensa_dependentes.append(parse_rend_trib_recebidos_pj_exigibilidade_suspensa_dependentes(line))
        elif registro_type_int == 83:
            declaracao_data.rendimentos_isentos_tipo02.append(parse_rendimento_isento_tipo02(line))
        elif registro_type_int == 84:
            declaracao_data.rendimentos_isentos_tipo03.append(parse_rendimento_isento_tipo03(line))
        elif registro_type_int == 85:
            declaracao_data.rendimentos_isentos_tipo04.append(parse_rendimento_isento_tipo04(line))
        elif registro_type_int == 86:
            declaracao_data.rendimentos_isentos_tipo05.append(parse_rendimento_isento_tipo05(line))
        elif registro_type_int == 87:
            declaracao_data.rendimentos_isentos_tipo06.append(parse_rendimento_isento_tipo06(line))
        elif registro_type_int == 88:
            declaracao_data.rendimento_exclusivo_tipo02.append(parse_rendimento_exclusivo_tipo02(line))
        elif registro_type_int == 89:
            declaracao_data.rendimento_exclusivo_tipo03.append(parse_rendimento_exclusivo_tipo03(line))
        elif registro_type_int == 95:
            declaracao_data.informacoes_complementares.append(parse_informacoes_complementares(line))

    return declaracao_data