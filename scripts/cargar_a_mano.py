#!/usr/bin/env python3
"""Carga un sorteo a mano en data/extractos.json (lo usa el plan B)."""
import datetime, json, os, re, sys
from pathlib import Path

ARCHIVO = Path(__file__).resolve().parent.parent / "data" / "extractos.json"
fecha = (os.environ.get("FECHA") or "").strip()
if not fecha:
    fecha = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3)).strftime("%Y-%m-%d")
sorteo = os.environ["SORTEO"].strip()
nums = re.findall(r"\d+", os.environ["NUMEROS"])
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", fecha):
    sys.exit("La fecha tiene que ser AAAA-MM-DD, por ejemplo 2026-11-19")
if sorteo not in ("Previa", "Primera", "Matutina", "Vespertina", "Nocturna"):
    sys.exit("Sorteo desconocido: " + sorteo)
if len(nums) != 20 or any(len(n) > 4 for n in nums):
    sys.exit(f"Tienen que ser 20 números de hasta 4 cifras (cargaste {len(nums)})")
datos = json.loads(ARCHIVO.read_text(encoding="utf-8")) if ARCHIVO.exists() else {}
datos.setdefault(fecha, {})[sorteo] = [n.zfill(4) for n in nums]
orden = ["Previa", "Primera", "Matutina", "Vespertina", "Nocturna"]
datos = {f: {s: datos[f][s] for s in orden if s in datos[f]} for f in sorted(datos)[-7:]}
ARCHIVO.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"Cargado {sorteo} del {fecha}: cabeza {nums[0].zfill(4)}")
