const CATEGORIAS = ['Facultades (estudiantes)', 'Dirección de Registro y Servicios Académicos', 'Trámites exonerados de pago'];
const PROCEDIMIENTOS = [
  { id: 1, categoria: 'Facultades (estudiantes)', nombre: 'Constancia de estudios', oficina: 'Dirección de Escuela', costo: 'S/ 10.00', plazo: '3 días hábiles',
    requisitos: ['Solicitud dirigida al director', 'Copia de DNI', 'Voucher de pago'] },
  { id: 2, categoria: 'Facultades (estudiantes)', nombre: 'Constancia de egresado', oficina: 'Secretaría Académica', costo: 'S/ 25.00', plazo: '5 días hábiles',
    requisitos: ['Solicitud dirigida al decano', 'Copia de DNI', 'Voucher de pago'] },
  { id: 3, categoria: 'Dirección de Registro y Servicios Académicos', nombre: 'Rectificación de matrícula', oficina: 'Registro Académico', costo: 'S/ 15.00', plazo: '2 días hábiles',
    requisitos: ['Solicitud', 'Ficha de matrícula', 'Voucher de pago'] },
  { id: 4, categoria: 'Dirección de Registro y Servicios Académicos', nombre: 'Certificado de notas', oficina: 'Registro Académico', costo: 'S/ 20.00', plazo: '4 días hábiles',
    requisitos: ['Solicitud', 'Copia de DNI', 'Voucher de pago'] },
  { id: 5, categoria: 'Facultades (estudiantes)', nombre: 'Licencia de estudios', oficina: 'Dirección de Escuela', costo: 'S/ 30.00', plazo: '7 días hábiles',
    requisitos: ['Solicitud con motivo', 'Copia de DNI', 'Documento sustentatorio', 'Voucher de pago'] },
  { id: 6, categoria: 'Dirección de Registro y Servicios Académicos', nombre: 'Duplicado de carné universitario', oficina: 'Secretaría Académica', costo: 'S/ 12.00', plazo: '5 días hábiles',
    requisitos: ['Solicitud', 'Declaración jurada de pérdida', 'Voucher de pago'] },
  { id: 7, categoria: 'Trámites exonerados de pago', nombre: 'Solicitud de información pública', oficina: 'Secretaría General', costo: 'S/ 0.00', plazo: '7 días hábiles',
    requisitos: ['Solicitud', 'Copia de DNI'] },
  { id: 8, categoria: 'Trámites exonerados de pago', nombre: 'Recurso de reconsideración', oficina: 'Secretaría General', costo: 'S/ 0.00', plazo: '15 días hábiles',
    requisitos: ['Recurso fundamentado', 'Copia de DNI'] }
];
const ALUMNOS = { '210369': 'Jack Eliezer Ttito Huaman', '215719': 'Brayan Isau Choque Mamani', '215275': 'Orlando Cochama Bornas', '230253': 'Franklin Gilberto Mamani Condori',
  '230251': 'Dominic Jair Delgado Huamputupa', '194521': 'Ana Quispe Mamani' };
const CARRERAS = { 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica': ['Ingeniería Informática y de Sistemas', 'Ingeniería Eléctrica', 'Ingeniería Electrónica', 'Ingeniería Mecánica'],
  'Facultad de Ingeniería Civil': ['Ingeniería Civil'], 'Facultad de Arquitectura': ['Arquitectura'], 'Facultad de Ciencias Administrativas y Turismo': ['Administración', 'Turismo'],
  'Facultad de Derecho y Ciencias Sociales': ['Derecho', 'Ciencia Política'], 'Facultad de Educación y Ciencias de la Comunicación': ['Educación Primaria', 'Ciencias de la Comunicación'],
  'Facultad de Medicina y Odontología': ['Medicina Humana', 'Odontología'], 'Facultad de Contabilidad': ['Contabilidad'], 'Facultad de Economía': ['Economía'], 'Facultad de Ciencias': ['Física', 'Matemática'] };
const FACULTADES = ['Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica', 'Facultad de Ingeniería Civil', 'Facultad de Arquitectura',
  'Facultad de Ciencias Administrativas y Turismo', 'Facultad de Derecho y Ciencias Sociales', 'Facultad de Educación y Ciencias de la Comunicación',
  'Facultad de Medicina y Odontología', 'Facultad de Contabilidad', 'Facultad de Economía', 'Facultad de Ciencias'];
