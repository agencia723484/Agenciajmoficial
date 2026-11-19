/*
 * Motor de la página de la Agencia Juan Molina.
 *
 * Lee la plantilla que está dentro de <template id="plantilla"> (el mismo
 * formato del diseño original: {{huecos}}, <sc-if> y <sc-for>) y la dibuja
 * con Preact usando los valores que devuelve renderVals() del componente.
 */
(function () {
  'use strict';
  var h = preact.h;

  // ---------- 1. Compilar la plantilla a un árbol liviano ----------
  var HUECO = /\{\{\s*([^}]+?)\s*\}\}/g;
  var HUECO_ENTERO = /^\{\{\s*([^}]+?)\s*\}\}$/;
  var BOOLEANOS = { disabled: 1, checked: 1, selected: 1, required: 1, readonly: 1, multiple: 1, hidden: 1 };
  var EVENTOS = { onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onsubmit: 'onSubmit', onkeydown: 'onKeyDown', onblur: 'onBlur', onfocus: 'onFocus' };

  function partes(texto) {
    var out = [], ultimo = 0, m;
    HUECO.lastIndex = 0;
    while ((m = HUECO.exec(texto))) {
      if (m.index > ultimo) out.push({ lit: texto.slice(ultimo, m.index) });
      out.push({ ruta: m[1] });
      ultimo = HUECO.lastIndex;
    }
    if (ultimo < texto.length) out.push({ lit: texto.slice(ultimo) });
    return out;
  }

  function valorAttr(texto) {
    var m = HUECO_ENTERO.exec(texto.trim());
    if (m) return { ruta: m[1] };
    if (texto.indexOf('{{') === -1) return { lit: texto };
    return { partes: partes(texto) };
  }

  function compilar(nodo) {
    var hijos = [];
    for (var c = nodo.firstChild; c; c = c.nextSibling) {
      var n = compilarNodo(c);
      if (n) hijos.push(n);
    }
    return hijos;
  }

  function compilarNodo(n) {
    if (n.nodeType === 3) {
      var t = n.nodeValue;
      return t.indexOf('{{') === -1 ? { tipo: 'txt', lit: t } : { tipo: 'txt', partes: partes(t) };
    }
    if (n.nodeType !== 1) return null;
    var tag = n.localName;
    if (tag === 'sc-if') {
      return { tipo: 'si', valor: valorAttr(n.getAttribute('value') || ''), hijos: compilar(n) };
    }
    if (tag === 'sc-for') {
      return { tipo: 'para', lista: valorAttr(n.getAttribute('list') || ''), como: n.getAttribute('as') || 'item', hijos: compilar(n) };
    }
    var esSvg = n.namespaceURI === 'http://www.w3.org/2000/svg';
    var attrs = [];
    var tipoInput = (n.getAttribute('type') || '').toLowerCase();
    for (var i = 0; i < n.attributes.length; i++) {
      var a = n.attributes[i];
      var nombre = a.name;
      if (nombre.indexOf('hint-') === 0) continue;
      var bajo = nombre.toLowerCase();
      if (EVENTOS[bajo]) {
        nombre = EVENTOS[bajo];
        // Igual que en React: onChange de un campo de texto avisa en cada tecla.
        if (nombre === 'onChange' && (tag === 'textarea' || (tag === 'input' && tipoInput !== 'checkbox' && tipoInput !== 'radio'))) nombre = 'onInput';
      }
      var v = valorAttr(a.value);
      if (!esSvg && BOOLEANOS[bajo] && v.lit !== undefined) v = { lit: true };
      attrs.push([nombre, v]);
    }
    var contenido = tag === 'template' ? n.content : n;
    return { tipo: 'el', tag: tag, attrs: attrs, hijos: compilar(contenido) };
  }

  // ---------- 2. Dibujar el árbol con los valores ----------
  function buscar(ruta, alcances) {
    if (ruta === 'true') return true;
    if (ruta === 'false') return false;
    if (ruta === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(ruta)) return Number(ruta);
    if (/^(['"]).*\1$/.test(ruta)) return ruta.slice(1, -1);
    var p = ruta.split('.');
    var base;
    for (var i = alcances.length - 1; i >= 0; i--) {
      if (alcances[i] && Object.prototype.hasOwnProperty.call(alcances[i], p[0])) { base = alcances[i][p[0]]; break; }
    }
    for (var j = 1; j < p.length && base != null; j++) base = base[p[j]];
    return base;
  }

  function texto(v) { return v == null || v === false ? '' : String(v); }

  function evaluar(v, alcances) {
    if (v.lit !== undefined) return v.lit;
    if (v.ruta !== undefined) return buscar(v.ruta, alcances);
    var s = '';
    for (var i = 0; i < v.partes.length; i++) {
      var p = v.partes[i];
      s += p.lit !== undefined ? p.lit : texto(buscar(p.ruta, alcances));
    }
    return s;
  }

  function dibujar(lista, alcances) {
    var out = [];
    for (var i = 0; i < lista.length; i++) {
      var n = lista[i];
      if (n.tipo === 'txt') {
        out.push(n.lit !== undefined ? n.lit : evaluar(n, alcances));
      } else if (n.tipo === 'si') {
        if (evaluar(n.valor, alcances)) out.push(dibujar(n.hijos, alcances));
      } else if (n.tipo === 'para') {
        var items = evaluar(n.lista, alcances) || [];
        for (var k = 0; k < items.length; k++) {
          var alc = {}; alc[n.como] = items[k]; alc.$index = k;
          out.push(dibujar(n.hijos, alcances.concat([alc])));
        }
      } else {
        var props = {};
        for (var a = 0; a < n.attrs.length; a++) {
          var val = evaluar(n.attrs[a][1], alcances);
          if (val === undefined) continue;
          props[n.attrs[a][0]] = val;
        }
        out.push(h.apply(null, [n.tag, props].concat(dibujar(n.hijos, alcances))));
      }
    }
    return out;
  }

  // ---------- 3. La clase base del componente ----------
  var plantilla = document.getElementById('plantilla');
  var arbol = compilar(plantilla.content);

  function DCLogic(props) { preact.Component.call(this, props); this.state = {}; }
  DCLogic.prototype = Object.create(preact.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.render = function () {
    var r = dibujar(arbol, [this.renderVals()]);
    return r.length === 1 ? r[0] : h(preact.Fragment, null, r);
  };

  window.DCLogic = DCLogic;
  window.MotorJM = { montar: function (Comp, props) { preact.render(h(Comp, props || {}), document.getElementById('app')); } };
})();
