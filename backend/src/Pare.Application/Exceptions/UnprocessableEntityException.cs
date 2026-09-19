namespace Pare.Application.Exceptions;

public sealed class UnprocessableEntityException(string message) : Exception(message)
{
}
