/**
 * Módulo para gerenciar modais da aplicação
 */
class ModalManager {
    constructor() {
        this.modalContainer = document.getElementById('modal-container');
        this.modalTitle = document.getElementById('modal-title');
        this.modalContent = document.getElementById('modal-content');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelModalBtn = document.getElementById('modal-cancel');
        this.confirmModalBtn = document.getElementById('modal-confirm');
        
        this.currentCallback = null;
        
        this.setupEventListeners();
    }
    
    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        this.closeModalBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        this.cancelModalBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        this.confirmModalBtn.addEventListener('click', () => {
            if (this.currentCallback) {
                this.currentCallback();
            }
            this.hideModal();
        });
        
        // Fecha o modal ao clicar fora dele
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.hideModal();
            }
        });
        
        // Tecla ESC para fechar o modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modalContainer.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    }
    
    /**
     * Exibe o modal com o conteúdo e configurações especificadas
     * @param {Object} options - Configurações do modal
     */
    showModal(options = {}) {
        const defaultOptions = {
            title: 'Aviso',
            content: 'Conteúdo do modal',
            confirmLabel: 'Confirmar',
            cancelLabel: 'Cancelar',
            showCancel: true,
            callback: null
        };
        
        const opts = { ...defaultOptions, ...options };
        
        // Configura o modal
        this.modalTitle.textContent = opts.title;
        
        if (typeof opts.content === 'string') {
            this.modalContent.innerHTML = opts.content;
        } else if (opts.content instanceof HTMLElement) {
            this.modalContent.innerHTML = '';
            this.modalContent.appendChild(opts.content);
        }
        
        this.confirmModalBtn.textContent = opts.confirmLabel;
        this.cancelModalBtn.textContent = opts.cancelLabel;
        
        // Mostra ou esconde o botão de cancelar
        if (opts.showCancel) {
            this.cancelModalBtn.style.display = 'block';
        } else {
            this.cancelModalBtn.style.display = 'none';
        }
        
        // Guarda o callback
        this.currentCallback = opts.callback;
        
        // Exibe o modal
        this.modalContainer.classList.remove('hidden');
    }
    
    /**
     * Esconde o modal
     */
    hideModal() {
        this.modalContainer.classList.add('hidden');
        this.currentCallback = null;
    }
    
    /**
     * Cria um modal de alerta simples
     * @param {string} message - Mensagem a ser exibida
     */
    alert(message, title = 'Aviso') {
        this.showModal({
            title: title,
            content: message,
            confirmLabel: 'OK',
            showCancel: false
        });
    }
    
    /**
     * Cria um modal de confirmação
     * @param {string} message - Mensagem a ser exibida
     * @param {Function} callback - Função a ser chamada se o usuário confirmar
     */
    confirm(message, callback, title = 'Confirmação') {
        this.showModal({
            title: title,
            content: message,
            confirmLabel: 'Confirmar',
            cancelLabel: 'Cancelar',
            showCancel: true,
            callback: callback
        });
    }
    
    /**
     * Cria um modal com formulário personalizado
     * @param {string} title - Título do modal
     * @param {HTMLElement} formElement - Elemento HTML do formulário
     * @param {Function} callback - Função a ser chamada se o usuário confirmar
     */
    formModal(title, formElement, callback) {
        this.showModal({
            title: title,
            content: formElement,
            confirmLabel: 'Salvar',
            cancelLabel: 'Cancelar',
            showCancel: true,
            callback: callback
        });
    }
}

// Inicializa o gerenciador de modais quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});
