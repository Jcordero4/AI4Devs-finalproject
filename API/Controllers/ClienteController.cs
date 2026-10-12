using Microsoft.AspNetCore.Mvc;
using NutriTrack.Application.DTOs;
using NutriTrack.Application.Services;

namespace NutriTrack.API.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClienteController(ServicioCliente servicio) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultadoPaginadoDto<ClienteListadoDto>>> Listar(
        [FromQuery] string? nombre, [FromQuery] string? id, [FromQuery] int pagina = 1, CancellationToken ct = default) =>
        Ok(await servicio.ListarAsync(nombre, id, pagina, ct));

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClienteDto>> Obtener(string id, CancellationToken ct) =>
        Ok(await servicio.ObtenerAsync(id, ct));

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ClienteDto>> Crear(CrearClienteDto dto, CancellationToken ct)
    {
        var cliente = await servicio.CrearAsync(dto, ct);
        return CreatedAtAction(nameof(Obtener), new { id = cliente.Id }, cliente);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClienteDto>> Editar(string id, EditarClienteDto dto, CancellationToken ct) =>
        Ok(await servicio.EditarAsync(id, dto, ct));
}
