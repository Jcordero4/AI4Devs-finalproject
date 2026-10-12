using Microsoft.EntityFrameworkCore;
using NutriTrack.Domain.Entities;
using NutriTrack.Domain.Enums;

namespace NutriTrack.Infrastructure.Persistence;

public class NutriTrackDbContext(DbContextOptions<NutriTrackDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("Clientes");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasMaxLength(15);
            e.Property(c => c.Nombre).HasMaxLength(50).IsRequired();
            e.Property(c => c.Genero)
                .HasConversion(g => g.ToString(), s => Enum.Parse<Genero>(s))
                .HasMaxLength(1).IsFixedLength().IsRequired();
            e.Property(c => c.Email).HasMaxLength(320);
            e.Ignore(c => c.Edad);
            e.HasIndex(c => c.Nombre);
        });
    }
}
