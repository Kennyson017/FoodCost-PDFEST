// js/pages/preparos.js
import { STATE, generateId, updateAndSaveState } from '../state.js';
import * as Calc from '../calc.js';
import { showToast, escapeHTML, debounce } from '../components.js';

let currentPreparoEditId = null;
let currentIngredientesPreparo = [];

let searchQuery = '';

export const renderPreparos = (container, params = []) => {
    if (params.length > 0) {
        if (params[0] === 'novo') {
            currentPreparoEditId = null;
            currentIngredientesPreparo = [];
            renderForm(container);
            return;
        } else if (params[1] === 'editar') {
            currentPreparoEditId = params[0];
            const found = STATE.preparos.find(p => p.id === currentPreparoEditId);
            currentIngredientesPreparo = found ? JSON.parse(JSON.stringify(found.ingredientes || [])) : [];
            renderForm(container);
            return;
        }
    }

    renderList(container);
};

const renderList = (container) => {
    let preparos = STATE.preparos || [];

    if (searchQuery) {
        preparos = preparos.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    container.innerHTML = `
        <div class="header-action">
            <div>
                <h1>Sub-receitas (Preparos)</h1>
                <p style="color: var(--text-muted);">${STATE.preparos.length} preparos totais</p>
            </div>
            <a href="#preparos/novo" class="btn btn-primary">
                <i data-lucide="plus" style="width: 18px; height: 18px; margin-right: 8px;"></i> Novo Preparo
            </a>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 16px;">
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <div style="flex: 2; min-width: 200px; position: relative;">
                    <i data-lucide="search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
                    <input type="text" id="searchPreparo" placeholder="Buscar preparo por nome..." value="${escapeHTML(searchQuery)}" style="padding: 12px 16px 12px 48px;">
                </div>
            </div>
        </div>

        <div class="table-container">
            <table id="tabelaPreparos">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Rendimento</th>
                        <th>Custo Total</th>
                        <th>Custo Base</th>
                        <th style="text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${preparos.map(p => `
                        <tr>
                            <td data-label="Nome"><strong>${escapeHTML(p.nome)}</strong></td>
                            <td data-label="Rendimento">${p.rendimentoBase} ${escapeHTML(p.unidadeBase)}</td>
                            <td data-label="Custo Total">${Calc.formatCurrency(p.custoTotal)}</td>
                            <td data-label="Custo Base"><strong style="color: var(--primary);">${Calc.formatCurrency(p.custoUnitarioBase)} / ${escapeHTML(p.unidadeBase)}</strong></td>
                            <td data-label="Ações" style="text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                                <a href="#preparos/${p.id}/editar" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Editar</a>
                                <button class="btn btn-danger btn-excluir" data-id="${p.id}" style="padding: 6px 12px; font-size: 0.85rem;">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                    ${preparos.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 32px;">Nenhum preparo cadastrado.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    container.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm("Tem certeza que deseja excluir este preparo? Isso afetará produtos que o utilizam.")) {
                STATE.preparos = STATE.preparos.filter(p => p.id !== id);
                updateAndSaveState();
                showToast("Preparo excluído.");
                renderList(container);
            }
        });
    });

    const searchInput = container.querySelector('#searchPreparo');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderList(container);
            const input = document.getElementById('searchPreparo');
            if (input) input.focus();
        });
    }
};

