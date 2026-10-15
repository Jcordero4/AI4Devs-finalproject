using Microsoft.EntityFrameworkCore;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Domain.Entities;
using NutriTrack.Infrastructure.Persistence;

namespace NutriTrack.Infrastructure.Repositories;

public class RepositorioMedicion(NutriTrackDbContext db) : IRepositorioMedicion
{
    public Task<bool> ExisteAsync(string clienteId, DateOnly fecha, CancellationToken ct = default) =>
        db.Set<Medicion>().AnyAsync(m => m.ClienteId == clienteId && m.FechaMedicion == fecha, ct);

    public async Task<IReadOnlyList<Medicion>> ListarAsync(string clienteId, CancellationToken ct = default) =>
        await db.Set<Medicion>().AsNoTracking()
            .Where(m => m.ClienteId == clienteId)
            .OrderByDescending(m => m.FechaMedicion)
            .ToListAsync(ct);

    public Task<Medicion?> ObtenerAsync(string clienteId, DateOnly fecha, CancellationToken ct = default) =>
        db.Set<Medicion>()
            .Include(m => m.Tratamientos)
            .Include(m => m.Plan)
            .FirstOrDefaultAsync(m => m.ClienteId == clienteId && m.FechaMedicion == fecha, ct);

    public async Task AgregarAsync(Medicion medicion, CancellationToken ct = default)
    {
        db.Set<Medicion>().Add(medicion);
        try
        {
            // Un único SaveChanges: EF Core persiste medición, tratamientos y plan en una sola transacción.
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            db.Entry(medicion).State = EntityState.Detached;
            if (await ExisteAsync(medicion.ClienteId, medicion.FechaMedicion, ct))
            {
                throw new ConflictoException("Ya existe una medición de este cliente para la fecha actual.");
            }
            throw;
        }
    }

    public Task ActualizarAsync(Medicion medicion, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
