using FluentValidation;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Excepciones;
using NutriTrack.Application.Interfaces;
using NutriTrack.Domain.Entities;

namespace NutriTrack.Application.Services;

public class ServicioMedicion(
    IRepositorioMedicion repositorio,
    IRepositorioCliente repositorioCliente,
    IValidator<GuardarMedicionDto> validador)
{
    public async Task<IReadOnlyList<MedicionResumenDto>> ListarAsync(string clienteId, CancellationToken ct = default)
    {
        await AsegurarClienteAsync(clienteId, ct);
        var mediciones = await repositorio.ListarAsync(clienteId, ct);
        return mediciones
            .OrderByDescending(m => m.FechaMedicion)
            .Select(m => new MedicionResumenDto(m.FechaMedicion, m.Peso, m.Grasa, m.MasaMuscular, m.Agua, m.GrasaVisceral, m.Imc))
            .ToList();
    }

    public async Task<MedicionDto> ObtenerAsync(string clienteId, DateOnly fecha, CancellationToken ct = default)
    {
        await AsegurarClienteAsync(clienteId, ct);
        var medicion = await repositorio.ObtenerAsync(clienteId, fecha, ct)
            ?? throw new NoEncontradoException($"No existe una medición del cliente '{clienteId}' en la fecha {fecha:dd/MM/yyyy}.");
        return Mapear(medicion);
    }

    public async Task<MedicionDto> CrearAsync(string clienteId, GuardarMedicionDto dto, CancellationToken ct = default)
    {
        await validador.ValidateAndThrowAsync(dto, ct);
        await AsegurarClienteAsync(clienteId, ct);

        var hoy = DateOnly.FromDateTime(DateTime.Today);
        if (await repositorio.ExisteAsync(clienteId, hoy, ct))
        {
            throw new ConflictoException("Ya existe una medición de este cliente para la fecha actual.");
        }

        var medicion = new Medicion { ClienteId = clienteId, FechaMedicion = hoy };
        Aplicar(medicion, dto);

        await repositorio.AgregarAsync(medicion, ct);
        return Mapear(medicion);
    }

    public async Task<MedicionDto> ActualizarAsync(string clienteId, DateOnly fecha, GuardarMedicionDto dto, CancellationToken ct = default)
    {
        await validador.ValidateAndThrowAsync(dto, ct);
        await AsegurarClienteAsync(clienteId, ct);

        if (fecha != DateOnly.FromDateTime(DateTime.Today))
        {
            throw new ConflictoException("Solo se puede actualizar la medición del día actual.");
        }

        var medicion = await repositorio.ObtenerAsync(clienteId, fecha, ct)
            ?? throw new NoEncontradoException($"No existe una medición del cliente '{clienteId}' en la fecha {fecha:dd/MM/yyyy}.");

        Aplicar(medicion, dto);

        await repositorio.ActualizarAsync(medicion, ct);
        return Mapear(medicion);
    }

    private async Task AsegurarClienteAsync(string clienteId, CancellationToken ct)
    {
        if (!await repositorioCliente.ExisteAsync(clienteId, ct))
        {
            throw new NoEncontradoException($"No existe el cliente '{clienteId}'.");
        }
    }

    private static void Aplicar(Medicion medicion, GuardarMedicionDto dto)
    {
        medicion.Peso = dto.Peso!.Value;
        medicion.Grasa = dto.Grasa!.Value;
        medicion.MasaMuscular = dto.MasaMuscular!.Value;
        medicion.Agua = dto.Agua!.Value;
        medicion.GrasaVisceral = dto.GrasaVisceral!.Value;
        medicion.Imc = dto.Imc!.Value;

        var plan = dto.Plan!;
        medicion.Plan ??= new PlanNutricional { ClienteId = medicion.ClienteId, FechaMedicion = medicion.FechaMedicion };
        medicion.Plan.Lacteo = plan.Lacteo!.Value;
        medicion.Plan.Fruta = plan.Fruta!.Value;
        medicion.Plan.Vegetales = plan.Vegetales!.Value;
        medicion.Plan.Harinas = plan.Harinas!.Value;
        medicion.Plan.Proteina = plan.Proteina!.Value;
        medicion.Plan.Grasa = plan.Grasa!.Value;
        medicion.Plan.Agua = plan.Agua!.Value;

        var filas = (dto.Tratamientos ?? [])
            .Select(t => (t.Producto!.Trim(), t.Dosis!.Trim()))
            .ToList();
        medicion.ReemplazarTratamientos(filas);
    }

    private static MedicionDto Mapear(Medicion m)
    {
        var plan = m.Plan ?? new PlanNutricional { ClienteId = m.ClienteId, FechaMedicion = m.FechaMedicion };
        return new MedicionDto(
            m.ClienteId, m.FechaMedicion, m.Peso, m.Grasa, m.MasaMuscular, m.Agua, m.GrasaVisceral, m.Imc,
            m.Tratamientos.OrderBy(t => t.Secuencia).Select(t => new TratamientoDto(t.Secuencia, t.Producto, t.Dosis)).ToList(),
            new PlanNutricionalDto(plan.Lacteo, plan.Fruta, plan.Vegetales, plan.Harinas, plan.Proteina, plan.Grasa, plan.Agua));
    }
}
