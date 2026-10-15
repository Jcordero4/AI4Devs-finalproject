namespace NutriTrack.Domain.Entities;

/// <summary>Porciones diarias asociadas 1:1 a una medición (no es el plan versionado de Epic 4).</summary>
public class PlanNutricional
{
    public required string ClienteId { get; init; }
    public DateOnly FechaMedicion { get; init; }
    public int Lacteo { get; set; }
    public int Fruta { get; set; }
    public int Vegetales { get; set; }
    public int Harinas { get; set; }
    public int Proteina { get; set; }
    public int Grasa { get; set; }
    public int Agua { get; set; }
}
