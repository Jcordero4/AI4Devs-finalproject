using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NutriTrack.Application.DTOs;
using NutriTrack.Domain.Entities;
using NutriTrack.Infrastructure.Persistence;

namespace NutriTrack.Tests.Integration;

public class MedicionApiTests : IClassFixture<ClienteApiTests.Fabrica>
{
    private static readonly DateOnly Hoy = DateOnly.FromDateTime(DateTime.Today);

    private readonly ClienteApiTests.Fabrica _fabrica;
    private readonly HttpClient _http;

    public MedicionApiTests(ClienteApiTests.Fabrica fabrica)
    {
        _fabrica = fabrica;
        _http = fabrica.CreateClient();
    }

    private async Task<string> CrearClienteAsync(string id)
    {
        var r = await _http.PostAsJsonAsync("/api/clientes", new CrearClienteDto(id, "Cliente " + id, new DateOnly(1990, 5, 20), "F", 165, null, null));
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return id;
    }

    private static GuardarMedicionDto Valido() => new(
        70.5m, 20m, 35m, 55m, 8m, 24.2m,
        [new TratamientoEntradaDto("Omega 3", "1 al día"), new TratamientoEntradaDto("Vitamina D", "2 al día")],
        new PlanNutricionalDto(2, 3, 4, 2, 5, 1, 8));

    private static string Ruta(string clienteId) => $"/api/clientes/{clienteId}/mediciones";

