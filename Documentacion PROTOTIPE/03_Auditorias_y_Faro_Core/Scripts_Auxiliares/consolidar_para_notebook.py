import os
import sys
import time

# Forzar codificación UTF-8 en sys.stdout para evitar UnicodeEncodeError en consolas Windows (cp1252)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Inicializar soporte de colores ANSI en consolas Windows de forma nativa
if sys.platform == 'win32':
    os.system('color')

# Paleta de colores ANSI Premium
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_BLUE = "\033[94m"
C_CYAN = "\033[96m"
C_RED = "\033[91m"
C_GRAY = "\033[90m"
C_MAGENTA = "\033[95m"

root_dir = r"d:\PROTOTIPE\Documentacion PROTOTIPE"
desktop_dir = r"C:\Users\Sergio\Desktop\documentacion prototype"
mapa_consolidacion = os.path.join(desktop_dir, "_MAPA_DE_CONSOLIDACION.md")

# Función helper para extraer de forma eficiente el título principal de un archivo Markdown
def extract_metadata(filepath, filename):
    title = filename.replace('.md', '').replace('_', ' ').title()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for _ in range(15):  # Leer solo las primeras 15 líneas para mayor rapidez
                line = f.readline()
                if not line:
                    break
                stripped = line.strip()
                if stripped.startswith('# '):
                    title = stripped[2:].replace('📚', '').replace('📦', '').strip()
                    break
    except Exception:
        pass
    return title

# Cabecera Visual Premium de la Herramienta
print(f"{C_CYAN}======================================================================{C_RESET}")
print(f" {C_BOLD}{C_GREEN}📚 [PROTOTIPE DOCUMENTATION CONSOLIDATOR - NOTEBOOKLM]{C_RESET}")
print(f" {C_GRAY}Engine de compactación documental para bases de conocimiento.{C_RESET}")
print(f"{C_CYAN}======================================================================{C_RESET}")
print(f" {C_BLUE}• Directorio Origen:{C_RESET} {root_dir}")
print(f" {C_BLUE}• Destino Escritorio:{C_RESET} {desktop_dir}")
print(f"{C_CYAN}----------------------------------------------------------------------{C_RESET}")

# 1. Limpieza y preparación segura del Escritorio
print(f" {C_YELLOW}🧹 Preparando entorno y limpiando archivos anteriores...{C_RESET}")
try:
    if os.path.exists(desktop_dir):
        files_removed = 0
        for f in os.listdir(desktop_dir):
            fp = os.path.join(desktop_dir, f)
            if os.path.isfile(fp):
                try:
                    os.remove(fp)
                    files_removed += 1
                except Exception:
                    pass
        if files_removed > 0:
            print(f"    -> {C_GREEN}OK:{C_RESET} Eliminados {files_removed} consolidados anteriores.")
    else:
        os.makedirs(desktop_dir, exist_ok=True)
        print(f"    -> {C_GREEN}OK:{C_RESET} Creado directorio de salida en el Escritorio.")
except Exception as e:
    print(f"    {C_RED}[!] Advertencia en limpieza: {str(e)}{C_RESET}")

# 2. Escaneo recursivo de directorios buscando archivos Markdown (.md)
print(f" {C_YELLOW}🔎 Escaneando base documental en búsqueda de archivos Markdown...{C_RESET}")
carpetas_consolidar = {}
total_files_found = 0

for root, dirs, files in os.walk(root_dir):
    # Omitir copias de seguridad de reglas, backups y git
    if ".prototipe-backup" in root or ".git" in root:
        continue
        
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, root_dir)
        
        # Agrupar por carpeta de nivel 1
        parts = rel_path.split(os.sep)
        subfolder = parts[0] if len(parts) > 1 else "Raiz"
        
        # Exclusión de históricos de bitácoras de cambios en la carpeta de auditorías
        if subfolder == "03_Auditorias_y_Faro_Core":
            file_lower = file.lower()
            if "historico" in file_lower or "hasta" in file_lower:
                continue
        
        ext = os.path.splitext(file)[1].lower()
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
        total_files_found += 1

print(f"    -> {C_GREEN}OK:{C_RESET} Detectados {C_BOLD}{total_files_found}{C_RESET} archivos Markdown en {C_BOLD}{len(carpetas_consolidar)}{C_RESET} secciones principales.")
print(f"{C_CYAN}----------------------------------------------------------------------{C_RESET}")

