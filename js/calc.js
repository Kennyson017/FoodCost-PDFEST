// js/calc.js

// Fatores de conversão para a unidade base
const FATOR_CONVERSAO = {
    kg: 1000, // kg para gramas
    g: 1,
    L: 1000,  // Litro para ml
    ml: 1,
    un: 1,
    cx: 1,
    pct: 1
};

export const calcCustoUnitario = (precoCompra, quantidade, unidadeCompra) => {
    const fator = FATOR_CONVERSAO[unidadeCompra] || 1;
    const quantidadeBase = quantidade * fator;
    return precoCompra / quantidadeBase;
};

export const calcCustoIngrediente = (custoUnitarioInsumo, qtdUsada, rendimento = 100) => {
    // Se o rendimento é 80%, precisamos usar mais insumo para chegar na qtdUsada
    // Custo real = (Custo Unitário * Qtd) / (Rendimento / 100)
    const taxaRendimento = parseFloat(rendimento) / 100;
    return (custoUnitarioInsumo * qtdUsada) / taxaRendimento;
};

export const calcCustoProducao = (ingredientes = [], custoOpUnitario = 0) => {
    const custoIngredientes = ingredientes.reduce((acc, curr) => acc + (curr.custoIngrediente || 0), 0);
    return custoIngredientes + parseFloat(custoOpUnitario);
};

export const calcPrecoSugerido = (custoTotal, margemMeta = 0, impostos = 0, taxaMaquininha = 0) => {
    const taxasTotais = (parseFloat(margemMeta) + parseFloat(impostos) + parseFloat(taxaMaquininha)) / 100;
    const markupDivisor = 1 - taxasTotais;
    
    // Evitar divisão por zero ou valor negativo (se as taxas passarem de 100%)
    if (markupDivisor <= 0) return custoTotal; 
    
    return custoTotal / markupDivisor;
};

export const calcMargemReal = (precoPraticado, custoTotal) => {
    if (!precoPraticado || precoPraticado <= 0) return 0;
    // Margem (%) = ((Preço - Custo) / Preço) * 100
    return ((precoPraticado - custoTotal) / precoPraticado) * 100;
};

export const calcCustoOpUnitario = (totalCustosMensais, volumeMensal) => {
    if (!volumeMensal || volumeMensal <= 0) return 0;
    return parseFloat(totalCustosMensais) / parseFloat(volumeMensal);
};

export const calcBreakEven = (totalCustosMensais, margemContribuicaoMedia) => {
    // Cálculo simplificado: quantos R$ precisam ser faturados
    // margemContribuicaoMedia em decimal
    const margemDecimal = parseFloat(margemContribuicaoMedia) / 100;
    if (margemDecimal <= 0) return 0;
    return parseFloat(totalCustosMensais) / margemDecimal;
};

// Utils para formatação
export const formatCurrency = (value) => {
    if (isNaN(value)) value = 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatCurrencyInput = (value) => {
    if (isNaN(value)) value = 0;
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseCurrencyInput = (valueString) => {
    if (!valueString) return 0;
    // Remove tudo que não for dígito, vírgula ou menos
    let cleanStr = valueString.replace(/[^\d,-]/g, '');
    cleanStr = cleanStr.replace(',', '.');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
};
