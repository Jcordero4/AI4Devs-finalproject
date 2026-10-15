using FluentValidation;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Application.Services;
using NutriTrack.Application.Validators;
using NutriTrack.Domain.Entities;
using NutriTrack.Domain.Enums;

namespace NutriTrack.Tests.Unit;

public class MedicionUnitTests
{
    private static readonly DateOnly Hoy = DateOnly.FromDateTime(DateTime.Today);

    private static GuardarMedicionDto Valido() => new(
        70.5m, 20m, 35m, 55m, 8m, 24.2m,
        [new TratamientoEntradaDto("Omega 3", "1 cápsula al día")],
        new PlanNutricionalDto(2, 3, 4, 2, 5, 1, 8));

    // --- Dominio ---

    [Fact]
    public void PlanNutricional_PorcionesPorDefectoEnCero()
    {
        var plan = new PlanNutricional { ClienteId = "C1" };

        Assert.Equal(0, plan.Lacteo + plan.Fruta + plan.Vegetales + plan.Harinas + plan.Proteina + plan.Grasa + plan.Agua);
    }

    [Fact]
    public void ReemplazarTratamientos_AsignaSecuenciaPorFila()
    {
        var medicion = new Medicion { ClienteId = "C1", FechaMedicion = Hoy };

        medicion.ReemplazarTratamientos([("A", "1"), ("B", "2"), ("C", "3")]);

        Assert.Equal([1, 2, 3], medicion.Tratamientos.Select(t => t.Secuencia));
        Assert.Equal(["A", "B", "C"], medicion.Tratamientos.Select(t => t.Producto));
    }

    [Fact]
    public void ReemplazarTratamientos_ActualizaExistentesYQuitaSobrantes()
    {
        var medicion = new Medicion { ClienteId = "C1", FechaMedicion = Hoy };
        medicion.ReemplazarTratamientos([("A", "1"), ("B", "2"), ("C", "3")]);

        medicion.ReemplazarTratamientos([("X", "9")]);

        var unico = Assert.Single(medicion.Tratamientos);
        Assert.Equal(1, unico.Secuencia);
        Assert.Equal("X", unico.Producto);
    }

    // --- Validadores ---

    [Fact]
    public void Validador_AceptaDatosValidos() =>
        Assert.True(new GuardarMedicionDtoValidator().Validate(Valido()).IsValid);

    [Fact]
    public void Validador_RechazaFaltantes() =>
        Assert.False(new GuardarMedicionDtoValidator().Validate(new GuardarMedicionDto(null, null, null, null, null, null, null, null)).IsValid);

    [Theory]
    [InlineData(0)]
    [InlineData(-1.5)]
    public void Validador_RechazaValoresNoPositivos(double valor)
    {
        var v = (decimal)valor;
        var validador = new GuardarMedicionDtoValidator();

        Assert.False(validador.Validate(Valido() with { Peso = v }).IsValid);
        Assert.False(validador.Validate(Valido() with { Grasa = v }).IsValid);
        Assert.False(validador.Validate(Valido() with { MasaMuscular = v }).IsValid);
        Assert.False(validador.Validate(Valido() with { Agua = v }).IsValid);
        Assert.False(validador.Validate(Valido() with { GrasaVisceral = v }).IsValid);
        Assert.False(validador.Validate(Valido() with { Imc = v }).IsValid);
    }

    [Fact]
    public void Validador_RechazaTratamientoIncompletoOLargo()
    {
        var validador = new GuardarMedicionDtoValidator();

        Assert.False(validador.Validate(Valido() with { Tratamientos = [new TratamientoEntradaDto("", "x")] }).IsValid);
        Assert.False(validador.Validate(Valido() with { Tratamientos = [new TratamientoEntradaDto("x", " ")] }).IsValid);
        Assert.False(validador.Validate(Valido() with { Tratamientos = [new TratamientoEntradaDto(new string('a', 51), "x")] }).IsValid);
        Assert.False(validador.Validate(Valido() with { Tratamientos = [new TratamientoEntradaDto("x", new string('a', 151))] }).IsValid);
    }

    [Fact]
    public void Validador_RechazaPlanFaltanteOConPorcionNegativa()
    {
        var validador = new GuardarMedicionDtoValidator();

        Assert.False(validador.Validate(Valido() with { Plan = null }).IsValid);
        Assert.False(validador.Validate(Valido() with { Plan = new PlanNutricionalDto(2, 3, 4, 2, null, 1, 8) }).IsValid);
        Assert.False(validador.Validate(Valido() with { Plan = new PlanNutricionalDto(-1, 3, 4, 2, 5, 1, 8) }).IsValid);
    }

    // --- Servicio ---

    private sealed class RepoMedicionFalso : IRepositorioMedicion
    {
        public List<Medicion> Datos { get; } = [];
        public int Guardados { get; private set; }

        public Task<bool> ExisteAsync(string clienteId, DateOnly fecha, CancellationToken ct = default) =>
            Task.FromResult(Datos.Any(m => m.ClienteId == clienteId && m.FechaMedicion == fecha));

