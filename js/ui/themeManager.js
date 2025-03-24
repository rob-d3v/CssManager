/**
 * Módulo para gerenciar o tema da aplicação
 */
class ThemeManager {
    constructor() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.themeLabel = document.getElementById('theme-label');
        this.body = document.body;
        
        this.initTheme();
        this.setupEventListeners();
    }
    
    /**
     * Inicializa o tema com base nas preferências salvas ou padrão
     */
    initTheme() {
        // Verifica se há uma preferência de tema salva no localStorage
        const savedTheme = localStorage.getItem('cssManagerTheme');
        
        if (savedTheme === 'light') {
            this.body.classList.remove('theme-dark');
            this.body.classList.add('theme-light');
            this.themeSwitch.checked = false;
            this.themeLabel.textContent = 'Tema Claro';
        } else {
            // Padrão é tema escuro
            this.body.classList.remove('theme-light');
            this.body.classList.add('theme-dark');
            this.themeSwitch.checked = true;
            this.themeLabel.textContent = 'Tema Escuro';
        }
    }
    
    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        this.themeSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });
    }
    
    /**
     * Alterna entre os temas claro e escuro
     */
    toggleTheme() {
        if (this.themeSwitch.checked) {
            // Mudar para tema escuro
            this.body.classList.remove('theme-light');
            this.body.classList.add('theme-dark');
            this.themeLabel.textContent = 'Tema Escuro';
            localStorage.setItem('cssManagerTheme', 'dark');
        } else {
            // Mudar para tema claro
            this.body.classList.remove('theme-dark');
            this.body.classList.add('theme-light');
            this.themeLabel.textContent = 'Tema Claro';
            localStorage.setItem('cssManagerTheme', 'light');
        }
    }
}

// Inicializa o gerenciador de temas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
