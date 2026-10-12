using FluentValidation;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Application.Services;
using NutriTrack.Application.Validators;
using NutriTrack.Domain.Entities;

namespace NutriTrack.Tests.Unit;

public class ClienteUnitTests
{
    [Theory]
    [InlineData("1990-06-15", "2026-06-14", 35)]
    [InlineData("1990-06-15", "2026-06-15", 36)]
    [InlineData("2026-01-01", "2026-06-15", 0)]
    [InlineData("2030-01-01", "2026-06-15", 0)]
    public void CalcularEdad_DerivaDeFechaNacimiento(string nacimiento, string hoy, int esperado)
    {
        var edad = Cliente.CalcularEdad(DateOnly.Parse(nacimiento), DateOnly.Parse(hoy));

        Assert.Equal(esperado, edad);
    }

    private static CrearClienteDto Valido() =>
        new("123", "Ana", new DateOnly(1990, 1, 1), "F", 165, null);

    [Fact]
    public void ValidadorCrear_AceptaDatosValidos() =>
        Assert.True(new CrearClienteDtoValidator().Validate(Valido()).IsValid);

    [Fact]
    public void ValidadorCrear_RechazaFaltantes() =>
        Assert.False(new CrearClienteDtoValidator().Validate(new CrearClienteDto(null, null, null, null, null, null)).IsValid);

    [Theory]
    [InlineData("sin-arroba")]
    [InlineData("a@b")]
    public void ValidadorCrear_RechazaEmailInvalido(string email) =>
        Assert.False(new CrearClienteDtoValidator().Validate(Valido() with { Email = email }).IsValid);

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void ValidadorCrear_RechazaAlturaNoPositiva(int altura) =>
        Assert.False(new CrearClienteDtoValidator().Validate(Valido() with { Altura = altura }).IsValid);

    [Fact]
    public void ValidadorCrear_RechazaGeneroInvalidoYFechaFutura()
    {
        var validador = new CrearClienteDtoValidator();
        Assert.False(validador.Validate(Valido() with { Genero = "X" }).IsValid);
        Assert.False(validador.Validate(Valido() with { FechaNacimiento = DateOnly.FromDateTime(DateTime.Today).AddDays(1) }).IsValid);
    }

    [Fact]
    public async Task Servicio_Crear_AsignaFechaIngresoYActivo()
    {
        var repo = new RepoFalso();
        var servicio = CrearServicio(repo);

        var creado = await servicio.CrearAsync(Valido());

        Assert.True(creado.Activo);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), creado.FechaIngreso);
        Assert.Single(repo.Datos);
    }

    [Fact]
    public async Task Servicio_Crear_IdDuplicado_LanzaConflicto()
    {
        var servicio = CrearServicio(new RepoFalso());
        await servicio.CrearAsync(Valido());

        await Assert.ThrowsAsync<ConflictoException>(() => servicio.CrearAsync(Valido()));
    }

    [Fact]
    public async Task Servicio_Editar_NoModificaIdNiActivo_YLanza404SiNoExiste()
    {
        var servicio = CrearServicio(new RepoFalso());
        await servicio.CrearAsync(Valido());

        var editado = await servicio.EditarAsync("123", new EditarClienteDto("Ana María", new DateOnly(1991, 2, 2), "F", 170, "ana@correo.com"));

        Assert.Equal("123", editado.Id);
        Assert.True(editado.Activo);
        Assert.Equal("Ana María", editado.Nombre);
        await Assert.ThrowsAsync<NoEncontradoException>(() =>
            servicio.EditarAsync("999", new EditarClienteDto("X", new DateOnly(1991, 2, 2), "M", 170, null)));
    }

    private static ServicioCliente CrearServicio(IRepositorioCliente repo) =>
        new(repo, new CrearClienteDtoValidator(), new EditarClienteDtoValidator());

    private sealed class RepoFalso : IRepositorioCliente
    {
        public List<Cliente> Datos { get; } = [];
        public Task<bool> ExisteAsync(string id, CancellationToken ct = default) => Task.FromResult(Datos.Any(c => c.Id == id));
        public Task<Cliente?> ObtenerAsync(string id, CancellationToken ct = default) => Task.FromResult(Datos.FirstOrDefault(c => c.Id == id));
        public Task<(IReadOnlyList<Cliente> Items, int Total)> ListarAsync(string? nombre, string? id, int pagina, int tamanoPagina, CancellationToken ct = default) =>
            Task.FromResult(((IReadOnlyList<Cliente>)Datos, Datos.Count));
        public Task AgregarAsync(Cliente cliente, CancellationToken ct = default) { Datos.Add(cliente); return Task.CompletedTask; }
        public Task ActualizarAsync(Cliente cliente, CancellationToken ct = default) => Task.CompletedTask;
    }
}