# Helper para renderizar barra de progreso visual animada por consola
def render_progress_bar(current, total, prefix='', suffix='', length=35):
    percent = (current / total) * 100
    filled_length = int(length * current // total)
    bar = '█' * filled_length + '░' * (length - filled_length)
    # Escribir y resetear línea en caliente
    sys.stdout.write(f'\r {prefix} {C_CYAN}|{bar}|{C_RESET} {C_BOLD}{percent:.1f}%{C_RESET} {suffix}')
    sys.stdout.flush()

mapa_reporte = []
processed_folders = 0
total_folders = len(carpetas_consolidar)

# 3. Compactar los archivos por sección principal
for subfolder, file_list in sorted(carpetas_consolidar.items()):
    consolidated_file_name = f"{subfolder}__CONSOLIDADO.md"
    consolidated_path = os.path.join(desktop_dir, consolidated_file_name)
    
    prefix_msg = f"{C_BLUE}📦 {subfolder:<20}{C_RESET}"
    
    # Escribir el consolidado
    with open(consolidated_path, 'w', encoding='utf-8') as f_out:
        f_out.write(f"# Documentación Consolidada - {subfolder.replace('_', ' ').title()}\n\n")
        f_out.write(f"Este archivo consolidado agrupa {len(file_list)} documentos originales pertenecientes a la sección `{subfolder}` del ecosistema PROTOTIPE para NotebookLM.\n\n")
        
        # Escribir Tabla de contenidos
        f_out.write("## Índice de Contenidos del Documento\n\n")
        for f_item in file_list:
            f_out.write(f"- [Ir a: {f_item['ruta_relativa']}](#archivo-{f_item['ruta_relativa'].lower().replace('/', '-').replace('.', '-')})\n")
        f_out.write("\n---\n\n")
        
        # Añadir archivos con barra de progreso animada por cada archivo de la carpeta
        for idx, f_item in enumerate(file_list, 1):
            orig_rel = f_item['ruta_relativa']
            anchor = f"archivo-{orig_rel.lower().replace('/', '-').replace('.', '-')}"
            
            f_out.write(f'<a name="{anchor}"></a>\n')
            f_out.write(f"# ARCHIVO: {orig_rel}\n\n")
            
            # Procesamiento diferencial inteligente por sección
            if subfolder in ["06_Biblioteca_Componentes", "09_Modulos_Completos"]:
                # Generar inventario de existencias conceptual (Nombre, Ruta, Ubicación)
                title = extract_metadata(f_item['ruta_completa'], f_item['nombre'])
                content = f"""* **Nombre de Componente/Módulo:** {title}
* **Ubicación Física:** `{orig_rel}`
* **Estatus:** Documentado e indexado en el monorepo.
*(Nota: El código fuente React completo y especificaciones técnicas detalladas de este componente se omiten en el consolidado de NotebookLM para optimizar el límite de caracteres).*
"""
            else:
                # Cargar el contenido completo de forma íntegra sin resumir nada
                try:
                    content = ""
                    with open(f_item['ruta_completa'], 'r', encoding='utf-8') as f_in:
                        content = f_in.read()
                except UnicodeDecodeError:
                    try:
                        with open(f_item['ruta_completa'], 'r', encoding='latin-1') as f_in:
                            content = f_in.read()
                    except Exception as e:
                        content = f"\n*Error de lectura crítico*: {str(e)}\n"
            
            f_out.write(content)
            f_out.write("\n\n---\n\n")
            
            mapa_reporte.append({
                "archivo_original": orig_rel,
                "archivo_consolidado": consolidated_file_name,
                "ancla": f"#{anchor}",
                "estado": "Consolidado exitosamente"
            })
            
            # Animar barra de progreso
            render_progress_bar(idx, len(file_list), prefix=prefix_msg, suffix=f"({idx}/{len(file_list)})")
            time.sleep(0.005) # Animación ágil
            
    # Salto de línea al terminar la carpeta actual
    print()
    processed_folders += 1

# 4. Crear el mapa de consolidación estructurado
print(f"{C_CYAN}----------------------------------------------------------------------{C_RESET}")
print(f" {C_YELLOW}🗺️ Generando mapa de consolidación de fuentes...{C_RESET}")

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

print(f"    -> {C_GREEN}OK:{C_RESET} _MAPA_DE_CONSOLIDACION.md creado exitosamente en el Escritorio.")
print(f"{C_CYAN}======================================================================{C_RESET}")
print(f" {C_BOLD}{C_GREEN}🎉 ¡CONSOLIDACIÓN COMPLETADA EXITOSAMENTE!{C_RESET}")
print(f" {C_BLUE}• Total Secciones Consolidadas:{C_RESET} {len(carpetas_consolidar)}")
print(f" {C_BLUE}• Total Archivos Compactados:{C_RESET} {total_files_found}")
print(f" {C_GREEN}✨ Tus fuentes listas para NotebookLM en {C_BOLD}Desktop\\documentacion prototype\\{C_RESET}")
print(f"{C_CYAN}======================================================================{C_RESET}")
