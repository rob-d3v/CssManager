/**
 * Arquivo principal da aplicação CSS Manager
 */
class CSSManager {
    constructor() {
        // Elementos de entrada e saída
        this.cssInput = document.getElementById('css-input');
        this.cssOutput = document.getElementById('css-output');
        
        // Botões de ações para o editor
        this.copyInputBtn = document.getElementById('copy-input');
        this.clearInputBtn = document.getElementById('clear-input');
        this.copyOutputBtn = document.getElementById('copy-output');
        this.applyToInputBtn = document.getElementById('apply-to-input');
        this.resetAllBtn = document.getElementById('reset-all');
        
        // Botões de funções
        this.convertUnitsBtn = document.getElementById('convert-units-btn');
        this.mergeDuplicatesBtn = document.getElementById('merge-duplicates');
        this.sortPropertiesBtn = document.getElementById('sort-properties-btn');
        this.removeCommentsBtn = document.getElementById('remove-comments');
        this.formatCssBtn = document.getElementById('format-css');
        this.minifyCssBtn = document.getElementById('minify-css');
        this.addVendorPrefixesBtn = document.getElementById('add-vendor-prefixes');
        this.convertToJavaFxBtn = document.getElementById('convert-to-javafx');
        this.convertColorsBtn = document.getElementById('convert-colors');
        this.removeUnusedBtn = document.getElementById('remove-unused');
        
        // Seletores e inputs
        this.unitConversionSelect = document.getElementById('unit-conversion');
        this.baseFontSizeInput = document.getElementById('base-font-size');
        this.viewportWidthInput = document.getElementById('viewport-width');
        this.viewportHeightInput = document.getElementById('viewport-height');
        this.sortPropertiesSelect = document.getElementById('sort-properties');
        this.colorFormatSelect = document.getElementById('color-format');
        
        // Inicializa gerenciadores
        this.initializeManagerInstances();
        
        // Configura os listeners de eventos
        this.setupEventListeners();
    }
    
