using FluentValidation;
using NutriTrack.Application.DTOs;

namespace NutriTrack.Application.Validators;

internal static class ReglasMedicion
{
    public static IRuleBuilderOptions<T, decimal?> ValidarValorPositivo<T>(this IRuleBuilder<T, decimal?> rule, string nombre) =>
        rule.NotNull().WithMessage($"{nombre} es obligatorio.")
            .GreaterThan(0).WithMessage($"{nombre} debe ser mayor a 0.")
            .PrecisionScale(10, 2, true).WithMessage($"{nombre} admite hasta 10 dígitos con 2 decimales.");

    public static IRuleBuilderOptions<T, int?> ValidarPorcion<T>(this IRuleBuilder<T, int?> rule, string nombre) =>
        rule.NotNull().WithMessage($"{nombre} del plan de nutrición es obligatorio.")
            .GreaterThanOrEqualTo(0).WithMessage($"{nombre} del plan de nutrición debe ser 0 o mayor.");
}

public class TratamientoEntradaDtoValidator : AbstractValidator<TratamientoEntradaDto>
{
    public TratamientoEntradaDtoValidator()
    {
        RuleFor(x => x.Producto).NotEmpty().WithMessage("El producto del tratamiento es obligatorio.")
            .MaximumLength(50).WithMessage("El producto admite máximo 50 caracteres.");
        RuleFor(x => x.Dosis).NotEmpty().WithMessage("La dosis del tratamiento es obligatoria.")
            .MaximumLength(150).WithMessage("La dosis admite máximo 150 caracteres.");
    }
}

public class PlanNutricionalDtoValidator : AbstractValidator<PlanNutricionalDto>
{
    public PlanNutricionalDtoValidator()
    {
        RuleFor(x => x.Lacteo).ValidarPorcion("Lácteos");
        RuleFor(x => x.Fruta).ValidarPorcion("Frutas");
        RuleFor(x => x.Vegetales).ValidarPorcion("Vegetales");
        RuleFor(x => x.Harinas).ValidarPorcion("Harinas");
        RuleFor(x => x.Proteina).ValidarPorcion("Proteínas");
        RuleFor(x => x.Grasa).ValidarPorcion("Grasas");
        RuleFor(x => x.Agua).ValidarPorcion("Agua");
    }
}

public class GuardarMedicionDtoValidator : AbstractValidator<GuardarMedicionDto>
{
    public GuardarMedicionDtoValidator()
    {
        RuleFor(x => x.Peso).ValidarValorPositivo("El peso");
        RuleFor(x => x.Grasa).ValidarValorPositivo("El % de grasa");
        RuleFor(x => x.MasaMuscular).ValidarValorPositivo("La masa muscular");
        RuleFor(x => x.Agua).ValidarValorPositivo("El % de agua");
        RuleFor(x => x.GrasaVisceral).ValidarValorPositivo("La grasa visceral");
        RuleFor(x => x.Imc).ValidarValorPositivo("El IMC");

        RuleFor(x => x.Plan).NotNull().WithMessage("El plan de nutrición es obligatorio.")
            .SetValidator(new PlanNutricionalDtoValidator());
        RuleForEach(x => x.Tratamientos).SetValidator(new TratamientoEntradaDtoValidator());
    }
}
