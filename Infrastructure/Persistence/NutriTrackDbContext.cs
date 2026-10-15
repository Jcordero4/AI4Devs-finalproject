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
            e.Property(c => c.Telefono).HasMaxLength(15);
            e.Property(c => c.Email).HasMaxLength(320);
            e.Ignore(c => c.Edad);
            e.HasIndex(c => c.Nombre);
        });

        modelBuilder.Entity<Medicion>(e =>
        {
            e.ToTable("Mediciones");
            e.HasKey(m => new { m.ClienteId, m.FechaMedicion });
            e.Property(m => m.ClienteId).HasMaxLength(15);
            e.Property(m => m.Peso).HasPrecision(10, 2);
            e.Property(m => m.Grasa).HasPrecision(10, 2);
            e.Property(m => m.MasaMuscular).HasPrecision(10, 2);
            e.Property(m => m.Agua).HasPrecision(10, 2);
            e.Property(m => m.GrasaVisceral).HasPrecision(10, 2);
            e.Property(m => m.Imc).HasPrecision(10, 2);
            e.HasOne<Cliente>().WithMany().HasForeignKey(m => m.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(m => m.Tratamientos).WithOne()
                .HasForeignKey(t => new { t.ClienteId, t.FechaMedicion }).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Plan).WithOne()
                .HasForeignKey<PlanNutricional>(p => new { p.ClienteId, p.FechaMedicion }).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Tratamiento>(e =>
        {
            e.ToTable("Tratamientos");
            e.HasKey(t => new { t.ClienteId, t.FechaMedicion, t.Secuencia });
            e.Property(t => t.ClienteId).HasMaxLength(15);
            e.Property(t => t.Secuencia).ValueGeneratedNever();
            e.Property(t => t.Producto).HasMaxLength(50).IsRequired();
            e.Property(t => t.Dosis).HasMaxLength(150).IsRequired();
        });

        modelBuilder.Entity<PlanNutricional>(e =>
        {
            e.ToTable("PlanesNutricionales");
            e.HasKey(p => new { p.ClienteId, p.FechaMedicion });
            e.Property(p => p.ClienteId).HasMaxLength(15);
        });
    }
}
