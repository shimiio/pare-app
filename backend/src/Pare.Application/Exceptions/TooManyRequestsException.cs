namespace Pare.Application.Exceptions;

public class TooManyRequestsException(string message) : Exception(message)
{
}
