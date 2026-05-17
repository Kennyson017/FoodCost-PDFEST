// js/pages/produtos.js
import { STATE, saveState, generateId, updateAndSaveState } from '../state.js';
import * as Calc from '../calc.js';
import { showToast, escapeHTML, renderBadge } from '../components.js';

let currentProdutoEditId = null;
let currentIngredientes = []; // Estado temporário para a ficha técnica

export const renderProdutos = (container, params = []) => {
    if (params.length > 0) {
        if (params[0] === 'novo') {
            currentProdutoEditId = null;
            currentIngredientes = [];
            renderForm(container);
            return;
        } else if (params[1] === 'editar') {
            currentProdutoEditId = params[0];
            const found = STATE.produtos.find(p => p.id === currentProdutoEditId);
            currentIngredientes = found ? JSON.parse(JSON.stringify(found.ingredientes || [])) : [];
            renderForm(container);
            return;
        }
    }

    renderList(container);
};

const renderList = (container) => {
    const produtos = STATE.produtos || [];
    const margemMeta = STATE.negocio.margemMeta || 0;

    container.innerHTML = `
        <div class="header-action" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1>Produtos do Cardápio</h1>
                <p style="color: var(--text-muted);">${produtos.length} produtos cadastrados</p>
            </div>
            <a href="#produtos/novo" class="btn btn-primary">+ Novo Produto</a>
        </div>

        <div class="card-grid">
            ${produtos.map(p => `
                <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="margin-bottom: 4px;">${escapeHTML(p.nome)}</h3>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(p.categoria)} • ${(p.ingredientes || []).length} insumos</span>
                        </div>
                        ${renderBadge(p.margemReal, margemMeta)}
                    </div>
                    
                    <div style="background-color: var(--bg-panel); padding: 12px; border-radius: 8px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--text-muted);">Custo de Produção</span>
                            <strong>${Calc.formatCurrency(p.custoTotalProducao)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--text-muted);">Preço Sugerido</span>
                            <span>${Calc.formatCurrency(p.precoSugerido)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
                            <span style="color: var(--text-muted);">Preço Praticado</span>
                            <strong style="color: var(--primary); font-size: 1.1rem;">${Calc.formatCurrency(p.precoPraticado)}</strong>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: auto;">
                        <button class="btn btn-secondary btn-duplicar" data-id="${p.id}" style="padding: 6px 12px; font-size: 0.85rem;">Duplicar</button>
                        <a href="#produtos/${p.id}/editar" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Editar</a>
                        <button class="btn btn-danger btn-excluir" data-id="${p.id}" style="padding: 6px 12px; font-size: 0.85rem;">Excluir</button>
                    </div>
                </div>
            `).join('')}
            ${produtos.length === 0 ? '<div class="card"><p style="text-align: center; padding: 32px 0;">Nenhum produto cadastrado.</p></div>' : ''}
        </div>
    `;

    // Bind excluir
    container.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Tem certeza que deseja excluir este produto?")) {
                STATE.produtos = STATE.produtos.filter(p => p.id !== e.target.dataset.id);
                updateAndSaveState();
                showToast("Produto excluído.");
                renderList(container);
            }
        });
    });

    // Bind duplicar
    container.querySelectorAll('.btn-duplicar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const original = STATE.produtos.find(p => p.id === e.target.dataset.id);
            if (original) {
                const copia = JSON.parse(JSON.stringify(original));
                copia.id = generateId();
                copia.nome = copia.nome + " (Cópia)";
                STATE.produtos.push(copia);
                updateAndSaveState();
                showToast("Produto duplicado!");
                renderList(container);
            }
        });
    });
};

