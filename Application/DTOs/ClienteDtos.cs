namespace NutriTrack.Application.DTOs;

public record CrearClienteDto(string? Id, string? Nombre, DateOnly? FechaNacimiento, string? Genero, int? Altura, string? Email);

public record EditarClienteDto(string? Nombre, DateOnly? FechaNacimiento, string? Genero, int? Altura, string? Email);

public record ClienteDto(
    string Id,
    string Nombre,
    DateOnly FechaNacimiento,
    int Edad,
    string Genero,
    int Altura,
    string? Email,
    DateOnly FechaIngreso,
    bool Activo);

public record ClienteListadoDto(string Id, string Nombre, string? Email, bool Activo);

public record ResultadoPaginadoDto<T>(IReadOnlyList<T> Items, int Pagina, int TamanoPagina, int Total);
