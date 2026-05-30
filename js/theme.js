// js/theme.js

const THEME_STORAGE_KEY = 'foodcost_theme';

export const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    applyTheme(savedTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
};

const applyTheme = (theme) => {
    const root = document.documentElement;
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    const logoImg = document.getElementById('app-logo');

    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        if (icon) icon.innerHTML = '<i data-lucide="moon" style="width: 18px; height: 18px;"></i>';
        if (label) label.textContent = 'Modo Escuro';
        if (logoImg) logoImg.src = 'icons/foodcost-logo-ambar.svg';
    } else {
        root.removeAttribute('data-theme');
        if (icon) icon.innerHTML = '<i data-lucide="sun" style="width: 18px; height: 18px;"></i>';
        if (label) label.textContent = 'Modo Claro';
        if (logoImg) logoImg.src = 'icons/foodcost-logo-escuro.svg';
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
};