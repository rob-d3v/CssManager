/**
 * Módulo para gerenciar arquivos CSS
 */
class FileManager {
    constructor() {
        this.loadFileBtn = document.getElementById('load-file');
        this.saveFileBtn = document.getElementById('save-file');
        this.cssInput = document.getElementById('css-input');
        this.cssOutput = document.getElementById('css-output');
        
        this.setupEventListeners();
    }
    
    /**
     * Configura os listeners de eventos
     */
    setupEventListeners() {
        // Botão para carregar arquivo CSS
        this.loadFileBtn.addEventListener('click', () => {
            this.loadCSSFile();
        });
        
        // Botão para salvar arquivo CSS
        this.saveFileBtn.addEventListener('click', () => {
            this.saveCSSFile();
        });
    }
    
    /**
     * Carrega um arquivo CSS do disco
     */
    loadCSSFile() {
        // Cria um input de arquivo invisível
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.css';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Quando um arquivo for selecionado
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const content = e.target.result;
                    this.cssInput.value = content;
                    
                    // Dispara um evento input para atualizar o preview
                    const inputEvent = new Event('input', { bubbles: true });
                    this.cssInput.dispatchEvent(inputEvent);
                    
                    // Mostra mensagem de sucesso
                    window.modalManager.alert(`Arquivo "${file.name}" carregado com sucesso.`, 'Arquivo Carregado');
                };
                
                reader.onerror = () => {
                    window.modalManager.alert('Erro ao ler o arquivo CSS.', 'Erro');
                };
                
                reader.readAsText(file);
            }
            
            // Remove o input após uso
            document.body.removeChild(fileInput);
        });
        
        // Clica no input para abrir o seletor de arquivos
        fileInput.click();
    }
    
    /**
     * Salva o CSS processado em um arquivo
     */
    saveCSSFile() {
        const cssContent = this.cssOutput.value || this.cssInput.value;
        
        if (!cssContent.trim()) {
            window.modalManager.alert('Não há CSS para salvar.', 'Aviso');
            return;
        }
        
        // Cria um elemento para perguntar o nome do arquivo
        const formElement = document.createElement('div');
        formElement.innerHTML = `
            <div class="modal-form-group">
                <label for="filename">Nome do arquivo:</label>
                <input type="text" id="filename" class="input-style" value="styles.css">
            </div>
        `;
        
        // Exibe o modal com o formulário
        window.modalManager.formModal('Salvar Arquivo CSS', formElement, () => {
            const filename = document.getElementById('filename').value || 'styles.css';
            
            // Adiciona extensão .css se não estiver presente
            const finalFilename = filename.endsWith('.css') ? filename : `${filename}.css`;
            
            // Cria um blob com o conteúdo CSS
            const blob = new Blob([cssContent], { type: 'text/css' });
            
            // Cria um link para download
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = finalFilename;
            
            // Adiciona o link ao documento e clica nele
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Limpa
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        });
    }
}