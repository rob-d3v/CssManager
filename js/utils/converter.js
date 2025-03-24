/**
 * Módulo para converter unidades CSS
 */
class CSSUnitConverter {
    /**
     * Converte unidades em um objeto CSS
     * @param {Object} cssObj - Objeto CSS analisado
     * @param {Object} options - Opções de conversão
     * @return {Object} Objeto CSS com unidades convertidas
     */
    static convertUnits(cssObj, options = {}) {
        const defaultOptions = {
            from: 'px',
            to: 'rem',
            baseFontSize: 16,
            viewportWidth: 1920,
            viewportHeight: 1080,
            precision: 4
        };
        
        const opts = { ...defaultOptions, ...options };
        
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        // Percorre todas as regras
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                // Percorre todas as declarações
                rule.declarations.forEach(declaration => {
                    if (declaration.type === 'declaration') {
                        // Converte o valor da propriedade
                        declaration.value = this._convertValueUnits(
                            declaration.value,
                            declaration.property,
                            opts
                        );
                    }
                });
            }
        });
        
        return cssObj;
    }
    
    /**
     * Converte unidades em um valor CSS
     * @private
     */
    static _convertValueUnits(value, property, options) {
        // Ignora propriedades que não devem ter unidades convertidas
        const ignoreProps = ['content', 'font-family', 'z-index', 'opacity'];
        if (ignoreProps.includes(property)) {
            return value;
        }
        
        // Encontra valores com a unidade de origem
        const regex = new RegExp(`(-?[\\d\\.]+)${options.from}\\b`, 'g');
        
        return value.replace(regex, (match, numPart) => {
            const num = parseFloat(numPart);
            
            // Converte para a unidade alvo
            let convertedValue;
            
            switch (options.to) {
                case 'rem':
                    convertedValue = num / options.baseFontSize;
                    break;
                case 'em':
                    convertedValue = num / options.baseFontSize;
                    break;
                case 'px':
                    if (options.from === 'rem' || options.from === 'em') {
                        convertedValue = num * options.baseFontSize;
                    } else {
                        return match; // Não há conversão necessária
                    }
                    break;
                case '%':
                    // Para porcentagens, precisamos saber se é largura ou altura
                    if (property.includes('width') || property.includes('left') || property.includes('right') || 
                        property.includes('margin-left') || property.includes('margin-right') ||
                        property.includes('padding-left') || property.includes('padding-right')) {
                        convertedValue = (num / options.viewportWidth) * 100;
                    } else if (property.includes('height') || property.includes('top') || property.includes('bottom') ||
                               property.includes('margin-top') || property.includes('margin-bottom') ||
                               property.includes('padding-top') || property.includes('padding-bottom')) {
                        convertedValue = (num / options.viewportHeight) * 100;
                    } else {
                        // Para propriedades ambíguas, usamos a largura como padrão
                        convertedValue = (num / options.viewportWidth) * 100;
                    }
                    break;
                case 'vw':
                    convertedValue = (num / options.viewportWidth) * 100;
                    break;
                case 'vh':
                    convertedValue = (num / options.viewportHeight) * 100;
                    break;
                default:
                    return match; // Unidade não suportada
            }
            
            // Arredonda para a precisão especificada
            convertedValue = convertedValue.toFixed(options.precision);
            
            // Remove zeros à direita após o ponto decimal
            convertedValue = convertedValue.replace(/\.?0+$/, '');
            
            return `${convertedValue}${options.to}`;
        });
    }
    
    /**
     * Converte cores em um objeto CSS
     * @param {Object} cssObj - Objeto CSS analisado
     * @param {Object} options - Opções de conversão de cores
     * @return {Object} Objeto CSS com cores convertidas
     */
    static convertColors(cssObj, options = {}) {
        const defaultOptions = {
            format: 'hex' // hex, rgb, hsl
        };
        
        const opts = { ...defaultOptions, ...options };
        
        if (!cssObj.stylesheet || !cssObj.stylesheet.rules) {
            return cssObj;
        }
        
        // Percorre todas as regras
        cssObj.stylesheet.rules.forEach(rule => {
            if (rule.type === 'rule' && rule.declarations) {
                // Percorre todas as declarações
                rule.declarations.forEach(declaration => {
                    if (declaration.type === 'declaration') {
                        // Converte cores na propriedade
                        declaration.value = this._convertColorValues(declaration.value, opts);
                    }
                });
            }
        });
        
        return cssObj;
    }
    
    /**
     * Converte valores de cores em um valor CSS
     * @private
     */
    static _convertColorValues(value, options) {
        // Converte cores HEX
        if (/\#([0-9a-f]{3}|[0-9a-f]{6})\b/gi.test(value)) {
            value = value.replace(/\#([0-9a-f]{3}|[0-9a-f]{6})\b/gi, match => {
                return this._convertColor(match, options.format);
            });
        }
        
        // Converte cores RGB
        if (/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi.test(value)) {
            value = value.replace(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi, match => {
                return this._convertColor(match, options.format);
            });
        }
        
        // Converte cores RGBA
        if (/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d\.]+\s*\)/gi.test(value)) {
            value = value.replace(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d\.]+\s*\)/gi, match => {
                return this._convertColor(match, options.format);
            });
        }
        
        // Converte cores HSL
        if (/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/gi.test(value)) {
            value = value.replace(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/gi, match => {
                return this._convertColor(match, options.format);
            });
        }
        
        // Converte cores HSLA
        if (/hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d\.]+\s*\)/gi.test(value)) {
            value = value.replace(/hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d\.]+\s*\)/gi, match => {
                return this._convertColor(match, options.format);
            });
        }
        
        return value;
    }
    
    /**
     * Converte uma cor para o formato especificado
     * @private
     */
    static _convertColor(colorStr, format) {
        // Parse a cor para RGB
        const rgbColor = this._parseColorToRGB(colorStr);
        if (!rgbColor) {
            return colorStr; // Se não puder analisar, retorna a string original
        }
        
        // Verifica se tem alpha
        const hasAlpha = rgbColor.length === 4;
        
        // Converte para o formato alvo
        switch (format) {
            case 'hex':
                if (hasAlpha && rgbColor[3] < 1) {
                    // Não pode representar transparência em HEX, manter como RGBA
                    return `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${rgbColor[3]})`;
                }
                return this._rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
                
            case 'rgb':
                if (hasAlpha && rgbColor[3] < 1) {
                    return `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${rgbColor[3]})`;
                }
                return `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
                
            case 'hsl':
                const hsl = this._rgbToHsl(rgbColor[0], rgbColor[1], rgbColor[2]);
                if (hasAlpha && rgbColor[3] < 1) {
                    return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${rgbColor[3]})`;
                }
                return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                
            default:
                return colorStr;
        }
    }
    
    /**
     * Converte um string de cor qualquer para valores RGB
     * @private
     * @return {Array|null} [r, g, b] ou [r, g, b, a] ou null se inválido
     */
    static _parseColorToRGB(colorStr) {
        // HEX color (#FFF or #FFFFFF)
        if (colorStr.startsWith('#')) {
            let hex = colorStr.substring(1);
            
            // Convert short hex to full hex
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return [r, g, b];
            }
            
            return null;
        }
        
        // RGB color
        if (colorStr.startsWith('rgb(')) {
            const values = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (values) {
                return [parseInt(values[1]), parseInt(values[2]), parseInt(values[3])];
            }
            return null;
        }
        
        // RGBA color
        if (colorStr.startsWith('rgba(')) {
            const values = colorStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i);
            if (values) {
                return [parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseFloat(values[4])];
            }
            return null;
        }
        
        // HSL color
        if (colorStr.startsWith('hsl(')) {
            const values = colorStr.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
            if (values) {
                const hsl = [parseInt(values[1]), parseInt(values[2]), parseInt(values[3])];
                const rgb = this._hslToRgb(hsl[0], hsl[1], hsl[2]);
                return rgb;
            }
            return null;
        }
        
        // HSLA color
        if (colorStr.startsWith('hsla(')) {
            const values = colorStr.match(/hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i);
            if (values) {
                const hsl = [parseInt(values[1]), parseInt(values[2]), parseInt(values[3])];
                const rgb = this._hslToRgb(hsl[0], hsl[1], hsl[2]);
                return [...rgb, parseFloat(values[4])];
            }
            return null;
        }
        
        return null;
    }
    
    /**
     * Converte RGB para HEX
     * @private
     */
    static _rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    /**
     * Converte RGB para HSL
     * @private
     */
    static _rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // acromático
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        // Converte para graus e porcentagens
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return [h, s, l];
    }
    
    /**
     * Converte HSL para RGB
     * @private
     */
    static _hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // acromático
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}