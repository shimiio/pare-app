using Microsoft.Extensions.Logging;
using MediatR;

namespace Pare.Application.Behaviours;

public class LoggingBehaviour<TRequest, TResponse>(
    ILogger<LoggingBehaviour<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        logger.LogInformation("→ {RequestName}", typeof(TRequest).Name);

        var response = await next(ct);

        logger.LogInformation("← {RequestName} completed", typeof(TRequest).Name);

        return response;
    }
}
