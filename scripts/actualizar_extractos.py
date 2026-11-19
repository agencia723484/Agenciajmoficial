#!/usr/bin/env python3
"""Lee los extractos de la Quiniela de la Provincia desde la página oficial
de la Lotería y los guarda en data/extractos.json para que la web los muestre.

Formato: {"AAAA-MM-DD": {"Previa": ["0000", ... 20 números], ...}, ...}
Solo agrega sorteos completos (20 números de 4 cifras); nunca borra uno ya
guardado. Conserva los últimos DIAS_A_GUARDAR días.
"""
import json, re, sys, urllib.request
from pathlib import Path

URL = "https://www.loteria.gba.gob.ar/index.php/resultados"
ARCHIVO = Path(__file__).resolve().parent.parent / "data" / "extractos.json"
DIAS_A_GUARDAR = 7
NOMBRES = {
    "la previa": "Previa", "previa": "Previa",
    "el primero": "Primera", "primera": "Primera", "la primera": "Primera",
    "matutina": "Matutina", "vespertina": "Vespertina", "nocturna": "Nocturna",
}


def bajar(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def leer(html):
    """Devuelve {fecha: {sorteo: [20 números]}} con los sorteos completos de la página."""
    html = html.split('class="contenedorExtractos"')[0]
    salida = {}
    for bloque in re.split(r'<div class="sorteo">', html)[1:]:
        titulo = re.search(r"<h3>\s*(.*?)\s*<", bloque, re.S)
        fecha = re.search(r'class="fechaSorteo">\s*(\d{2})/(\d{2})/(\d{4})\s*<', bloque)
        if not titulo or not fecha:
            continue
        nombre = re.sub(r"^quiniela\s+", "", titulo.group(1).strip(), flags=re.I).lower()
        sorteo = NOMBRES.get(nombre)
        if not sorteo:
            continue
        pares = re.findall(r"<span>\s*(\d{1,2})\s*</span>\s*<span>\s*([^<]*?)\s*</span>", bloque)
        nums = {}
        for pos, num in pares:
            p = int(pos)
            if 1 <= p <= 20 and p not in nums:
                nums[p] = num
        lista = [nums.get(p, "") for p in range(1, 21)]
        if not all(re.fullmatch(r"\d{4}", n) for n in lista):
            continue  # sorteo todavía no publicado o incompleto
        clave = f"{fecha.group(3)}-{fecha.group(2)}-{fecha.group(1)}"
        salida.setdefault(clave, {})[sorteo] = lista
    return salida


def main():
    actual = {}
    if ARCHIVO.exists():
        try:
            actual = json.loads(ARCHIVO.read_text(encoding="utf-8"))
        except ValueError:
            actual = {}
    nuevos = leer(bajar(URL))
    cambios = 0
    for fecha, sorteos in nuevos.items():
        for sorteo, lista in sorteos.items():
            if actual.get(fecha, {}).get(sorteo) != lista:
                actual.setdefault(fecha, {})[sorteo] = lista
                cambios += 1
    orden = ["Previa", "Primera", "Matutina", "Vespertina", "Nocturna"]
    fechas = sorted(actual)[-DIAS_A_GUARDAR:]
    final = {f: {s: actual[f][s] for s in orden if s in actual[f]} for f in fechas}
    ARCHIVO.parent.mkdir(parents=True, exist_ok=True)
    ARCHIVO.write_text(json.dumps(final, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Sorteos leídos: {sum(len(v) for v in nuevos.values())} · cambios: {cambios}")
    if not nuevos:
        print("AVISO: no se pudo leer ningún sorteo de la página oficial", file=sys.stderr)


if __name__ == "__main__":
    main()
