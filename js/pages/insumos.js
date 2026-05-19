// js/pages/insumos.js
import { STATE, saveState, generateId, updateAndSaveState } from '../state.js';
import * as Calc from '../calc.js';
import { showToast, escapeHTML } from '../components.js';

let currentInsumoEditId = null;
let searchQuery = '';
let filterCategoria = '';

export const renderInsumos = (container, params = []) => {
    if (params.length > 0) {
        if (params[0] === 'novo') {
            currentInsumoEditId = null;
            renderForm(container);
            return;
        } else if (params[1] === 'editar') {
            currentInsumoEditId = params[0];
            renderForm(container);
            return;
        }
    }

    renderList(container);
};

const renderList = (container) => {
    let insumos = STATE.insumos || [];

    // Filter
    if (searchQuery) {
        insumos = insumos.filter(i => i.nome.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterCategoria) {
        insumos = insumos.filter(i => i.categoria === filterCategoria);
    }

    const categories = ['Proteína', 'Pão', 'Queijo / laticínio', 'Vegetal / folha', 'Molho / condimento', 'Embalagem', 'Outros'];

    container.innerHTML = `
        <div class="header-action">
            <div>
                <h1>Insumos</h1>
                <p style="color: var(--text-muted);">${STATE.insumos.length} itens totais</p>
            </div>
            <a href="#insumos/novo" class="btn btn-primary">+ Novo Insumo</a>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 16px;">
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <div style="flex: 2; min-width: 200px;">
                    <input type="text" id="searchInsumo" placeholder="Buscar insumo por nome..." value="${escapeHTML(searchQuery)}" style="padding: 8px 16px;">
                </div>
                <div style="flex: 1; min-width: 150px;">
                    <select id="filterCategoriaInsumo" style="padding: 8px 16px;">
                        <option value="">Todas as Categorias</option>
                        ${categories.map(c => `<option value="${c}" ${filterCategoria === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table id="tabelaInsumos">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Medida</th>
                        <th>Preço Compra</th>
                        <th>Custo Base</th>
                        <th style="text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${insumos.map(i => `
                        <tr>
                            <td data-label="Nome"><strong>${escapeHTML(i.nome)}</strong></td>
                            <td data-label="Categoria"><span class="badge badge-neutral">${escapeHTML(i.categoria)}</span></td>
                            <td data-label="Medida">${i.quantidadeCompra} ${escapeHTML(i.unidadeCompra)}</td>
                            <td data-label="Preço Compra">${Calc.formatCurrency(i.precoCompra)}</td>
                            <td data-label="Custo Base"><strong style="color: var(--primary);">${Calc.formatCurrency(i.custoUnitarioBase)} / ${escapeHTML(i.unidadeBase)}</strong></td>
                            <td data-label="Ações" style="text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                                <a href="#insumos/${i.id}/editar" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Editar</a>
                                <button class="btn btn-danger btn-excluir" data-id="${i.id}" style="padding: 6px 12px; font-size: 0.85rem;">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                    ${insumos.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 32px;">Nenhum insumo cadastrado.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;

    // Bind excluir
    container.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm("Tem certeza que deseja excluir este insumo? Isso afetará produtos que o utilizam.")) {
                STATE.insumos = STATE.insumos.filter(i => i.id !== id);
                updateAndSaveState(); // recalcula e salva
                showToast("Insumo excluído.");
                renderList(container); // Re-renderiza
            }
        });
    });

    // Bind filters
    const searchInput = container.querySelector('#searchInsumo');
    const categoryFilter = container.querySelector('#filterCategoriaInsumo');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderList(container);
            const input = document.getElementById('searchInsumo');
            if (input) input.focus(); // keep focus
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterCategoria = e.target.value;
            renderList(container);
        });
    }
};

