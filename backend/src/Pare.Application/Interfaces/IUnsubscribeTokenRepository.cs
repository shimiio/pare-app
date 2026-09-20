using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUnsubscribeTokenRepository
{
    Task<UnsubscribeToken> CreateAsync(UnsubscribeToken token, CancellationToken ct);
    Task<UnsubscribeToken?> GetByUserIdAsync(int userId, CancellationToken ct);
    Task<UnsubscribeToken?> GetByTokenAsync(string token, CancellationToken ct);
}
