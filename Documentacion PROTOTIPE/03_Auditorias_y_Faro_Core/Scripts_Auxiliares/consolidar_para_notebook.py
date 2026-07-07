import os
import shutil

root_dir = r"d:\PROTOTIPE\Documentacion PROTOTIPE"
desktop_dir = r"C:\Users\Sergio\Desktop\documentacion prototype"
mapa_consolidacion = os.path.join(desktop_dir, "_MAPA_DE_CONSOLIDACION.md")

# Asegurar que el directorio de salida esté limpio y creado
if os.path.exists(desktop_dir):
    # Eliminar archivos anteriores
    for f in os.listdir(desktop_dir):
        fp = os.path.join(desktop_dir, f)
        if os.path.isfile(fp):
            try:
                os.remove(fp)
            except Exception:
                pass
else:
    os.makedirs(desktop_dir, exist_ok=True)

# Agrupación por carpeta principal
carpetas_consolidar = {}

for root, dirs, files in os.walk(root_dir):
    # Omitir backups o carpetas ocultas
    if ".prototipe-backup" in root or ".git" in root:
        continue
        
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, root_dir)
        
        # Obtener el nombre de la carpeta principal
        parts = rel_path.split(os.sep)
        subfolder = parts[0] if len(parts) > 1 else "Raiz"
        
        ext = os.path.splitext(file)[1].lower()
        # Restringir EXCLUSIVAMENTE a archivos .md
        if ext != '.md':
            continue
            
        if subfolder not in carpetas_consolidar:
            carpetas_consolidar[subfolder] = []
            
        carpetas_consolidar[subfolder].append({
            "ruta_completa": full_path,
            "ruta_relativa": rel_path.replace('\\', '/'),
            "nombre": file,
            "extension": ext
        })

mapa_reporte = []

for subfolder, file_list in carpetas_consolidar.items():
    consolidated_file_name = f"{subfolder}__CONSOLIDADO.md"
    consolidated_path = os.path.join(desktop_dir, consolidated_file_name)
    
    print(f"Consolidando {len(file_list)} archivos en {consolidated_file_name}...")
    
    with open(consolidated_path, 'w', encoding='utf-8') as f_out:
        f_out.write(f"# Documentación Consolidada - {subfolder.replace('_', ' ').title()}\n\n")
        f_out.write(f"Este archivo consolidado agrupa {len(file_list)} documentos originales pertenecientes a la sección `{subfolder}` del ecosistema PROTOTIPE para NotebookLM.\n\n")
        
        # Tabla de contenido al inicio del archivo
        f_out.write("## Índice de Contenidos del Documento\n\n")
        for f_item in file_list:
            f_out.write(f"- [Ir a: {f_item['ruta_relativa']}](#archivo-{f_item['ruta_relativa'].lower().replace('/', '-').replace('.', '-')})\n")
        f_out.write("\n---\n\n")
        
        for f_item in file_list:
            orig_rel = f_item['ruta_relativa']
            
            # Ancla de enlace
            anchor = f"archivo-{orig_rel.lower().replace('/', '-').replace('.', '-')}"
            f_out.write(f'<a name="{anchor}"></a>\n')
            f_out.write(f"# ARCHIVO: {orig_rel}\n\n")
            
            try:
                content = ""
                try:
                    with open(f_item['ruta_completa'], 'r', encoding='utf-8') as f_in:
                        content = f_in.read()
                except UnicodeDecodeError:
                    with open(f_item['ruta_completa'], 'r', encoding='latin-1') as f_in:
                        content = f_in.read()
                
                f_out.write(content)
                f_out.write("\n\n---\n\n")
                
                mapa_reporte.append({
                    "archivo_original": orig_rel,
                    "archivo_consolidado": consolidated_file_name,
                    "ancla": f"#{anchor}",
                    "estado": "Consolidado exitosamente"
                })
            except Exception as e:
                f_out.write(f"\n*Error al leer contenido*: {str(e)}\n\n---\n\n")
                mapa_reporte.append({
                    "archivo_original": orig_rel,
                    "archivo_consolidado": consolidated_file_name,
                    "ancla": f"#{anchor}",
                    "estado": f"Error de lectura: {str(e)}"
                })

# Escribir el mapa de consolidación
markdown_lines = [
    "# 🗺️ Mapa de Consolidación de Documentos (Para NotebookLM)",
    "\nEste archivo indica en cuál de los **archivos consolidados** se encuentra el contenido de cada documento original de la base documental del proyecto PROTOTIPE.\n",
    "## Resumen de Consolidación",
    "Para evitar superar el límite de 300 fuentes de NotebookLM, los archivos originales fueron unificados en **archivos consolidados** principales (agrupados por su carpeta de origen en el monorepo).",
    "La consolidación se limitó de forma estricta a archivos de documentación Markdown (.md) en formato plano.\n",
    "## Mapeo de Fuentes\n",
    "| Documento Original | Archivo Consolidado en Escritorio | Ubicación de la Sección | Estado |",
    "| :--- | :--- | :--- | :--- |"
]

for item in sorted(mapa_reporte, key=lambda x: x['archivo_original']):
    orig = item['archivo_original']
    consolidado = item['archivo_consolidado']
    ancla = item['ancla']
    estado = item['estado']
    
    markdown_lines.append(f"| `{orig}` | `{consolidado}` | `{ancla}` | {estado} |")

with open(mapa_consolidacion, 'w', encoding='utf-8') as f_out:
    f_out.write("\n".join(markdown_lines))

print(f"Consolidación completada. Archivos consolidados: {len(carpetas_consolidar)}")
