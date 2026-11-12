using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using NutriTrack.Application;
using NutriTrack.Infrastructure;
using NutriTrack.Infrastructure.Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration).WriteTo.Console());

builder.Services.AddControllers();
builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o => o.SwaggerDoc("v1", new() { Title = "NutriTrack API", Version = "v1" }));
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Render termina TLS en su proxy: respetar X-Forwarded-* y no redirigir a HTTPS dentro del contenedor.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    KnownNetworks = { },
    KnownProxies = { }
});

if (app.Configuration.GetValue<bool>("Database:MigrarAlIniciar"))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<NutriTrackDbContext>().Database.Migrate();
}

app.UseSerilogRequestLogging();
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors();
app.UseMiddleware<NutriTrack.API.Middleware.ManejoErroresMiddleware>();
app.MapHealthChecks("/health");
app.MapControllers();

app.Run();

public partial class Program;
