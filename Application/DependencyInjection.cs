using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace NutriTrack.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<Services.ServicioCliente>();
        services.AddScoped<Services.ServicioMedicion>();
        return services;
    }
}