const renderForm = (container) => {
    let preparo = {
        nome: '', unidadeBase: 'g', rendimentoBase: 1000
    };

    if (currentPreparoEditId) {
        const found = STATE.preparos.find(p => p.id === currentPreparoEditId);
        if (found) preparo = { ...found };
        else return window.location.hash = '#preparos';
    }

    container.innerHTML = `
        <div class="header-action">
            <a href="#preparos" style="color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 8px;">← Voltar para lista</a>
            <h1>${currentPreparoEditId ? 'Editar Preparo' : 'Novo Preparo'}</h1>
        </div>

        <form id="preparoForm">
            <div class="layout-split">
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card">
                        <h2>Dados do Preparo</h2>
                        <div class="form-row">
                            <div class="form-group" style="flex: 2;">
                                <label>Nome do Preparo *</label>
                                <input type="text" id="prep_nome" value="${escapeHTML(preparo.nome)}" required placeholder="Ex: Maionese da Casa">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Rendimento da Receita *</label>
                                <input type="number" step="0.01" min="0.01" id="prep_rendimento" value="${preparo.rendimentoBase}" required placeholder="Ex: 1000">
                                <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">Quanto essa receita rende após pronta.</p>
                            </div>
                            <div class="form-group">
                                <label>Unidade de Medida *</label>
                                <select id="prep_unidade">
                                    <option value="g" ${preparo.unidadeBase === 'g' ? 'selected' : ''}>g (Grama)</option>
                                    <option value="ml" ${preparo.unidadeBase === 'ml' ? 'selected' : ''}>ml (Mililitro)</option>
                                    <option value="un" ${preparo.unidadeBase === 'un' ? 'selected' : ''}>un (Unidade)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h2>Ingredientes do Preparo</h2>
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <select id="insumoSelect" style="flex: 1;">
                                <option value="">Selecione um insumo para adicionar...</option>
                                ${STATE.insumos.map(i => `<option value="${i.id}">${escapeHTML(i.nome)} (${Calc.formatCurrency(i.custoUnitarioBase)}/${i.unidadeBase})</option>`).join('')}
                            </select>
                            <button type="button" id="btnAddInsumo" class="btn btn-secondary">Adicionar</button>
                        </div>
                        <div class="table-container">
                            <table id="tabelaIngredientesPreparo">
                                <thead>
                                    <tr>
                                        <th>Insumo</th>
                                        <th style="width: 120px;">Qtd</th>
                                        <th>Unid</th>
                                        <th>Custo</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody id="ingredientesPreparoBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card" style="position: sticky; top: 24px;">
                    <h2>Resumo do Custo</h2>
                    
                    <div style="background-color: var(--bg-panel); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--text-muted);">Custo Total da Receita</span>
                            <strong id="lblCustoTotalPrep">R$ 0,00</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-color);">
                            <span style="color: var(--text-muted);">Custo Base Calculado</span>
                            <strong id="lblCustoBasePrep" style="color: var(--primary);">R$ 0,00 / un</strong>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Salvar Preparo</button>
                        <a href="#preparos" class="btn btn-secondary" style="width: 100%; text-align: center;">Cancelar</a>
                    </div>
                </div>
            </div>
        </form>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    bindFormEvents(container);
};

const bindFormEvents = (container) => {
    const tbody = container.querySelector('#ingredientesPreparoBody');
    const btnAdd = container.querySelector('#btnAddInsumo');
    const select = container.querySelector('#insumoSelect');
    const form = container.querySelector('#preparoForm');
    const inputRendimento = container.querySelector('#prep_rendimento');
    const inputUnidade = container.querySelector('#prep_unidade');

    const debouncedUpdatePricing = debounce(() => updatePricingPanel(container), 300);

    const renderFichaRows = () => {
        tbody.innerHTML = currentIngredientesPreparo.map((ing, index) => {
            const insumoData = STATE.insumos.find(i => i.id === ing.insumoId);
            const nomeExibicao = insumoData ? insumoData.nome : 'Insumo Removido';
            const unidadeExibicao = insumoData ? insumoData.unidadeBase : 'un';
            const custoItem = insumoData ? Calc.calcCustoIngrediente(insumoData.custoUnitarioBase, ing.quantidade, insumoData.rendimento) : 0;
            
            return `
                <tr>
                    <td data-label="Insumo">${escapeHTML(nomeExibicao)}</td>
                    <td data-label="Qtd">
                        <input type="number" step="0.01" min="0" class="input-qtd" data-index="${index}" value="${ing.quantidade}" style="padding: 6px; width: 100%;">
                    </td>
                    <td data-label="Unid" style="color: var(--text-muted);">${escapeHTML(unidadeExibicao)}</td>
                    <td data-label="Custo">${Calc.formatCurrency(custoItem)}</td>
                    <td style="text-align: right;">
                        <button type="button" class="btn btn-danger btn-remove-ing" data-index="${index}" style="padding: 4px 8px; border: none;"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        if (currentIngredientesPreparo.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Adicione insumos à receita.</td></tr>`;
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }

        tbody.querySelectorAll('.input-qtd').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                currentIngredientesPreparo[idx].quantidade = parseFloat(e.target.value) || 0;
                debouncedUpdatePricing();
            });
            input.addEventListener('change', renderFichaRows);
        });

        tbody.querySelectorAll('.btn-remove-ing').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                currentIngredientesPreparo.splice(idx, 1);
                renderFichaRows();
            });
        });

        updatePricingPanel(container);
    };

    btnAdd.addEventListener('click', () => {
        const id = select.value;
        if (!id) return;
        const insumo = STATE.insumos.find(i => i.id === id);
        if (insumo) {
            const existe = currentIngredientesPreparo.find(i => i.insumoId === id);
            if (existe) existe.quantidade += 1;
            else currentIngredientesPreparo.push({ insumoId: id, quantidade: 1 });
            select.value = '';
            renderFichaRows();
        }
    });

    inputRendimento.addEventListener('input', debouncedUpdatePricing);
    inputUnidade.addEventListener('change', debouncedUpdatePricing);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (currentIngredientesPreparo.length === 0) {
            showToast("A receita precisa ter pelo menos um insumo.", "error");
            return;
        }

        const rendimento = parseFloat(inputRendimento.value) || 0;
        if (rendimento <= 0) {
            showToast("O rendimento deve ser maior que zero.", "error");
            return;
        }

        const novoPreparo = {
            id: currentPreparoEditId || generateId(),
            nome: container.querySelector('#prep_nome').value,
            rendimentoBase: rendimento,
            unidadeBase: inputUnidade.value,
            ingredientes: JSON.parse(JSON.stringify(currentIngredientesPreparo))
        };

        if (currentPreparoEditId) {
            const idx = STATE.preparos.findIndex(p => p.id === currentPreparoEditId);
            if (idx !== -1) STATE.preparos[idx] = novoPreparo;
        } else {
            STATE.preparos.push(novoPreparo);
        }

        updateAndSaveState();
        showToast("Preparo salvo com sucesso!");
        window.location.hash = '#preparos';
    });

    renderFichaRows();
};

const updatePricingPanel = (container) => {
    let custoTotal = 0;
    currentIngredientesPreparo.forEach(ing => {
        const insumo = STATE.insumos.find(i => i.id === ing.insumoId);
        if (insumo) {
            custoTotal += Calc.calcCustoIngrediente(insumo.custoUnitarioBase, ing.quantidade, insumo.rendimento);
        }
    });

    const rendimento = parseFloat(container.querySelector('#prep_rendimento').value) || 1;
    const unidade = container.querySelector('#prep_unidade').value;
    const custoBase = custoTotal / rendimento;

    container.querySelector('#lblCustoTotalPrep').textContent = Calc.formatCurrency(custoTotal);
    container.querySelector('#lblCustoBasePrep').textContent = `${Calc.formatCurrency(custoBase)} / ${unidade}`;
};
