export class IRPFParser {
  public parseHeader(line: string): any {
    return {
      nr_cpf: line.substring(18, 29).trim(),
      nm_nome: line.substring(32, 92).trim(),
      exercicio: line.substring(7, 11).trim() || '2025'
    };
  }

  public parseRendimentosPJ(line: string): any {
    return {
      cnpj: line.substring(13, 27).trim(),
      nome: line.substring(27, 87).trim()
    };
  }

  public parseRendimentosPJDependentes(line: string): any {
    return {
      cnpj: line.substring(15, 29).trim(),
      nome: line.substring(29, 89).trim()
    };
  }

  public parseBens(line: string): any {
    // Ajuste de Precisão: A descrição pode começar em posições variadas dependendo do campo País
    // Vamos pegar do índice 17 em diante e limpar o que sobrar de códigos numéricos no início
    const rawDesc = line.substring(17).trim();
    const cleanDesc = rawDesc.replace(/^[0-9]{1,5}/, '').trim(); 

    return {
      grupo: parseInt(line.substring(13, 15).trim()),
      codigo: line.substring(15, 17).trim(),
      descricao: cleanDesc
    };
  }

  public parsePagamentos(line: string): any {
    return {
      codigo: line.substring(13, 15).trim(),
      nome: line.substring(34, 94).trim()
    };
  }
}
