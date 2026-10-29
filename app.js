// TUPA UNSAAC: gestión de trámites del TUPA
const $ = (id) => document.getElementById(id);
const EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'];
const MAX_MB = 50;
let rol = null, vistaActual = null, paso = 1, chipOf = '', chipEst = '';
let tramites = TRAMITES.map(t => ({ ...t, docs: t.docs.map(d => ({ ...d })), obs: { ...(t.obs || {}) }, historial: t.historial.map(h => [...h]) }));
let usuario = '';
const NOT = { '215719': NOTIFICACIONES.map(n => ({ ...n })) };
const notifsDe = (c) => (NOT[c] = NOT[c] || []);
const misNotifs = () => notifsDe(usuario);
const misTramites = () => tramites.filter(t => t.dueno === usuario);

/* Íconos (SVG de trazo) */
const P = { casa: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', buscar: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16l-4-4',
  nuevo: 'M6 3h8l4 4v14H6zM14 3v4h4M12 11v6M9 14h6', ruta: 'M5 6a2 2 0 1 0 0 .01M19 18a2 2 0 1 0 0 .01M7 6h7a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h7',
  campana: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0', bandeja: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
  grafico: 'M4 20V10M10 20V4M16 20v-7M22 20H2', check: 'M5 12l5 5L20 7' };
const ico = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
$('ico-campana').innerHTML = ico('campana', 22); $('ico-buscar').innerHTML = ico('buscar'); $('ico-buscar2').innerHTML = ico('buscar'); $('ico-ruta').innerHTML = ico('ruta');

const MENUS = {
  alumno: [['inicio', 'Inicio', 'casa'], ['consulta', 'Consultar TUPA', 'buscar'], ['registro', 'Nuevo trámite', 'nuevo'], ['seguimiento', 'Seguimiento', 'ruta'], ['notificaciones', 'Notificaciones', 'campana']],
  oficina: [['panel', 'Bandeja de trámites', 'bandeja'], ['reportes', 'Reportes', 'grafico'], ['consulta', 'Consultar TUPA', 'buscar']]
};
const TITULOS = { inicio: 'Inicio', consulta: 'Consultar TUPA', registro: 'Nuevo trámite', seguimiento: 'Seguimiento', notificaciones: 'Notificaciones', panel: 'Bandeja de trámites', reportes: 'Reportes' };
const proc = (id) => PROCEDIMIENTOS.find(p => p.id === Number(id));
const noLeidas = () => (rol === 'alumno' ? misNotifs().filter(n => !n.leida).length : 0);
const etq = (e) => `<span class="etq ${e === 'En revisión' ? 'Revisión' : e}">${e}</span>`;
const hoy = () => { const d = new Date(); const z = (n) => String(n).padStart(2, '0'); return `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`; };
function aviso(t) { const a = $('aviso'); a.textContent = t; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, 3500); }

/* Navegación */
function pintarMenu() {
  $('menu').innerHTML = MENUS[rol].map(([id, t, i]) => {
    const c = id === 'notificaciones' && noLeidas() ? `<span class="contador">${noLeidas()}</span>` : '';
    return `<button data-vista="${id}" class="${id === vistaActual ? 'activo' : ''}" ${id === vistaActual ? 'aria-current="page"' : ''}>${ico(i)}<span>${t}</span>${c}</button>`;
  }).join('');
  const n = noLeidas(); $('campana-n').hidden = !n || rol !== 'alumno'; $('campana-n').textContent = n;
  $('btn-campana').hidden = rol !== 'alumno';
}
function mostrar(v) {
  vistaActual = v; cerrarDrawer(); $('lateral').classList.remove('abierto');
  document.querySelectorAll('.vista').forEach(s => { s.hidden = s.id !== 'vista-' + v; });
  $('migas').textContent = 'TUPA UNSAAC  ›  ' + TITULOS[v];
  pintarMenu();
  ({ inicio: pintarInicio, consulta: pintarConsulta, registro: iniciarRegistro, seguimiento: pintarMis, notificaciones: pintarNotifs, panel: pintarPanel, reportes: pintarReportes })[v]();
  window.scrollTo(0, 0);
}
$('menu').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) mostrar(b.dataset.vista); });
$('btn-campana').addEventListener('click', () => mostrar('notificaciones'));
$('btn-menu').addEventListener('click', () => $('lateral').classList.toggle('abierto'));
$('form-login').addEventListener('submit', (e) => {
  e.preventDefault(); rol = $('login-rol').value;
  usuario = $('login-usuario').value.trim();
  $('login').hidden = true; $('app').hidden = false;
  const nombre = rol === 'alumno' ? (ALUMNOS[usuario] || 'Usuario ' + usuario) : 'Oficina ' + usuario;
  $('u-nombre').textContent = nombre.split(' ').slice(0, 2).join(' '); $('u-rol').textContent = rol === 'alumno' ? 'Solicitante' : 'Personal de oficina';
  $('avatar').textContent = nombre.charAt(0).toUpperCase();
  mostrar(rol === 'alumno' ? 'inicio' : 'panel');
});
$('btn-salir').addEventListener('click', () => { $('app').hidden = true; $('login').hidden = false; $('form-login').reset(); });

