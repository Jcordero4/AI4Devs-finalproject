using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NutriTrack.Application.Excepciones;

namespace NutriTrack.API.Middleware;

public class ManejoErroresMiddleware(RequestDelegate siguiente, ILogger<ManejoErroresMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await siguiente(contexto);
        }
        catch (ValidationException ex)
        {
            var errores = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            await Responder(contexto, new ValidationProblemDetails(errores)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Datos inválidos."
            });
        }
        catch (NoEncontradoException ex)
        {
            await Responder(contexto, new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = ex.Message });
        }
        catch (ConflictoException ex)
        {
            await Responder(contexto, new ProblemDetails { Status = StatusCodes.Status409Conflict, Title = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado.");
            await Responder(contexto, new ProblemDetails { Status = StatusCodes.Status500InternalServerError, Title = "Error interno." });
        }
    }

    private static Task Responder(HttpContext contexto, ProblemDetails problema)
    {
        contexto.Response.StatusCode = problema.Status!.Value;
        return contexto.Response.WriteAsJsonAsync(problema, problema.GetType(), (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json");
    }
}
