import os
from pypdf import PdfReader
import re
import sys

# Garante que o output do console aceite UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text):
    # Remove excess whitespace and normalize line endings
    text = re.sub(r'\n\s*\n', '\n\n', text)
    # Remove control characters
    text = "".join(ch for ch in text if ch.isprintable() or ch in '\n\r\t')
    return text.strip()

def convert_pdfs():
    base_dir = r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\base_conhecimento'
    output_dir = r'c:\Users\jmtri\OneDrive\ViTan\IRPF-Kanban\src\data\knowledge_md'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    files = [f for f in os.listdir(base_dir) if f.lower().endswith('.pdf')]
    
    print(f"Encontrados {len(files)} arquivos PDF.")
    
    for filename in files:
        pdf_path = os.path.join(base_dir, filename)
        # Sanitização agressiva do nome do arquivo
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', os.path.splitext(filename)[0]).lower()
        md_filename = f"{safe_name}.md"
        md_path = os.path.join(output_dir, md_filename)
        
        print(f"Convertendo {filename} -> {md_filename}...")
        
        try:
            reader = PdfReader(pdf_path)
            content = []
            content.append(f"# {filename}\n")
            
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    content.append(f"## Página {i+1}\n")
                    content.append(clean_text(text) + "\n")
            
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write("\n".join(content))
                
        except Exception as e:
            print(f"Erro ao processar {filename}: {e}")

if __name__ == "__main__":
    convert_pdfs()