    /**
     * Inicializa instâncias dos gerenciadores de componentes
     */
    initializeManagerInstances() {
        // Os gerenciadores (theme, preview, modal) são inicializados automaticamente
        // FileManager precisa ser inicializado manualmente
        this.fileManager = new FileManager();
    }
    
    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        // Botões de edição
        this.copyInputBtn.addEventListener('click', () => this.copyToClipboard(this.cssInput));
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard(this.cssOutput));
        this.applyToInputBtn.addEventListener('click', () => this.applyOutputToInput());
        this.resetAllBtn.addEventListener('click', () => this.resetAll());
        
        // Botões de funções
        this.convertUnitsBtn.addEventListener('click', () => this.convertUnits());
        this.mergeDuplicatesBtn.addEventListener('click', () => this.mergeDuplicates());
        this.sortPropertiesBtn.addEventListener('click', () => this.sortProperties());
        this.removeCommentsBtn.addEventListener('click', () => this.removeComments());
        this.formatCssBtn.addEventListener('click', () => this.formatCSS());
        this.minifyCssBtn.addEventListener('click', () => this.minifyCSS());
        this.addVendorPrefixesBtn.addEventListener('click', () => this.addVendorPrefixes());
        this.convertToJavaFxBtn.addEventListener('click', () => this.convertToJavaFX());
        this.convertColorsBtn.addEventListener('click', () => this.convertColors());
        this.removeUnusedBtn.addEventListener('click', () => this.removeUnused());
    }
    
    /**
     * Copia o conteúdo de um elemento para a área de transferência
     */
    copyToClipboard(element) {
        const text = element.value;
        
        if (!text.trim()) {
            window.modalManager.alert('Não há conteúdo para copiar.', 'Aviso');
            return;
        }
        
        // Usa a API do navegador para copiar
        navigator.clipboard.writeText(text)
            .then(() => {
                // Feedback visual temporário
                const originalText = element === this.cssInput ? this.copyInputBtn.innerHTML : this.copyOutputBtn.innerHTML;
                
                if (element === this.cssInput) {
                    this.copyInputBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        this.copyInputBtn.innerHTML = originalText;
                    }, 1500);
                } else {
                    this.copyOutputBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        this.copyOutputBtn.innerHTML = originalText;
                    }, 1500);
                }
            })
            .catch(() => {
                window.modalManager.alert('Não foi possível copiar o texto.', 'Erro');
            });
    }
    
    /**
     * Limpa o input de CSS
     */
    clearInput() {
        if (!this.cssInput.value.trim()) {
            return;
        }
        
        window.modalManager.confirm('Tem certeza que deseja limpar o CSS de entrada?', () => {
            this.cssInput.value = '';
            this.cssOutput.value = '';
            
            // Atualiza o preview
            const inputEvent = new Event('input', { bubbles: true });
            this.cssInput.dispatchEvent(inputEvent);
        });
    }
    
    /**
     * Aplica o CSS de saída à entrada
     */
    applyOutputToInput() {
        if (!this.cssOutput.value.trim()) {
            window.modalManager.alert('Não há CSS processado para aplicar.', 'Aviso');
            return;
        }
        
        window.modalManager.confirm('Substituir o CSS de entrada pelo CSS processado?', () => {
            this.cssInput.value = this.cssOutput.value;
            this.cssOutput.value = '';
            
            // Atualiza o preview
            const inputEvent = new Event('input', { bubbles: true });
            this.cssInput.dispatchEvent(inputEvent);
        });
    }
    
    /**
     * Reinicia toda a aplicação
     */
    resetAll() {
        window.modalManager.confirm('Tem certeza que deseja reiniciar tudo?', () => {
            this.cssInput.value = '';
            this.cssOutput.value = '';
            
            // Reinicia configurações
            this.unitConversionSelect.value = 'px-to-rem';
            this.baseFontSizeInput.value = '16';
            this.viewportWidthInput.value = '1920';
            this.viewportHeightInput.value = '1080';
            this.sortPropertiesSelect.value = 'alphabetical';
            this.colorFormatSelect.value = 'hex';
            
            // Atualiza o preview
            const inputEvent = new Event('input', { bubbles: true });
            this.cssInput.dispatchEvent(inputEvent);
        });
    }
    
    /**
     * Processa o CSS e retorna um objeto analisado
     */
    parseCSS() {
        const cssText = this.cssInput.value;
        
        if (!cssText.trim()) {
            window.modalManager.alert('Digite ou carregue algum CSS primeiro.', 'Aviso');
            return null;
        }
        
        try {
            return CSSParser.parse(cssText);
        } catch (error) {
            window.modalManager.alert(`Erro ao analisar o CSS: ${error.message}`, 'Erro');
            return null;
        }
    }
    
    /**
     * Atualiza a saída com o CSS processado
     */
    updateOutput(cssObj, options = {}) {
        try {
            const cssText = CSSParser.stringify(cssObj, options);
            this.cssOutput.value = cssText;
        } catch (error) {
            window.modalManager.alert(`Erro ao gerar o CSS: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Converte unidades no CSS
     */
    convertUnits() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        const conversionType = this.unitConversionSelect.value;
        const [from, to] = conversionType.split('-to-');
        
        const baseFontSize = parseInt(this.baseFontSizeInput.value, 10) || 16;
        const viewportWidth = parseInt(this.viewportWidthInput.value, 10) || 1920;
        const viewportHeight = parseInt(this.viewportHeightInput.value, 10) || 1080;
        
        try {
            const convertedCss = CSSUnitConverter.convertUnits(cssObj, {
                from,
                to,
                baseFontSize,
                viewportWidth,
                viewportHeight,
                precision: 4
            });
            
            this.updateOutput(convertedCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao converter unidades: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Mescla seletores duplicados
     */
    mergeDuplicates() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const mergedCss = CSSParser.mergeDuplicateSelectors(cssObj);
            this.updateOutput(mergedCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao mesclar duplicados: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Ordena as propriedades CSS
     */
    sortProperties() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        const sortType = this.sortPropertiesSelect.value;
        
        try {
            let sortedCss;
            
            if (sortType === 'alphabetical') {
                sortedCss = CSSParser.sortPropertiesAlphabetically(cssObj);
            } else if (sortType === 'grouped') {
                sortedCss = CSSParser.sortPropertiesByGroups(cssObj);
            } else {
                // Importância - a implementar
                sortedCss = CSSParser.sortPropertiesAlphabetically(cssObj);
            }
            
            this.updateOutput(sortedCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao ordenar propriedades: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Remove comentários do CSS
     */
    removeComments() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const cleanCss = CSSParser.removeComments(cssObj);
            this.updateOutput(cleanCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao remover comentários: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Formata o CSS com indentação adequada
     */
    formatCSS() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const formattedCss = CSSFormatter.format(cssObj);
            this.cssOutput.value = formattedCss;
        } catch (error) {
            window.modalManager.alert(`Erro ao formatar CSS: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Minifica o CSS
     */
    minifyCSS() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const minifiedCss = CSSFormatter.minify(cssObj);
            this.cssOutput.value = minifiedCss;
        } catch (error) {
            window.modalManager.alert(`Erro ao minificar CSS: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Adiciona prefixos vendor
     */
    addVendorPrefixes() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const prefixedCss = CSSFormatter.addVendorPrefixes(cssObj);
            this.updateOutput(prefixedCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao adicionar prefixos: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Converte o CSS para o formato JavaFX
     */
    convertToJavaFX() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        try {
            const javaFxCss = JavaFXConverter.convertToJavaFX(cssObj);
            this.cssOutput.value = javaFxCss;
        } catch (error) {
            window.modalManager.alert(`Erro ao converter para JavaFX: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Converte as cores no CSS
     */
    convertColors() {
        const cssObj = this.parseCSS();
        if (!cssObj) return;
        
        const format = this.colorFormatSelect.value;
        
        try {
            const convertedCss = CSSUnitConverter.convertColors(cssObj, {
                format
            });
            
            this.updateOutput(convertedCss);
        } catch (error) {
            window.modalManager.alert(`Erro ao converter cores: ${error.message}`, 'Erro');
        }
    }
    
    /**
     * Remove propriedades não utilizadas
     */
    removeUnused() {
        window.modalManager.alert('Funcionalidade de remoção de propriedades não utilizadas será implementada em versões futuras.', 'Em Desenvolvimento');
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.cssManager = new CSSManager();
});
