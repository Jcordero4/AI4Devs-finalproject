namespace NutriTrack.Domain.Entities;

public class Medicion
{
    public required string ClienteId { get; init; }
    public DateOnly FechaMedicion { get; init; }
    public decimal Peso { get; set; }
    public decimal Grasa { get; set; }
    public decimal MasaMuscular { get; set; }
    public decimal Agua { get; set; }
    public decimal GrasaVisceral { get; set; }
    public decimal Imc { get; set; }

    public List<Tratamiento> Tratamientos { get; } = [];
    public PlanNutricional? Plan { get; set; }

    /// <summary>
    /// Reemplaza los tratamientos conservando la numeración 1..N: actualiza las filas existentes,
    /// agrega las que faltan y quita las sobrantes.
    /// </summary>
    public void ReemplazarTratamientos(IReadOnlyList<(string Producto, string Dosis)> filas)
    {
        for (var i = 0; i < filas.Count; i++)
        {
            var secuencia = i + 1;
            var existente = Tratamientos.FirstOrDefault(t => t.Secuencia == secuencia);
            if (existente is null)
            {
                Tratamientos.Add(new Tratamiento
                {
                    ClienteId = ClienteId,
                    FechaMedicion = FechaMedicion,
                    Secuencia = secuencia,
                    Producto = filas[i].Producto,
                    Dosis = filas[i].Dosis
                });
            }
            else
            {
                existente.Producto = filas[i].Producto;
                existente.Dosis = filas[i].Dosis;
            }
        }

        Tratamientos.RemoveAll(t => t.Secuencia > filas.Count);
    }
}
