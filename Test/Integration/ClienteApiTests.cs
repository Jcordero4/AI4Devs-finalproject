using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NutriTrack.Application.DTOs;
using NutriTrack.Infrastructure.Persistence;

namespace NutriTrack.Tests.Integration;

public class ClienteApiTests : IClassFixture<ClienteApiTests.Fabrica>
{
    public class Fabrica : WebApplicationFactory<Program>
    {
        private readonly string _bd = Guid.NewGuid().ToString();

        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder) =>
            builder.ConfigureServices(services =>
            {
                var existentes = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<NutriTrackDbContext>) ||
                    d.ServiceType.FullName!.Contains("IDbContextOptionsConfiguration")).ToList();
                foreach (var d in existentes) services.Remove(d);
                services.AddDbContext<NutriTrackDbContext>(o => o.UseInMemoryDatabase(_bd));
            });
    }

    private readonly HttpClient _http;

    public ClienteApiTests(Fabrica fabrica) => _http = fabrica.CreateClient();

    private static CrearClienteDto Nuevo(string id, string nombre) =>
        new(id, nombre, new DateOnly(1990, 5, 20), "M", 175, null);

    [Fact]
    public async Task Alta_Exitosa_DevuelveCreatedConDefaults()
    {
        var respuesta = await _http.PostAsJsonAsync("/api/clientes", Nuevo("A-001", "Zoe"));

        Assert.Equal(HttpStatusCode.Created, respuesta.StatusCode);
        var cliente = await respuesta.Content.ReadFromJsonAsync<ClienteDto>();
        Assert.True(cliente!.Activo);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), cliente.FechaIngreso);
        Assert.True(cliente.Edad >= 35);
    }

    [Fact]
    public async Task Alta_IdDuplicado_Devuelve409()
    {
        await _http.PostAsJsonAsync("/api/clientes", Nuevo("DUP-1", "Uno"));

        var respuesta = await _http.PostAsJsonAsync("/api/clientes", Nuevo("DUP-1", "Otro"));

        Assert.Equal(HttpStatusCode.Conflict, respuesta.StatusCode);
    }

    [Fact]
    public async Task Alta_EmailInvalido_Devuelve400()
    {
        var respuesta = await _http.PostAsJsonAsync("/api/clientes", Nuevo("E-1", "Mail") with { Email = "malo" });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
    }

    [Fact]
    public async Task Alta_SinObligatorios_Devuelve400()
    {
        var respuesta = await _http.PostAsJsonAsync("/api/clientes", new { Id = "X-1" });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
    }

    [Fact]
    public async Task Edicion_ActualizaYMantieneId()
    {
        await _http.PostAsJsonAsync("/api/clientes", Nuevo("ED-1", "Antes"));

        var respuesta = await _http.PutAsJsonAsync("/api/clientes/ED-1", new EditarClienteDto("Despues", new DateOnly(1985, 1, 1), "F", 160, "a@b.com"));

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        var cliente = await _http.GetFromJsonAsync<ClienteDto>("/api/clientes/ED-1");
        Assert.Equal("Despues", cliente!.Nombre);
        Assert.Equal("ED-1", cliente.Id);
    }

    [Fact]
    public async Task ClienteInexistente_Devuelve404()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await _http.GetAsync("/api/clientes/NOEXISTE")).StatusCode);
        var put = await _http.PutAsJsonAsync("/api/clientes/NOEXISTE", new EditarClienteDto("X", new DateOnly(1985, 1, 1), "F", 160, null));
        Assert.Equal(HttpStatusCode.NotFound, put.StatusCode);
    }

    [Fact]
    public async Task Listado_OrdenaPorNombre_FiltraYPagina()
    {
        for (var i = 0; i < 27; i++)
        {
            await _http.PostAsJsonAsync("/api/clientes", Nuevo($"L-{i:00}", $"Lista {i:00}"));
        }

        var pagina1 = await _http.GetFromJsonAsync<ResultadoPaginadoDto<ClienteListadoDto>>("/api/clientes?nombre=Lista");
        var pagina2 = await _http.GetFromJsonAsync<ResultadoPaginadoDto<ClienteListadoDto>>("/api/clientes?nombre=Lista&pagina=2");
        var porId = await _http.GetFromJsonAsync<ResultadoPaginadoDto<ClienteListadoDto>>("/api/clientes?id=L-05");

        Assert.Equal(25, pagina1!.Items.Count);
        Assert.Equal(27, pagina1.Total);
        Assert.Equal(2, pagina2!.Items.Count);
        Assert.Equal(pagina1.Items.Select(c => c.Nombre).Order().ToList(), pagina1.Items.Select(c => c.Nombre).ToList());
        Assert.Single(porId!.Items);
    }

    [Fact]
    public async Task Delete_NoSoportado()
    {
        await _http.PostAsJsonAsync("/api/clientes", Nuevo("DEL-1", "Borrar"));

        var respuesta = await _http.DeleteAsync("/api/clientes/DEL-1");

        Assert.Equal(HttpStatusCode.MethodNotAllowed, respuesta.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _http.GetAsync("/api/clientes/DEL-1")).StatusCode);
    }
}
