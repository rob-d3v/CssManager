/**
 * Módulo para analisar e manipular CSS
 */
class CSSParser {
    /**
     * Analisa um string CSS e retorna um objeto com regras CSS
     * @param {string} cssText - O CSS a ser analisado
     * @return {Object} Um objeto representando a estrutura CSS
     */
    static parse(cssText) {
        // Remove quaisquer BOM ou caracteres inválidos no início
        cssText = cssText.replace(/^\uFEFF/, '');
        
        const result = {
            stylesheet: {
                rules: []
            }
        };
        
        // Preservar comentários para posterior processamento
        const comments = [];
        cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, match => {
            const placeholder = `__COMMENT_${comments.length}__`;
            comments.push(match);
            return placeholder;
        });
        
        // Analisa cada regra
        let currentPos = 0;
        while (currentPos < cssText.length) {
            currentPos = this._skipWhitespace(cssText, currentPos);
            
            // Se chegamos ao fim do CSS
            if (currentPos >= cssText.length) {
                break;
            }
            
            // Verifica se é uma regra @
            if (cssText[currentPos] === '@') {
                const atRule = this._parseAtRule(cssText, currentPos);
                result.stylesheet.rules.push(atRule.rule);
                currentPos = atRule.nextPos;
            } else {
                // Regra normal
                const ruleResult = this._parseRule(cssText, currentPos);
                if (ruleResult.rule) {
                    result.stylesheet.rules.push(ruleResult.rule);
                }
                currentPos = ruleResult.nextPos;
            }
        }
        
        // Restaura comentários
        const resultString = JSON.stringify(result);
        const finalResult = JSON.parse(resultString.replace(/__COMMENT_(\d+)__/g, (match, index) => {
            return comments[parseInt(index, 10)];
        }));
        
