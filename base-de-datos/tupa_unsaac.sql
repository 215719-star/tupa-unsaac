-- TUPA UNSAAC: esquema de base de datos (PostgreSQL)
-- Ejecutar: psql -d tupa_unsaac -f tupa_unsaac.sql

DROP TABLE IF EXISTS notificacion, historial, documento, tramite, requisito,
  procedimiento, categoria, usuario, carrera, facultad, oficina CASCADE;

CREATE TABLE facultad (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE carrera (
  id          SERIAL PRIMARY KEY,
  facultad_id INT NOT NULL REFERENCES facultad(id),
  nombre      VARCHAR(150) NOT NULL,
  UNIQUE (facultad_id, nombre)
);

CREATE TABLE oficina (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE usuario (
  id               SERIAL PRIMARY KEY,
  codigo           VARCHAR(11) NOT NULL UNIQUE,          -- código de alumno, DNI o RUC (6 a 11 dígitos)
  tipo_documento   VARCHAR(10) NOT NULL DEFAULT 'DNI' CHECK (tipo_documento IN ('DNI','RUC','CODIGO','EXTRANJERO')),
  nombres          VARCHAR(150) NOT NULL,
  correo           VARCHAR(120) NOT NULL UNIQUE,
  telefono         CHAR(9) CHECK (telefono ~ '^[0-9]{9}$'),
  direccion        VARCHAR(200),
  facultad_id      INT REFERENCES facultad(id),
  carrera_id       INT REFERENCES carrera(id),
  rol              VARCHAR(10) NOT NULL DEFAULT 'USUARIO' CHECK (rol IN ('USUARIO','OFICINA')),
  oficina_id       INT REFERENCES oficina(id),
  clave_hash       VARCHAR(100) NOT NULL,                -- nunca se guarda la contraseña en texto
  creado_en        TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT ck_codigo CHECK (codigo ~ '^[0-9]{6,11}$'),
  CONSTRAINT ck_oficina_rol CHECK ((rol = 'OFICINA' AND oficina_id IS NOT NULL) OR (rol = 'USUARIO' AND oficina_id IS NULL))
);

CREATE TABLE categoria (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE procedimiento (
  id            SERIAL PRIMARY KEY,
  categoria_id  INT NOT NULL REFERENCES categoria(id),
  oficina_id    INT NOT NULL REFERENCES oficina(id),
  nombre        VARCHAR(200) NOT NULL,
  costo         NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (costo >= 0),
  plazo_dias    INT NOT NULL CHECK (plazo_dias > 0),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (categoria_id, nombre)
);

CREATE TABLE requisito (
  id                SERIAL PRIMARY KEY,
  procedimiento_id  INT NOT NULL REFERENCES procedimiento(id) ON DELETE CASCADE,
  descripcion       VARCHAR(200) NOT NULL,
  obligatorio       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tramite (
  id                SERIAL PRIMARY KEY,
  codigo            VARCHAR(16) NOT NULL UNIQUE,         -- EXP-2026-0001
  usuario_id        INT NOT NULL REFERENCES usuario(id),
  procedimiento_id  INT NOT NULL REFERENCES procedimiento(id),
  tipo_documento    VARCHAR(30) NOT NULL,                -- Solicitud, Oficio, Carta, etc.
  numero_documento  VARCHAR(40),
  asunto            VARCHAR(200) NOT NULL,
  aclaracion        VARCHAR(180) CHECK (aclaracion IS NULL OR char_length(aclaracion) >= 10),
  clave_pago        VARCHAR(10) CHECK (clave_pago IS NULL OR clave_pago ~ '^[0-9]{4,10}$'),
  estado            VARCHAR(12) NOT NULL DEFAULT 'Registrado'
                    CHECK (estado IN ('Registrado','En revisión','Observado','Aprobado','Finalizado')),
  fecha_registro    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE documento (
  id               SERIAL PRIMARY KEY,
  tramite_id       INT NOT NULL REFERENCES tramite(id) ON DELETE CASCADE,
  requisito_id     INT REFERENCES requisito(id),
  nombre_archivo   VARCHAR(200) NOT NULL,
  url_archivo      VARCHAR(400) NOT NULL,
  tamano_bytes     BIGINT NOT NULL CHECK (tamano_bytes > 0 AND tamano_bytes <= 52428800),  -- máx. 50 MB
  estado           VARCHAR(10) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Validado','Observado')),
  observacion      VARCHAR(300),
  subido_en        TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT ck_extension CHECK (lower(nombre_archivo) ~ '\.(pdf|zip|rar|xls|xlsx|doc|docx)$'),
  CONSTRAINT ck_obs CHECK (estado <> 'Observado' OR char_length(coalesce(observacion,'')) >= 5)
);

CREATE TABLE historial (
  id          SERIAL PRIMARY KEY,
  tramite_id  INT NOT NULL REFERENCES tramite(id) ON DELETE CASCADE,
  usuario_id  INT REFERENCES usuario(id),               -- quien realizó el cambio
  estado      VARCHAR(12) NOT NULL,
  detalle     VARCHAR(300) NOT NULL,
  fecha       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notificacion (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tramite_id  INT REFERENCES tramite(id) ON DELETE CASCADE,
  mensaje     VARCHAR(300) NOT NULL,
  leida       BOOLEAN NOT NULL DEFAULT FALSE,
  fecha       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX ix_tramite_usuario ON tramite(usuario_id);
CREATE INDEX ix_tramite_estado ON tramite(estado);
CREATE INDEX ix_documento_tramite ON documento(tramite_id);
CREATE INDEX ix_historial_tramite ON historial(tramite_id);
CREATE INDEX ix_notif_usuario ON notificacion(usuario_id, leida);

-- Datos iniciales
INSERT INTO oficina(nombre) VALUES ('Dirección de Escuela'),('Registro Académico'),('Mesa de Partes'),('Bienestar Universitario');
INSERT INTO categoria(nombre) VALUES ('Trámites académicos'),('Trámites administrativos'),('Información y recursos');
INSERT INTO facultad(nombre) VALUES ('Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica');
INSERT INTO carrera(facultad_id,nombre) VALUES (1,'Ingeniería Informática y de Sistemas');
INSERT INTO procedimiento(categoria_id,oficina_id,nombre,costo,plazo_dias) VALUES
 (1,1,'Constancia de estudios',10.00,3),
 (1,2,'Certificado de notas',15.00,5),
 (2,3,'Solicitud de información pública',0.00,10);
INSERT INTO requisito(procedimiento_id,descripcion) VALUES
 (1,'Solicitud dirigida al Director'),(1,'Copia de DNI'),(1,'Voucher de pago'),
 (2,'Solicitud dirigida al Director'),(2,'Copia de DNI'),(2,'Voucher de pago'),
 (3,'Solicitud de información');