        public Task<IReadOnlyList<Medicion>> ListarAsync(string clienteId, CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<Medicion>>(Datos.Where(m => m.ClienteId == clienteId).ToList());

        public Task<Medicion?> ObtenerAsync(string clienteId, DateOnly fecha, CancellationToken ct = default) =>
            Task.FromResult(Datos.FirstOrDefault(m => m.ClienteId == clienteId && m.FechaMedicion == fecha));

        public Task AgregarAsync(Medicion medicion, CancellationToken ct = default)
        {
            Datos.Add(medicion);
            Guardados++;
            return Task.CompletedTask;
        }

        public Task ActualizarAsync(Medicion medicion, CancellationToken ct = default)
        {
            Guardados++;
            return Task.CompletedTask;
        }
    }

    private sealed class RepoClienteFalso(params string[] ids) : IRepositorioCliente
    {
        public Task<bool> ExisteAsync(string id, CancellationToken ct = default) => Task.FromResult(ids.Contains(id));
        public Task<Cliente?> ObtenerAsync(string id, CancellationToken ct = default) =>
            Task.FromResult<Cliente?>(ids.Contains(id) ? new Cliente { Id = id, Nombre = "N", Genero = Genero.F } : null);
        public Task<(IReadOnlyList<Cliente> Items, int Total)> ListarAsync(string? nombre, string? id, int pagina, int tamanoPagina, CancellationToken ct = default) =>
            Task.FromResult<(IReadOnlyList<Cliente>, int)>(([], 0));
        public Task AgregarAsync(Cliente cliente, CancellationToken ct = default) => Task.CompletedTask;
        public Task ActualizarAsync(Cliente cliente, CancellationToken ct = default) => Task.CompletedTask;
    }

    private static ServicioMedicion CrearServicio(RepoMedicionFalso repo) =>
        new(repo, new RepoClienteFalso("C1"), new GuardarMedicionDtoValidator());

    [Fact]
    public async Task Servicio_Crear_AsignaFechaActualYSecuencias()
    {
        var repo = new RepoMedicionFalso();
        var dto = Valido() with
        {
            Tratamientos = [new TratamientoEntradaDto("A", "1"), new TratamientoEntradaDto("B", "2")]
        };

        var resultado = await CrearServicio(repo).CrearAsync("C1", dto);

        Assert.Equal(Hoy, resultado.FechaMedicion);
        Assert.Equal([1, 2], resultado.Tratamientos.Select(t => t.Secuencia));
        Assert.Equal(5, resultado.Plan.Proteina);
        Assert.Equal(1, repo.Guardados);
    }

    [Fact]
    public async Task Servicio_Crear_ClienteInexistente_Lanza404() =>
        await Assert.ThrowsAsync<NoEncontradoException>(() => CrearServicio(new RepoMedicionFalso()).CrearAsync("NO", Valido()));

    [Fact]
    public async Task Servicio_Crear_MedicionDelDiaExistente_Lanza409()
    {
        var servicio = CrearServicio(new RepoMedicionFalso());
        await servicio.CrearAsync("C1", Valido());

        await Assert.ThrowsAsync<ConflictoException>(() => servicio.CrearAsync("C1", Valido()));
    }

    [Fact]
    public async Task Servicio_Crear_DatosInvalidos_NoGuarda()
    {
        var repo = new RepoMedicionFalso();

        await Assert.ThrowsAsync<ValidationException>(() => CrearServicio(repo).CrearAsync("C1", Valido() with { Peso = 0 }));

        Assert.Equal(0, repo.Guardados);
    }

    [Fact]
    public async Task Servicio_Actualizar_DelDia_ActualizaElMismoRegistro()
    {
        var repo = new RepoMedicionFalso();
        var servicio = CrearServicio(repo);
        await servicio.CrearAsync("C1", Valido());

        var resultado = await servicio.ActualizarAsync("C1", Hoy, Valido() with { Peso = 80m, Tratamientos = [] });

        Assert.Equal(80m, resultado.Peso);
        Assert.Empty(resultado.Tratamientos);
        Assert.Single(repo.Datos);
    }

    [Fact]
    public async Task Servicio_Actualizar_FechaHistorica_Lanza409()
    {
        var repo = new RepoMedicionFalso();
        var ayer = Hoy.AddDays(-1);
        repo.Datos.Add(new Medicion { ClienteId = "C1", FechaMedicion = ayer });

        await Assert.ThrowsAsync<ConflictoException>(() => CrearServicio(repo).ActualizarAsync("C1", ayer, Valido()));
    }

    [Fact]
    public async Task Servicio_Actualizar_SinMedicionDelDia_Lanza404() =>
        await Assert.ThrowsAsync<NoEncontradoException>(() => CrearServicio(new RepoMedicionFalso()).ActualizarAsync("C1", Hoy, Valido()));

    [Fact]
    public async Task Servicio_Listar_OrdenaDeMasRecienteAMasAntigua()
    {
        var repo = new RepoMedicionFalso();
        repo.Datos.Add(new Medicion { ClienteId = "C1", FechaMedicion = Hoy.AddDays(-10) });
        repo.Datos.Add(new Medicion { ClienteId = "C1", FechaMedicion = Hoy });
        repo.Datos.Add(new Medicion { ClienteId = "C1", FechaMedicion = Hoy.AddDays(-3) });

        var lista = await CrearServicio(repo).ListarAsync("C1");

        Assert.Equal([Hoy, Hoy.AddDays(-3), Hoy.AddDays(-10)], lista.Select(m => m.FechaMedicion));
    }
}
