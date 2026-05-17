// js/components.js

export const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

export const renderBadge = (margem, margemMeta) => {
    if (margem < 0) {
        return `<span class="badge badge-danger">🔴 Prejuízo (${margem.toFixed(1)}%)</span>`;
    } else if (margem < margemMeta) {
        return `<span class="badge badge-warning">🟡 Apertado (${margem.toFixed(1)}%)</span>`;
    } else {
        return `<span class="badge badge-success">🟢 Saudável (${margem.toFixed(1)}%)</span>`;
    }
};

export const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};