const ESTADOS = ['Registrado', 'En revisión', 'Aprobado', 'Finalizado'];
const D = (n, e) => ({ n, est: e, archivo: n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pdf' });
const TRAMITES = [
  { codigo: 'EXP-2026-0001', proc: 2, nombre: 'Ana Quispe Mamani', doc: '194521', dueno: '194521', correo: 'ana.quispe@correo.com', tel: '951234567', facultad: 'Facultad de Arquitectura',
    asunto: 'Constancia para postulación a prácticas', estado: 'En revisión', fecha: '2026-10-20', clave: '48211',
    docs: [D('Solicitud dirigida al decano', 'Pendiente'), D('Copia de DNI', 'Validado'), D('Voucher de pago', 'Pendiente')],
    historial: [['20/10/2026 09:12', 'Trámite registrado'], ['21/10/2026 08:40', 'En revisión en Secretaría Académica']] },
  { codigo: 'EXP-2026-0002', proc: 1, nombre: 'Brayan Isau Choque Mamani', doc: '215719', dueno: '215719', correo: '215719@unsaac.edu.pe', tel: '987654321', facultad: 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica',
    asunto: 'Constancia para beca', estado: 'Aprobado', fecha: '2026-10-21', clave: '49625',
    docs: [D('Solicitud dirigida al director', 'Validado'), D('Copia de DNI', 'Validado'), D('Voucher de pago', 'Validado')],
    historial: [['21/10/2026 10:05', 'Trámite registrado'], ['22/10/2026 11:30', 'En revisión en Dirección de Escuela'], ['23/10/2026 15:10', 'Aprobado']] },
  { codigo: 'EXP-2026-0003', proc: 4, nombre: 'Brayan Isau Choque Mamani', doc: '215719', dueno: '215719', correo: '215719@unsaac.edu.pe', tel: '987654321', facultad: 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica',
    asunto: 'Certificado para trámite en el extranjero', estado: 'Observado', fecha: '2026-10-22', clave: '50317',
    docs: [D('Solicitud', 'Validado'), D('Copia de DNI', 'Observado'), D('Voucher de pago', 'Validado')],
    obs: { 'Copia de DNI': 'La copia no es legible. Súbela nuevamente en PDF.' },
    historial: [['22/10/2026 16:20', 'Trámite registrado'], ['23/10/2026 09:00', 'En revisión en Registro Académico'], ['23/10/2026 12:45', 'Observado: Copia de DNI']] },
  { codigo: 'EXP-2026-0004', proc: 3, nombre: 'Carlos Mamani Flores', doc: '215900', dueno: '215900', correo: 'carlos.mamani@correo.com', tel: '964321876', facultad: 'Facultad de Ingeniería Civil',
    asunto: 'Cambio de sección', estado: 'Registrado', fecha: '2026-10-26', clave: '51890',
    docs: [D('Solicitud', 'Pendiente'), D('Ficha de matrícula', 'Pendiente'), D('Voucher de pago', 'Pendiente')],
    historial: [['26/10/2026 18:02', 'Trámite registrado']] },
  { codigo: 'EXP-2026-0005', proc: 6, nombre: 'Brayan Isau Choque Mamani', doc: '215719', dueno: '215719', correo: '215719@unsaac.edu.pe', tel: '987654321', facultad: 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica',
    asunto: 'Duplicado de carné por pérdida', estado: 'Finalizado', fecha: '2026-10-15', clave: '47002',
    docs: [D('Solicitud', 'Validado'), D('Declaración jurada de pérdida', 'Validado'), D('Voucher de pago', 'Validado')],
    historial: [['15/10/2026 08:15', 'Trámite registrado'], ['16/10/2026 10:00', 'En revisión en Secretaría Académica'], ['17/10/2026 09:30', 'Aprobado'], ['19/10/2026 14:00', 'Finalizado: documento listo para recoger']] }
];
const NOTIFICACIONES = [
  { texto: 'Tu expediente EXP-2026-0003 fue observado: la copia de DNI no es legible.', hora: 'Hace 2 días', leida: false },
  { texto: 'Tu expediente EXP-2026-0002 fue aprobado.', hora: 'Hace 3 días', leida: false },
  { texto: 'Tu expediente EXP-2026-0005 fue finalizado. Puedes recoger tu documento.', hora: 'Hace 9 días', leida: true }
];
