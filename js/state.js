// js/state.js
import * as Calc from './calc.js';
import { SEED_DATA } from './seed.js';

const STORAGE_KEYS = {
    INSUMOS: 'foodcost_insumos',
    PREPAROS: 'foodcost_preparos',
    PRODUTOS: 'foodcost_produtos',
    NEGOCIO: 'foodcost_negocio'
};

export const STATE = {
    insumos: [],
    preparos: [],
    produtos: [],
    negocio: {}
};

export const loadState = () => {
    const insumosRaw = localStorage.getItem(STORAGE_KEYS.INSUMOS);
    const preparosRaw = localStorage.getItem(STORAGE_KEYS.PREPAROS);
    const produtosRaw = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    const negocioRaw = localStorage.getItem(STORAGE_KEYS.NEGOCIO);

    let needsSeed = false;

    if (!insumosRaw || !produtosRaw || !negocioRaw || insumosRaw === '[]' || insumosRaw === 'null') {
        needsSeed = true;
    } else {
        STATE.insumos = JSON.parse(insumosRaw);
        STATE.preparos = preparosRaw ? JSON.parse(preparosRaw) : [];
        STATE.produtos = JSON.parse(produtosRaw);
        STATE.negocio = JSON.parse(negocioRaw);
    }

    if (needsSeed) {
        seedState();
        saveState();
    }
    
    // Recalcular dinamicamente sempre que carregar (garante coerência)
    recalculateState();
};

export const saveState = () => {
    localStorage.setItem(STORAGE_KEYS.INSUMOS, JSON.stringify(STATE.insumos));
    localStorage.setItem(STORAGE_KEYS.PREPAROS, JSON.stringify(STATE.preparos));
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(STATE.produtos));
    localStorage.setItem(STORAGE_KEYS.NEGOCIO, JSON.stringify(STATE.negocio));
};

export const updateAndSaveState = () => {
    recalculateState();
    saveState();
};

export const generateId = () => {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const recalculateState = () => {
    // Atualiza custo unitário dos insumos
    STATE.insumos.forEach(insumo => {
        insumo.custoUnitarioBase = Calc.calcCustoUnitario(insumo.precoCompra, insumo.quantidadeCompra, insumo.unidadeCompra);
    });

    // Atualiza custo unitário dos preparos
    if (!STATE.preparos) STATE.preparos = [];
    STATE.preparos.forEach(preparo => {
        let custoTotalPreparo = 0;
        if (preparo.ingredientes) {
            preparo.ingredientes.forEach(ing => {
                const insumoOrigem = STATE.insumos.find(i => i.id === ing.insumoId);
                if (insumoOrigem) {
                    ing.custoIngrediente = Calc.calcCustoIngrediente(insumoOrigem.custoUnitarioBase, ing.quantidade, insumoOrigem.rendimento);
                    custoTotalPreparo += ing.custoIngrediente;
                } else {
                    ing.custoIngrediente = 0;
                }
            });
        }
        preparo.custoTotal = custoTotalPreparo;
        preparo.custoUnitarioBase = preparo.rendimentoBase > 0 ? (custoTotalPreparo / preparo.rendimentoBase) : 0;
    });

    // Atualiza custos do negócio
    const negocio = STATE.negocio;
    negocio.volumeMensal = (negocio.vendasDia || 0) * (negocio.diasMes || 26);
    
    let totalCustos = 0;
    if (negocio.custos) {
        for (const [key, value] of Object.entries(negocio.custos)) {
            totalCustos += parseFloat(value) || 0;
        }
    }
    negocio.totalCustosMensais = totalCustos;
    negocio.custoOpUnitario = Calc.calcCustoOpUnitario(negocio.totalCustosMensais, negocio.volumeMensal);

    // Atualiza produtos (custo de ingredientes, produção, sugerido e margem)
    STATE.produtos.forEach(produto => {
        let custoIngredientes = 0;
        
        if (produto.ingredientes) {
            produto.ingredientes.forEach(ing => {
                const insumoOrigem = STATE.insumos.find(i => i.id === ing.insumoId);
                const preparoOrigem = STATE.preparos.find(p => p.id === ing.preparoId);
                
                if (insumoOrigem) {
                    ing.custoIngrediente = Calc.calcCustoIngrediente(insumoOrigem.custoUnitarioBase, ing.quantidade, insumoOrigem.rendimento);
                    custoIngredientes += ing.custoIngrediente;
                } else if (preparoOrigem) {
                    ing.custoIngrediente = Calc.calcCustoIngrediente(preparoOrigem.custoUnitarioBase, ing.quantidade, 100);
                    custoIngredientes += ing.custoIngrediente;
                } else {
                    ing.custoIngrediente = 0; // Deletado
                }
            });
        }
        
        produto.custoIngredientes = custoIngredientes;
        produto.custoOperacionalRateado = negocio.custoOpUnitario || 0;
        produto.custoTotalProducao = Calc.calcCustoProducao(produto.ingredientes, produto.custoOperacionalRateado);
        
        produto.precoSugerido = Calc.calcPrecoSugerido(
            produto.custoTotalProducao, 
            negocio.margemMeta || 0, 
            negocio.taxaImpostos || 0, 
            negocio.taxaMaquininha || 0
        );
        
        produto.margemReal = Calc.calcMargemReal(produto.precoPraticado, produto.custoTotalProducao);
    });
};

export const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(STATE));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "foodcost_backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export const importData = (jsonData) => {
    try {
        const parsedData = JSON.parse(jsonData);
        
        // Basic Schema Validation
        const hasInsumos = Array.isArray(parsedData.insumos);
        const hasProdutos = Array.isArray(parsedData.produtos);
        const hasNegocio = typeof parsedData.negocio === 'object' && parsedData.negocio !== null;

        if (hasInsumos && hasProdutos && hasNegocio) {
            STATE.insumos = parsedData.insumos;
            STATE.preparos = Array.isArray(parsedData.preparos) ? parsedData.preparos : [];
            STATE.produtos = parsedData.produtos;
            STATE.negocio = parsedData.negocio;
            updateAndSaveState();
            return true;
        }
        console.error("JSON schema invalid. Missing required arrays or objects.");
        return false;
    } catch (e) {
        console.error("Erro ao importar JSON", e);
        return false;
    }
};

const seedState = () => {
    console.log("Aplicando Seed Data...");

    STATE.negocio = JSON.parse(JSON.stringify(SEED_DATA.negocio));
    STATE.insumos = JSON.parse(JSON.stringify(SEED_DATA.insumos));
    STATE.preparos = SEED_DATA.preparos ? JSON.parse(JSON.stringify(SEED_DATA.preparos)) : [];
    STATE.produtos = JSON.parse(JSON.stringify(SEED_DATA.produtos));
};

// Auto-load inicial se estiver no browser (evita erro em node)
if (typeof window !== 'undefined') {
    // Delay inicialização para quando o app for montado
}