/* Inicio */
function pintarInicio() {
  $('saludo').textContent = ALUMNOS[usuario] ? 'Hola, ' + ALUMNOS[usuario].split(' ')[0] : 'Bienvenido a TUPA UNSAAC';
  $('accesos').innerHTML = [['consulta', 'buscar', 'Consultar el TUPA', 'Requisitos, costos y plazos'], ['registro', 'nuevo', 'Iniciar un trámite', 'Regístralo en 4 pasos'], ['seguimiento', 'ruta', 'Ver mi trámite', 'Estado y recorrido']]
    .map(([v, i, t, s]) => `<button class="acceso" data-ir="${v}"><div class="ico">${ico(i, 24)}</div><b>${t}</b><span>${s}</span></button>`).join('');
  const mios = misTramites().slice(-4).reverse();
  $('inicio-lista').innerHTML = mios.length ? mios.map(t => `<div class="fila-lista"><div class="t"><b>${t.codigo}</b><small>${proc(t.proc).nombre}</small></div>${etq(t.estado)}</div>`).join('')
    : '<p class="vacio">Aún no tienes trámites. Inicia uno desde "Iniciar un trámite".</p>';
}
$('accesos').addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (b) mostrar(b.dataset.ir); });

/* Consulta */
function pintarConsulta() {
  const ofs = [...new Set(PROCEDIMIENTOS.map(p => p.oficina))];
  $('chips-oficina').innerHTML = ['', ...ofs].map(o => `<button class="chip ${o === chipOf ? 'activo' : ''}" data-of="${o}">${o || 'Todas'}</button>`).join('');
  const q = $('buscar').value.trim().toLowerCase();
  const lista = PROCEDIMIENTOS.filter(p => p.nombre.toLowerCase().includes(q) && (!chipOf || p.oficina === chipOf));
  $('resumen-consulta').textContent = lista.length ? `Se encontraron ${lista.length} procedimientos` : 'No se encontraron procedimientos. Prueba con otra palabra.';
  $('lista-procedimientos').innerHTML = lista.map(p => `
    <article class="tarjeta proc"><h3>${p.nombre}</h3><div class="oficina">${p.oficina}</div>
      <div class="datos-mini"><div>Costo<b>${p.costo}</b></div><div>Plazo<b>${p.plazo}</b></div></div>
      <ul class="requisitos" hidden>${p.requisitos.map(r => `<li>${r}</li>`).join('')}</ul>
      <div class="acciones"><button class="btn-sec peq" data-accion="req">Ver requisitos</button>
      ${rol === 'alumno' ? `<button class="btn peq" data-accion="iniciar" data-id="${p.id}">Iniciar trámite</button>` : ''}</div></article>`).join('');
}
$('buscar').addEventListener('input', pintarConsulta);
$('chips-oficina').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) { chipOf = b.dataset.of; pintarConsulta(); } });
$('lista-procedimientos').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.accion === 'req') { const ul = b.closest('.tarjeta').querySelector('.requisitos'); ul.hidden = !ul.hidden; b.textContent = ul.hidden ? 'Ver requisitos' : 'Ocultar requisitos'; }
  else {
    const p = proc(b.dataset.id); mostrar('registro'); $('t-cat').value = p.categoria; pintarTramites();
    const r = document.querySelector(`input[name=tramite][value="${p.id}"]`); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

/* Registro en 4 pasos (según el manual de usuario de la Mesa de Partes Virtual) */
const NOMBRES_PASO = ['Interesado', 'Petición', 'Archivos', 'Confirmar'];
const esExonerado = (p) => p.costo === 'S/ 0.00';
const mb = (b) => (b / 1048576).toFixed(1);
function iniciarRegistro() {
  $('t-facultad').innerHTML = FACULTADES.map(f => `<option>${f}</option>`).join('');
  pintarCarreras();
  $('t-cat').innerHTML = CATEGORIAS.map(c => `<option>${c}</option>`).join('');
  $('form-tramite').reset(); $('t-nombre').readOnly = true; $('t-lupa-msg').textContent = '';
  $('form-tramite').hidden = false; $('t-exito').hidden = true; $('pasos').hidden = false; $('aviso-pago').hidden = false;
  const d = new Date(); $('t-fecha').textContent = d.toLocaleDateString('es-PE'); $('t-nsol').textContent = String(54137 + tramites.length);
  pintarTramites(); irPaso(1);
}
function pintarCarreras() { $('t-carrera').innerHTML = (CARRERAS[$('t-facultad').value] || ['Otra']).map(c => `<option>${c}</option>`).join(''); }
$('t-facultad').addEventListener('change', pintarCarreras);
$('btn-lupa').addEventListener('click', () => {
  const c = $('t-doc').value.trim(); const m = $('t-lupa-msg');
  if (!/^\d{6,11}$/.test(c)) { m.textContent = 'Escribe un código, DNI o RUC válido (6 a 11 dígitos) y vuelve a pulsar Buscar.'; return; }
  if (ALUMNOS[c]) { $('t-nombre').value = ALUMNOS[c]; $('t-nombre').readOnly = true; m.textContent = 'Datos encontrados. Verifica que tu nombre sea correcto.'; }
  else { $('t-nombre').value = ''; m.textContent = 'No encontramos ese código. Si eres extranjero o no apareces, marca "ingresaré mis datos manualmente".'; }
});
$('t-manual').addEventListener('change', () => { $('t-nombre').readOnly = !$('t-manual').checked; if ($('t-manual').checked) $('t-nombre').focus(); });
function pintarTramites() {
  const cat = $('t-cat').value;
  $('t-lista').innerHTML = PROCEDIMIENTOS.filter(p => p.categoria === cat).map(p => `<label class="opcion"><input type="radio" name="tramite" value="${p.id}"> ${p.nombre}
    <small>${esExonerado(p) ? '<span class="exo">Exonerado de pago</span>' : p.costo}</small></label>`).join('');
  $('t-solicito').value = ''; $('t-info').innerHTML = ''; pintarRequisitos();
}
$('t-cat').addEventListener('change', pintarTramites);
const elegido = () => { const r = document.querySelector('input[name=tramite]:checked'); return r ? proc(r.value) : null; };
$('t-lista').addEventListener('change', () => {
  const p = elegido(); document.querySelectorAll('.opcion').forEach(o => o.classList.toggle('sel', o.querySelector('input').checked));
  $('t-solicito').value = p.nombre; $('t-info').innerHTML = `Oficina: <b>${p.oficina}</b> · Costo: <b>${p.costo}</b> · Plazo: <b>${p.plazo}</b>`; pintarRequisitos();
});
function pintarRequisitos() {
  const p = elegido();
  if (!p) { $('t-requisitos').innerHTML = '<p class="ayuda">Primero elige un trámite en el paso 2.</p>'; $('t-clave-caja').hidden = false; medir(); return; }
  $('t-clave-caja').hidden = esExonerado(p);
  $('t-requisitos').innerHTML = p.requisitos.map((r, i) => `<div class="req-fila"><span class="nombre">${r}</span><span class="archivo">Sin archivo</span>
    <input type="file" id="arch-${i}" data-req="${r}"><label class="subir" for="arch-${i}">Elegir archivo</label></div>`).join('');
  medir();
}
function medir() {
  const inps = [...$('t-requisitos').querySelectorAll('input[type=file]')]; const sub = inps.filter(i => i.files[0] && i.classList.contains('ok'));
  const total = sub.reduce((a, i) => a + i.files[0].size, 0);
  $('t-total').textContent = `${sub.length} de ${inps.length} archivos · ${mb(total)} MB de ${MAX_MB} MB`;
  $('t-medidor').style.width = Math.min(100, (total / (MAX_MB * 1048576)) * 100) + '%';
}
$('t-requisitos').addEventListener('change', (e) => {
  const inp = e.target; const fila = inp.closest('.req-fila'); const f = inp.files[0];
  const valido = !!f && EXT.includes(f.name.split('.').pop().toLowerCase());
  inp.classList.toggle('ok', valido);
  fila.querySelector('.archivo').innerHTML = f ? `${valido ? '<span class="vcheck">✓</span> ' : ''}${f.name} (${mb(f.size)} MB)` : 'Sin archivo';
  fila.classList.toggle('listo', valido); fila.classList.toggle('malo', !!f && !valido);
  const q = fila.querySelector('.quitar'); if (q) q.remove();
  if (f) fila.insertAdjacentHTML('beforeend', '<button type="button" class="quitar" aria-label="Quitar archivo" title="Quitar archivo">×</button>');
  medir();
});
$('t-requisitos').addEventListener('click', (e) => {
  const q = e.target.closest('.quitar'); if (!q) return;
  const fila = q.closest('.req-fila'); const inp = fila.querySelector('input[type=file]'); inp.value = ''; inp.classList.remove('ok');
  fila.classList.remove('listo', 'malo'); fila.querySelector('.archivo').textContent = 'Sin archivo'; q.remove(); medir();
});
$('t-aclara').addEventListener('input', () => { const n = $('t-aclara').value.length; $('t-cont').textContent = n + ' / 180'; $('t-cont').classList.toggle('alto', n >= 160); });
function irPaso(n) {
  paso = n; $('t-error').textContent = '';
  document.querySelectorAll('.paso-panel').forEach(p => { p.hidden = Number(p.dataset.paso) !== n; });
  $('pasos').innerHTML = NOMBRES_PASO.map((t, i) => `<li class="${i + 1 < n ? 'hecho' : i + 1 === n ? 'actual' : ''}" ${i + 1 === n ? 'aria-current="step"' : ''}><span class="num">${i + 1 < n ? '✓' : i + 1}</span>${t}</li>`).join('');
  $('btn-ant').hidden = n === 1; $('btn-sig').hidden = n === 4; $('btn-reg').hidden = n !== 4; $('btn-limpiar').hidden = n !== 4;
  if (n === 3) pintarRequisitos_conservar();
  if (n === 4) pintarResumen();
}
function pintarRequisitos_conservar() { /* los archivos ya elegidos se conservan al volver; solo se actualiza el medidor */ medir(); }
const err = (t) => { $('t-error').textContent = t; $('t-error').className = 'error'; return false; };
function validar(n) {
  if (n === 1) {
    if (!/^\d{6,11}$/.test($('t-doc').value.trim())) return err('Escribe tu código, DNI o RUC (6 a 11 dígitos).');
    if ($('t-nombre').value.trim().length < 5) return err('Pulsa Buscar para completar tu nombre, o marca el ingreso manual y escríbelo.');
    if (!/^\d{9}$/.test($('t-tel').value.trim())) return err('El teléfono móvil debe tener 9 dígitos.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('t-correo').value.trim())) return err('Escribe un correo electrónico válido para recibir los avisos.');
    if (!$('t-auto').checked) return err('Debes autorizar las notificaciones por correo para continuar.');
  }
  if (n === 2 && !elegido()) return err('Elige el trámite que vas a realizar.');
  if (n === 3) {
    let total = 0;
    for (const inp of $('t-requisitos').querySelectorAll('input[type=file]')) {
      const f = inp.files[0];
      if (!f) return err(`Falta adjuntar: ${inp.dataset.req}. Sin documentos el trámite no será atendido.`);
      const ext = f.name.split('.').pop().toLowerCase();
      if (!EXT.includes(ext)) return err(`"${f.name}" no es un formato permitido (${EXT.join(', ')}).`);
      total += f.size;
    }
    if (total > MAX_MB * 1048576) return err(`Los archivos superan el máximo de ${MAX_MB} MB.`);
    if ($('t-aclara').value.trim().length < 10) return err('Aclara tu petición e indica el destino del documento (mínimo 10 caracteres).');
    if (!$('t-clave-caja').hidden && !/^\d{4,10}$/.test($('t-clave').value.trim())) return err('Ingresa la clave de pago que figura en tu voucher (solo números).');
    if (!$('t-robot').checked) return err('Marca la casilla "No soy un robot" para continuar.');
  }
  $('t-error').textContent = ''; return true;
}
$('btn-sig').addEventListener('click', () => { if (validar(paso)) irPaso(paso + 1); });
$('btn-ant').addEventListener('click', () => irPaso(paso - 1));
$('btn-limpiar').addEventListener('click', () => { iniciarRegistro(); aviso('Formulario limpio'); });
['input', 'change'].forEach(ev => $('form-tramite').addEventListener(ev, () => { $('t-error').textContent = ''; }));
function pintarResumen() {
  const p = elegido();
  const arch = [...$('t-requisitos').querySelectorAll('input[type=file]')].map(i => i.files[0] ? i.files[0].name : '').join(', ');
  const filas = [['Tipo de usuario', $('t-tipo').value], ['Código, DNI o RUC', $('t-doc').value], ['Nombres', $('t-nombre').value], ['Facultad', $('t-facultad').value], ['Carrera', $('t-carrera').value],
    ['Teléfono', $('t-tel').value], ['Correo', $('t-correo').value], ['Categoría', $('t-cat').value], ['Trámite', p.nombre], ['Costo y plazo', `${esExonerado(p) ? 'Exonerado de pago' : p.costo} · ${p.plazo}`],
    ['Documento', $('t-tdoc').value + ($('t-ndoc').value ? ' ' + $('t-ndoc').value : '')], ['Aclaración', $('t-aclara').value], ['Archivos', arch]];
  if (!esExonerado(p)) filas.push(['Clave de pago', $('t-clave').value]);
  $('t-resumen').innerHTML = filas.map(() => '<dt></dt><dd></dd>').join('');
  $('t-resumen').querySelectorAll('dt').forEach((dt, i) => { dt.textContent = filas[i][0]; });
  $('t-resumen').querySelectorAll('dd').forEach((dd, i) => { dd.textContent = filas[i][1]; });
}
$('form-tramite').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!(validar(1) && validar(2) && validar(3))) return;
  const codigo = 'EXP-2026-' + String(tramites.length + 1).padStart(4, '0'); const p = elegido();
  const arch = {}; $('t-requisitos').querySelectorAll('input[type=file]').forEach(i => { arch[i.dataset.req] = i.files[0]; });
  tramites.push({ codigo, proc: p.id, nombre: $('t-nombre').value.trim(), doc: $('t-doc').value.trim(), dueno: usuario, correo: $('t-correo').value.trim(), tel: $('t-tel').value.trim(),
    facultad: $('t-facultad').value, clave: $('t-clave').value.trim(), asunto: $('t-aclara').value.trim(), estado: 'Registrado', fecha: new Date().toISOString().slice(0, 10),
    docs: p.requisitos.map(r => ({ n: r, est: 'Pendiente', archivo: arch[r].name, size: arch[r].size, tipo: arch[r].type, url: URL.createObjectURL(arch[r]) })),
    obs: {}, historial: [[hoy(), 'Trámite registrado']] });
  notifsDe(usuario).unshift({ texto: `Tu expediente ${codigo} fue registrado correctamente.`, hora: 'Ahora', leida: false });
  $('form-tramite').hidden = true; $('pasos').hidden = true; $('aviso-pago').hidden = true; $('t-exito').hidden = false;
  $('t-exito').innerHTML = `<div class="check-grande">${ico('check', 30)}</div><h2>Trámite registrado</h2><p>Anota tu número de expediente:</p><div class="cod">${codigo}</div>
    <p class="ayuda">Enviamos una notificación a ${$('t-correo').value.trim()} y te avisaremos en cada cambio de estado.</p><button class="btn" data-ver="${codigo}">Ver seguimiento</button> <button class="btn-sec" data-ir="inicio">Ir al inicio</button>`;
  pintarMenu(); aviso(`Trámite registrado: ${codigo}`);
});
$('t-exito').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.ver) { mostrar('seguimiento'); $('s-codigo').value = b.dataset.ver; $('form-seguimiento').requestSubmit(); } else mostrar(b.dataset.ir);
});

