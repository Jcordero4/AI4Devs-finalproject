using NutriTrack.Domain.Entities;

namespace NutriTrack.Application.Interfaces;

public interface IRepositorioMedicion
{
    Task<bool> ExisteAsync(string clienteId, DateOnly fecha, CancellationToken ct = default);
    /// <summary>Lista las mediciones del cliente; <paramref name="desde"/> y <paramref name="hasta"/> (inclusivos, opcionales) limitan el rango de fechas.</summary>
    Task<IReadOnlyList<Medicion>> ListarAsync(string clienteId, DateOnly? desde = null, DateOnly? hasta = null, CancellationToken ct = default);
    /// <summary>Devuelve la medición con sus tratamientos y plan, rastreada para poder actualizarla.</summary>
    Task<Medicion?> ObtenerAsync(string clienteId, DateOnly fecha, CancellationToken ct = default);
    /// <summary>Guarda medición, tratamientos y plan en una única operación atómica.</summary>
    Task AgregarAsync(Medicion medicion, CancellationToken ct = default);
    Task ActualizarAsync(Medicion medicion, CancellationToken ct = default);
}
