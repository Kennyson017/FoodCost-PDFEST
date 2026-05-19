// js/pages/produtos.js
import { STATE, saveState, generateId, updateAndSaveState } from '../state.js';
import * as Calc from '../calc.js';
import { showToast, escapeHTML, renderBadge, debounce } from '../components.js';

let currentProdutoEditId = null;
let currentIngredientes = []; // Estado temporário para a ficha técnica

let searchQueryProd = '';
let filterCategoriaProd = '';

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
    let produtos = STATE.produtos || [];
    const margemMeta = STATE.negocio.margemMeta || 0;

    // Filter
    if (searchQueryProd) {
        produtos = produtos.filter(p => p.nome.toLowerCase().includes(searchQueryProd.toLowerCase()));
    }
    if (filterCategoriaProd) {
        produtos = produtos.filter(p => p.categoria === filterCategoriaProd);
    }

    const categories = ['Smash', 'Artesanal', 'Tradicional', 'Combo', 'Veggie', 'Sobremesa', 'Bebida', 'Acompanhamento'];

    container.innerHTML = `
        <div class="header-action">
            <div>
                <h1>Produtos do Cardápio</h1>
                <p style="color: var(--text-muted);">${STATE.produtos.length} produtos totais</p>
            </div>
            <a href="#produtos/novo" class="btn btn-primary">+ Novo Produto</a>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 16px;">
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <div style="flex: 2; min-width: 200px;">
                    <input type="text" id="searchProduto" placeholder="Buscar produto por nome..." value="${escapeHTML(searchQueryProd)}" style="padding: 8px 16px;">
                </div>
                <div style="flex: 1; min-width: 150px;">
                    <select id="filterCategoriaProduto" style="padding: 8px 16px;">
                        <option value="">Todas as Categorias</option>
                        ${categories.map(c => `<option value="${c}" ${filterCategoriaProd === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div class="card-grid">
            ${produtos.map(p => `
                <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; gap: 16px; align-items: flex-start;">
                        <div style="width: 60px; height: 60px; border-radius: 8px; flex-shrink: 0; background-color: var(--bg-hover); background-image: url('${p.imagem || ''}'); background-size: cover; background-position: center; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            ${!p.imagem ? '<span style="font-size: 1.5rem; color: var(--text-muted);">🍔</span>' : ''}
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h3 style="margin-bottom: 4px;">${escapeHTML(p.nome)}</h3>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(p.categoria)} • ${(p.ingredientes || []).length} insumos</span>
                                </div>
                                ${renderBadge(p.margemReal, margemMeta)}
                            </div>
                        </div>
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

    // Bind filters
    const searchInput = container.querySelector('#searchProduto');
    const categoryFilter = container.querySelector('#filterCategoriaProduto');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQueryProd = e.target.value;
            renderList(container);
            const input = document.getElementById('searchProduto');
            if (input) input.focus(); // keep focus
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterCategoriaProd = e.target.value;
            renderList(container);
        });
    }
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
        <div class="header-action">
            <a href="#produtos" style="color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 8px;">← Voltar para lista</a>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <h1>${currentProdutoEditId ? 'Editar Produto' : 'Novo Produto'}</h1>
                ${currentProdutoEditId ? `<button type="button" id="btnExportarPDF" class="btn btn-secondary">📄 Exportar PDF</button>` : ''}
            </div>
        </div>

        <form id="produtoForm">
            <div class="layout-split">
                
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <!-- Dados Básicos -->
                    <div class="card">
                        <h2>Dados do Produto</h2>
                        <div class="form-row" style="align-items: center;">
                            <div class="form-group" style="flex: 0 0 100px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <div id="imgPreview" style="width: 80px; height: 80px; border-radius: 8px; background-color: var(--bg-hover); background-image: url('${produto.imagem || ''}'); background-size: cover; background-position: center; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    ${!produto.imagem ? '<span style="font-size: 24px; color: var(--text-muted);">📷</span>' : ''}
                                </div>
                                <label class="btn btn-secondary" style="font-size: 0.75rem; padding: 4px 8px; cursor: pointer;">
                                    Foto
                                    <input type="file" id="prod_imagem" accept="image/*" style="display: none;">
                                </label>
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
                                <div class="form-row" style="margin-bottom: 0;">
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
                        </div>
                    </div>

                    <!-- Ficha Técnica -->
                    <div class="card">
                        <h2>Ficha Técnica (Ingredientes)</h2>
                        
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <select id="insumoSelect" style="flex: 1;">
                                <option value="">Selecione um insumo ou preparo...</option>
                                <optgroup label="Insumos">
                                    ${STATE.insumos.map(i => `<option value="ins_${i.id}">${escapeHTML(i.nome)} (${Calc.formatCurrency(i.custoUnitarioBase)}/${i.unidadeBase})</option>`).join('')}
                                </optgroup>
                                <optgroup label="Preparos (Sub-receitas)">
                                    ${(STATE.preparos || []).map(p => `<option value="prep_${p.id}">${escapeHTML(p.nome)} (${Calc.formatCurrency(p.custoUnitarioBase)}/${p.unidadeBase})</option>`).join('')}
                                </optgroup>
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

    const debouncedUpdatePricingPanel = debounce(() => updatePricingPanel(container), 300);

    const renderFichaRows = () => {
        tbody.innerHTML = currentIngredientes.map((ing, index) => {
            const insumoData = STATE.insumos.find(i => i.id === ing.insumoId);
            const preparoData = (STATE.preparos || []).find(p => p.id === ing.preparoId);
            
            let nomeExibicao = 'Item Removido';
            let unidadeExibicao = 'un';
            let custoItem = 0;

            if (insumoData) {
                nomeExibicao = insumoData.nome;
                unidadeExibicao = insumoData.unidadeBase;
                custoItem = Calc.calcCustoIngrediente(insumoData.custoUnitarioBase, ing.quantidade, insumoData.rendimento);
            } else if (preparoData) {
                nomeExibicao = preparoData.nome + ' (Preparo)';
                unidadeExibicao = preparoData.unidadeBase;
                custoItem = Calc.calcCustoIngrediente(preparoData.custoUnitarioBase, ing.quantidade, 100);
            }
            
            return `
                <tr>
                    <td data-label="Item">${escapeHTML(nomeExibicao)}</td>
                    <td data-label="Quantidade">
                        <input type="number" step="0.01" min="0" class="input-qtd" data-index="${index}" value="${ing.quantidade}" style="padding: 6px; width: 100%;">
                    </td>
                    <td data-label="Unidade" style="color: var(--text-muted);">${escapeHTML(unidadeExibicao)}</td>
                    <td data-label="Custo">${Calc.formatCurrency(custoItem)}</td>
                    <td style="text-align: right;">
                        <button type="button" class="btn btn-danger btn-remove-ing" data-index="${index}" style="padding: 4px 8px; border: none;">✖</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (currentIngredientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Adicione insumos ou preparos para compor o produto.</td></tr>`;
        }

        // Binds das linhas
        tbody.querySelectorAll('.input-qtd').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                currentIngredientes[idx].quantidade = parseFloat(e.target.value) || 0;
                debouncedUpdatePricingPanel();
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
        const val = select.value;
        if (!val) return;
        
        const type = val.split('_')[0];
        const id = val.substring(type.length + 1);

        if (type === 'ins') {
            const insumo = STATE.insumos.find(i => i.id === id);
            if (insumo) {
                const existe = currentIngredientes.find(i => i.insumoId === id);
                if (existe) existe.quantidade += 1;
                else currentIngredientes.push({ insumoId: id, nomeInsumo: insumo.nome, quantidade: 1, unidade: insumo.unidadeBase });
            }
        } else if (type === 'prep') {
            const preparo = (STATE.preparos || []).find(p => p.id === id);
            if (preparo) {
                const existe = currentIngredientes.find(i => i.preparoId === id);
                if (existe) existe.quantidade += 1;
                else currentIngredientes.push({ preparoId: id, nomeInsumo: preparo.nome, quantidade: 1, unidade: preparo.unidadeBase });
            }
        }
        
        select.value = ''; // reseta
        renderFichaRows();
    });

    inputPrecoPraticado.addEventListener('input', debouncedUpdatePricingPanel);

    let currentImageBase64 = null;
    const inputImagem = container.querySelector('#prod_imagem');
    const imgPreview = container.querySelector('#imgPreview');

    if (currentProdutoEditId) {
        const p = STATE.produtos.find(prod => prod.id === currentProdutoEditId);
        if (p && p.imagem) {
            currentImageBase64 = p.imagem;
        }
    }

    inputImagem.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                currentImageBase64 = ev.target.result;
                imgPreview.style.backgroundImage = `url('${currentImageBase64}')`;
                imgPreview.innerHTML = ''; // Remove the camera emoji
            };
            reader.readAsDataURL(file);
        }
    });

    const btnExportarPDF = container.querySelector('#btnExportarPDF');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', () => {
            const produtoNome = container.querySelector('#prod_nome').value || 'Produto';
            
            // Build a temporary hidden element for the PDF
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '20px';
            pdfContainer.style.fontFamily = 'DM Sans, sans-serif';
            pdfContainer.style.color = '#000';
            pdfContainer.style.backgroundColor = '#fff';
            
            const ingredientesHtml = currentIngredientes.map(ing => {
                const insumoData = STATE.insumos.find(i => i.id === ing.insumoId);
                const preparoData = (STATE.preparos || []).find(p => p.id === ing.preparoId);
                let nome = 'Removido';
                let unidade = 'un';
                if (insumoData) { nome = insumoData.nome; unidade = insumoData.unidadeBase; }
                else if (preparoData) { nome = preparoData.nome + ' (Preparo)'; unidade = preparoData.unidadeBase; }
                return `<li>${ing.quantidade} ${unidade} - ${nome}</li>`;
            }).join('');

            pdfContainer.innerHTML = `
                <h1 style="font-family: Syne, sans-serif; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Ficha Técnica</h1>
                <h2>${escapeHTML(produtoNome)}</h2>
                <p><strong>Categoria:</strong> ${container.querySelector('#prod_categoria').value}</p>
                
                <h3 style="margin-top: 20px;">Ingredientes:</h3>
                <ul>${ingredientesHtml}</ul>
                
                <h3 style="margin-top: 20px;">Custos e Preços:</h3>
                <p><strong>Custo de Ingredientes:</strong> ${container.querySelector('#lblCustoIngredientes').textContent}</p>
                <p><strong>Custo Total de Produção:</strong> ${container.querySelector('#lblCustoTotal').textContent}</p>
                <p><strong>Preço Praticado:</strong> ${Calc.formatCurrency(parseFloat(inputPrecoPraticado.value) || 0)}</p>
                <p><strong>Preço Sugerido:</strong> ${container.querySelector('#lblPrecoSugerido').textContent}</p>
            `;
            
            const opt = {
                margin:       1,
                filename:     `Ficha_Tecnica_${produtoNome.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Needs to be in body to render properly sometimes, so we attach, print, detach
            document.body.appendChild(pdfContainer);
            html2pdf().set(opt).from(pdfContainer).save().then(() => {
                document.body.removeChild(pdfContainer);
                showToast("PDF gerado com sucesso!");
            });
        });
    }

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
            ingredientes: JSON.parse(JSON.stringify(currentIngredientes)),
            imagem: currentImageBase64
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
        const preparo = (STATE.preparos || []).find(p => p.id === ing.preparoId);
        
        if (insumo) {
            custoIngredientes += Calc.calcCustoIngrediente(insumo.custoUnitarioBase, ing.quantidade, insumo.rendimento);
        } else if (preparo) {
            custoIngredientes += Calc.calcCustoIngrediente(preparo.custoUnitarioBase, ing.quantidade, 100);
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
