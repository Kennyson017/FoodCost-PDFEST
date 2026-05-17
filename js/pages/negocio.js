// js/pages/negocio.js
import { STATE, saveState, exportData, importData, loadState, updateAndSaveState } from '../state.js';
import * as Calc from '../calc.js';
import { showToast } from '../components.js';

export const renderNegocio = (container) => {
    const negocio = STATE.negocio || {};
    const custos = negocio.custos || {};

    container.innerHTML = `
        <div class="header-action">
            <h1>Configurações do Negócio</h1>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <label class="btn btn-secondary" style="cursor: pointer; flex: 1; text-align: center;">
                    Importar Backup
                    <input type="file" id="importFile" accept=".json" style="display: none;">
                </label>
                <button id="btnExportar" class="btn btn-secondary" style="flex: 1;">Exportar Backup</button>
                <button id="btnSalvarNegocio" class="btn btn-primary" style="flex: 2;">Salvar Configurações</button>
            </div>
        </div>

        <div class="layout-split">
            <div class="settings-form">
                <!-- Seção 1: Dados da Empresa -->
                <div class="card" style="margin-bottom: 24px;">
                    <h2>1. Dados da Empresa</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Estabelecimento</label>
                            <input type="text" id="neg_nome" value="${negocio.nomeEstabelecimento || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tipo de Negócio</label>
                            <select id="neg_tipo">
                                <option value="lanchonete" ${negocio.tipo === 'lanchonete' ? 'selected' : ''}>Lanchonete</option>
                                <option value="foodtruck" ${negocio.tipo === 'foodtruck' ? 'selected' : ''}>Food Truck</option>
                                <option value="darkkitchen" ${negocio.tipo === 'darkkitchen' ? 'selected' : ''}>Dark Kitchen</option>
                                <option value="restaurante" ${negocio.tipo === 'restaurante' ? 'selected' : ''}>Restaurante</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Seção 2: Custos Operacionais Fixos -->
                <div class="card" style="margin-bottom: 24px;">
                    <h2>2. Custos Operacionais Mensais</h2>
                    <p style="margin-bottom: 16px;">Informe todos os custos fixos mensais para manter a operação rodando.</p>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Aluguel / Ponto</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_aluguel" value="${custos.aluguel || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Salários e Encargos</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_salarios" value="${custos.salarios || ''}">
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Pró-labore do dono</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_prolabore" value="${custos.prolabore || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Energia Elétrica</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_energia" value="${custos.energia || ''}">
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Água e Gás</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_agua_gas" value="${custos.agua_gas || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Outros (Internet, Sistema, Limpeza)</label>
                            <div class="input-group has-prefix">
                                <span class="input-prefix">R$</span>
                                <input type="number" class="custo-input" id="custo_outros" value="${custos.outros || ''}">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Seção 3: Volume e Metas -->
                <div class="card">
                    <h2>3. Volume de Vendas e Margem</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Vendas por Dia (média)</label>
                            <div class="input-group has-suffix">
                                <input type="number" id="neg_vendasDia" value="${negocio.vendasDia || 0}">
                                <span class="input-suffix">un</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Dias Abertos por Mês</label>
                            <input type="number" id="neg_diasMes" value="${negocio.diasMes || 26}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Meta de Margem de Lucro</label>
                            <div class="input-group has-suffix">
                                <input type="number" id="neg_margemMeta" value="${negocio.margemMeta || 35}">
                                <span class="input-suffix">%</span>
                            </div>
                            <p style="font-size: 0.8rem; margin-top: 4px;">% de lucro limpo esperado na venda.</p>
                        </div>
                        <div class="form-group">
                            <label>Impostos + Maquininha</label>
                            <div class="input-group has-suffix">
                                <input type="number" id="neg_impostos" value="${(negocio.taxaImpostos || 0) + (negocio.taxaMaquininha || 0)}">
                                <span class="input-suffix">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumo Calculado em Tempo Real -->
            <div class="summary-panel">
                <div class="card" style="position: sticky; top: 24px; background-color: var(--primary-light); border-color: var(--primary);">
                    <h2 style="color: var(--primary);">Resumo do Negócio</h2>
                    
                    <div style="margin-bottom: 16px;">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Custo Operacional Mensal</p>
                        <h3 id="resumo_custoMensal" style="font-size: 1.8rem; margin-bottom: 0;">R$ 0,00</h3>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Volume Estimado / Mês</p>
                        <h3 id="resumo_volume" style="font-size: 1.5rem; margin-bottom: 0;">0 un</h3>
                    </div>
                    
                    <div style="margin-bottom: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Custo Operacional por Unidade</p>
                        <h2 id="resumo_custoUnitario" style="font-size: 2rem; color: var(--primary); margin-bottom: 0;">R$ 0,00</h2>
                        <p style="font-size: 0.8rem; margin-top: 8px; color: var(--text-main);">Este valor será somado ao custo de ingredientes de cada produto.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    bindEvents(container);
    updateSimulations();
};

const bindEvents = (container) => {
    // Escuta mudanças nos inputs para atualizar o painel lateral em tempo real
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateSimulations);
    });

    // Salvar
    container.querySelector('#btnSalvarNegocio').addEventListener('click', handleSave);

    // Exportar Backup
    container.querySelector('#btnExportar').addEventListener('click', () => {
        exportData();
        showToast("Backup exportado com sucesso.");
    });

    // Importar Backup
    const fileInput = container.querySelector('#importFile');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            const success = importData(content);
            if (success) {
                showToast("Backup restaurado com sucesso!");
                loadState(); // Recarrega estado para memória
                renderNegocio(document.getElementById('app')); // Re-renderiza a página
            } else {
                showToast("Erro: Arquivo JSON inválido.", "error");
            }
        };
        reader.readAsText(file);
    });
};

const updateSimulations = () => {
    // Coleta custos
    let totalCustosMensais = 0;
    document.querySelectorAll('.custo-input').forEach(input => {
        totalCustosMensais += parseFloat(input.value) || 0;
    });

    // Coleta volume
    const vendasDia = parseFloat(document.getElementById('neg_vendasDia').value) || 0;
    const diasMes = parseFloat(document.getElementById('neg_diasMes').value) || 0;
    const volumeMensal = vendasDia * diasMes;

    // Calcula unitário
    const custoOpUnitario = Calc.calcCustoOpUnitario(totalCustosMensais, volumeMensal);

    // Atualiza DOM
    document.getElementById('resumo_custoMensal').textContent = Calc.formatCurrency(totalCustosMensais);
    document.getElementById('resumo_volume').textContent = volumeMensal + ' un';
    document.getElementById('resumo_custoUnitario').textContent = Calc.formatCurrency(custoOpUnitario);
};

const handleSave = () => {
    const negocio = STATE.negocio || {};
    
    negocio.nomeEstabelecimento = document.getElementById('neg_nome').value;
    negocio.tipo = document.getElementById('neg_tipo').value;
    
    negocio.custos = {
        aluguel: parseFloat(document.getElementById('custo_aluguel').value) || 0,
        salarios: parseFloat(document.getElementById('custo_salarios').value) || 0,
        prolabore: parseFloat(document.getElementById('custo_prolabore').value) || 0,
        energia: parseFloat(document.getElementById('custo_energia').value) || 0,
        agua_gas: parseFloat(document.getElementById('custo_agua_gas').value) || 0,
        outros: parseFloat(document.getElementById('custo_outros').value) || 0
    };

    negocio.vendasDia = parseFloat(document.getElementById('neg_vendasDia').value) || 0;
    negocio.diasMes = parseFloat(document.getElementById('neg_diasMes').value) || 0;
    negocio.margemMeta = parseFloat(document.getElementById('neg_margemMeta').value) || 0;
    
    // Tratamos impostos e maquininha num input só na UI para simplificar, mas salvamos em impostos
    negocio.taxaImpostos = parseFloat(document.getElementById('neg_impostos').value) || 0;
    negocio.taxaMaquininha = 0;

    STATE.negocio = negocio;
    
    // Recarregar os dados recalculando tudo (pois o custo op. unitário afeta todos os produtos)
    updateAndSaveState(); // Ele chama recalculateState() e saveState() internamente
    
    showToast("Configurações salvas com sucesso!");
    updateSimulations();
};