    [Fact]
    public async Task Alta_GuardaMedicionTratamientosYPlan()
    {
        var id = await CrearClienteAsync("M-ALTA");

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), Valido());

        Assert.Equal(HttpStatusCode.Created, respuesta.StatusCode);
        var creada = await respuesta.Content.ReadFromJsonAsync<MedicionDto>();
        Assert.Equal(Hoy, creada!.FechaMedicion);
        Assert.Equal([1, 2], creada.Tratamientos.Select(t => t.Secuencia));
        Assert.Equal(5, creada.Plan.Proteina);

        var detalle = await _http.GetFromJsonAsync<MedicionDto>($"{Ruta(id)}/{Hoy:yyyy-MM-dd}");
        Assert.Equal(2, detalle!.Tratamientos.Count);
        Assert.Equal(8, detalle.Plan.Agua);
    }

    [Fact]
    public async Task Alta_IgnoraFechaEnviada()
    {
        var id = await CrearClienteAsync("M-FECHA");

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), new { Valido().Peso, Valido().Grasa, Valido().MasaMuscular, Valido().Agua, Valido().GrasaVisceral, Valido().Imc, Valido().Tratamientos, Valido().Plan, FechaMedicion = "2000-01-01" });

        var creada = await respuesta.Content.ReadFromJsonAsync<MedicionDto>();
        Assert.Equal(Hoy, creada!.FechaMedicion);
    }

    [Fact]
    public async Task Alta_ClienteInexistente_Devuelve404()
    {
        var respuesta = await _http.PostAsJsonAsync(Ruta("NO-EXISTE"), Valido());

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task Alta_MedicionDelDiaExistente_Devuelve409()
    {
        var id = await CrearClienteAsync("M-DUP");
        await _http.PostAsJsonAsync(Ruta(id), Valido());

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), Valido());

        Assert.Equal(HttpStatusCode.Conflict, respuesta.StatusCode);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public async Task Alta_ValorNoPositivo_Devuelve400YNoGuarda(double peso)
    {
        var id = await CrearClienteAsync("M-NEG" + (peso == 0 ? "0" : "N"));

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), Valido() with { Peso = (decimal)peso });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));
        Assert.Empty(lista!);
    }

    [Fact]
    public async Task Alta_TratamientoIncompleto_Devuelve400YNoGuardaNingunBloque()
    {
        var id = await CrearClienteAsync("M-ATOM");

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), Valido() with { Tratamientos = [new TratamientoEntradaDto("Omega", "")] });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));
        Assert.Empty(lista!);
    }

    [Fact]
    public async Task Alta_PlanFaltante_Devuelve400()
    {
        var id = await CrearClienteAsync("M-PLAN");

        var respuesta = await _http.PostAsJsonAsync(Ruta(id), Valido() with { Plan = null });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
    }

    [Fact]
    public async Task Historico_OrdenadoDeMasRecienteAMasAntigua()
    {
        var id = await CrearClienteAsync("M-HIST");
        using (var scope = _fabrica.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NutriTrackDbContext>();
            foreach (var dias in new[] { -20, -5, -40 })
            {
                db.Set<Medicion>().Add(new Medicion { ClienteId = id, FechaMedicion = Hoy.AddDays(dias), Peso = 70 });
            }
            await db.SaveChangesAsync();
        }
        await _http.PostAsJsonAsync(Ruta(id), Valido());

        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));

        Assert.Equal([Hoy, Hoy.AddDays(-5), Hoy.AddDays(-20), Hoy.AddDays(-40)], lista!.Select(m => m.FechaMedicion));
    }

    private async Task<string> CrearClienteConHistorialAsync(string id)
    {
        await CrearClienteAsync(id);
        using var scope = _fabrica.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NutriTrackDbContext>();
        foreach (var dias in new[] { -40, -20, -10, -5, 0 })
        {
            db.Set<Medicion>().Add(new Medicion { ClienteId = id, FechaMedicion = Hoy.AddDays(dias), Peso = 70 + dias });
        }
        await db.SaveChangesAsync();
        return id;
    }

    private static string Fecha(int dias) => Hoy.AddDays(dias).ToString("yyyy-MM-dd");

    [Fact]
    public async Task Historico_SinParametros_DevuelveTodo()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG-TODO");

        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));

        Assert.Equal(5, lista!.Count);
    }

    [Fact]
    public async Task Historico_ConRango_DevuelveSoloElRangoInclusivoOrdenado()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG");

        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>($"{Ruta(id)}?desde={Fecha(-20)}&hasta={Fecha(-5)}");

        Assert.Equal([Hoy.AddDays(-5), Hoy.AddDays(-10), Hoy.AddDays(-20)], lista!.Select(m => m.FechaMedicion));
    }

    [Fact]
    public async Task Historico_ConUnSoloExtremo_FiltraPorEseExtremo()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG-UNO");

        var soloDesde = await _http.GetFromJsonAsync<List<MedicionResumenDto>>($"{Ruta(id)}?desde={Fecha(-10)}");
        var soloHasta = await _http.GetFromJsonAsync<List<MedicionResumenDto>>($"{Ruta(id)}?hasta={Fecha(-20)}");

        Assert.Equal([Hoy, Hoy.AddDays(-5), Hoy.AddDays(-10)], soloDesde!.Select(m => m.FechaMedicion));
        Assert.Equal([Hoy.AddDays(-20), Hoy.AddDays(-40)], soloHasta!.Select(m => m.FechaMedicion));
    }

    [Fact]
    public async Task Historico_RangoSinMediciones_Devuelve200ConArregloVacio()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG-VACIO");

        var respuesta = await _http.GetAsync($"{Ruta(id)}?desde={Fecha(-100)}&hasta={Fecha(-90)}");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        Assert.Empty((await respuesta.Content.ReadFromJsonAsync<List<MedicionResumenDto>>())!);
    }

    [Fact]
    public async Task Historico_RangoInvertido_Devuelve400ConErrorEnDesde()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG-INV");

        var respuesta = await _http.GetAsync($"{Ruta(id)}?desde={Fecha(0)}&hasta={Fecha(-5)}");

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
        Assert.Equal("application/problem+json", respuesta.Content.Headers.ContentType?.MediaType);
        Assert.Contains("\"desde\"", await respuesta.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Historico_FechaConFormatoInvalido_Devuelve400()
    {
        var id = await CrearClienteConHistorialAsync("M-RNG-FMT");

        var respuesta = await _http.GetAsync($"{Ruta(id)}?desde=ayer");

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
    }

    [Fact]
    public async Task Historico_ClienteInexistenteConRango_Devuelve404()
    {
        var respuesta = await _http.GetAsync($"{Ruta("NO-EXISTE")}?desde={Fecha(-5)}&hasta={Fecha(0)}");

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task Historico_ClienteInexistente_Devuelve404()
    {
        var respuesta = await _http.GetAsync(Ruta("NO-EXISTE"));

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task Detalle_Inexistente_Devuelve404()
    {
        var id = await CrearClienteAsync("M-DET");

        var respuesta = await _http.GetAsync($"{Ruta(id)}/2000-01-01");

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task Actualizacion_DelDia_ReemplazaMedicionTratamientosYPlan()
    {
        var id = await CrearClienteAsync("M-PUT");
        await _http.PostAsJsonAsync(Ruta(id), Valido());
        var cambio = Valido() with
        {
            Peso = 68m,
            Tratamientos = [new TratamientoEntradaDto("Solo uno", "3 al día")],
            Plan = new PlanNutricionalDto(1, 1, 1, 1, 1, 1, 1)
        };

        var respuesta = await _http.PutAsJsonAsync($"{Ruta(id)}/{Hoy:yyyy-MM-dd}", cambio);

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));
        Assert.Single(lista!);
        var detalle = await _http.GetFromJsonAsync<MedicionDto>($"{Ruta(id)}/{Hoy:yyyy-MM-dd}");
        Assert.Equal(68m, detalle!.Peso);
        var tratamiento = Assert.Single(detalle.Tratamientos);
        Assert.Equal("Solo uno", tratamiento.Producto);
        Assert.Equal(1, detalle.Plan.Lacteo);
    }

    [Fact]
    public async Task Actualizacion_FechaHistorica_SeRechazaYNoCambia()
    {
        var id = await CrearClienteAsync("M-HPUT");
        var ayer = Hoy.AddDays(-1);
        using (var scope = _fabrica.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NutriTrackDbContext>();
            db.Set<Medicion>().Add(new Medicion { ClienteId = id, FechaMedicion = ayer, Peso = 70 });
            await db.SaveChangesAsync();
        }

        var respuesta = await _http.PutAsJsonAsync($"{Ruta(id)}/{ayer:yyyy-MM-dd}", Valido());

        Assert.Equal(HttpStatusCode.Conflict, respuesta.StatusCode);
        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));
        Assert.Equal(70m, lista!.Single().Peso);
    }

    [Fact]
    public async Task Actualizacion_SinMedicionDelDia_Devuelve404()
    {
        var id = await CrearClienteAsync("M-NOPUT");

        var respuesta = await _http.PutAsJsonAsync($"{Ruta(id)}/{Hoy:yyyy-MM-dd}", Valido());

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task SinEliminacion_DeleteNoEstaPermitido()
    {
        var id = await CrearClienteAsync("M-DEL");
        await _http.PostAsJsonAsync(Ruta(id), Valido());

        var respuesta = await _http.DeleteAsync($"{Ruta(id)}/{Hoy:yyyy-MM-dd}");

        Assert.True(respuesta.StatusCode is HttpStatusCode.MethodNotAllowed or HttpStatusCode.NotFound);
        var lista = await _http.GetFromJsonAsync<List<MedicionResumenDto>>(Ruta(id));
        Assert.Single(lista!);
    }
}
