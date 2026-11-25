/* Lógica de la página (copiada tal cual del diseño) + carga de resultados. */
class Component extends DCLogic {
roll() {
return String(Math.floor(Math.random() * 100)).padStart(2, '0');
}
revelarPalpito() {
if (this.state && this.state.palFase === 'girando') { return; }
(this._palTimers || []).forEach((t) => clearTimeout(t));
this._palTimers = [];
const final = this.roll();
this.setState({ palFase: 'girando', palGiro: this.roll() });
let espera = 0;
for (let i = 1; i <= 14; i++) {
espera += 60 + i * 8;
this._palTimers.push(setTimeout(() => this.setState({ palGiro: this.roll() }), espera));
}
this._palTimers.push(setTimeout(() => this.setState({ palFase: 'listo', palpito: final }), espera + 250));
}
componentDidMount() {
this._reloj = setInterval(() => this.forceUpdate(), 30000);
}
componentWillUnmount() {
clearInterval(this._reloj);
(this._palTimers || []).forEach((t) => clearTimeout(t));
}
extractos() {
// Extractos oficiales de la Quiniela de la Provincia: fecha (AAAA-MM-DD) → sorteo → 20 números en orden.
// EXTRACTOS-INICIO
return {"2026-11-18": {"Previa": ["9189", "9296", "3233", "8456", "9418", "1177", "2421", "3266", "3486", "1596", "0425", "4620", "5544", "9294", "0721", "3036", "1966", "4689", "9314", "5921"]}, "2026-11-19": {"Previa": ["9112", "3598", "7577", "4714", "9794", "3806", "9269", "1771", "8762", "2136", "1023", "4100", "8257", "5158", "4855", "8561", "9633", "2038", "3757", "5231"]}};
// EXTRACTOS-FIN
}
renderVals() {
const palFase = (this.state && this.state.palFase) || 'oculto';
const palpito = (this.state && this.state.palpito) || '';
const historiaAbierta = !!(this.state && this.state.historia);
const suenosAbierta = !!(this.state && this.state.suenos);
const formasAbierta = !!(this.state && this.state.formas);
const primaryColor = this.props.primary ?? '#1F5135';
const juegoAbierto = (this.state && this.state.juego) || null;
const juegos = [
{ id: 'quiniela', nombre: 'Quiniela', alt: 'Logo de Quiniela Provincia', logo: 'img/quiniela.png', precio: 'Mínimo $100', desc: 'Elegís un número de una a cuatro cifras y en qué ubicación lo jugás. No tiene tope, y el premio lo cobrás acá, sea el monto que sea.' },
{ id: 'quinielaplus', nombre: 'Quiniela Plus', alt: 'Logo de Quiniela Plus', logo: 'img/quiniela-plus.png', precio: '$1.000', desc: 'Elegís 8 números del 00 al 99 y con la misma jugada participás en Plus, Súper Plus y Chance Plus. Sale con la Nocturna.' },
{ id: 'quini6', nombre: 'Quini 6', alt: 'Logo de Quini 6', logo: 'img/quini6.png', precio: '$4.000', desc: 'Elegís 6 números del 00 al 45 y participás en cuatro modalidades. Sortea miércoles y domingos.' },
{ id: 'telekino', nombre: 'Telekino', alt: 'Logo de Telekino', logo: 'img/telekino.png', precio: '$3.000', desc: 'Elegís 15 números del 1 al 25. Sortea los domingos.' },
{ id: 'loto', nombre: 'Loto Plus', alt: 'Logo de Loto Plus', logo: 'img/loto-plus.png', precio: '$4.000', desc: 'Elegís 6 números y además se sortea un Número Plus: si lo acertás, triplica el monto de tu premio. Sortea miércoles y sábados.' },
{ id: 'loto5', nombre: 'Loto 5', alt: 'Logo de Loto 5 Plus', logo: 'img/loto5.png', precio: '$1.000', desc: 'Elegís 5 números del 0 al 36 y salen con ruleta. Un sorteo por semana.' },
{ id: 'brinco', nombre: 'Brinco', alt: 'Logo de Brinco', logo: 'img/brinco.png', precio: '$1.500', desc: 'Elegís 6 números del 00 al 39. Sortea los domingos a las 21 hs.' }
].map((j) => {
const abierto = juegoAbierto === j.id;
return Object.assign({}, j, {
abierto: abierto,
tieneLogo: !!j.logo,
sinLogo: !j.logo,
borde: abierto ? primaryColor : '#FFFFFF',
accion: abierto ? 'Cerrar' : 'Ver cómo se juega',
toggle: () => this.setState({ juego: abierto ? null : j.id })
});
});
const suenos = ['Los huevos','El agua','El niño','San Cono','La cama','El gato','El perro','El revólver','El incendio','El arroyo','El cañón','El minero','El soldado','La yeta','El borracho','La niña bonita','El anillo','La desgracia','La sangre','El pescado','La fiesta','La mujer','El loco','El cocinero','El caballo','La gallina','La misa','El peine','Los cerros','San Pedro','Santa Rosa','La luz','El dinero','Cristo','La cabeza','El pajarito','La castaña','El dentista','Las piedras','La lluvia','El cura','El cuchillo','Las zapatillas','El balcón','La cárcel','El vino','Los tomates','El muerto','El muerto que habla','La carne','El pan','El serrucho','Madre e hijo','El barco','La vaca','La música','La caída','El jorobado','El ahogado','Las plantas','La Virgen','La escopeta','La inundación','El casamiento','El llanto','El cazador','Las lombrices','La mordida','Los sobrinos','Los vicios','El muerto sueño','Excremento','La sorpresa','El hospital','Personas negras','Los besos','Las llamas','Las piernas de mujer','La ramera','El ladrón','La bocha','Las flores','La pelea','El mal tiempo','La iglesia','La linterna','El humo','Los piojos','El Papa','La rata','El miedo','El excusado','El médico','El enamorado','El cementerio','Los anteojos','El marido','La mesa','La lavandera','Los hermanos'];
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const busqueda = (this.state && this.state.q) || '';
const q = norm(busqueda);
const suenosLista = suenos.map((t, i) => ({ num: String(i).padStart(2, '0'), texto: t })).filter((it) => !q || it.num.indexOf(q) !== -1 || norm(it.texto).indexOf(q) !== -1);
const st = this.state || {};
const fmt = (n) => '$' + Number(n).toLocaleString('es-AR');
const dos = (n) => String(n).padStart(2, '0');
const chip = (on) => ({ on: on, bg: on ? primaryColor : '#FFFFFF', fg: on ? '#FFFFFF' : '#17211B', borde: on ? primaryColor : '#9AA59E' });
const modo = st.modo || 'quiniela';
const modos = [{ id: 'quiniela', label: 'Quiniela' }, { id: 'otros', label: 'Quini 6, Loto y otros' }].map((m) => Object.assign({}, m, chip(modo === m.id), {
bg: modo === m.id ? primaryColor : '#FFFFFF', fg: modo === m.id ? '#FFFFFF' : primaryColor,
pick: () => this.setState({ modo: m.id })
}));
const ubicTxt = { '1': 'a la cabeza', '5': 'a los 5', '10': 'a los 10', '20': 'a los 20' };
const lineasSt = st.lineas || [{ id: 1, num: '', ubic: '1', imp: '' }];
const setLinea = (id, campo, valor) => this.setState({ lineas: lineasSt.map((l) => l.id === id ? Object.assign({}, l, { [campo]: valor }) : l) });
// Redoblona: manda la primera ubicación. La segunda va a los 5, 10 o 20 y nunca es menor que la primera.
const ubic2Min = (u) => String(Math.max(5, parseInt(u, 10) || 1));
const ubic2De = (l) => (parseInt(l.ubic2, 10) || 0) >= parseInt(ubic2Min(l.ubic), 10) ? l.ubic2 : ubic2Min(l.ubic);
const setCampos = (id, cambios) => this.setState({ lineas: lineasSt.map((x) => x.id === id ? Object.assign({}, x, cambios) : x) });
const lineas = lineasSt.map((l) => {
const imp = parseInt(l.imp, 10) || 0;
const redo = !!l.redo;
const num2 = l.num2 || '';
const ubic2 = ubic2De(l);
const errRedo = redo && ((l.num && l.num.length !== 2) || (num2 && num2.length !== 2)) ? 'En la redoblona van números de 2 cifras (del 00 al 99).' : '';
const error = errRedo || ((l.num && l.imp && imp < 100) ? 'El mínimo es $100.' : '');
const numOk = redo ? (/^\d{2}$/.test(l.num) && /^\d{2}$/.test(num2)) : /^\d{1,4}$/.test(l.num);
return Object.assign({}, l, {
redo: redo,
num2: num2,
valida: numOk && imp >= 100,
impNum: imp,
txt: redo ? (l.num + ' ' + ubicTxt[l.ubic] + ' + ' + num2 + ' ' + ubicTxt[ubic2] + ' (redoblona)') : (l.num + ' ' + ubicTxt[l.ubic]),
error: error,
tieneError: !!error,
puedeQuitar: lineasSt.length > 1,
toggleRedo: () => setCampos(l.id, { redo: !redo, ubic2: ubic2 }),
setNum2: (e) => setLinea(l.id, 'num2', e.target.value.replace(/\D/g, '').slice(0, 2)),
ubic2Chips: ['5', '10', '20'].map((u) => parseInt(u, 10) < parseInt(ubic2Min(l.ubic), 10) ? { label: 'A los ' + u, on: false, off: true, cursor: 'not-allowed', bg: '#ECEEE7', fg: '#4A5650', borde: '#DDE2DA', toggle: () => {} } : Object.assign({ label: 'A los ' + u, off: false, cursor: 'pointer' }, chip(u === ubic2), {
toggle: () => setLinea(l.id, 'ubic2', u)
})),
setNum: (e) => setLinea(l.id, 'num', e.target.value.replace(/\D/g, '').slice(0, 4)),
setUbic: (e) => { const u = e.target.value; setCampos(l.id, { ubic: u, ubic2: ubic2De({ ubic: u, ubic2: l.ubic2 }) }); },
setImp: (e) => setLinea(l.id, 'imp', e.target.value.replace(/\D/g, '').slice(0, 7)),
quitar: () => this.setState({ lineas: lineasSt.filter((x) => x.id !== l.id) })
});
});
const nuevaLinea = (num) => ({ id: Date.now() + Math.random(), num: num || '', ubic: '1', imp: '' });
const partes = {};
new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach((x) => { partes[x.type] = x.value; });
const hoyKey = partes.year + '-' + partes.month + '-' + partes.day;
const minAhora = (parseInt(partes.hour, 10) % 24) * 60 + parseInt(partes.minute, 10);
const diaSemana = (k) => new Date(k + 'T12:00:00Z').getUTCDay();
const hoySortea = diaSemana(hoyKey) !== 0;
const chipOff = (label) => ({ label: label, on: false, off: true, cursor: 'not-allowed', bg: '#ECEEE7', fg: '#4A5650', borde: '#DDE2DA', toggle: () => {} });
// Cierre de apuestas: 15 minutos antes de cada sorteo (minutos desde las 00:00).
const CIERRES = { 'La Previa': 600, 'Primera': 705, 'Matutina': 885, 'Vespertina': 1065, 'Nocturna': 1245 };
const sorteosNom = ['La Previa', 'Primera', 'Matutina', 'Vespertina', 'Nocturna'];
const sorteoAbierto = (n) => hoySortea && minAhora < CIERRES[n];
const sorteosAbiertos = sorteosNom.filter(sorteoAbierto);
const sorteosSel = (st.sorteos || []).filter(sorteoAbierto);
const sorteosChips = sorteosNom.map((n) => !sorteoAbierto(n) ? chipOff(n + ' · cerró') : Object.assign({ label: n, off: false, cursor: 'pointer' }, chip(sorteosSel.indexOf(n) !== -1), {
toggle: () => this.setState({ sorteos: sorteosSel.indexOf(n) !== -1 ? sorteosSel.filter((x) => x !== n) : sorteosNom.filter((x) => x === n || sorteosSel.indexOf(x) !== -1) })
}));
// Quinielas que no sortean en todos los turnos.
const SOLO_EN = { 'Montevideo': ['Matutina', 'Nocturna'] };
const juegaEn = (q, s) => !SOLO_EN[q] || SOLO_EN[q].indexOf(s) !== -1;
const baseSorteos = sorteosSel.length ? sorteosSel : sorteosAbiertos;
const quinielaDisponible = (q) => !baseSorteos.length || baseSorteos.some((s) => juegaEn(q, s));
const quinielasNom = ['Provincia', 'Ciudad', 'Córdoba', 'Santa Fe', 'Entre Ríos', 'Montevideo'];
const quinielasSel = (st.quinielas || ['Provincia']).filter(quinielaDisponible);
const quinielasChips = quinielasNom.map((n) => !quinielaDisponible(n) ? chipOff(n + ' · no sortea') : Object.assign({ label: n, off: false, cursor: 'pointer' }, chip(quinielasSel.indexOf(n) !== -1), {
toggle: () => this.setState({ quinielas: quinielasSel.indexOf(n) !== -1 ? quinielasSel.filter((x) => x !== n) : quinielasNom.filter((x) => x === n || quinielasSel.indexOf(x) !== -1) })
}));
const jugadas = sorteosSel.map((s) => ({ s: s, qs: quinielasSel.filter((q) => juegaEn(q, s)) }));
const sorteoVacio = jugadas.find((x) => !x.qs.length);
const jugadasOk = jugadas.filter((x) => x.qs.length);
const precioDe = (id) => { const j = juegos.find((x) => x.id === id); return j ? (parseInt(String(j.precio).replace(/\D/g, ''), 10) || 0) : 0; };
const otros = [
{ id: 'quini6', nombre: 'Quini 6', cant: 6, min: 0, max: 45 },
{ id: 'loto', nombre: 'Loto Plus', cant: 6, min: 0, max: 41 },
{ id: 'telekino', nombre: 'Telekino', cant: 15, min: 1, max: 25 },
{ id: 'brinco', nombre: 'Brinco', cant: 6, min: 0, max: 39 },
{ id: 'loto5', nombre: 'Loto 5', cant: 5, min: 0, max: 36 },
{ id: 'quinielaplus', nombre: 'Quiniela Plus', cant: 8, min: 0, max: 99 }
];
const otroId = st.otro || 'quini6';
const otro = otros.find((o) => o.id === otroId) || otros[0];
const otroPrecio = precioDe(otro.id);
const sel = (st.sel || []).filter((n) => n >= otro.min && n <= otro.max);
const otrosChips = otros.map((o) => Object.assign({ label: o.nombre }, chip(o.id === otro.id), {
pick: () => this.setState({ otro: o.id, sel: [] })
}));
const bolillas = [];
for (let n = otro.min; n <= otro.max; n++) {
const on = sel.indexOf(n) !== -1;
bolillas.push(Object.assign({ label: dos(n) }, chip(on), {
toggle: () => {
if (on) { this.setState({ sel: sel.filter((x) => x !== n) }); }
else if (sel.length < otro.cant) { this.setState({ sel: sel.concat([n]) }); }
}
}));
}
const alAzar = () => {
const lista = sel.slice();
while (lista.length < otro.cant) {
const n = otro.min + Math.floor(Math.random() * (otro.max - otro.min + 1));
if (lista.indexOf(n) === -1) { lista.push(n); }
}
this.setState({ sel: lista });
};
const selOrden = sel.slice().sort((a, b) => a - b);
const esQuiniela = modo === 'quiniela';
const validas = lineas.filter((l) => l.valida);
const nombre = st.nombre || '';
const mayor = !!st.mayor;
let resumen, detalle, total, falta, boletaJuego, msg;
if (esQuiniela) {
boletaJuego = 'Quiniela';
// Cada número se juega una vez por cada par sorteo + quiniela que realmente sortea.
const mult = jugadasOk.reduce((a, x) => a + x.qs.length, 0);
total = validas.reduce((a, l) => a + l.impNum, 0) * mult;
resumen = validas.map((l) => ({ izq: l.txt, der: fmt(l.impNum) }));
const porSorteo = jugadasOk.map((x) => x.s + ': ' + x.qs.join(', ')).join('\n');
detalle = jugadasOk.length ? (porSorteo + (mult > 1 && validas.length ? '\nCada jugada va en ' + mult + ' loterías (una por quiniela y sorteo).' : '')) : ((sorteosSel.length ? '' : 'Sin sorteo elegido\n') + (quinielasSel.length ? '' : 'Sin quiniela elegida'));
falta = !hoySortea ? 'Los domingos no hay sorteos de Quiniela.' : (!sorteosAbiertos.length ? 'Ya cerraron todos los sorteos de hoy. Mañana podés mandar tu jugada.' : (!validas.length ? 'Cargá al menos un número con su importe.' : (!quinielasSel.length ? 'Elegí al menos una quiniela.' : (!sorteosSel.length ? 'Elegí al menos un sorteo.' : (sorteoVacio ? ('En ' + sorteoVacio.s + ' no sortea ninguna de las quinielas que elegiste. Sacá ese sorteo o sumá otra quiniela.') : '')))));
msg = 'Hola! Quiero hacer esta jugada de Quiniela:\n' + validas.map((l) => '• ' + l.txt + ' — ' + fmt(l.impNum)).join('\n') + '\n' + porSorteo + (mult > 1 ? '\nCada jugada va en ' + mult + ' loterías (una por quiniela y sorteo).' : '');
} else {
boletaJuego = otro.nombre;
total = sel.length === otro.cant ? otroPrecio : 0;
resumen = sel.length ? [{ izq: otro.nombre, der: otroPrecio ? fmt(otroPrecio) : 'Consultá' }] : [];
detalle = sel.length ? 'Números: ' + selOrden.map(dos).join(' - ') : '';
falta = sel.length < otro.cant ? ('Te ' + (otro.cant - sel.length === 1 ? 'falta 1 número' : 'faltan ' + (otro.cant - sel.length) + ' números') + '.') : '';
msg = 'Hola! Quiero hacer esta jugada de ' + otro.nombre + ':\nNúmeros: ' + selOrden.map(dos).join(' - ');
}
if (!falta && !nombre.trim()) { falta = 'Poné tu nombre así identificamos tu jugada.'; }
const celular = st.celular || '';
const celDig = celular.replace(/\D/g, '').replace(/^0/, '');
if (!falta && !celDig) { falta = 'Poné tu celular así te mandamos la foto del ticket.'; }
if (!falta && celDig.length !== 10) { falta = 'Revisá el celular: código de área y número, sin 0 ni 15 (10 números).'; }
if (!falta && !mayor) { falta = 'Confirmá que sos mayor de 18 años.'; }
msg += '\nTotal: ' + fmt(total) + '\nNombre: ' + nombre.trim() + '\nCelular: ' + celDig + '\nEspero que me confirmen el total para transferir.';
const ext = this.extractos();
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fechaLarga = (k) => { const d = diaSemana(k); const p = k.split('-'); const t = DIAS[d] + ' ' + parseInt(p[2], 10) + ' de ' + MESES[parseInt(p[1], 10) - 1]; return t.charAt(0).toUpperCase() + t.slice(1); };
const fechaCorta = (k) => { const p = k.split('-'); return DIAS[diaSemana(k)] + ' ' + parseInt(p[2], 10) + '/' + parseInt(p[1], 10); };
const anteriorKey = Object.keys(ext).filter((k) => k < hoyKey).sort().pop() || null;
const SORTEOS = [{ nombre: 'Previa', largo: 'La Previa', hora: '10:15', min: 615 }, { nombre: 'Primera', largo: 'Primera', hora: '12:00', min: 720 }, { nombre: 'Matutina', largo: 'Matutina', hora: '15:00', min: 900 }, { nombre: 'Vespertina', largo: 'Vespertina', hora: '18:00', min: 1080 }, { nombre: 'Nocturna', largo: 'Nocturna', hora: '21:00', min: 1260 }];
const resTab = st.resTab || (hoySortea || !anteriorKey ? 'hoy' : 'anterior');
const verKey = resTab === 'anterior' && anteriorKey ? anteriorKey : hoyKey;
const esHoy = verKey === hoyKey;
const datosDia = ext[verKey] || {};
const estado = (so) => {
const d = datosDia[so.nombre];
if (d) { return 'listo'; }
if (!esHoy) { return 'sin'; }
if (minAhora < so.min) { return 'futuro'; }
if (minAhora < so.min + 45) { return 'vivo'; }
return 'camino';
};
const resDias = [{ id: 'hoy', label: 'Hoy · ' + fechaCorta(hoyKey) }].concat(anteriorKey ? [{ id: 'anterior', label: 'Anterior · ' + fechaCorta(anteriorKey) }] : []).map((d) => {
const on = (d.id === 'anterior' ? !esHoy : esHoy);
return { label: d.label, on: on, bg: on ? primaryColor : '#FFFFFF', fg: on ? '#FFFFFF' : primaryColor, pick: () => this.setState({ resTab: d.id }) };
});
const resCartas = SORTEOS.map((so) => {
const e = estado(so);
const d = datosDia[so.nombre];
const nums = e === 'listo' && Array.isArray(d) ? d : [];
const vivo = e === 'vivo';
return {
nombre: so.largo, hora: so.hora,
tieneNums: nums.length > 0,
cabeza: nums[0] || '',
resto: nums.slice(1).map((n, i) => ({ pos: i + 2, num: n })),
esVivo: vivo,
esGris: !nums.length && !vivo,
aviso: e === 'futuro' ? ('Sortea a las ' + so.hora + ' hs.') : (e === 'camino' ? 'Ya se sorteó. Los números aparecen apenas los publique la Lotería.' : 'Sin datos de este sorteo.'),
fondo: nums.length || vivo ? '#FFFFFF' : 'transparent',
trazo: nums.length || vivo ? 'solid' : 'dashed',
borde: vivo ? '#9B1C1C' : (nums.length ? '#1F5135' : '#9AA59E')
};
});
const resSinSorteo = esHoy && !hoySortea;
const ahoraNav = Date.now();
const diasNav = Math.ceil((new Date('2026-12-23T00:00:00-03:00').getTime() - ahoraNav) / 86400000);
return {
navidadVigente: ahoraNav < new Date('2026-12-23T21:00:00-03:00').getTime(),
navidadFaltan: diasNav > 1 ? ('Faltan ' + diasNav + ' días') : (diasNav === 1 ? 'Falta 1 día' : '¡Es hoy a las 21!'),
primary: this.props.primary ?? '#1F5135',
cartelA: (this.props.cartel ?? 'B') === 'A',
cartelB: (this.props.cartel ?? 'B') !== 'A',
palpito: palpito,
historiaAbierta: historiaAbierta,
historiaAccion: historiaAbierta ? 'Cerrar' : 'Leer',
chevronRot: historiaAbierta ? 'rotate(180deg)' : 'rotate(0deg)',
toggleHistoria: () => this.setState({ historia: !historiaAbierta }),
suenosAbierta: suenosAbierta,
suenosAccion: suenosAbierta ? 'Cerrar' : 'Abrir',
suenosRot: suenosAbierta ? 'rotate(180deg)' : 'rotate(0deg)',
toggleSuenos: () => this.setState({ suenos: !suenosAbierta }),
formasAbierta: formasAbierta,
formasAccion: formasAbierta ? 'Cerrar' : 'Ver',
formasRot: formasAbierta ? 'rotate(180deg)' : 'rotate(0deg)',
toggleFormas: () => this.setState({ formas: !formasAbierta }),
juegos: juegos,
resDias: resDias,
resFecha: fechaLarga(verKey),
resHayVivo: esHoy && hoySortea && SORTEOS.some((so) => estado(so) === 'vivo'),
resSinSorteo: resSinSorteo,
resConSorteo: !resSinSorteo,
resAnteriorLabel: anteriorKey ? 'Anterior · ' + fechaCorta(anteriorKey) : 'Anterior',
resCartas: resCartas,
modos: modos,
esQuiniela: esQuiniela,
esOtros: !esQuiniela,
lineas: lineas,
puedeAgregar: lineasSt.length < 8,
agregarLinea: () => this.setState({ lineas: lineasSt.concat([nuevaLinea()]) }),
sorteosChips: sorteosChips,
quinielasChips: quinielasChips,
otrosChips: otrosChips,
otroConsigna: 'Elegí ' + otro.cant + ' números del ' + dos(otro.min) + ' al ' + dos(otro.max),
otroContador: sel.length + ' de ' + otro.cant,
bolillas: bolillas,
alAzar: alAzar,
borrarBolillas: () => this.setState({ sel: [] }),
boletaJuego: boletaJuego,
resumen: resumen,
resumenVacio: resumen.length === 0,
detalle: detalle,
totalTexto: fmt(total),
nombre: nombre,
setNombre: (e) => this.setState({ nombre: e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 40) }),
copiarTexto: st.copiado === true ? '¡Alias copiado!' : (st.copiado === 'error' ? 'Mantené apretado el alias para copiarlo' : 'Copiar alias'),
copiarCbu: () => {
const ok = () => this.setState({ copiado: true });
const no = () => this.setState({ copiado: 'error' });
try { navigator.clipboard.writeText('Agencia.juan.molina').then(ok, no); } catch (e) { no(); }
},
celular: celular,
setCelular: (e) => this.setState({ celular: e.target.value.replace(/[^\d\s-]/g, '').slice(0, 16) }),
mayor: mayor,
toggleMayor: () => this.setState({ mayor: !mayor }),
listo: !falta,
noListo: !!falta,
falta: falta,
waUrl: 'https://wa.me/5492914357210?text=' + encodeURIComponent(msg),
jugarPalpito: () => {
const vacia = lineasSt.find((l) => !l.num);
const nuevas = vacia ? lineasSt.map((l) => l === vacia ? Object.assign({}, l, { num: palpito, ubic: '1' }) : l) : lineasSt.concat([nuevaLinea(palpito)]);
this.setState({ modo: 'quiniela', lineas: nuevas.slice(0, 8), sorteos: (sorteosSel.indexOf('Nocturna') !== -1 || !sorteoAbierto('Nocturna')) ? sorteosSel : sorteosSel.concat(['Nocturna']) });
},
busqueda: busqueda,
buscar: (e) => this.setState({ q: e.target.value }),
suenosLista: suenosLista,
sinResultados: suenosLista.length === 0,
resultadosTexto: q ? (suenosLista.length + (suenosLista.length === 1 ? ' resultado' : ' resultados')) : 'Los 100 números, del 00 al 99',
revelar: () => this.revelarPalpito(),
palOculto: palFase === 'oculto',
palGirando: palFase === 'girando',
palListo: palFase === 'listo',
palGiro: (this.state && this.state.palGiro) || '00',
palBoton: palFase === 'oculto' ? 'Descubrí tu pálpito' : (palFase === 'girando' ? 'Girando…' : 'Otro pálpito'),
palPie: palFase === 'oculto' ? 'TOCÁ Y DESCUBRILO' : (palFase === 'girando' ? 'SE VIENE…' : 'A LA CABEZA'),
palAria: palFase === 'listo' ? ('Tu pálpito es el ' + palpito + '. Tocá para pedir otro.') : 'Descubrí tu pálpito para la Nocturna',
palClaseBola: palFase === 'oculto' ? 'pal-latido' : '',
palClaseAro: palFase === 'girando' ? 'pal-giro' : '',
chispas: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a, i) => ({ rot: a + 'deg', delay: (i % 3) * 60 + 'ms', color: i % 2 ? '#F2C14E' : '#FFF4D6' }))
};
}
}

