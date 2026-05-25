-- CreateTable
CREATE TABLE "Centro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VIEWER',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT,
    CONSTRAINT "Usuario_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT,
    "departamento" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    "usuarioId" TEXT,
    CONSTRAINT "Profesor_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Profesor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "capacidad" INTEGER,
    "equipamiento" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    CONSTRAINT "Aula_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asignatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'ASIGNATURA',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    CONSTRAINT "Asignatura_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "cursoAcademico" TEXT NOT NULL,
    "numAlumnos" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    CONSTRAINT "Grupo_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FranjaHoraria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    CONSTRAINT "FranjaHoraria_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dia" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "vigenteDesde" DATETIME,
    "vigenteHasta" DATETIME,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "centroId" TEXT NOT NULL,
    "profesorId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Asignacion_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Centro_codigo_key" ON "Centro"("codigo");

-- CreateIndex
CREATE INDEX "Centro_activo_idx" ON "Centro"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_centroId_idx" ON "Usuario"("centroId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_codigo_key" ON "Profesor"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_email_key" ON "Profesor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_usuarioId_key" ON "Profesor"("usuarioId");

-- CreateIndex
CREATE INDEX "Profesor_centroId_activo_idx" ON "Profesor"("centroId", "activo");

-- CreateIndex
CREATE INDEX "Profesor_apellidos_nombre_idx" ON "Profesor"("apellidos", "nombre");

-- CreateIndex
CREATE INDEX "Aula_centroId_activo_idx" ON "Aula"("centroId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "Aula_centroId_codigo_key" ON "Aula"("centroId", "codigo");

-- CreateIndex
CREATE INDEX "Asignatura_centroId_activo_idx" ON "Asignatura"("centroId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_centroId_codigo_key" ON "Asignatura"("centroId", "codigo");

-- CreateIndex
CREATE INDEX "Grupo_centroId_activo_idx" ON "Grupo"("centroId", "activo");

-- CreateIndex
CREATE INDEX "Grupo_nivel_idx" ON "Grupo"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_centroId_codigo_cursoAcademico_key" ON "Grupo"("centroId", "codigo", "cursoAcademico");

-- CreateIndex
CREATE INDEX "FranjaHoraria_centroId_orden_idx" ON "FranjaHoraria"("centroId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "FranjaHoraria_centroId_nombre_key" ON "FranjaHoraria"("centroId", "nombre");

-- CreateIndex
CREATE INDEX "Asignacion_centroId_dia_idx" ON "Asignacion"("centroId", "dia");

-- CreateIndex
CREATE INDEX "Asignacion_centroId_profesorId_dia_idx" ON "Asignacion"("centroId", "profesorId", "dia");

-- CreateIndex
CREATE INDEX "Asignacion_centroId_aulaId_dia_idx" ON "Asignacion"("centroId", "aulaId", "dia");

-- CreateIndex
CREATE INDEX "Asignacion_centroId_grupoId_dia_idx" ON "Asignacion"("centroId", "grupoId", "dia");
