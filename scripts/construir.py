#!/usr/bin/env python3
"""Arma la página publicable (index.html + app.js) a partir del diseño
fuente/Main.dc.html, que es una copia exacta del diseño hecho en Claude.

Uso:  python3 scripts/construir.py

Si cambiás el diseño, reemplazá fuente/Main.dc.html y volvé a correr esto.
"""
import html, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "fuente" / "Main.dc.html"
DOMINIO = "https://agenciajmoficial.com.ar"

# Imágenes subidas al diseño en Claude → archivo dentro de img/
IMAGENES = {
    "1eaa86e4f0958a687ada4d1d8bfbaa74": "img/quiniela.png",
    "1c401ef6e4a330b0b1bf6c9a65bf78e0": "img/quiniela-plus.png",
    "b20f732583dfe194410f704213ff52f4": "img/quini6.png",
    "2d741827ba390ca0d4bd1f272136809e": "img/telekino.png",
    "e8d6929e0267dd31b867c6e64d45ac60": "img/loto-plus.png",
    "af293c20bb4201518503264f34c9da9f": "img/loto5.png",
    "f2fc58adfd7af40eea242bd952abe0ae": "img/brinco.png",
    "5521b360bce44fbd7eead1fb0e17b1d8": "img/recorte-prode.jpg",
    "78b46bc219af206b95a1c69163566451": "img/frente.jpg",
    "e4b1d7d36c8b84486a81d2329a561c8b": "img/vereda.jpg",
    "32c11940537755223c2c269b3fad8307": "img/ticket-quiniela-plus.jpg",
}

TITULO = "Agencia Oficial Juan Molina · Lotería de la Provincia · Bahía Blanca"
DESCRIPCION = ("Agencia oficial de la Lotería de la Provincia en Juan Molina 256, Bahía Blanca, desde 1972. "
               "Quiniela, Quini 6, Loto, Telekino y Brinco. Armá tu jugada y mandala por WhatsApp.")


def entre(texto, ini, fin):
    a = texto.index(ini) + len(ini)
    return texto[a:texto.index(fin, a)]


def main():
    src = FUENTE.read_text(encoding="utf-8")
    for id_, ruta in IMAGENES.items():
        src = src.replace("/_blob/" + id_, ruta)
    faltan = re.findall(r"/_blob/[0-9a-f]+", src)
    if faltan:
        raise SystemExit("Hay imágenes sin archivo en img/: " + ", ".join(sorted(set(faltan))))

    helmet = entre(src, "<helmet>", "</helmet>").strip()
    plantilla = entre(src, "</helmet>", "</x-dc>").strip()
    codigo = entre(src, "data-dc-script", "</script>")
    codigo = codigo[codigo.index(">") + 1:].strip()

    datos_path = RAIZ / "data" / "extractos.json"
    iniciales = datos_path.read_text(encoding="utf-8").strip() if datos_path.exists() else "{}"
    json.loads(iniciales)

    app_js = f"""/* Lógica de la página (copiada tal cual del diseño) + carga de resultados. */
{codigo}

/* Resultados de la Quiniela: los actualiza solo el robot en data/extractos.json */
var EXTRACTOS_INICIALES = {iniciales};
Component.prototype.extractos = function () {{
  return (this.state && this.state._ext) || EXTRACTOS_INICIALES;
}};
(function () {{
  var montaje = Component.prototype.componentDidMount;
  var desmontaje = Component.prototype.componentWillUnmount;
  Component.prototype.componentDidMount = function () {{
    if (montaje) montaje.call(this);
    var yo = this;
    function cargar() {{
      fetch('data/extractos.json?t=' + Date.now(), {{ cache: 'no-store' }})
        .then(function (r) {{ return r.ok ? r.json() : null; }})
        .then(function (d) {{ if (d) yo.setState({{ _ext: d }}); }})
        .catch(function () {{}});
    }}
    cargar();
    this._cargaExt = setInterval(cargar, 120000);
    this._alVolver = function () {{ if (!document.hidden) cargar(); }};
    document.addEventListener('visibilitychange', this._alVolver);
  }};
  Component.prototype.componentWillUnmount = function () {{
    if (desmontaje) desmontaje.call(this);
    clearInterval(this._cargaExt);
    document.removeEventListener('visibilitychange', this._alVolver);
  }};
}})();

MotorJM.montar(Component);
"""
    (RAIZ / "app.js").write_text(app_js, encoding="utf-8")

    t, d = html.escape(TITULO), html.escape(DESCRIPCION)
    index = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="theme-color" content="#1F5135">
<link rel="canonical" href="{DOMINIO}/">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="Agencia Oficial Juan Molina">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{DOMINIO}/">
<meta property="og:image" content="{DOMINIO}/img/frente.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{helmet}
</head>
<body>
<div id="app"></div>
<noscript><p style="padding:24px;font-family:system-ui,sans-serif">Para ver la página activá JavaScript en tu navegador. También podés escribirnos al WhatsApp <a href="https://wa.me/5492914357210">291 435-7210</a> o visitarnos en Juan Molina 256.</p></noscript>
<template id="plantilla">
{plantilla}
</template>
<script src="vendor/preact.min.umd.js"></script>
<script src="src/motor.js"></script>
<script src="app.js"></script>
</body>
</html>
"""
    (RAIZ / "index.html").write_text(index, encoding="utf-8")
    print("Listo: index.html y app.js")


if __name__ == "__main__":
    main()
