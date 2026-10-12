using FluentValidation;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Domain.Entities;
using NutriTrack.Domain.Enums;

namespace NutriTrack.Application.Services;

public class ServicioCliente(
    IRepositorioCliente repositorio,
    IValidator<CrearClienteDto> validadorCrear,
    IValidator<EditarClienteDto> validadorEditar)
{
    public const int TamanoPagina = 25;

    public async Task<ResultadoPaginadoDto<ClienteListadoDto>> ListarAsync(string? nombre, string? id, int pagina, CancellationToken ct = default)
    {
        pagina = Math.Max(pagina, 1);
        var (items, total) = await repositorio.ListarAsync(nombre?.Trim(), id?.Trim(), pagina, TamanoPagina, ct);
        var dtos = items.Select(c => new ClienteListadoDto(c.Id, c.Nombre, c.Email, c.Activo)).ToList();
        return new ResultadoPaginadoDto<ClienteListadoDto>(dtos, pagina, TamanoPagina, total);
    }

    public async Task<ClienteDto> ObtenerAsync(string id, CancellationToken ct = default)
    {
        var cliente = await repositorio.ObtenerAsync(id, ct)
            ?? throw new NoEncontradoException($"No existe el cliente '{id}'.");
        return Mapear(cliente);
    }

    public async Task<ClienteDto> CrearAsync(CrearClienteDto dto, CancellationToken ct = default)
    {
        await validadorCrear.ValidateAndThrowAsync(dto, ct);

        var id = dto.Id!.Trim();
        if (await repositorio.ExisteAsync(id, ct))
        {
            throw new ConflictoException("El Id ya está registrado.");
        }

        var cliente = new Cliente
        {
            Id = id,
            Nombre = dto.Nombre!.Trim(),
            FechaNacimiento = dto.FechaNacimiento!.Value,
            Genero = Enum.Parse<Genero>(dto.Genero!),
            Altura = dto.Altura!.Value,
            Email = LimpiarEmail(dto.Email),
            FechaIngreso = DateOnly.FromDateTime(DateTime.Today),
            Activo = true
        };

        await repositorio.AgregarAsync(cliente, ct);
        return Mapear(cliente);
    }

    public async Task<ClienteDto> EditarAsync(string id, EditarClienteDto dto, CancellationToken ct = default)
    {
        await validadorEditar.ValidateAndThrowAsync(dto, ct);

        var cliente = await repositorio.ObtenerAsync(id, ct)
            ?? throw new NoEncontradoException($"No existe el cliente '{id}'.");

        cliente.Nombre = dto.Nombre!.Trim();
        cliente.FechaNacimiento = dto.FechaNacimiento!.Value;
        cliente.Genero = Enum.Parse<Genero>(dto.Genero!);
        cliente.Altura = dto.Altura!.Value;
        cliente.Email = LimpiarEmail(dto.Email);

        await repositorio.ActualizarAsync(cliente, ct);
        return Mapear(cliente);
    }

    private static string? LimpiarEmail(string? email) =>
        string.IsNullOrWhiteSpace(email) ? null : email.Trim();

    private static ClienteDto Mapear(Cliente c) =>
        new(c.Id, c.Nombre, c.FechaNacimiento, c.Edad, c.Genero.ToString(), c.Altura, c.Email, c.FechaIngreso, c.Activo);
}