        return finalResult;
    }
    
    /**
     * Converte o objeto CSS de volta para texto
     * @param {Object} cssObj - O objeto CSS a ser convertido
     * @param {Object} options - Opções de formatação
     * @return {string} CSS formatado
     */
    static stringify(cssObj, options = {}) {
        const defaultOptions = {
            indent: '  ',
            compress: false,
            comments: true
        };
        
        const opts = { ...defaultOptions, ...options };
        
        let result = '';
        
        // Processa as regras
        if (cssObj.stylesheet && cssObj.stylesheet.rules) {
            cssObj.stylesheet.rules.forEach(rule => {
                if (rule.type === 'rule') {
                    result += this._stringifyRule(rule, opts);
                } else if (rule.type === 'comment' && opts.comments) {
                    result += rule.comment;
                } else if (rule.type === 'at-rule') {
                    result += this._stringifyAtRule(rule, opts);
                }
                
                if (!opts.compress) {
                    result += '\n';
                }
            });
        }
        
        return result;
    }
    
    /**
     * Pula espaços em branco no texto CSS
     * @private
     */
    static _skipWhitespace(text, startPos) {
        let pos = startPos;
        while (pos < text.length && /\s/.test(text[pos])) {
            pos++;
        }
        return pos;
    }
    
    /**
     * Analisa uma regra @ no CSS
     * @private
     */
    static _parseAtRule(cssText, startPos) {
        let pos = startPos;
        let name = '';
        let parameters = '';
        
        // Pula o caractere @
        pos++;
        
        // Obtém o nome da regra
        while (pos < cssText.length && /[a-zA-Z-]/.test(cssText[pos])) {
            name += cssText[pos];
            pos++;
        }
        
        // Pula espaços em branco após o nome
        pos = this._skipWhitespace(cssText, pos);
        
        // Coleta parâmetros até encontrar { ou ;
        let isBlockRule = false;
        while (pos < cssText.length && cssText[pos] !== '{' && cssText[pos] !== ';') {
            parameters += cssText[pos];
            pos++;
        }
        parameters = parameters.trim();
        
        // Verifica se é uma regra de bloco
        if (pos < cssText.length && cssText[pos] === '{') {
            isBlockRule = true;
            pos++; // Pula o '{'
            
            // Encontra o fechamento do bloco
            let depth = 1;
            let block = '';
            
            while (pos < cssText.length && depth > 0) {
                if (cssText[pos] === '{') {
                    depth++;
                } else if (cssText[pos] === '}') {
                    depth--;
                }
                
                if (depth > 0) {
                    block += cssText[pos];
                }
                pos++;
            }
            
            return {
                rule: {
                    type: 'at-rule',
                    name: name,
                    parameters: parameters,
                    block: block,
                    hasBlock: true
                },
                nextPos: pos
            };
        } else {
            // Regra sem bloco
            if (pos < cssText.length && cssText[pos] === ';') {
                pos++; // Pula o ';'
            }
            
            return {
                rule: {
                    type: 'at-rule',
                    name: name,
                    parameters: parameters,
                    hasBlock: false
                },
                nextPos: pos
            };
        }
    }
    
    /**
     * Analisa uma regra normal no CSS
     * @private
     */
    static _parseRule(cssText, startPos) {
        let pos = startPos;
        let selectors = '';
        
        // Se for um comentário
        if (cssText.substr(pos, 2) === '/*') {
            const commentStart = pos;
            pos += 2; // Pula /*
            
            while (pos < cssText.length && cssText.substr(pos, 2) !== '*/') {
                pos++;
            }
            
            if (pos < cssText.length) {
                pos += 2; // Pula */
            }
            
            return {
                rule: {
                    type: 'comment',
                    comment: cssText.substring(commentStart, pos)
                },
                nextPos: pos
            };
        }
        
        // Coleta seletores até encontrar {
        while (pos < cssText.length && cssText[pos] !== '{') {
            selectors += cssText[pos];
            pos++;
        }
        
        // Se não encontrou '{', é um CSS inválido, retornamos posição atual
        if (pos >= cssText.length || cssText[pos] !== '{') {
            return {
                rule: null,
                nextPos: pos
            };
        }
        
        // Pula o '{'
        pos++;
        
        // Analisa as declarações
        const declarations = [];
        let declarationBuffer = '';
        
        while (pos < cssText.length && cssText[pos] !== '}') {
            // Se for um comentário dentro da regra
            if (cssText.substr(pos, 2) === '/*') {
                const commentStart = pos;
                pos += 2; // Pula /*
                
                while (pos < cssText.length && cssText.substr(pos, 2) !== '*/') {
                    pos++;
                }
                
                if (pos < cssText.length) {
                    pos += 2; // Pula */
                }
                
                declarations.push({
                    type: 'comment',
                    comment: cssText.substring(commentStart, pos)
                });
                continue;
            }
            
            declarationBuffer += cssText[pos];
            
            // Se encontrar ;, análise a declaração
            if (cssText[pos] === ';') {
                const declaration = this._parseDeclaration(declarationBuffer);
                if (declaration) {
                    declarations.push(declaration);
                }
                declarationBuffer = '';
            }
            
            pos++;
        }
        
        // Verifica se há uma declaração que não termina com ;
        if (declarationBuffer.trim()) {
            const declaration = this._parseDeclaration(declarationBuffer);
            if (declaration) {
                declarations.push(declaration);
            }
        }
        
        // Pula o '}'
        if (pos < cssText.length && cssText[pos] === '}') {
            pos++;
        }
        
        // Selectors pode conter vários seletores separados por vírgula
        const selectorList = selectors.split(',').map(s => s.trim()).filter(s => s);
        
        return {
            rule: {
                type: 'rule',
                selectors: selectorList,
                declarations: declarations
            },
            nextPos: pos
        };
    }
    
    /**
     * Analisa uma declaração CSS (propriedade: valor)
     * @private
     */
    static _parseDeclaration(text) {
        text = text.trim();
        if (!text || text === ';') {
            return null;
        }
        
        // Remove o ';' final se presente
        if (text.endsWith(';')) {
            text = text.slice(0, -1).trim();
        }
        
        // Encontra a posição do primeiro ':'
        const colonPos = text.indexOf(':');
        if (colonPos === -1) {
            return null;
        }
        
        const property = text.substring(0, colonPos).trim();
        const value = text.substring(colonPos + 1).trim();
        
        return {
            type: 'declaration',
            property: property,
            value: value
        };
    }
    
    /**
     * Converte uma regra CSS em string
     * @private
     */
    static _stringifyRule(rule, options) {
        if (!rule.selectors || rule.selectors.length === 0) {
            return '';
        }
        
        let result = '';
        
        // Seletores
        if (options.compress) {
            result += rule.selectors.join(',');
        } else {
            result += rule.selectors.join(', ');
        }
        
        // Abre bloco
        result += options.compress ? '{' : ' {\n';
        
        // Declarações
        if (rule.declarations && rule.declarations.length > 0) {
            rule.declarations.forEach(declaration => {
                if (declaration.type === 'declaration') {
                    if (!options.compress) {
                        result += options.indent;
                    }
                    
                    result += `${declaration.property}:`;
                    
                    if (!options.compress) {
                        result += ' ';
                    }
                    
                    result += declaration.value;
                    result += options.compress ? ';' : ';\n';
                } else if (declaration.type === 'comment' && options.comments) {
                    if (!options.compress) {
                        result += options.indent;
                    }
                    result += declaration.comment;
                    if (!options.compress) {
                        result += '\n';
                    }
                }
            });
        }
        
        // Fecha bloco
        result += '}';
        
        return result;
    }
    
    /**
     * Converte uma regra @ em string
     * @private
     */
    static _stringifyAtRule(rule, options) {
        let result = '@' + rule.name;
        
        if (rule.parameters) {
            result += ' ' + rule.parameters;
        }
        
        if (rule.hasBlock) {
            result += options.compress ? '{' : ' {\n';
            
            if (!options.compress) {
                // Indenta o conteúdo do bloco
                const lines = rule.block.split('\n');
                result += lines.map(line => options.indent + line).join('\n');
                result += '\n';
            } else {
                result += rule.block;
            }
            
            result += '}';
        } else {
            result += ';';
        }
        
        return result;
    }
    
    /**
     * Mescla seletores duplicados em um CSS
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {Object} Objeto CSS com seletores mesclados
     */
    static mergeDuplicateSelectors(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        const selectorMap = new Map();
        const newRules = [];
        
        // Regras que não são de tipo 'rule' (como comentários e at-rules)
        const otherRules = cssObj.stylesheet.rules.filter(rule => rule.type !== 'rule');
        
        // Processa as regras do tipo 'rule'
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type !== 'rule') {
                return;
            }
            
            // Converte os seletores em string para usar como chave
            const selectorKey = rule.selectors.sort().join(',');
            
            if (selectorMap.has(selectorKey)) {
                // Mescla as declarações com o seletor existente
                const existingRule = selectorMap.get(selectorKey);
                
                rule.declarations.forEach(declaration => {
                    // Se for um comentário, adiciona ao final
                    if (declaration.type === 'comment') {
                        existingRule.declarations.push(declaration);
                        return;
                    }
                    
                    // Verifica se a propriedade já existe
                    const existingIndex = existingRule.declarations.findIndex(
                        d => d.type === 'declaration' && d.property === declaration.property
                    );
                    
                    if (existingIndex !== -1) {
                        // Substitui a declaração existente
                        existingRule.declarations[existingIndex] = declaration;
                    } else {
                        // Adiciona nova declaração
                        existingRule.declarations.push(declaration);
                    }
                });
            } else {
                // Adiciona nova entrada ao mapa
                selectorMap.set(selectorKey, { ...rule });
                newRules.push(selectorMap.get(selectorKey));
            }
        });
        
        // Combina as regras mescladas com outras regras
        cssObj.stylesheet.rules = [...otherRules, ...newRules];
        
        return cssObj;
    }
    
    /**
     * Remove todos os comentários de um objeto CSS
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {Object} Objeto CSS sem comentários
     */
    static removeComments(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        // Remove regras de tipo comment
        cssObj.stylesheet.rules = cssObj.stylesheet.rules.filter(rule => rule.type !== 'comment');
        
        // Remove comentários de declarações dentro das regras
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                rule.declarations = rule.declarations.filter(decl => decl.type !== 'comment');
            }
        });
        
        return cssObj;
    }
    
    /**
     * Ordena as propriedades CSS em cada regra por ordem alfabética
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {Object} Objeto CSS com propriedades ordenadas
     */
    static sortPropertiesAlphabetically(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                // Separa comentários e declarações
                const comments = rule.declarations.filter(d => d.type === 'comment');
                const declarations = rule.declarations.filter(d => d.type === 'declaration');
                
                // Ordena as declarações por nome de propriedade
                declarations.sort((a, b) => a.property.localeCompare(b.property));
                
                // Recombina declarações e comentários
                rule.declarations = [...declarations, ...comments];
            }
        });
        
        return cssObj;
    }
    
    /**
     * Ordena as propriedades CSS em cada regra por grupos lógicos
     * @param {Object} cssObj - Objeto CSS analisado
     * @return {Object} Objeto CSS com propriedades ordenadas por grupos
     */
    static sortPropertiesByGroups(cssObj) {
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        // Define os grupos de propriedades e sua ordem
        const propertyGroups = [
            // Posicionamento
            ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
            
            // Display & Box Model
            ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 
             'align-items', 'align-content', 'order', 'flex-grow', 'flex-shrink', 'flex-basis', 
             'align-self', 'float', 'clear', 'box-sizing'],
            
            // Dimensões
            ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],
            
            // Margens, Padding, Bordas
            ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
             'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
             'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
             'border-width', 'border-style', 'border-color', 'border-radius'],
            
            // Fundo
            ['background', 'background-color', 'background-image', 'background-repeat',
             'background-attachment', 'background-position', 'background-size'],
            
            // Texto & Fonte
            ['color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
             'font-variant', 'font-stretch', 'line-height', 'letter-spacing', 'text-align',
             'text-decoration', 'text-indent', 'text-transform', 'text-shadow', 'white-space'],
            
            // Outros
            ['opacity', 'visibility', 'overflow', 'cursor', 'transition', 'animation']
        ];
        
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                // Separa comentários e declarações
                const comments = rule.declarations.filter(d => d.type === 'comment');
                const declarations = rule.declarations.filter(d => d.type === 'declaration');
                
                // Função para obter o grupo de uma propriedade
                const getPropertyGroupIndex = (property) => {
                    for (let i = 0; i < propertyGroups.length; i++) {
                        if (propertyGroups[i].includes(property)) {
                            return i;
                        }
                    }
                    return propertyGroups.length; // Propriedades não categorizadas vão para o final
                };
                
                // Ordena as declarações por grupo e depois alfabeticamente dentro do grupo
                declarations.sort((a, b) => {
                    const groupA = getPropertyGroupIndex(a.property);
                    const groupB = getPropertyGroupIndex(b.property);
                    
                    if (groupA !== groupB) {
                        return groupA - groupB;
                    }
                    
                    return a.property.localeCompare(b.property);
                });
                
                // Recombina declarações e comentários
                rule.declarations = [...declarations, ...comments];
            }
        });
        
        return cssObj;
    }
}