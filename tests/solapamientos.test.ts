import { describe, it, expect } from "vitest";
import { intervalosSolapan, horaAMinutos } from "@/lib/validations/comun";

describe("horaAMinutos", () => {
  it("convierte correctamente 00:00", () => {
    expect(horaAMinutos("00:00")).toBe(0);
  });
  it("convierte correctamente 09:30", () => {
    expect(horaAMinutos("09:30")).toBe(570);
  });
  it("convierte correctamente 23:59", () => {
    expect(horaAMinutos("23:59")).toBe(1439);
  });
});

describe("intervalosSolapan", () => {
  it("intervalos idénticos solapan", () => {
    expect(intervalosSolapan("09:00", "10:00", "09:00", "10:00")).toBe(true);
  });

  it("solapamiento parcial al inicio", () => {
    expect(intervalosSolapan("09:00", "10:00", "09:30", "10:30")).toBe(true);
  });

  it("solapamiento parcial al final", () => {
    expect(intervalosSolapan("09:30", "10:30", "09:00", "10:00")).toBe(true);
  });

  it("uno contenido en otro", () => {
    expect(intervalosSolapan("09:00", "12:00", "10:00", "11:00")).toBe(true);
  });

  it("intervalos consecutivos NO solapan (10:00 fin = 10:00 inicio)", () => {
    // BBDD 09:00-12:00 y Lenguaje de Marcas 12:20-15:20 NO solapan
    expect(intervalosSolapan("09:00", "12:00", "12:00", "13:00")).toBe(false);
    expect(intervalosSolapan("09:00", "12:00", "12:20", "15:20")).toBe(false);
  });

  it("intervalos separados NO solapan", () => {
    expect(intervalosSolapan("09:00", "10:00", "11:00", "12:00")).toBe(false);
  });

  it("orden inverso de argumentos no afecta", () => {
    expect(intervalosSolapan("11:00", "12:00", "09:00", "10:00")).toBe(false);
    expect(intervalosSolapan("11:00", "12:00", "10:00", "11:30")).toBe(true);
  });
});
