namespace NutriTrack.Application.Excepciones;

public class NoEncontradoException(string mensaje) : Exception(mensaje);

public class ConflictoException(string mensaje) : Exception(mensaje);
