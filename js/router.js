// js/router.js
import { renderDashboard } from './pages/dashboard.js';
import { renderInsumos } from './pages/insumos.js';
import { renderProdutos } from './pages/produtos.js';
import { renderNegocio } from './pages/negocio.js';

const routes = {
    'dashboard': renderDashboard,
    'insumos': renderInsumos,
    'produtos': renderProdutos,
    'negocio': renderNegocio
};

export const initRouter = () => {
    window.addEventListener('hashchange', handleRouteChange);
    
    // Processa a rota inicial
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    } else {
        handleRouteChange();
    }
};

const handleRouteChange = () => {
    const hash = window.location.hash.slice(1);
    const path = hash.split('/')[0] || 'dashboard';
    
    // Atualiza menu ativo
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.route === path) {
            el.classList.add('active');
        }
    });

    const appContainer = document.getElementById('app');
    
    // Efeito de transição
    appContainer.innerHTML = '';
    appContainer.classList.remove('view-enter');
    
    // Pequeno delay para forçar reflow e aplicar animação
    setTimeout(() => {
        const renderFunc = routes[path];
        
        if (renderFunc) {
            // Passa os parâmetros da rota (ex: ['insumos', 'novo'])
            renderFunc(appContainer, hash.split('/').slice(1));
        } else {
            appContainer.innerHTML = `<h2>Página não encontrada</h2>`;
        }
        
        appContainer.classList.add('view-enter');
    }, 10);
};

export const navigate = (path) => {
    window.location.hash = path;
};
