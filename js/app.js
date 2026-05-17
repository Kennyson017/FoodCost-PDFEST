// js/app.js
import { loadState } from './state.js';
import { initRouter } from './router.js';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando FoodCost...");
    
    // 1. Carrega dados do localStorage ou faz o seed inicial
    loadState();
    
    // 2. Inicializa o roteador
    initRouter();
});
