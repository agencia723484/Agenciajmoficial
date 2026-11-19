# Agencia Oficial Juan Molina

Página web de la Agencia Oficial Juan Molina (Lotería de la Provincia, legajo 723484),
Juan Molina 256, Bahía Blanca. Se publica en **https://agenciajmoficial.com.ar**.

## Cómo está armada

- `fuente/Main.dc.html`: el diseño original, copia exacta del hecho en Claude.
- `scripts/construir.py`: arma `index.html` y `app.js` a partir del diseño.
- `src/motor.js` + `vendor/preact.min.umd.js`: dibujan la página en el navegador.
- `img/`: logos y fotos.
- `data/extractos.json`: resultados de la Quiniela de la Provincia (últimos 7 días).

## Resultados automáticos

El robot `.github/workflows/resultados.yml` corre cada 10 minutos de lunes a sábado,
de 10 a 23 hs, lee el extracto oficial en loteria.gba.gob.ar y guarda los números nuevos.
La página los vuelve a pedir cada 2 minutos.

**Plan B:** si algún día el robot no lee bien, en GitHub entrá a
*Actions → Cargar un sorteo a mano → Run workflow*, elegí el sorteo y pegá los 20 números.
