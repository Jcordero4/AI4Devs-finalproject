using Microsoft.AspNetCore.Mvc;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Services;

namespace NutriTrack.API.Controllers;

[ApiController]
[Route("api/clientes/{clienteId}/mediciones")]
public class MedicionController(ServicioMedicion servicio) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<MedicionResumenDto>>> Listar(string clienteId, [FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(clienteId, desde, hasta, ct));

    [HttpGet("{fecha}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MedicionDto>> Obtener(string clienteId, DateOnly fecha, CancellationToken ct) =>
        Ok(await servicio.ObtenerAsync(clienteId, fecha, ct));

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<MedicionDto>> Crear(string clienteId, GuardarMedicionDto dto, CancellationToken ct)
    {
        var medicion = await servicio.CrearAsync(clienteId, dto, ct);
        return CreatedAtAction(nameof(Obtener), new { clienteId, fecha = medicion.FechaMedicion.ToString("yyyy-MM-dd") }, medicion);
    }

    [HttpPut("{fecha}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<MedicionDto>> Actualizar(string clienteId, DateOnly fecha, GuardarMedicionDto dto, CancellationToken ct) =>
        Ok(await servicio.ActualizarAsync(clienteId, fecha, dto, ct));
}
