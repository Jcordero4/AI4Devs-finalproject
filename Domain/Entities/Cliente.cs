using NutriTrack.Domain.Enums;

namespace NutriTrack.Domain.Entities;

public class Cliente
{
    public required string Id { get; init; }
    public required string Nombre { get; set; }
    public DateOnly FechaNacimiento { get; set; }
    public Genero Genero { get; set; }
    public int Altura { get; set; }
    public string? Email { get; set; }
    public DateOnly FechaIngreso { get; init; }
    public bool Activo { get; init; } = true;

    public int Edad => CalcularEdad(FechaNacimiento, DateOnly.FromDateTime(DateTime.Today));

    public static int CalcularEdad(DateOnly fechaNacimiento, DateOnly hoy)
    {
        var edad = hoy.Year - fechaNacimiento.Year;
        if (fechaNacimiento.AddYears(edad) > hoy)
        {
            edad--;
        }
        return Math.Max(edad, 0);
    }
}