/* Resultados de la Quiniela: los actualiza solo el robot en data/extractos.json */
var EXTRACTOS_INICIALES = {"2026-11-18":{"Previa":["9189","9296","3233","8456","9418","1177","2421","3266","3486","1596","0425","4620","5544","9294","0721","3036","1966","4689","9314","5921"]},"2026-11-19":{"Previa":["9112","3598","7577","4714","9794","3806","9269","1771","8762","2136","1023","4100","8257","5158","4855","8561","9633","2038","3757","5231"],"Primera":["9317","4824","5665","8418","4998","2723","1415","2094","9800","0689","7591","9165","8699","7336","7589","0417","7643","8714","5756","7846"],"Matutina":["3673","0976","2550","7084","5882","7747","2392","2666","4354","7300","7360","0156","3353","1497","0959","9185","0769","9068","5412","0138"],"Vespertina":["1572","0007","7882","4428","8017","1896","2498","9646","9576","7119","1146","0659","5209","4430","3757","5530","8693","7696","3641","8640"],"Nocturna":["5587","4017","0833","9013","1741","1266","2455","6111","9622","3533","3281","3943","7797","7999","9388","2737","3972","0860","3187","9182"]},"2026-11-20":{"Previa":["9509","2665","8946","3759","7729","1303","5652","0622","3736","1032","7687","4125","4038","8205","4937","7804","6558","8100","7599","2880"],"Primera":["7689","0213","3020","7673","9932","8464","7794","9987","0746","4237","5675","8347","2172","4721","2702","3406","9828","2214","0399","5441"],"Matutina":["6919","3489","2241","4414","7242","8128","3962","5444","9378","0337","5136","7660","9228","6765","9949","3689","0123","0011","7304","4975"],"Vespertina":["4172","9317","1407","1542","7748","7411","4864","0327","6104","0089","7675","0860","4266","5995","9333","9739","4382","0690","2869","4147"],"Nocturna":["6282","7096","0380","9301","9331","3384","1404","4945","8089","2146","7320","0866","3765","8331","4418","8689","4515","9566","8280","2588"]},"2026-11-21":{"Previa":["5579","4254","5363","3239","0687","7858","9308","6647","1300","3127","4645","7199","4887","7785","4370","2925","4908","9811","4480","9527"],"Primera":["8435","6700","1750","8556","6128","5790","8874","6087","2665","6133","0641","2634","9991","6685","1903","2426","9605","3717","8559","1576"],"Matutina":["2023","4160","4173","9503","0789","9388","9609","5947","8981","2030","6293","7524","3080","6144","6879","2318","3509","2931","9754","1215"],"Vespertina":["5643","1397","5053","5080","0076","7948","6563","3536","3568","2282","7690","2271","7537","0084","7436","1617","2203","5117","2870","1384"],"Nocturna":["6734","7650","2631","5558","7525","8991","3633","3877","5217","9913","7691","2253","7608","4802","0498","9184","8252","5941","2206","9637"]},"2026-11-23":{"Previa":["3998","7737","5387","7404","6181","1801","2385","9632","7206","6868","8494","6637","8430","2377","3507","0993","7712","5190","0124","7221"],"Primera":["9507","6490","9462","9244","5337","5380","7954","7090","5208","2700","6577","8991","2423","8268","2993","7453","4859","8861","8261","1760"],"Matutina":["7736","6884","9475","0614","9980","1919","9593","7568","1381","5511","2861","5787","6262","0357","7270","9554","4688","4700","1777","9801"],"Vespertina":["3356","9490","0430","2635","3158","2064","3867","5094","9742","7933","3306","6664","2498","2645","8529","1374","0071","3919","2382","7913"],"Nocturna":["7877","9988","6213","8060","6256","9499","8419","0883","5958","0071","5222","1541","0411","6860","1465","6958","0899","7301","7114","5837"]},"2026-11-24":{"Previa":["0388","7582","0600","3991","2809","5634","9545","2333","2983","6480","9417","1111","1674","1998","8807","3759","9628","8644","9099","3010"],"Primera":["0924","8213","5281","7228","7210","3976","8858","7440","5431","9560","7508","2203","9133","9345","2496","7568","6081","6750","4741","5635"],"Matutina":["8413","6956","2563","8843","2740","6810","9267","1655","9690","0254","9550","8658","4273","2547","8089","0767","4821","5641","2468","2171"],"Vespertina":["3930","8881","5468","8730","2669","8449","2210","8251","4178","8622","3636","7433","6155","3108","7891","6675","9416","4479","1121","3595"],"Nocturna":["1154","9340","2957","9871","1690","7247","6667","8020","7957","7397","1513","5060","1817","9007","3917","9612","2281","5550","7930","8603"]}};
Component.prototype.extractos = function () {
  return (this.state && this.state._ext) || EXTRACTOS_INICIALES;
};
(function () {
  var montaje = Component.prototype.componentDidMount;
  var desmontaje = Component.prototype.componentWillUnmount;
  Component.prototype.componentDidMount = function () {
    if (montaje) montaje.call(this);
    var yo = this;
    function cargar() {
      fetch('data/extractos.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) yo.setState({ _ext: d }); })
        .catch(function () {});
    }
    cargar();
    this._cargaExt = setInterval(cargar, 120000);
    this._alVolver = function () { if (!document.hidden) cargar(); };
    document.addEventListener('visibilitychange', this._alVolver);
  };
  Component.prototype.componentWillUnmount = function () {
    if (desmontaje) desmontaje.call(this);
    clearInterval(this._cargaExt);
    document.removeEventListener('visibilitychange', this._alVolver);
  };
})();

MotorJM.montar(Component);
