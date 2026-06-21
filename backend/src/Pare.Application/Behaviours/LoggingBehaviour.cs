using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Pare.Application.Behaviours;

public class LoggingBehaviour<TRequest, TResponse>(
    ILogger<LoggingBehaviour<TRequest, TResponse>> logger,
    IHttpContextAccessor httpContextAccessor) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehaviour<TRequest, TResponse>> _logger = logger;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var userId = _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        _logger.LogInformation("→ {RequestName} | User: {UserId}",
            typeof(TRequest).Name, userId);

        var response = await next(ct);

        _logger.LogInformation("← {RequestName} completed | User: {UserId}",
            typeof(TRequest).Name, userId);

        return response;
    }
}
