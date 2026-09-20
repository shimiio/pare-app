namespace Pare.Application.Exceptions;

public sealed class TooManyRequestsException(string message) : Exception(message)
{
}
