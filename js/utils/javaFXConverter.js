/**
 * Módulo para converter CSS para o formato JavaFX
 */
class JavaFXConverter {
    /**
     * Converte CSS para o formato JavaFX
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {string} CSS no formato JavaFX
     */
    static convertToJavaFX(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return '';
        }
        
        // Mapeamento de propriedades CSS para propriedades JavaFX
        const propertyMap = {
            'background-color': '-fx-background-color',
            'background-image': '-fx-background-image',
            'background-position': '-fx-background-position',
            'background-repeat': '-fx-background-repeat',
            'background-size': '-fx-background-size',
            'border': '-fx-border',
            'border-color': '-fx-border-color',
            'border-radius': '-fx-border-radius',
            'border-style': '-fx-border-style',
            'border-width': '-fx-border-width',
            'color': '-fx-text-fill',
            'cursor': '-fx-cursor',
            'display': '-fx-display',
            'font-family': '-fx-font-family',
            'font-size': '-fx-font-size',
            'font-style': '-fx-font-style',
            'font-weight': '-fx-font-weight',
            'height': '-fx-pref-height',
            'line-height': '-fx-line-height',
            'margin': '-fx-margin',
            'margin-bottom': '-fx-margin-bottom',
            'margin-left': '-fx-margin-left',
            'margin-right': '-fx-margin-right',
            'margin-top': '-fx-margin-top',
            'opacity': '-fx-opacity',
            'padding': '-fx-padding',
            'padding-bottom': '-fx-padding-bottom',
            'padding-left': '-fx-padding-left',
            'padding-right': '-fx-padding-right',
            'padding-top': '-fx-padding-top',
            'text-align': '-fx-text-alignment',
            'text-decoration': '-fx-text-decoration',
            'text-transform': '-fx-text-transform',
            'visibility': '-fx-visibility',
            'width': '-fx-pref-width',
            'z-index': '-fx-z-index'
        };
        
        // Cria um novo objeto CSS para JavaFX
        const javaFXObj = {
            stylesheet: {
                rules: []
            }
        };
        
        // Processa cada regra
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule') {
                const javaFXRule = {
                    type: 'rule',
                    selectors: [...rule.selectors],
                    declarations: []
                };
                
                // Processa cada declaração
                if (rule.declarations) {
                    rule.declarations.forEach(declaration => {
                        if (declaration.type === 'declaration') {
                            const property = declaration.property;
                            const javaFXProperty = propertyMap[property] || property;
                            
                            // Ajusta o valor se necessário
                            let value = declaration.value;
                            
                            // Ajustes específicos para JavaFX
                            if (property === 'background-image' && value.includes('url(')) {
                                value = value.replace(/url\(['"]?(.*?)['"]?\)/, "url('$1')");
                            } else if (property === 'display') {
                                // Mapeamento de valores de display
                                const displayMap = {
                                    'block': 'block',
                                    'inline': 'inline',
                                    'inline-block': 'inline-block',
                                    'flex': 'flex',
                                    'none': 'none'
                                };
                                if (displayMap[value]) {
                                    value = displayMap[value];
                                }
                            } else if (property === 'text-align') {
                                // Mapeamento de valores de text-align
                                const textAlignMap = {
                                    'left': 'LEFT',
                                    'center': 'CENTER',
                                    'right': 'RIGHT',
                                    'justify': 'JUSTIFY'
                                };
                                if (textAlignMap[value]) {
                                    value = textAlignMap[value];
                                }
                            }
                            
                            javaFXRule.declarations.push({
                                type: 'declaration',
                                property: javaFXProperty,
                                value: value
                            });
                        } else if (declaration.type === 'comment') {
                            javaFXRule.declarations.push(declaration);
                        }
                    });
                }
                
                javaFXObj.stylesheet.rules.push(javaFXRule);
            } else if (rule.type === 'comment') {
                // Mantém comentários
                javaFXObj.stylesheet.rules.push(rule);
            } else if (rule.type === 'at-rule') {
                // Alguns at-rules são suportados em JavaFX
                if (['font-face', 'keyframes', 'import'].includes(rule.name)) {
                    const javaFXRule = { ...rule };
                    
                    // Ajusta @keyframes para @-fx-keyframes
                    if (rule.name === 'keyframes') {
                        javaFXRule.name = '-fx-keyframes';
                    }
                    
                    javaFXObj.stylesheet.rules.push(javaFXRule);
                }
            }
        });
        
        // Converte de volta para texto
        return CSSParser.stringify(javaFXObj, {
            indent: '    ',
            compress: false,
            comments: true
        });
    }
    
    /**
     * Adiciona prefixos JavaFX a propriedades comuns
     * @param {string} cssText - Texto CSS
     * @return {string} CSS com prefixos JavaFX
     */
    static addJavaFXPrefixes(cssText) {
        // Esta função é uma versão simplificada que apenas adiciona 
        // o prefixo -fx- às propriedades que não começam com -fx-
        
        // Analisa o CSS
        const cssObj = CSSParser.parse(cssText);
        
        // Converte para JavaFX
        return this.convertToJavaFX(cssObj);
    }
}
