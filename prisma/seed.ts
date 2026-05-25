/**
 * Seed de la base de datos.
 *
 * Crea un centro de ejemplo con:
 * - 1 usuario administrador (admin@uf3.local / Admin1234!)
 * - 1 usuario editor   (editor@uf3.local / Editor1234!)
 * - 1 usuario viewer   (viewer@uf3.local / Viewer1234!)
 * - 10 profesores
 * - 8 aulas (incluyendo "Aula Informática 1")
 * - 15 asignaturas (incluyendo BBDD y Lenguaje de Marcas)
 * - 6 grupos de niveles variados (FP, Bach, Grado, Infantil…)
 * - 6 franjas horarias de referencia
 * - ~20 asignaciones realistas, entre ellas el ejemplo del viernes:
 *     09:00-12:00 BBDD en Aula Informática 1 (3 h seguidas, una sola fila)
 *     12:20-15:20 Lenguaje de Marcas en Aula Informática 1
 *
 * Ejecutar: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Rol, DiaSemana, NivelEducativo, TipoAsignatura } from "../src/lib/enums";

const prisma = new PrismaClient();

async function main() {
  console.info("🌱 Iniciando seed…");

  // -----------------------------------------------------------
  // Limpieza (orden inverso a las dependencias)
  // -----------------------------------------------------------
  await prisma.asignacion.deleteMany();
  await prisma.franjaHoraria.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.asignatura.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.profesor.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.centro.deleteMany();

  // -----------------------------------------------------------
  // Centro
  // -----------------------------------------------------------
  const centro = await prisma.centro.create({
    data: {
      codigo: "CEU-FIII",
      nombre: "CEU FP Fernando III",
      direccion: "Bormujos, Sevilla",
    },
  });
  console.info(`✓ Centro creado: ${centro.nombre}`);

  // -----------------------------------------------------------
  // Usuarios
  // -----------------------------------------------------------
  const adminHash = await bcrypt.hash("Admin1234!", 10);
  const editorHash = await bcrypt.hash("Editor1234!", 10);
  const viewerHash = await bcrypt.hash("Viewer1234!", 10);

  await prisma.usuario.createMany({
    data: [
      {
        email: "admin@uf3.local",
        passwordHash: adminHash,
        nombre: "Administrador UF3",
        rol: Rol.ADMIN,
      },
      {
        email: "editor@uf3.local",
        passwordHash: editorHash,
        nombre: "Coordinador UF3",
        rol: Rol.EDITOR,
        centroId: centro.id,
      },
      {
        email: "viewer@uf3.local",
        passwordHash: viewerHash,
        nombre: "Consulta UF3",
        rol: Rol.VIEWER,
        centroId: centro.id,
      },
    ],
  });
  console.info("✓ 3 usuarios creados (admin / editor / viewer)");

  // -----------------------------------------------------------
  // Profesores
  // -----------------------------------------------------------
  const profesoresData = [
    { codigo: "P001", nombre: "Lucía",   apellidos: "García Pérez",     departamento: "Informática" },
    { codigo: "P002", nombre: "Carlos",  apellidos: "Martín Ruiz",      departamento: "Informática" },
    { codigo: "P003", nombre: "María",   apellidos: "López Fernández",  departamento: "Informática" },
    { codigo: "P004", nombre: "Javier",  apellidos: "Sánchez Romero",   departamento: "Matemáticas" },
    { codigo: "P005", nombre: "Ana",     apellidos: "Jiménez Cano",     departamento: "Lengua" },
    { codigo: "P006", nombre: "Diego",   apellidos: "Moreno Torres",    departamento: "Inglés" },
    { codigo: "P007", nombre: "Sara",    apellidos: "Álvarez Vega",     departamento: "Ciencias" },
    { codigo: "P008", nombre: "Pablo",   apellidos: "Domínguez Suárez", departamento: "Informática" },
    { codigo: "P009", nombre: "Elena",   apellidos: "Navarro Reyes",    departamento: "Infantil" },
    { codigo: "P010", nombre: "Marcos",  apellidos: "Iglesias Mora",    departamento: "Educación Física" },
  ];

  const profesores = await Promise.all(
    profesoresData.map((p) =>
      prisma.profesor.create({
        data: {
          ...p,
          email: `${p.nombre.toLowerCase()}.${p.apellidos.split(" ")[0].toLowerCase()}@uf3.local`,
          centroId: centro.id,
        },
      }),
    ),
  );
  console.info(`✓ ${profesores.length} profesores creados`);

  // -----------------------------------------------------------
  // Aulas
  // -----------------------------------------------------------
  const aulasData = [
    { codigo: "INF-01", nombre: "Aula Informática 1", ubicacion: "Edif. A, Planta 1", capacidad: 25, equipamiento: "25 PCs, proyector, pizarra digital" },
    { codigo: "INF-02", nombre: "Aula Informática 2", ubicacion: "Edif. A, Planta 1", capacidad: 25, equipamiento: "25 PCs, proyector" },
    { codigo: "AULA-101", nombre: "Aula 101", ubicacion: "Edif. A, Planta 1", capacidad: 30, equipamiento: "Proyector, pizarra" },
    { codigo: "AULA-102", nombre: "Aula 102", ubicacion: "Edif. A, Planta 1", capacidad: 30, equipamiento: "Proyector, pizarra" },
    { codigo: "AULA-201", nombre: "Aula 201", ubicacion: "Edif. A, Planta 2", capacidad: 35 },
    { codigo: "INF-INF", nombre: "Aula Infantil", ubicacion: "Edif. B, Planta Baja", capacidad: 20, equipamiento: "Mobiliario adaptado" },
    { codigo: "LAB-CIE", nombre: "Laboratorio Ciencias", ubicacion: "Edif. C", capacidad: 20, equipamiento: "Material de laboratorio" },
    { codigo: "GIM", nombre: "Gimnasio", ubicacion: "Edif. D", capacidad: 60, equipamiento: "Material deportivo" },
  ];

  const aulas = await Promise.all(
    aulasData.map((a) => prisma.aula.create({ data: { ...a, centroId: centro.id } })),
  );
  console.info(`✓ ${aulas.length} aulas creadas`);

  // -----------------------------------------------------------
  // Asignaturas
  // -----------------------------------------------------------
  const asignaturasData = [
    { codigo: "BBDD",   nombre: "Bases de Datos",         tipo: TipoAsignatura.ASIGNATURA, color: "#2563eb" },
    { codigo: "LMSGI",  nombre: "Lenguaje de Marcas",     tipo: TipoAsignatura.ASIGNATURA, color: "#7c3aed" },
    { codigo: "PROG",   nombre: "Programación",           tipo: TipoAsignatura.ASIGNATURA, color: "#059669" },
    { codigo: "ED",     nombre: "Entornos de Desarrollo", tipo: TipoAsignatura.ASIGNATURA, color: "#dc2626" },
    { codigo: "FOL",    nombre: "FOL",                    tipo: TipoAsignatura.ASIGNATURA, color: "#ea580c" },
    { codigo: "SI",     nombre: "Sistemas Informáticos",  tipo: TipoAsignatura.ASIGNATURA, color: "#0891b2" },
    { codigo: "MAT",    nombre: "Matemáticas",            tipo: TipoAsignatura.ASIGNATURA, color: "#be185d" },
    { codigo: "LEN",    nombre: "Lengua Castellana",      tipo: TipoAsignatura.ASIGNATURA, color: "#a16207" },
    { codigo: "ING",    nombre: "Inglés",                 tipo: TipoAsignatura.ASIGNATURA, color: "#65a30d" },
    { codigo: "EF",     nombre: "Educación Física",       tipo: TipoAsignatura.ASIGNATURA, color: "#16a34a" },
    { codigo: "CIE",    nombre: "Ciencias Naturales",     tipo: TipoAsignatura.ASIGNATURA, color: "#0d9488" },
    { codigo: "JUEGO",  nombre: "Tiempo de juego",        tipo: TipoAsignatura.ASIGNATURA, color: "#facc15" },
    { codigo: "TUT",    nombre: "Tutoría",                tipo: TipoAsignatura.TUTORIA,    color: "#6b7280" },
    { codigo: "REU",    nombre: "Reunión Departamento",   tipo: TipoAsignatura.REUNION,    color: "#9ca3af" },
    { codigo: "GUARD",  nombre: "Guardia",                tipo: TipoAsignatura.GUARDIA,    color: "#fb7185" },
  ];

  const asignaturas = await Promise.all(
    asignaturasData.map((a) => prisma.asignatura.create({ data: { ...a, centroId: centro.id } })),
  );
  console.info(`✓ ${asignaturas.length} asignaturas creadas`);

  // -----------------------------------------------------------
  // Grupos
  // -----------------------------------------------------------
  const gruposData = [
    { codigo: "1DAW",       nombre: "1º DAW",                       nivel: NivelEducativo.FP_SUPERIOR,  numAlumnos: 24 },
    { codigo: "2DAW",       nombre: "2º DAW",                       nivel: NivelEducativo.FP_SUPERIOR,  numAlumnos: 18 },
    { codigo: "1ESO-A",     nombre: "1º ESO A",                     nivel: NivelEducativo.ESO,          numAlumnos: 28 },
    { codigo: "2BACH-B",    nombre: "2º Bachillerato B",            nivel: NivelEducativo.BACHILLERATO, numAlumnos: 26 },
    { codigo: "3GRADO-INF", nombre: "3º Grado Magisterio Infantil", nivel: NivelEducativo.GRADO,        numAlumnos: 30 },
    { codigo: "INF-4A",     nombre: "Infantil 4 años A",            nivel: NivelEducativo.INFANTIL,     numAlumnos: 20 },
  ];

  const grupos = await Promise.all(
    gruposData.map((g) =>
      prisma.grupo.create({
        data: { ...g, centroId: centro.id, cursoAcademico: "2025-2026" },
      }),
    ),
  );
  console.info(`✓ ${grupos.length} grupos creados`);

  // -----------------------------------------------------------
  // Franjas horarias (plantilla)
  // -----------------------------------------------------------
  const franjasData = [
    { nombre: "1ª hora", horaInicio: "08:00", horaFin: "09:00", orden: 1 },
    { nombre: "2ª hora", horaInicio: "09:00", horaFin: "10:00", orden: 2 },
    { nombre: "3ª hora", horaInicio: "10:00", horaFin: "11:00", orden: 3 },
    { nombre: "Recreo",  horaInicio: "11:00", horaFin: "11:20", orden: 4 },
    { nombre: "4ª hora", horaInicio: "11:20", horaFin: "12:20", orden: 5 },
    { nombre: "5ª hora", horaInicio: "12:20", horaFin: "13:20", orden: 6 },
  ];

  await prisma.franjaHoraria.createMany({
    data: franjasData.map((f) => ({ ...f, centroId: centro.id })),
  });
  console.info(`✓ ${franjasData.length} franjas horarias creadas`);

  // -----------------------------------------------------------
  // Atajos
  // -----------------------------------------------------------
  const findProf = (codigo: string) => profesores.find((p) => p.codigo === codigo)!;
  const findAula = (codigo: string) => aulas.find((a) => a.codigo === codigo)!;
  const findAsig = (codigo: string) => asignaturas.find((a) => a.codigo === codigo)!;
  const findGrupo = (codigo: string) => grupos.find((g) => g.codigo === codigo)!;

  // -----------------------------------------------------------
  // Asignaciones
  // -----------------------------------------------------------
  const asignacionesData: Array<{
    dia: (typeof DiaSemana)[keyof typeof DiaSemana];
    horaInicio: string;
    horaFin: string;
    profesorCod: string;
    aulaCod: string;
    asigCod: string;
    grupoCod: string;
    observaciones?: string;
  }> = [
    // ============ 1º DAW – Aula Informática 1 ============
    // VIERNES (ejemplo del cliente):
    //   09:00-12:00 BBDD (3 h seguidas, una sola fila)
    //   12:20-15:20 Lenguaje de Marcas
    { dia: DiaSemana.VIERNES,   horaInicio: "09:00", horaFin: "12:00", profesorCod: "P001", aulaCod: "INF-01",  asigCod: "BBDD",  grupoCod: "1DAW", observaciones: "Bloque de 3 horas seguidas" },
    { dia: DiaSemana.VIERNES,   horaInicio: "12:20", horaFin: "15:20", profesorCod: "P002", aulaCod: "INF-01",  asigCod: "LMSGI", grupoCod: "1DAW", observaciones: "Bloque de 3 horas tras recreo" },

    // Resto de la semana de 1º DAW
    { dia: DiaSemana.LUNES,     horaInicio: "08:00", horaFin: "10:00", profesorCod: "P003", aulaCod: "INF-01",  asigCod: "PROG",  grupoCod: "1DAW" },
    { dia: DiaSemana.LUNES,     horaInicio: "10:00", horaFin: "11:00", profesorCod: "P001", aulaCod: "INF-01",  asigCod: "BBDD",  grupoCod: "1DAW" },
    { dia: DiaSemana.LUNES,     horaInicio: "11:20", horaFin: "13:20", profesorCod: "P008", aulaCod: "INF-02",  asigCod: "ED",    grupoCod: "1DAW" },
    { dia: DiaSemana.MARTES,    horaInicio: "08:00", horaFin: "10:00", profesorCod: "P002", aulaCod: "INF-01",  asigCod: "LMSGI", grupoCod: "1DAW" },
    { dia: DiaSemana.MARTES,    horaInicio: "10:00", horaFin: "11:00", profesorCod: "P005", aulaCod: "AULA-101",asigCod: "FOL",   grupoCod: "1DAW" },
    { dia: DiaSemana.MIERCOLES, horaInicio: "08:00", horaFin: "10:00", profesorCod: "P003", aulaCod: "INF-01",  asigCod: "PROG",  grupoCod: "1DAW" },
    { dia: DiaSemana.JUEVES,    horaInicio: "09:00", horaFin: "11:00", profesorCod: "P001", aulaCod: "INF-01",  asigCod: "BBDD",  grupoCod: "1DAW" },

    // ============ 2º Bachillerato B ============
    { dia: DiaSemana.LUNES,     horaInicio: "08:00", horaFin: "09:00", profesorCod: "P004", aulaCod: "AULA-201", asigCod: "MAT", grupoCod: "2BACH-B" },
    { dia: DiaSemana.MARTES,    horaInicio: "08:00", horaFin: "09:00", profesorCod: "P005", aulaCod: "AULA-201", asigCod: "LEN", grupoCod: "2BACH-B" },
    { dia: DiaSemana.MARTES,    horaInicio: "09:00", horaFin: "10:00", profesorCod: "P006", aulaCod: "AULA-201", asigCod: "ING", grupoCod: "2BACH-B" },

    // ============ 1º ESO A ============
    { dia: DiaSemana.LUNES,     horaInicio: "09:00", horaFin: "10:00", profesorCod: "P004", aulaCod: "AULA-101", asigCod: "MAT", grupoCod: "1ESO-A" },
    { dia: DiaSemana.MARTES,    horaInicio: "11:20", horaFin: "12:20", profesorCod: "P010", aulaCod: "GIM",      asigCod: "EF",  grupoCod: "1ESO-A" },
    { dia: DiaSemana.MIERCOLES, horaInicio: "10:00", horaFin: "11:00", profesorCod: "P007", aulaCod: "LAB-CIE",  asigCod: "CIE", grupoCod: "1ESO-A" },

    // ============ Infantil 4 años A ============
    { dia: DiaSemana.LUNES,     horaInicio: "09:00", horaFin: "10:00", profesorCod: "P009", aulaCod: "INF-INF", asigCod: "JUEGO", grupoCod: "INF-4A" },
    { dia: DiaSemana.MARTES,    horaInicio: "09:00", horaFin: "10:00", profesorCod: "P009", aulaCod: "INF-INF", asigCod: "JUEGO", grupoCod: "INF-4A" },

    // ============ Tutorías / reuniones ============
    { dia: DiaSemana.MIERCOLES, horaInicio: "13:20", horaFin: "14:20", profesorCod: "P001", aulaCod: "AULA-102", asigCod: "TUT", grupoCod: "1DAW", observaciones: "Tutoría grupal" },
    { dia: DiaSemana.JUEVES,    horaInicio: "13:20", horaFin: "14:20", profesorCod: "P002", aulaCod: "AULA-102", asigCod: "REU", grupoCod: "1DAW", observaciones: "Reunión departamento informática" },
  ];

  for (const a of asignacionesData) {
    await prisma.asignacion.create({
      data: {
        centroId: centro.id,
        dia: a.dia,
        horaInicio: a.horaInicio,
        horaFin: a.horaFin,
        profesorId: findProf(a.profesorCod).id,
        aulaId: findAula(a.aulaCod).id,
        asignaturaId: findAsig(a.asigCod).id,
        grupoId: findGrupo(a.grupoCod).id,
        observaciones: a.observaciones,
      },
    });
  }
  console.info(`✓ ${asignacionesData.length} asignaciones creadas`);

  console.info("\n✅ Seed completado correctamente.\n");
  console.info("Credenciales de acceso:");
  console.info("  Admin   →  admin@uf3.local   /  Admin1234!");
  console.info("  Editor  →  editor@uf3.local  /  Editor1234!");
  console.info("  Viewer  →  viewer@uf3.local  /  Viewer1234!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
