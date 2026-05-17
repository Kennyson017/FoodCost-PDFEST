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
                <strong style="color: var(--status-danger);">⚠️ Atenção:</strong> Você tem ${produtosEmPrejuizo} produto(s) sendo vendido(s) abaixo do custo de produção!
            </div>
        ` : ''}

        <!-- Cards de Resumo -->
        <div class="card-grid" style="margin-bottom: 32px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            <div class="card" style="padding: 20px;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Total de Insumos</p>
                <h2 style="margin: 0; font-size: 2rem;">${totalInsumos}</h2>
            </div>
            <div class="card" style="padding: 20px;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Produtos no Cardápio</p>
                <h2 style="margin: 0; font-size: 2rem;">${totalProdutos}</h2>
            </div>
            <div class="card" style="padding: 20px;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Maior Custo (Produção)</p>
                <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-main);">${prodMaisCaro ? escapeHTML(prodMaisCaro.nome) : '-'}</h3>
                <span style="color: var(--status-danger); font-weight: bold;">${prodMaisCaro ? Calc.formatCurrency(prodMaisCaro.custoTotalProducao) : 'R$ 0,00'}</span>
            </div>
            <div class="card" style="padding: 20px;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Menor Margem</p>
                <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-main);">${prodMenorMargem ? escapeHTML(prodMenorMargem.nome) : '-'}</h3>
                <div>${prodMenorMargem ? renderBadge(prodMenorMargem.margemReal, margemMeta) : '-'}</div>
            </div>
            <div class="card" style="padding: 20px;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">Melhor Margem</p>
                <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-main);">${prodMaiorMargem ? escapeHTML(prodMaiorMargem.nome) : '-'}</h3>
                <div>${prodMaiorMargem ? renderBadge(prodMaiorMargem.margemReal, margemMeta) : '-'}</div>
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
                                    <td><strong>${escapeHTML(p.nome)}</strong></td>
                                    <td>${Calc.formatCurrency(p.custoTotalProducao)}</td>
                                    <td style="color: var(--text-muted);">${Calc.formatCurrency(p.precoSugerido)}</td>
                                    <td><strong>${Calc.formatCurrency(p.precoPraticado)}</strong></td>
                                    <td>${renderBadge(p.margemReal, margemMeta)}</td>
                                </tr>
                            `).join('')}
                            ${produtos.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 32px;">Nenhum produto cadastrado.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Resumo Operacional -->
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

                <div style="margin-top: 24px;">
                    <a href="#negocio" class="btn btn-primary" style="width: 100%; justify-content: center;">Ajustar Custos</a>
                </div>
            </div>

        </div>
    `;
};