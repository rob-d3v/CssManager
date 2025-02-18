import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import re
import css_parser
import json
from pathlib import Path
from ttkthemes import ThemedStyle


class ModernCSSOrganizer:
    # Unidades suportadas pelo JavaFX e suas conversões
    JAVAFX_UNITS = {
        'rem': 'em',  # JavaFX não suporta rem, mas suporta em
        'px': 'px',
        'em': 'em',
        '%': '%',
        'vw': 'vw',  # Viewport width
        'vh': 'vh'   # Viewport height
    }

    # Valores padrão para conversões
    DEFAULT_CONVERSIONS = {
        'viewport_width': 1920,  # Largura padrão para cálculos vw
        'viewport_height': 1080,  # Altura padrão para cálculos vh
        'base_em': 16           # Tamanho base para conversões em/rem
    }

    # Conversões específicas para JavaFX
    JAVAFX_CONVERSIONS = {
        'text-decoration-line': '-fx-underline',
        'background-color': '-fx-background-color',
        'color': '-fx-text-fill',
        'font-size': '-fx-font-size',
        'font-family': '-fx-font-family',
        'font-weight': '-fx-font-weight',
        'margin': '-fx-margin',
        'padding': '-fx-padding',
        'border-radius': '-fx-background-radius',
        'box-shadow': '-fx-effect',
        'transform': '-fx-transform',
        'opacity': '-fx-opacity',
        'cursor': '-fx-cursor',
        'text-align': '-fx-text-alignment',
        'display': '-fx-display',
        'visibility': '-fx-visibility'
    }

    def __init__(self, root):
        self.root = root
        self.root.title("CSS Manager Pro")
        self.root.geometry("1000x800")

        # Configurar tema dark
        self.style = ThemedStyle(root)
        self.style.set_theme("equilux")  # Tema dark moderno

        # Configurar cores personalizadas
        self.configure_custom_styles()

        # Variáveis de controle
        self.setup_variables()

        # Criar widgets
        self.create_widgets()

        # Configurar grid weights para responsividade
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)

    def setup_variables(self):
        """Inicializa todas as variáveis de controle"""
        self.px_to_rem = tk.BooleanVar(value=False)
        self.rem_to_px = tk.BooleanVar(value=False)
        self.merge_duplicates = tk.BooleanVar(value=False)
        self.sort_properties = tk.BooleanVar(value=False)
        self.remove_comments = tk.BooleanVar(value=False)
        self.is_javafx = tk.BooleanVar(value=False)
        self.minify_css = tk.BooleanVar(value=False)
        self.add_vendor_prefixes = tk.BooleanVar(value=False)
        self.convert_colors = tk.BooleanVar(value=False)
        self.organize_by_groups = tk.BooleanVar(value=False)
        self.remove_unused = tk.BooleanVar(value=False)
        self.format_code = tk.BooleanVar(value=False)
        self.base_font_size = tk.IntVar(value=16)
        self.color_format = tk.StringVar(value="HEX")
        self.target_unit = tk.StringVar(value="em")
        self.viewport_width = tk.IntVar(value=1920)
        self.viewport_height = tk.IntVar(value=1080)

    def configure_custom_styles(self):
        """Configura estilos personalizados para a interface"""
        # Cores
        bg_color = '#2b2b2b'
        fg_color = '#ffffff'
        accent_color = '#4a9eff'

        # Configurar estilos
        self.style.configure('Main.TFrame', background=bg_color)
        self.style.configure('Card.TLabelframe',
                             background=bg_color,
                             foreground=fg_color,
                             borderwidth=2,
                             relief='solid')
        self.style.configure('Card.TLabelframe.Label',
                             background=bg_color,
                             foreground=fg_color,
                             font=('Helvetica', 10, 'bold'))
        self.style.configure('Action.TButton',
                             padding=10,
                             font=('Helvetica', 10))

        # Configurar cores do Text widget
        self.root.option_add('*Text*Background', '#1e1e1e')
        self.root.option_add('*Text*Foreground', '#ffffff')
        self.root.option_add('*Text*selectBackground', accent_color)
        self.root.option_add('*Text*selectForeground', '#ffffff')

    def create_widgets(self):
        """Cria todos os widgets da interface"""
        # Frame principal
        main_frame = ttk.Frame(self.root, style='Main.TFrame', padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Área superior com opções
        self.create_options_area(main_frame)

        # Área de configurações
        self.create_settings_area(main_frame)

        # Área de ações
        self.create_action_area(main_frame)

        # Área de preview
        self.create_preview_area(main_frame)

    def create_options_area(self, parent):
        """Cria a área de opções com dois cards lado a lado"""
        options_frame = ttk.Frame(parent)
        options_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E))
        options_frame.grid_columnconfigure(0, weight=1)
        options_frame.grid_columnconfigure(1, weight=1)

        # Card de opções básicas
        basic_frame = ttk.LabelFrame(options_frame, text="Opções Básicas",
                                     style='Card.TLabelframe', padding="10")
        basic_frame.grid(row=0, column=0, padx=5, pady=5,
                         sticky=(tk.W, tk.E, tk.N, tk.S))

        basic_options = [
            ("Converter px para rem", self.px_to_rem),
            ("Converter rem para px", self.rem_to_px),
            ("Mesclar seletores duplicados", self.merge_duplicates),
            ("Ordenar propriedades", self.sort_properties),
            ("Remover comentários", self.remove_comments),
            ("Arquivo CSS para JavaFX", self.is_javafx)
        ]

        for i, (text, var) in enumerate(basic_options):
            ttk.Checkbutton(basic_frame, text=text, variable=var).grid(
                row=i, column=0, sticky=tk.W, pady=2)

        # Card de opções avançadas
        advanced_frame = ttk.LabelFrame(options_frame, text="Opções Avançadas",
                                        style='Card.TLabelframe', padding="10")
        advanced_frame.grid(row=0, column=1, padx=5, pady=5,
                            sticky=(tk.W, tk.E, tk.N, tk.S))

        advanced_options = [
            ("Minificar CSS", self.minify_css),
            ("Adicionar prefixos vendor", self.add_vendor_prefixes),
            ("Converter formatos de cores", self.convert_colors),
            ("Organizar por grupos", self.organize_by_groups),
            ("Remover propriedades não usadas", self.remove_unused),
            ("Formatar código", self.format_code)
        ]

        for i, (text, var) in enumerate(advanced_options):
            ttk.Checkbutton(advanced_frame, text=text, variable=var).grid(
                row=i, column=0, sticky=tk.W, pady=2)

    def create_settings_area(self, parent):
        """Cria a área de configurações"""
        settings_frame = ttk.LabelFrame(parent, text="Configurações",
                                        style='Card.TLabelframe', padding="10")
        settings_frame.grid(row=1, column=0, columnspan=2,
                            padx=5, pady=5, sticky=(tk.W, tk.E))

        # Configurações de fonte e unidades
        font_frame = ttk.Frame(settings_frame)
        font_frame.grid(row=0, column=0, sticky=tk.W)

        ttk.Label(font_frame, text="Tamanho base da fonte (px):").grid(
            row=0, column=0, padx=5)
        ttk.Entry(font_frame, textvariable=self.base_font_size,
                  width=5).grid(row=0, column=1, padx=5)

        # Unidades relativas
        unit_frame = ttk.Frame(settings_frame)
        unit_frame.grid(row=0, column=1, padx=20, sticky=tk.W)

        ttk.Label(unit_frame, text="Unidade alvo:").grid(row=0, column=0)
        for i, unit in enumerate(['em', '%', 'vw', 'vh']):
            ttk.Radiobutton(unit_frame, text=unit, variable=self.target_unit,
                            value=unit).grid(row=0, column=i+1, padx=5)

        # Viewport settings
        viewport_frame = ttk.Frame(settings_frame)
        viewport_frame.grid(row=1, column=0, columnspan=2,
                            pady=10, sticky=tk.W)

        ttk.Label(viewport_frame, text="Viewport Width (px):").grid(
            row=0, column=0)
        ttk.Entry(viewport_frame, textvariable=self.viewport_width,
                  width=6).grid(row=0, column=1, padx=5)

        ttk.Label(viewport_frame, text="Viewport Height (px):").grid(
            row=0, column=2, padx=10)
        ttk.Entry(viewport_frame, textvariable=self.viewport_height,
                  width=6).grid(row=0, column=3, padx=5)

        # Formato de cores
        color_frame = ttk.Frame(settings_frame)
        color_frame.grid(row=2, column=0, columnspan=2, pady=5, sticky=tk.W)

        ttk.Label(color_frame, text="Formato de cores:").grid(row=0, column=0)
        for i, format_name in enumerate(['HEX', 'RGB', 'HSL']):
            ttk.Radiobutton(color_frame, text=format_name,
                            variable=self.color_format,
                            value=format_name).grid(row=0, column=i+1, padx=5)

    def create_action_area(self, parent):
        """Cria a área de botões de ação"""
        btn_frame = ttk.Frame(parent)
        btn_frame.grid(row=2, column=0, columnspan=2, pady=10)

        ttk.Button(btn_frame, text="Selecionar arquivo CSS",
                   command=self.select_file,
                   style='Action.TButton').grid(row=0, column=0, padx=5)

        ttk.Button(btn_frame, text="Processar",
                   command=self.process_css,
                   style='Action.TButton').grid(row=0, column=1, padx=5)

        ttk.Button(btn_frame, text="Salvar como...",
                   command=self.save_as,
                   style='Action.TButton').grid(row=0, column=2, padx=5)

    def create_preview_area(self, parent):
        """Cria a área de preview do CSS"""
        preview_frame = ttk.LabelFrame(parent, text="Preview",
                                       style='Card.TLabelframe', padding="10")
        preview_frame.grid(row=3, column=0, columnspan=2, pady=5,
                           sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configurar grid weights para o frame de preview
        preview_frame.grid_columnconfigure(0, weight=1)
        preview_frame.grid_rowconfigure(0, weight=1)

        # Criar widget Text com scrollbar
        self.preview_text = tk.Text(preview_frame, height=15, width=90,
                                    font=('Consolas', 10))
        self.preview_text.grid(
            row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        scrollbar = ttk.Scrollbar(preview_frame, orient="vertical",
                                  command=self.preview_text.yview)
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))

        self.preview_text.configure(yscrollcommand=scrollbar.set)

    def select_file(self):
        """Abre diálogo para selecionar arquivo CSS"""
        self.filename = filedialog.askopenfilename(
            filetypes=[("CSS files", "*.css"), ("All files", "*.*")]
        )
        if self.filename:
            with open(self.filename, 'r', encoding='utf-8') as file:
                self.css_content = file.read()
                self.preview_text.delete(1.0, tk.END)
                self.preview_text.insert(tk.END, self.css_content)

    def save_as(self):
        """Abre diálogo para salvar arquivo processado"""
        if not hasattr(self, 'css_content'):
            messagebox.showerror("Erro", "Nenhum CSS para salvar!")
            return

        filename = filedialog.asksaveasfilename(
            defaultextension=".css",
            filetypes=[("CSS files", "*.css"), ("All files", "*.*")],
            initialfile="processed.css"
        )
        if filename:
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(self.preview_text.get(1.0, tk.END))
            messagebox.showinfo("Sucesso", f"Arquivo salvo como:\n{filename}")

    def minify_css_content(self, css_content):
        """Minifica o conteúdo CSS removendo espaços desnecessários"""
        # Remove comentários
        css_content = re.sub(r'/\*[\s\S]*?\*/', '', css_content)
        # Remove espaços em branco extras
        css_content = re.sub(r'\s+', ' ', css_content)
        # Remove espaços antes e depois de caracteres específicos
        css_content = re.sub(r'\s*([\{\}\:\;\,])\s*', r'\1', css_content)
        return css_content.strip()

    def format_css(self, css_content):
        """Formata o CSS com identação adequada"""
        formatted = ""
        indent_level = 0
        lines = css_content.split('}')

        for line in lines:
            if '{' in line:
                selector, properties = line.split('{')
                formatted += '    ' * indent_level + selector.strip() + ' {\n'
                # Formata cada propriedade em uma nova linha
                for prop in properties.split(';'):
                    if prop.strip():
                        formatted += '    ' * \
                            (indent_level + 1) + prop.strip() + ';\n'
                formatted += '    ' * indent_level + '}\n\n'

        return formatted

    def add_vendor_prefixes(self, css_content):
        """Adiciona prefixos vendor para propriedades que precisam"""
        prefixes = ['-webkit-', '-moz-', '-ms-', '-o-']
        properties_need_prefix = [
            'animation', 'transform', 'transition', 'box-shadow', 'border-radius',
            'user-select', 'appearance', 'backdrop-filter', 'backface-visibility'
        ]

        for prop in properties_need_prefix:
            pattern = f"({prop}\\s*:.*?;)"
            if re.search(pattern, css_content):
                for prefix in prefixes:
                    css_content = re.sub(
                        pattern,
                        f"{prefix}\1\n    \1",
                        css_content
                    )
        return css_content

    def convert_color_format(self, css_content):
        """Converte cores para o formato especificado"""
        target_format = self.color_format.get()

        def convert_color(match):
            color = match.group(0)
            if target_format == "RGB":
                # Converte HEX para RGB
                if color.startswith('#'):
                    r = int(color[1:3], 16)
                    g = int(color[3:5], 16)
                    b = int(color[5:7], 16)
                    return f"rgb({r},{g},{b})"
            elif target_format == "HEX":
                # Converte RGB para HEX
                if color.startswith('rgb'):
                    values = re.findall(r'\d+', color)
                    if len(values) == 3:
                        r, g, b = map(int, values)
                        return f"#{r:02x}{g:02x}{b:02x}"
            elif target_format == "HSL":
                # Implementa conversão para HSL se necessário
                if color.startswith('#'):
                    r = int(color[1:3], 16) / 255.0
                    g = int(color[3:5], 16) / 255.0
                    b = int(color[5:7], 16) / 255.0
                    h, s, l = self.rgb_to_hsl(r, g, b)
                    return f"hsl({int(h*360)},{int(s*100)}%,{int(l*100)}%)"
            return color

        # Procura e converte cores
        css_content = re.sub(
            r'#[0-9a-fA-F]{6}|rgb\(\d+,\s*\d+,\s*\d+\)', convert_color, css_content)
        return css_content

    def rgb_to_hsl(self, r, g, b):
        """Converte RGB para HSL"""
        max_val = max(r, g, b)
        min_val = min(r, g, b)
        h = s = l = (max_val + min_val) / 2

        if max_val == min_val:
            h = s = 0
        else:
            d = max_val - min_val
            s = d / (2 - max_val - min_val) if l > 0.5 else d / \
                (max_val + min_val)
            if max_val == r:
                h = (g - b) / d + (6 if g < b else 0)
            elif max_val == g:
                h = (b - r) / d + 2
            elif max_val == b:
                h = (r - g) / d + 4
            h /= 6

        return h, s, l

    def organize_by_groups(self, css_content):
        """Organiza propriedades CSS por grupos lógicos"""
        property_groups = {
            'Posicionamento': ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
            'Display': ['display', 'visibility', 'opacity', 'overflow'],
            'Box Model': ['margin', 'padding', 'width', 'height', 'box-sizing'],
            'Cores': ['color', 'background', 'border-color'],
            'Tipografia': ['font-family', 'font-size', 'font-weight', 'line-height'],
            'Efeitos': ['transform', 'transition', 'animation', 'box-shadow']
        }

        def sort_properties(properties_text):
            properties = [p.strip()
                          for p in properties_text.split(';') if p.strip()]
            grouped_properties = {group: [] for group in property_groups}
            others = []

            for prop in properties:
                prop_name = prop.split(':')[0].strip()
                matched = False
                for group, props in property_groups.items():
                    if any(p in prop_name for p in props):
                        grouped_properties[group].append(prop)
                        matched = True
                        break
                if not matched:
                    others.append(prop)

            # Reconstrói o CSS ordenado por grupos
            result = []
            for group, props in grouped_properties.items():
                if props:
                    result.extend(props)
            result.extend(others)

            return ';\n    '.join(result)

        # Aplica a organização em cada bloco CSS
        def organize_block(match):
            selector = match.group(1)
            properties = match.group(2)
            organized_props = sort_properties(properties)
            return f"{selector} {{\n    {organized_props};\n}}"

        return re.sub(r'([^{]+)\s*{\s*([^}]+)}', organize_block, css_content)

    def convert_units(self, css_content):
        """Converte unidades para o formato desejado"""
        target_unit = self.target_unit.get()
        base_size = self.base_font_size.get()
        viewport_width = self.viewport_width.get()
        viewport_height = self.viewport_height.get()

        def convert_value(match):
            value = float(match.group(1))
            unit = match.group(2)

            # Primeiro converte para pixels
            if unit == 'rem':
                px_value = value * base_size
            elif unit == 'em':
                px_value = value * base_size
            elif unit == 'vw':
                px_value = (value / 100) * viewport_width
            elif unit == 'vh':
                px_value = (value / 100) * viewport_height
            elif unit == '%':
                return f"{value}%"  # Mantém porcentagem como está
            else:  # px
                px_value = value

            # Depois converte para a unidade alvo
            if target_unit == 'em':
                return f"{px_value / base_size}em"
            elif target_unit == 'vw':
                return f"{(px_value / viewport_width) * 100}vw"
            elif target_unit == 'vh':
                return f"{(px_value / viewport_height) * 100}vh"
            elif target_unit == '%':
                return f"{(px_value / base_size) * 100}%"
            else:  # px
                return f"{px_value}px"

        # Procura e converte todas as unidades
        pattern = r'(\d*\.?\d+)(px|rem|em|vw|vh|%)'
        return re.sub(pattern, convert_value, css_content)

    def remove_unused_properties(self, css_content):
        """Remove propriedades que não têm efeito"""
        # Lista de propriedades que são frequentemente redundantes
        redundant_patterns = [
            r'margin:\s*0[^;]*;\s*margin-(?:top|right|bottom|left):[^;]*;',
            r'padding:\s*0[^;]*;\s*padding-(?:top|right|bottom|left):[^;]*;',
            r'border:\s*none[^;]*;\s*border-(?:top|right|bottom|left):[^;]*;',
            r'font:\s*[^;]*;\s*font-(?:family|size|weight|style):[^;]*;'
        ]

        for pattern in redundant_patterns:
            css_content = re.sub(pattern, '', css_content)

        return css_content

    def process_css(self):
        """Processa o arquivo CSS aplicando todas as transformações selecionadas"""
        if not hasattr(self, 'css_content'):
            messagebox.showerror(
                "Erro", "Por favor, selecione um arquivo CSS primeiro!")
            return

        processed_css = self.css_content

        try:
            # Aplicar transformações conforme opções selecionadas
            if self.remove_comments.get():
                processed_css = self.remove_css_comments(processed_css)

            if self.px_to_rem.get():
                processed_css = self.px_to_rem_convert(processed_css)

            if self.rem_to_px.get():
                processed_css = self.rem_to_px_convert(processed_css)

            if self.merge_duplicates.get():
                processed_css = self.merge_duplicate_selectors(processed_css)

            if self.sort_properties.get():
                processed_css = self.sort_css_properties(processed_css)

            if self.is_javafx.get():
                processed_css = self.convert_to_javafx(processed_css)

            if self.minify_css.get():
                processed_css = self.minify_css_content(processed_css)

            if self.add_vendor_prefixes.get():
                processed_css = self.add_vendor_prefixes(processed_css)

            if self.convert_colors.get():
                processed_css = self.convert_color_format(processed_css)

            if self.organize_by_groups.get():
                processed_css = self.organize_by_groups(processed_css)

            if self.remove_unused.get():
                processed_css = self.remove_unused_properties(processed_css)

            if self.format_code.get():
                processed_css = self.format_css(processed_css)

            # Atualizar preview
            self.preview_text.delete(1.0, tk.END)
            self.preview_text.insert(tk.END, processed_css)

            messagebox.showinfo("Sucesso", "CSS processado com sucesso!")

        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao processar CSS:\n{str(e)}")


if __name__ == "__main__":
    root = tk.Tk()
    app = ModernCSSOrganizer(root)
    root.mainloop()