const renderForm = (container) => {
    let insumo = {
        nome: '', categoria: 'Proteína', unidadeCompra: 'kg', unidadeBase: 'g', 
        precoCompra: '', quantidadeCompra: '', rendimento: 100
    };

    if (currentInsumoEditId) {
        const found = STATE.insumos.find(i => i.id === currentInsumoEditId);
        if (found) insumo = { ...found };
        else return window.location.hash = '#insumos'; // volta pra lista se não achar
    }

    container.innerHTML = `
        <div class="header-action">
            <a href="#insumos" style="color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 8px;">← Voltar para lista</a>
            <h1>${currentInsumoEditId ? 'Editar Insumo' : 'Novo Insumo'}</h1>
        </div>

        <div class="card" style="max-width: 800px;">
            <form id="insumoForm">
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <label>Nome do Insumo *</label>
                        <input type="text" id="ins_nome" value="${escapeHTML(insumo.nome)}" required placeholder="Ex: Queijo Cheddar Fatiado">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select id="ins_categoria">
                            ${['Proteína', 'Pão', 'Queijo / laticínio', 'Vegetal / folha', 'Molho / condimento', 'Embalagem', 'Outros'].map(c => `
                                <option value="${c}" ${insumo.categoria === c ? 'selected' : ''}>${c}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <h3 style="margin-top: 24px; margin-bottom: 16px; font-size: 1.1rem;">Dados de Compra</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Preço Pago *</label>
                        <div class="input-group has-prefix">
                            <span class="input-prefix">R$</span>
                            <input type="number" step="0.01" min="0" id="ins_preco" value="${insumo.precoCompra}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Quantidade Comprada *</label>
                        <input type="number" step="0.001" min="0" id="ins_qtd" value="${insumo.quantidadeCompra}" required>
                    </div>
                    <div class="form-group">
                        <label>Unidade de Medida *</label>
                        <select id="ins_unidade">
                            <option value="kg" ${insumo.unidadeCompra === 'kg' ? 'selected' : ''}>kg (Quilograma)</option>
                            <option value="g" ${insumo.unidadeCompra === 'g' ? 'selected' : ''}>g (Grama)</option>
                            <option value="L" ${insumo.unidadeCompra === 'L' ? 'selected' : ''}>L (Litro)</option>
                            <option value="ml" ${insumo.unidadeCompra === 'ml' ? 'selected' : ''}>ml (Mililitro)</option>
                            <option value="un" ${insumo.unidadeCompra === 'un' ? 'selected' : ''}>un (Unidade)</option>
                            <option value="cx" ${insumo.unidadeCompra === 'cx' ? 'selected' : ''}>cx (Caixa)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Rendimento Pós-Preparo (%)</label>
                        <div class="input-group has-suffix">
                            <input type="number" min="0" max="100" id="ins_rendimento" value="${insumo.rendimento}" title="Ex: Bacon perde 30% na chapa, então rende 70%">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; justify-content: center;">
                        <div style="background-color: var(--primary-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--primary); text-align: center;">
                            <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Custo Base Calculado</span>
                            <strong id="previewCusto" style="color: var(--primary); font-size: 1.2rem;">R$ 0,00 / un</strong>
                        </div>
                    </div>
                </div>

                ${insumo.historicoPrecos && insumo.historicoPrecos.length > 0 ? `
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-muted);">Histórico de Preços</h3>
                    <ul style="list-style: none; padding: 0; font-size: 0.85rem;">
                        ${insumo.historicoPrecos.map(h => `
                            <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light);">
                                <span>${new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                <span><strong>${Calc.formatCurrency(h.preco)}</strong> por ${h.qtd} un/kg</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end;">
                    <a href="#insumos" class="btn btn-secondary">Cancelar</a>
                    <button type="submit" class="btn btn-primary">Salvar Insumo</button>
                </div>
            </form>
        </div>
    `;

    // Lógica de UI em tempo real
    const form = container.querySelector('#insumoForm');
    const inputPreco = container.querySelector('#ins_preco');
    const inputQtd = container.querySelector('#ins_qtd');
    const inputUnidade = container.querySelector('#ins_unidade');
    const previewCusto = container.querySelector('#previewCusto');

    const updatePreview = () => {
        const preco = parseFloat(inputPreco.value) || 0;
        const qtd = parseFloat(inputQtd.value) || 0;
        const uni = inputUnidade.value;
        
        if (preco > 0 && qtd > 0) {
            const custo = Calc.calcCustoUnitario(preco, qtd, uni);
            const uniBase = getUnidadeBase(uni);
            previewCusto.textContent = `${Calc.formatCurrency(custo)} / ${uniBase}`;
        } else {
            previewCusto.textContent = `R$ 0,00`;
        }
    };

    const debouncedUpdatePreview = debounce(updatePreview, 300);
    [inputPreco, inputQtd, inputUnidade].forEach(el => el.addEventListener('input', debouncedUpdatePreview));
    updatePreview(); // initial call

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const preco = parseFloat(inputPreco.value);
        const qtd = parseFloat(inputQtd.value);
        
        if (preco <= 0 || qtd <= 0) {
            showToast("Preço e Quantidade devem ser maiores que zero.", "error");
            return;
        }

        const novoInsumo = {
            id: currentInsumoEditId || generateId(),
            nome: container.querySelector('#ins_nome').value,
            categoria: container.querySelector('#ins_categoria').value,
            unidadeCompra: inputUnidade.value,
            unidadeBase: getUnidadeBase(inputUnidade.value),
            precoCompra: preco,
            quantidadeCompra: qtd,
            rendimento: parseFloat(container.querySelector('#ins_rendimento').value) || 100,
            historicoPrecos: insumo.historicoPrecos || []
        };

        // Add to history if new or price changed
        const hasPriceChanged = !currentInsumoEditId || insumo.precoCompra !== preco || insumo.quantidadeCompra !== qtd;
        if (hasPriceChanged) {
            novoInsumo.historicoPrecos.unshift({
                data: new Date().toISOString().split('T')[0],
                preco: preco,
                qtd: qtd
            });
            // Keep last 10 records
            if (novoInsumo.historicoPrecos.length > 10) novoInsumo.historicoPrecos.pop();
        }

        if (currentInsumoEditId) {
            const index = STATE.insumos.findIndex(i => i.id === currentInsumoEditId);
            if (index !== -1) STATE.insumos[index] = novoInsumo;
        } else {
            STATE.insumos.push(novoInsumo);
        }

        updateAndSaveState(); // Recalcula custoUnitarioBase e afeta produtos, depois salva
        showToast("Insumo salvo com sucesso!");
        window.location.hash = '#insumos';
    });
};

const getUnidadeBase = (unidadeCompra) => {
    const mapa = {
        'kg': 'g', 'g': 'g',
        'L': 'ml', 'ml': 'ml',
        'un': 'un', 'cx': 'cx', 'pct': 'pct'
    };
    return mapa[unidadeCompra] || 'un';
};