const renderForm = (container) => {
    let produto = {
        nome: '', categoria: 'Artesanal', precoPraticado: 0, descricao: ''
    };

    if (currentProdutoEditId) {
        const found = STATE.produtos.find(p => p.id === currentProdutoEditId);
        if (found) produto = { ...found };
        else return window.location.hash = '#produtos';
    }

    const negocio = STATE.negocio || {};
    const custoOp = negocio.custoOpUnitario || 0;
    const margemMeta = negocio.margemMeta || 0;

    container.innerHTML = `
        <div class="header-action" style="margin-bottom: 24px;">
            <a href="#produtos" style="color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 8px;">← Voltar para lista</a>
            <h1>${currentProdutoEditId ? 'Editar Produto' : 'Novo Produto'}</h1>
        </div>

        <form id="produtoForm">
            <div class="layout-split">
                
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <!-- Dados Básicos -->
                    <div class="card">
                        <h2>Dados do Produto</h2>
                        <div class="form-row">
                            <div class="form-group" style="flex: 2;">
                                <label>Nome do Produto *</label>
                                <input type="text" id="prod_nome" value="${escapeHTML(produto.nome)}" required placeholder="Ex: Smash Duplo Bacon">
                            </div>
                            <div class="form-group">
                                <label>Categoria *</label>
                                <select id="prod_categoria">
                                    ${['Smash', 'Artesanal', 'Tradicional', 'Combo', 'Veggie', 'Sobremesa', 'Bebida', 'Acompanhamento'].map(c => `
                                        <option value="${c}" ${produto.categoria === c ? 'selected' : ''}>${c}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Ficha Técnica -->
                    <div class="card">
                        <h2>Ficha Técnica (Ingredientes)</h2>
                        
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <select id="insumoSelect" style="flex: 1;">
                                <option value="">Selecione um insumo para adicionar...</option>
                                ${STATE.insumos.map(i => `<option value="${i.id}">${escapeHTML(i.nome)} (${Calc.formatCurrency(i.custoUnitarioBase)}/${i.unidadeBase})</option>`).join('')}
                            </select>
                            <button type="button" id="btnAddInsumo" class="btn btn-secondary">Adicionar</button>
                        </div>

                        <div class="table-container">
                            <table id="tabelaFichaTecnica">
                                <thead>
                                    <tr>
                                        <th>Insumo</th>
                                        <th style="width: 120px;">Quantidade</th>
                                        <th>Unidade</th>
                                        <th>Custo</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody id="fichaTecnicaBody">
                                    <!-- Renderizado via JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Precificação (Sidebar) -->
                <div class="card" style="position: sticky; top: 24px;">
                    <h2>Precificação</h2>
                    
                    <div style="background-color: var(--bg-panel); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--text-muted);">Custo Ingredientes</span>
                            <span id="lblCustoIngredientes">R$ 0,00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                            <span style="color: var(--text-muted); cursor: help;" title="Valor definido na página Negócio">+ Custo Operacional</span>
                            <span>${Calc.formatCurrency(custoOp)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <strong>Custo Total de Produção</strong>
                            <strong id="lblCustoTotal" style="color: var(--status-danger);">R$ 0,00</strong>
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label>Preço Sugerido (Margem ${margemMeta}%)</label>
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 8px;" id="lblPrecoSugerido">R$ 0,00</div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Calculado incluindo taxas do negócio (${(negocio.taxaImpostos||0) + (negocio.taxaMaquininha||0)}%).</p>
                    </div>

                    <div class="form-group">
                        <label>Preço de Venda Praticado *</label>
                        <div class="input-group has-prefix">
                            <span class="input-prefix">R$</span>
                            <input type="number" step="0.01" id="prod_preco" value="${produto.precoPraticado}" required style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 0.9rem; color: var(--text-muted);">Margem Real Alcançada:</span>
                        <div id="lblBadgeMargem" style="margin-top: 8px;">
                            <!-- Renderizado via JS -->
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Salvar Produto</button>
                        <a href="#produtos" class="btn btn-secondary" style="width: 100%; text-align: center;">Cancelar</a>
                    </div>
                </div>

            </div>
        </form>
    `;

    bindFichaTecnicaEvents(container);
};

const bindFichaTecnicaEvents = (container) => {
    const tbody = container.querySelector('#fichaTecnicaBody');
    const btnAdd = container.querySelector('#btnAddInsumo');
    const select = container.querySelector('#insumoSelect');
    const form = container.querySelector('#produtoForm');
    const inputPrecoPraticado = container.querySelector('#prod_preco');

    const renderFichaRows = () => {
        tbody.innerHTML = currentIngredientes.map((ing, index) => {
            const insumoData = STATE.insumos.find(i => i.id === ing.insumoId);
            const nomeExibicao = insumoData ? insumoData.nome : (ing.nomeInsumo + ' (Removido)');
            const unidadeExibicao = insumoData ? insumoData.unidadeBase : ing.unidade;
            const custoItem = insumoData ? Calc.calcCustoIngrediente(insumoData.custoUnitarioBase, ing.quantidade, insumoData.rendimento) : 0;
            
            return `
                <tr>
                    <td>${escapeHTML(nomeExibicao)}</td>
                    <td>
                        <input type="number" step="0.01" min="0" class="input-qtd" data-index="${index}" value="${ing.quantidade}" style="padding: 6px; width: 100%;">
                    </td>
                    <td style="color: var(--text-muted);">${escapeHTML(unidadeExibicao)}</td>
                    <td>${Calc.formatCurrency(custoItem)}</td>
                    <td style="text-align: right;">
                        <button type="button" class="btn btn-danger btn-remove-ing" data-index="${index}" style="padding: 4px 8px; border: none;">✖</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (currentIngredientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Adicione insumos para compor o produto.</td></tr>`;
        }

        // Binds das linhas
        tbody.querySelectorAll('.input-qtd').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                currentIngredientes[idx].quantidade = parseFloat(e.target.value) || 0;
                updatePricingPanel(container);
                // Não re-renderiza a tabela toda no 'input' pra não perder foco, só atualiza painel
            });
            input.addEventListener('change', renderFichaRows); // re-renderiza no blur
        });

        tbody.querySelectorAll('.btn-remove-ing').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                currentIngredientes.splice(idx, 1);
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
            // Verifica se já existe, se sim só soma
            const existe = currentIngredientes.find(i => i.insumoId === id);
            if (existe) {
                existe.quantidade += 1;
            } else {
                currentIngredientes.push({
                    insumoId: id,
                    nomeInsumo: insumo.nome,
                    quantidade: 1, // default
                    unidade: insumo.unidadeBase
                });
            }
            select.value = ''; // reseta
            renderFichaRows();
        }
    });

    inputPrecoPraticado.addEventListener('input', () => updatePricingPanel(container));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (currentIngredientes.length === 0) {
            showToast("O produto precisa ter pelo menos um insumo.", "error");
            return;
        }

        const novoProduto = {
            id: currentProdutoEditId || generateId(),
            nome: container.querySelector('#prod_nome').value,
            categoria: container.querySelector('#prod_categoria').value,
            precoPraticado: parseFloat(inputPrecoPraticado.value) || 0,
            ingredientes: JSON.parse(JSON.stringify(currentIngredientes))
        };

        if (currentProdutoEditId) {
            const idx = STATE.produtos.findIndex(p => p.id === currentProdutoEditId);
            if (idx !== -1) STATE.produtos[idx] = novoProduto;
        } else {
            STATE.produtos.push(novoProduto);
        }

        updateAndSaveState(); // Recalcula totais
        showToast("Produto salvo com sucesso!");
        window.location.hash = '#produtos';
    });

    renderFichaRows(); // render inicial
};

const updatePricingPanel = (container) => {
    let custoIngredientes = 0;
    
    currentIngredientes.forEach(ing => {
        const insumo = STATE.insumos.find(i => i.id === ing.insumoId);
        if (insumo) {
            custoIngredientes += Calc.calcCustoIngrediente(insumo.custoUnitarioBase, ing.quantidade, insumo.rendimento);
        }
    });

    const negocio = STATE.negocio || {};
    const custoOp = negocio.custoOpUnitario || 0;
    const custoTotal = Calc.calcCustoProducao([{ custoIngrediente: custoIngredientes }], custoOp); // hack pra reaproveitar func
    
    const precoSugerido = Calc.calcPrecoSugerido(
        custoTotal, 
        negocio.margemMeta || 0, 
        negocio.taxaImpostos || 0, 
        negocio.taxaMaquininha || 0
    );

    const precoPraticado = parseFloat(container.querySelector('#prod_preco').value) || 0;
    const margemReal = Calc.calcMargemReal(precoPraticado, custoTotal);

    container.querySelector('#lblCustoIngredientes').textContent = Calc.formatCurrency(custoIngredientes);
    container.querySelector('#lblCustoTotal').textContent = Calc.formatCurrency(custoTotal);
    container.querySelector('#lblPrecoSugerido').textContent = Calc.formatCurrency(precoSugerido);
    
    container.querySelector('#lblBadgeMargem').innerHTML = renderBadge(margemReal, negocio.margemMeta || 0);
};
