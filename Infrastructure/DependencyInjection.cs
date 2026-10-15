using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NutriTrack.Infrastructure.Persistence;

namespace NutriTrack.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta ConnectionStrings:DefaultConnection.");

        services.AddDbContext<NutriTrackDbContext>(options =>
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0))));

        services.AddScoped<Application.Interfaces.IRepositorioCliente, Repositories.RepositorioCliente>();
        services.AddScoped<Application.Interfaces.IRepositorioMedicion, Repositories.RepositorioMedicion>();

        return services;
    }
}
