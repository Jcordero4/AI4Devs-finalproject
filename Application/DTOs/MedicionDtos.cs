namespace NutriTrack.Application.DTOs;

public record TratamientoEntradaDto(string? Producto, string? Dosis);

public record PlanNutricionalDto(int? Lacteo, int? Fruta, int? Vegetales, int? Harinas, int? Proteina, int? Grasa, int? Agua);

/// <summary>Cuerpo de alta (POST) y actualización (PUT) de una medición; la fecha la define el servidor.</summary>
public record GuardarMedicionDto(
    decimal? Peso,
    decimal? Grasa,
    decimal? MasaMuscular,
    decimal? Agua,
    decimal? GrasaVisceral,
    decimal? Imc,
    List<TratamientoEntradaDto>? Tratamientos,
    PlanNutricionalDto? Plan);

public record TratamientoDto(int Secuencia, string Producto, string Dosis);

public record MedicionResumenDto(
    DateOnly FechaMedicion,
    decimal Peso,
    decimal Grasa,
    decimal MasaMuscular,
    decimal Agua,
    decimal GrasaVisceral,
    decimal Imc);

public record MedicionDto(
    string ClienteId,
    DateOnly FechaMedicion,
    decimal Peso,
    decimal Grasa,
    decimal MasaMuscular,
    decimal Agua,
    decimal GrasaVisceral,
    decimal Imc,
    IReadOnlyList<TratamientoDto> Tratamientos,
    PlanNutricionalDto Plan);
