using FluentValidation;
using NutriTrack.Application.DTOs;

namespace NutriTrack.Application.Validators;

internal static class ReglasCliente
{
    public const string PatronEmail = @"^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$";

    public static IRuleBuilderOptions<T, string?> ValidarGenero<T>(this IRuleBuilder<T, string?> rule) =>
        rule.NotEmpty().WithMessage("El género es obligatorio.")
            .Must(g => g is "M" or "F").WithMessage("El género debe ser M o F.");

    public static IRuleBuilderOptions<T, DateOnly?> ValidarFechaNacimiento<T>(this IRuleBuilder<T, DateOnly?> rule) =>
        rule.NotNull().WithMessage("La fecha de nacimiento es obligatoria.")
            .Must(f => f is null || f.Value <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de nacimiento no puede ser futura.");

    public static IRuleBuilderOptions<T, int?> ValidarAltura<T>(this IRuleBuilder<T, int?> rule) =>
        rule.NotNull().WithMessage("La altura es obligatoria.")
            .GreaterThan(0).WithMessage("La altura debe ser mayor a 0.");
}

public class CrearClienteDtoValidator : AbstractValidator<CrearClienteDto>
{
    public CrearClienteDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("El Id es obligatorio.")
            .MaximumLength(15).WithMessage("El Id admite máximo 15 caracteres.");
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(50).WithMessage("El nombre admite máximo 50 caracteres.");
        RuleFor(x => x.FechaNacimiento).ValidarFechaNacimiento();
        RuleFor(x => x.Genero).ValidarGenero();
        RuleFor(x => x.Altura).ValidarAltura();
        RuleFor(x => x.Email).MaximumLength(320).Matches(ReglasCliente.PatronEmail).WithMessage("El formato del email es inválido.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class EditarClienteDtoValidator : AbstractValidator<EditarClienteDto>
{
    public EditarClienteDtoValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(50).WithMessage("El nombre admite máximo 50 caracteres.");
        RuleFor(x => x.FechaNacimiento).ValidarFechaNacimiento();
        RuleFor(x => x.Genero).ValidarGenero();
        RuleFor(x => x.Altura).ValidarAltura();
        RuleFor(x => x.Email).MaximumLength(320).Matches(ReglasCliente.PatronEmail).WithMessage("El formato del email es inválido.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
