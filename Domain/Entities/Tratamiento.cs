namespace NutriTrack.Domain.Entities;

public class Tratamiento
{
    public required string ClienteId { get; init; }
    public DateOnly FechaMedicion { get; init; }
    public int Secuencia { get; init; }
    public required string Producto { get; set; }
    public required string Dosis { get; set; }
}
