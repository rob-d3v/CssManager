/**
 * Módulo para gerenciar o preview do CSS
 */
class PreviewManager {
    constructor() {
        this.previewFrame = document.getElementById('preview-frame');
        this.togglePreviewBtn = document.getElementById('toggle-preview');
        this.previewPanel = document.querySelector('.preview-panel');
        this.cssInput = document.getElementById('css-input');
        this.cssOutput = document.getElementById('css-output');
        this.expanded = false;
        
        this.setupEventListeners();
        this.initPreviewFrame();
    }
    
    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        // Botão para expandir/recolher o painel de preview
        this.togglePreviewBtn.addEventListener('click', () => {
            this.togglePreviewSize();
        });
        
        // Atualiza o preview quando o CSS de entrada ou saída mudar
        this.cssInput.addEventListener('input', () => {
            this.updatePreview();
        });
        
        // Ouve mudanças no CSS de saída (quando processado)
        const outputObserver = new MutationObserver(() => {
            this.updatePreview();
        });
        
        outputObserver.observe(this.cssOutput, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });
    }
    
    /**
     * Inicializa o iframe de preview
     */
    initPreviewFrame() {
        // Cria o conteúdo básico do iframe
        this.updatePreviewContent('<div class="preview-container"></div>', '');
    }
    
    /**
     * Atualiza o conteúdo do preview com o CSS atual
     */
    updatePreview() {
        // Verifica qual fonte de CSS usar (entrada ou saída)
        const cssText = this.cssOutput.value || this.cssInput.value;
        
        if (!cssText) {
            this.updatePreviewContent('<div class="preview-container"></div>', '');
            return;
        }
        
        // Cria um HTML básico para o preview
        const html = `
            <div class="preview-container">
                <div class="preview-header">Preview Header</div>
                <div class="preview-content">
                    <h1>Heading 1</h1>
                    <h2>Heading 2</h2>
                    <p>This is a paragraph with <a href="#">a link</a> and <strong>bold text</strong>.</p>
                    <div class="preview-box">
                        <span>Box Element</span>
                    </div>
                    <button class="preview-button">Button</button>
                </div>
                <div class="preview-footer">Preview Footer</div>
            </div>
        `;
        
        this.updatePreviewContent(html, cssText);
    }
    
    /**
     * Atualiza o conteúdo do iframe
     * @param {string} html - Conteúdo HTML
     * @param {string} css - CSS a ser aplicado
     */
    updatePreviewContent(html, css) {
        // Acessa o documento do iframe
        const doc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
        
        // Limpa o conteúdo existente
        doc.open();
        
        // Adiciona HTML básico com o CSS
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CSS Preview</title>
                <style>
                    /* Estilos básicos para o preview */
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    
                    .preview-container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    /* Estilos CSS personalizados */
                    ${css}
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `);
        
        doc.close();
    }
    
    /**
     * Alterna entre preview expandido e normal
     */
    togglePreviewSize() {
        if (this.expanded) {
            // Retorna ao tamanho normal
            this.previewPanel.style.height = '250px';
            this.togglePreviewBtn.innerHTML = '<i class="fas fa-expand"></i>';
        } else {
            // Expande o preview
            this.previewPanel.style.height = '500px';
            this.togglePreviewBtn.innerHTML = '<i class="fas fa-compress"></i>';
        }
        
        this.expanded = !this.expanded;
    }
}

// Inicializa o gerenciador de preview quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.previewManager = new PreviewManager();
});
