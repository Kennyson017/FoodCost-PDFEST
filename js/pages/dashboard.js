// js/pages/dashboard.js
import { STATE } from '../state.js';
import * as Calc from '../calc.js';
import { escapeHTML, renderBadge } from '../components.js';

export const renderDashboard = (container) => {
    const produtos = STATE.produtos || [];
    const insumos = STATE.insumos || [];
    const negocio = STATE.negocio || {};
    const margemMeta = negocio.margemMeta || 0;

    // Métricas
    const totalInsumos = insumos.length;
    const totalProdutos = produtos.length;
    
    let prodMaisCaro = null;
    let prodMenorMargem = null;
    let prodMaiorMargem = null;
    let produtosEmPrejuizo = 0;

    produtos.forEach(p => {
        if (!prodMaisCaro || p.custoTotalProducao > prodMaisCaro.custoTotalProducao) {
            prodMaisCaro = p;
        }
        if (!prodMenorMargem || p.margemReal < prodMenorMargem.margemReal) {
            prodMenorMargem = p;
        }
        if (!prodMaiorMargem || p.margemReal > prodMaiorMargem.margemReal) {
            prodMaiorMargem = p;
        }
        if (p.margemReal < 0) {
            produtosEmPrejuizo++;
        }
    });

    container.innerHTML = `
        <div class="header-action" style="margin-bottom: 24px;">
            <h1>Dashboard</h1>
            <p style="color: var(--text-muted);">Visão geral da rentabilidade do seu cardápio</p>
        </div>

        ${produtosEmPrejuizo > 0 ? `
            <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--status-danger); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <strong style="color: var(--status-danger);"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> Atenção:</strong> Você tem ${produtosEmPrejuizo} produto(s) sendo vendido(s) abaixo do custo de produção!
            </div>
        ` : ''}

        <!-- Cards de Resumo -->
        <div class="card-grid" style="margin-bottom: 32px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="card icon-decorative" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total de Insumos</span>
                    <span style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.1); color: var(--primary); border-radius: 8px;">
                        <i data-lucide="package-open" style="width: 20px; height: 20px;"></i>
                    </span>
                </div>
                <h2 style="margin: 0; font-size: 2.2rem; font-weight: 700;">${totalInsumos}</h2>
            </div>
            <div class="card icon-decorative" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Produtos Ativos</span>
                    <span style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.1); color: var(--primary); border-radius: 8px;">
                        <i data-lucide="utensils" style="width: 20px; height: 20px;"></i>
                    </span>
                </div>
                <h2 style="margin: 0; font-size: 2.2rem; font-weight: 700;">${totalProdutos}</h2>
            </div>
            <div class="card icon-decorative" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Maior Custo</span>
                    <span style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); color: var(--status-danger); border-radius: 8px;">
                        <i data-lucide="trending-up" style="width: 20px; height: 20px;"></i>
                    </span>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prodMaisCaro ? escapeHTML(prodMaisCaro.nome) : '-'}">${prodMaisCaro ? escapeHTML(prodMaisCaro.nome) : '-'}</h3>
                    <div style="color: var(--status-danger); font-weight: bold; margin-top: 4px; font-size: 1.2rem;">${prodMaisCaro ? Calc.formatCurrency(prodMaisCaro.custoTotalProducao) : 'R$ 0,00'}</div>
                </div>
            </div>
            <div class="card icon-decorative" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Melhor Margem</span>
                    <span style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(16, 185, 129, 0.1); color: var(--status-success); border-radius: 8px;">
                        <i data-lucide="trophy" style="width: 20px; height: 20px;"></i>
                    </span>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prodMaiorMargem ? escapeHTML(prodMaiorMargem.nome) : '-'}">${prodMaiorMargem ? escapeHTML(prodMaiorMargem.nome) : '-'}</h3>
                    <div style="margin-top: 8px;">${prodMaiorMargem ? renderBadge(prodMaiorMargem.margemReal, margemMeta) : '-'}</div>
                </div>
            </div>
            <div class="card icon-decorative" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; border-color: ${prodMenorMargem && prodMenorMargem.margemReal < 0 ? 'var(--status-danger)' : 'var(--border-color)'};">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Menor Margem</span>
                    <span style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); color: var(--status-danger); border-radius: 8px;">
                        <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                    </span>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prodMenorMargem ? escapeHTML(prodMenorMargem.nome) : '-'}">${prodMenorMargem ? escapeHTML(prodMenorMargem.nome) : '-'}</h3>
                    <div style="margin-top: 8px;">${prodMenorMargem ? renderBadge(prodMenorMargem.margemReal, margemMeta) : '-'}</div>
                </div>
            </div>
        </div>

        <div class="layout-split">
            
            <!-- Tabela de Rentabilidade -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                    <h2 style="margin: 0; font-size: 1.2rem;">Rentabilidade do Cardápio</h2>
                </div>
                <div class="table-container" style="border: none; border-radius: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Custo Prod.</th>
                                <th>Sugerido</th>
                                <th>Praticado</th>
                                <th>Margem</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${produtos.sort((a, b) => a.margemReal - b.margemReal).map(p => `
                                <tr>
                                    <td data-label="Produto"><strong>${escapeHTML(p.nome)}</strong></td>
                                    <td data-label="Custo Prod.">${Calc.formatCurrency(p.custoTotalProducao)}</td>
                                    <td data-label="Sugerido" style="color: var(--text-muted);">${Calc.formatCurrency(p.precoSugerido)}</td>
                                    <td data-label="Praticado"><strong>${Calc.formatCurrency(p.precoPraticado)}</strong></td>
                                    <td data-label="Margem">${renderBadge(p.margemReal, margemMeta)}</td>
                                </tr>
                            `).join('')}
                            ${produtos.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 32px;">Nenhum produto cadastrado.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Resumo Operacional e Gráfico -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div class="card" style="background-color: var(--primary-light); border-color: var(--primary);">
                    <h2 style="color: var(--primary); font-size: 1.2rem;">Sua Operação</h2>
                    
                    <div style="margin-top: 20px;">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Meta de Margem</p>
                        <h3 style="font-size: 1.8rem; margin-bottom: 0;">${margemMeta}%</h3>
                    </div>
                    
                    <div style="margin-top: 16px;">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Custo Operacional Fixo</p>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0;">${Calc.formatCurrency(negocio.totalCustosMensais || 0)}</h3>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Dividido por ${negocio.volumeMensal || 0} vendas/mês</p>
                    </div>
                    
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="font-size: 0.9rem; color: var(--text-main);">Custo em cada Lanche</p>
                        <h2 style="font-size: 2rem; color: var(--primary); margin-bottom: 0;">+ ${Calc.formatCurrency(negocio.custoOpUnitario || 0)}</h2>
                    </div>

                    <div class="form-group icon-action" style="margin-top: 24px; margin-bottom: 0;">
                        <a href="#negocio" class="btn btn-primary" style="width: 100%; justify-content: center;">
                            <i data-lucide="sliders-horizontal" style="width: 18px; height: 18px; margin-right: 8px;"></i> Ajustar Custos
                        </a>
                    </div>
                </div>

                <div class="card">
                    <h2 style="font-size: 1.2rem; margin-bottom: 16px;">Composição Média do Preço</h2>
                    <canvas id="costChart" width="100" height="100"></canvas>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    renderChart(produtos, negocio);
};

const renderChart = (produtos, negocio) => {
    const canvas = document.getElementById('costChart');
    if (!canvas) return;

    if (produtos.length === 0) {
        return;
    }

    // Calcula as médias
    let avgIngredientes = 0;
    let avgOp = negocio.custoOpUnitario || 0;
    let avgTaxes = 0;
    let avgProfit = 0;

    produtos.forEach(p => {
        avgIngredientes += p.custoIngredientes || 0;
        const preco = p.precoPraticado || 0;
        const impostosTotais = (negocio.taxaImpostos || 0) + (negocio.taxaMaquininha || 0);
        avgTaxes += preco * (impostosTotais / 100);
        avgProfit += preco - p.custoTotalProducao - (preco * (impostosTotais / 100));
    });

    avgIngredientes /= produtos.length;
    avgTaxes /= produtos.length;
    avgProfit /= produtos.length;

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Ingredientes', 'Custo Operacional', 'Impostos/Taxas', 'Lucro Limpo'],
            datasets: [{
                data: [
                    Math.max(0, avgIngredientes), 
                    Math.max(0, avgOp), 
                    Math.max(0, avgTaxes), 
                    Math.max(0, avgProfit)
                ],
                backgroundColor: [
                    '#ef4444', // red
                    '#f59e0b', // amber
                    '#eab308', // yellow
                    '#10b981'  // green
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-main)',
                        font: { family: 'DM Sans' }
                    }
                }
            }
        }
    });
};
