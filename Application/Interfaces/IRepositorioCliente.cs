using NutriTrack.Domain.Entities;

namespace NutriTrack.Application.Interfaces;

public interface IRepositorioCliente
{
    Task<bool> ExisteAsync(string id, CancellationToken ct = default);
    Task<Cliente?> ObtenerAsync(string id, CancellationToken ct = default);
    Task<(IReadOnlyList<Cliente> Items, int Total)> ListarAsync(string? nombre, string? id, int pagina, int tamanoPagina, CancellationToken ct = default);
    Task AgregarAsync(Cliente cliente, CancellationToken ct = default);
    Task ActualizarAsync(Cliente cliente, CancellationToken ct = default);
}
