using Microsoft.EntityFrameworkCore;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Domain.Entities;
using NutriTrack.Infrastructure.Persistence;

namespace NutriTrack.Infrastructure.Repositories;

public class RepositorioCliente(NutriTrackDbContext db) : IRepositorioCliente
{
    public Task<bool> ExisteAsync(string id, CancellationToken ct = default) =>
        db.Clientes.AnyAsync(c => c.Id == id, ct);

    public Task<Cliente?> ObtenerAsync(string id, CancellationToken ct = default) =>
        db.Clientes.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<(IReadOnlyList<Cliente> Items, int Total)> ListarAsync(
        string? nombre, string? id, int pagina, int tamanoPagina, CancellationToken ct = default)
    {
        var consulta = db.Clientes.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(nombre))
        {
            consulta = consulta.Where(c => c.Nombre.Contains(nombre));
        }
        if (!string.IsNullOrWhiteSpace(id))
        {
            consulta = consulta.Where(c => c.Id.Contains(id));
        }

        var total = await consulta.CountAsync(ct);
        var items = await consulta.OrderBy(c => c.Nombre).ThenBy(c => c.Id)
            .Skip((pagina - 1) * tamanoPagina).Take(tamanoPagina).ToListAsync(ct);
        return (items, total);
    }

    public async Task AgregarAsync(Cliente cliente, CancellationToken ct = default)
    {
        db.Clientes.Add(cliente);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            db.Entry(cliente).State = EntityState.Detached;
            if (await db.Clientes.AsNoTracking().AnyAsync(c => c.Id == cliente.Id, ct))
            {
                throw new ConflictoException("El Id ya está registrado.");
            }
            throw;
        }
    }

    public Task ActualizarAsync(Cliente cliente, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