/* Seguimiento */
function detalleTramite(t) {
  const p = proc(t.proc); const mio = rol === 'alumno' && t.dueno === usuario;
  return `<div class="tarjeta"><div class="detalle-cab"><div><h2>${t.codigo} · ${p.nombre}</h2><div class="peq-txt">Solicitante: ${t.nombre} · ${p.oficina}<br>Asunto: ${t.asunto}</div></div>${etq(t.estado)}</div>
    <h3 style="margin-top:1rem">Recorrido del trámite</h3><ul class="tl">${t.historial.map(([f, x]) => `<li class="${x.startsWith('Observado') ? 'obs' : ''}">${x}<small>${f}</small></li>`).join('')}</ul>
    <h3>Documentos</h3><div class="tabla-caja"><table class="tabla"><thead><tr><th>Documento</th><th>Estado</th><th></th></tr></thead><tbody>${
      t.docs.map((d, i) => `<tr><td>${d.n}<div class="peq-txt">${d.archivo}</div>${t.obs[d.n] ? `<div class="obs-nota">Observación: ${t.obs[d.n]}</div>` : ''}</td><td>${etq(d.est)}</td>
      <td>${mio && d.est === 'Observado' ? `<input type="file" class="subsanar-inp" id="sub-${i}" data-cod="${t.codigo}" data-i="${i}" hidden><label class="btn peq subsanar" for="sub-${i}" style="margin:0">Subir de nuevo</label>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
}
$('s-detalle').addEventListener('change', (e) => {
  const inp = e.target.closest('.subsanar-inp'); if (!inp || !inp.files[0]) return;
  const t = tramites.find(x => x.codigo === inp.dataset.cod); const d = t.docs[inp.dataset.i]; const f = inp.files[0];
  if (!EXT.includes(f.name.split('.').pop().toLowerCase())) { $('s-estado').textContent = `"${f.name}" no es un formato permitido (${EXT.join(', ')}).`; return; }
  d.archivo = f.name; d.size = f.size; d.tipo = f.type; d.url = URL.createObjectURL(f); d.est = 'Pendiente'; delete t.obs[d.n];
  t.historial.push([hoy(), `Documento corregido: ${d.n}`]);
  if (!t.docs.some(x => x.est === 'Observado')) { t.estado = 'En revisión'; t.historial.push([hoy(), 'En revisión en ' + proc(t.proc).oficina]); }
  $('s-estado').textContent = ''; $('s-detalle').innerHTML = detalleTramite(t); pintarMis(); aviso('Documento enviado de nuevo');
});
$('form-seguimiento').addEventListener('submit', (e) => {
  e.preventDefault(); const c = $('s-codigo').value.trim().toUpperCase();
  if (!c) { $('s-estado').textContent = 'Escribe el código del expediente.'; $('s-detalle').innerHTML = ''; return; }
  const t = tramites.find(x => x.codigo === c);
  $('s-estado').textContent = t ? '' : `No se encontró el expediente ${c}. Revisa que tenga el formato EXP-2026-0001.`;
  $('s-detalle').innerHTML = t ? detalleTramite(t) : '';
});
function pintarMis() {
  const mios = misTramites();
  if (!mios.length) { $('s-mis').innerHTML = '<div class="tarjeta vacio">Aún no tienes trámites registrados.</div>'; return; }
  $('s-mis').innerHTML = `<div class="tabla-caja"><table class="tabla"><thead><tr><th>Expediente</th><th>Procedimiento</th><th>Solicitante</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${
    mios.map(t => `<tr><td><b>${t.codigo}</b></td><td>${proc(t.proc).nombre}</td><td>${t.nombre}</td><td>${t.fecha}</td><td>${etq(t.estado)}</td><td><button class="btn-sec peq" data-cod="${t.codigo}">Ver</button></td></tr>`).join('')}</tbody></table></div>`;
}
$('s-mis').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $('s-codigo').value = b.dataset.cod; $('form-seguimiento').requestSubmit(); $('s-detalle').scrollIntoView({ behavior: 'smooth' }); });

/* Notificaciones */
function pintarNotifs() {
  const notifs = misNotifs();
  $('lista-notif').innerHTML = notifs.length ? notifs.map(n => `<li class="${n.leida ? '' : 'nueva'}"><span class="pt"></span><div><b>${n.texto}</b><small>${n.hora}</small></div></li>`).join('') : '<li>No tienes notificaciones.</li>';
}
$('btn-leer').addEventListener('click', () => { misNotifs().forEach(n => { n.leida = true; }); pintarNotifs(); pintarMenu(); });

/* Bandeja de oficina */
function pintarPanel() {
  const c = (e) => tramites.filter(t => t.estado === e).length;
  $('p-stats').innerHTML = [['', 'Total de trámites', tramites.length], ['info', 'En revisión', c('En revisión')], ['obs', 'Observados', c('Observado')], ['ok', 'Finalizados', c('Finalizado')]]
    .map(([k, t, n]) => `<div class="stat ${k}"><b>${n}</b><span>${t}</span></div>`).join('');
  $('p-chips').innerHTML = ['', 'Registrado', 'En revisión', 'Observado', 'Aprobado', 'Finalizado'].map(e => `<button class="chip ${e === chipEst ? 'activo' : ''}" data-est="${e}">${e || 'Todos'}</button>`).join('');
  const q = $('p-buscar').value.trim().toLowerCase();
  const lista = tramites.filter(t => (!chipEst || t.estado === chipEst) && (!q || t.codigo.toLowerCase().includes(q) || t.nombre.toLowerCase().includes(q)));
  $('p-filas').innerHTML = lista.length ? lista.map(t => `<tr><td><b>${t.codigo}</b></td><td>${proc(t.proc).nombre}</td><td>${t.nombre}</td><td>${t.fecha}</td><td>${etq(t.estado)}</td>
    <td><button class="btn-sec peq" data-cod="${t.codigo}">Revisar</button></td></tr>`).join('') : '<tr><td colspan="6">No hay trámites con esos filtros.</td></tr>';
}
$('p-chips').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) { chipEst = b.dataset.est; pintarPanel(); } });
$('p-buscar').addEventListener('input', pintarPanel);
$('p-filas').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) abrirDrawer(b.dataset.cod); });
let obsAbierta = null;
function abrirDrawer(cod, msg = '') {
  const t = tramites.find(x => x.codigo === cod); const p = proc(t.proc);
  const todos = t.docs.every(d => d.est === 'Validado');
  $('drawer').innerHTML = `<button class="cerrar" id="d-cerrar" aria-label="Cerrar">×</button><h2>${t.codigo}</h2>
    <p class="peq-txt"><b>${p.nombre}</b> · ${p.oficina}</p>
    <div class="persona"><b>${t.nombre}</b> (${t.doc})<br>${t.facultad || ''}<br>${t.correo || ''} · ${t.tel || ''}<br>${t.clave ? 'Clave de pago: <b>' + t.clave + '</b> · ' : ''}Costo: <b>${p.costo}</b><br>Asunto: ${t.asunto}</div><p>${etq(t.estado)}</p>
    <h3>Revisión de documentos</h3>${t.docs.map((d, i) => `<div class="doc-fila"><span class="n">${d.n}<small>${d.archivo}</small></span>${etq(d.est)}
      <button class="btn-sec peq" data-cod="${t.codigo}" data-i="${i}" data-ver="1">Ver</button>
      <button class="btn btn-ok peq" data-cod="${t.codigo}" data-i="${i}" data-res="Validado">Validar</button>
      <button class="btn-obs btn-sec peq" data-cod="${t.codigo}" data-i="${i}" data-pedir="1">Observar</button>
      ${t.obs[d.n] ? `<div class="obs-nota">Observación: ${t.obs[d.n]}</div>` : ''}
      ${obsAbierta && obsAbierta.cod === t.codigo && obsAbierta.i === i ? `<div class="obs-form"><label for="obs-motivo">Motivo de la observación</label>
        <textarea id="obs-motivo" rows="2" placeholder="Ej. La copia no es legible. Súbela nuevamente en PDF."></textarea>
        <button class="btn peq" data-cod="${t.codigo}" data-i="${i}" data-conf="1" style="margin:0">Confirmar observación</button> <button class="btn-sec peq" data-cancel="1">Cancelar</button></div>` : ''}</div>`).join('')}
    <p id="p-msg" class="error ${msg.startsWith('✓') ? 'ok' : ''}" role="alert">${msg}</p>
    ${todos && t.estado === 'En revisión' ? '<p class="ayuda">Todos los documentos están validados: ya puedes aprobar el trámite.</p>' : ''}
    <div class="acc-final"><button class="btn" data-cod="${t.codigo}" data-estado="Aprobado">Aprobar trámite</button><button class="btn-sec" data-cod="${t.codigo}" data-estado="Finalizado">Finalizar</button></div>
    <h3 style="margin-top:1.4rem">Recorrido</h3><ul class="tl">${t.historial.map(([f, x]) => `<li class="${x.startsWith('Observado') ? 'obs' : ''}">${x}<small>${f}</small></li>`).join('')}</ul>`;
  $('drawer').hidden = false; $('drawer-fondo').hidden = false;
  if (obsAbierta && obsAbierta.cod === t.codigo) { const ta = $('obs-motivo'); if (ta) ta.focus(); }
}
function cerrarDrawer() { $('drawer').hidden = true; $('drawer-fondo').hidden = true; obsAbierta = null; }
$('drawer-fondo').addEventListener('click', cerrarDrawer);
function cambiar(t, estado, texto) {
  t.estado = estado; t.historial.push([hoy(), texto]);
  notifsDe(t.dueno).unshift({ texto: `Tu expediente ${t.codigo} cambió a: ${estado}.`, hora: 'Ahora', leida: false });
}
/* Visor de documentos */
function abrirVisor(t, i) {
  const d = t.docs[i]; const kb = d.size ? (d.size / 1024 < 1024 ? Math.round(d.size / 1024) + ' KB' : (d.size / 1048576).toFixed(1) + ' MB') : '';
  $('visor-titulo').textContent = d.n;
  let cuerpo;
  if (d.url && /^image\//.test(d.tipo || '')) cuerpo = `<img class="vista" src="${d.url}" alt="${d.n}">`;
  else if (d.url && d.tipo === 'application/pdf') cuerpo = `<iframe src="${d.url}" title="${d.n}"></iframe>`;
  else if (/dni|carn/i.test(d.n)) cuerpo = `<div class="carnet"><div class="foto">${ico('casa', 40).replace(/<path[^>]*>/, '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>')}</div><div class="datos"><b>${t.nombre}</b><div class="linea-txt"></div><div class="linea-txt"></div><div class="linea-txt" style="width:60%"></div></div></div>`;
  else cuerpo = `<div class="hoja"><h3>${d.n}</h3><div class="linea-txt"></div><div class="linea-txt media"></div><div class="linea-txt"></div><div class="linea-txt corta"></div><div class="linea-txt media"></div><div class="firma">${t.nombre}</div></div>`;
  const abrir = d.url ? ` · <a href="${d.url}" target="_blank" rel="noopener">Abrir en otra pestaña</a>` : '';
  $('visor-cuerpo').innerHTML = `<p class="visor-meta">${t.codigo} · ${d.archivo}${kb ? ' · ' + kb : ''} · enviado por ${t.nombre}${abrir}</p>${cuerpo}`;
  $('visor').hidden = false; $('visor-cerrar').focus();
}
function cerrarVisor() { $('visor').hidden = true; $('visor-cuerpo').innerHTML = ''; }
$('visor-cerrar').addEventListener('click', cerrarVisor);
$('visor').addEventListener('click', (e) => { if (e.target === $('visor')) cerrarVisor(); });
document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('visor').hidden) cerrarVisor(); else if (!$('drawer').hidden) cerrarDrawer(); });
$('drawer').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'd-cerrar') return cerrarDrawer();
  if (b.dataset.cancel) { const c = obsAbierta.cod; obsAbierta = null; return abrirDrawer(c); }
  const t = tramites.find(x => x.codigo === b.dataset.cod);
  if (b.dataset.ver) return abrirVisor(t, b.dataset.i);
  if (b.dataset.pedir) { obsAbierta = { cod: t.codigo, i: Number(b.dataset.i) }; return abrirDrawer(t.codigo); }
  if (b.dataset.conf) {
    const motivo = $('obs-motivo').value.trim();
    if (motivo.length < 5) { $('p-msg').textContent = 'Escribe el motivo de la observación (mínimo 5 caracteres).'; return; }
    const d = t.docs[b.dataset.i]; d.est = 'Observado'; t.obs[d.n] = motivo; obsAbierta = null; cambiar(t, 'Observado', `Observado: ${d.n}`);
  } else if (b.dataset.res) {
    const d = t.docs[b.dataset.i]; d.est = 'Validado'; delete t.obs[d.n]; obsAbierta = null;
    if ((t.estado === 'Registrado' || t.estado === 'Observado') && !t.docs.some(x => x.est === 'Observado')) cambiar(t, 'En revisión', 'En revisión en ' + proc(t.proc).oficina);
  } else if (b.dataset.estado) {
    if (b.dataset.estado === 'Aprobado' && t.estado === 'Aprobado') return abrirDrawer(t.codigo, 'El trámite ya está aprobado.');
    if (b.dataset.estado === 'Aprobado' && t.docs.some(d => d.est !== 'Validado')) return abrirDrawer(t.codigo, 'Todos los documentos deben estar validados para aprobar.');
    if (b.dataset.estado === 'Finalizado' && t.estado !== 'Aprobado') return abrirDrawer(t.codigo, 'Primero debes aprobar el trámite para finalizarlo.');
    cambiar(t, b.dataset.estado, b.dataset.estado === 'Aprobado' ? 'Aprobado' : 'Finalizado: documento listo para recoger');
  }
  abrirDrawer(t.codigo); pintarPanel(); aviso(`Expediente ${t.codigo}: ${t.estado}`);
});

/* Reportes */
const COL = { 'Registrado': '#9a8f8b', 'En revisión': '#1f5fa8', 'Observado': '#d08a00', 'Aprobado': '#5aa36f', 'Finalizado': '#2f7d4f' };
function pintarReportes() {
  const c = (e) => tramites.filter(t => t.estado === e).length;
  $('r-stats').innerHTML = [['', 'Total de trámites', tramites.length], ['info', 'En revisión', c('En revisión')], ['obs', 'Observados', c('Observado')], ['ok', 'Finalizados', c('Finalizado')]].map(([k, t, n]) => `<div class="stat ${k}"><b>${n}</b><span>${t}</span></div>`).join('');
  const por = PROCEDIMIENTOS.map(p => [p.nombre, tramites.filter(t => t.proc === p.id).length]); const max = Math.max(1, ...por.map(x => x[1]));
  $('r-barras').innerHTML = por.map(([n, v]) => `<div class="barra-fila"><span>${n}</span><div class="pista"><div class="rell" style="width:${(v / max) * 100}%"></div></div><b>${v}</b></div>`).join('');
  let acum = 0; const total = tramites.length;
  const trozos = Object.keys(COL).map(e => { const a = acum, b = acum + (c(e) / total) * 100; acum = b; return `${COL[e]} ${a}% ${b}%`; });
  $('r-dona').innerHTML = `<div class="dona" style="background:conic-gradient(${trozos.join(',')})"><div class="dona-centro">${total}</div></div>
    <div class="leyenda">${Object.keys(COL).map(e => `<div><i style="background:${COL[e]}"></i>${e}: <b>${c(e)}</b></div>`).join('')}</div>`;
}
$('r-csv').addEventListener('click', () => {
  const filas = [['Expediente', 'Procedimiento', 'Solicitante', 'Estado', 'Fecha'], ...tramites.map(t => [t.codigo, proc(t.proc).nombre, t.nombre, t.estado, t.fecha])];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([filas.map(f => f.map(x => `"${x}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'reporte-tramites.csv'; a.click();
  aviso('Reporte descargado');
});
