/**
 * Módulo para formatação de CSS
 */
class CSSFormatter {
    /**
     * Formata CSS com indentação adequada
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {string} CSS formatado
     */
    static format(cssObj) {
        return CSSParser.stringify(cssObj, {
            indent: '  ',
            compress: false,
            comments: true
        });
    }
    
    /**
     * Minifica CSS removendo espaços desnecessários
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {string} CSS minificado
     */
    static minify(cssObj) {
        // Primeiro, remova comentários
        const noComments = CSSParser.removeComments(cssObj);
        
        // Em seguida, stringify sem espaços
        return CSSParser.stringify(noComments, {
            indent: '',
            compress: true,
            comments: false
        });
    }
    
    /**
     * Adiciona prefixos vendor a propriedades CSS
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {Object} Objeto CSS com prefixos adicionados
     */
    static addVendorPrefixes(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        // Lista de propriedades que precisam de prefixos vendor
        const prefixProperties = [
            'animation', 'animation-delay', 'animation-direction', 'animation-duration',
            'animation-fill-mode', 'animation-iteration-count', 'animation-name',
            'animation-play-state', 'animation-timing-function', 'appearance', 'backdrop-filter',
            'backface-visibility', 'background-clip', 'border-image', 'column-count',
            'column-gap', 'column-rule', 'column-width', 'columns', 'filter', 'flex',
            'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink',
            'flex-wrap', 'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow',
            'grid-auto-rows', 'grid-column', 'grid-column-end', 'grid-column-start',
            'grid-row', 'grid-row-end', 'grid-row-start', 'grid-template', 'grid-template-areas',
            'grid-template-columns', 'grid-template-rows', 'hyphens', 'mask', 'perspective',
            'perspective-origin', 'sticky', 'text-size-adjust', 'transform',
            'transform-origin', 'transform-style', 'transition', 'transition-delay',
            'transition-duration', 'transition-property', 'transition-timing-function',
            'user-select'
        ];
        
        // Prefixos vendor a serem adicionados
        const vendors = ['-webkit-', '-moz-', '-ms-', '-o-'];
        
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                const newDeclarations = [];
                
                rule.declarations.forEach(declaration => {
                    if (declaration.type === 'declaration') {
                        const property = declaration.property;
                        
                        // Verifica se a propriedade precisa de prefixos
                        if (prefixProperties.includes(property)) {
                            // Adiciona versões com prefixo
                            vendors.forEach(vendor => {
                                newDeclarations.push({
                                    type: 'declaration',
                                    property: `${vendor}${property}`,
                                    value: declaration.value
                                });
                            });
                        }
                        
                        // Mantém a declaração original
                        newDeclarations.push(declaration);
                    } else {
                        // Mantém comentários e outros tipos
                        newDeclarations.push(declaration);
                    }
                });
                
                rule.declarations = newDeclarations;
            }
        });
        
        return cssObj;
    }
}
