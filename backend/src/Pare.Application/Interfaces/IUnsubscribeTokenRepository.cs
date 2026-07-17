using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUnsubscribeTokenRepository
{
    Task<UnsubscribeToken> CreateAsync(UnsubscribeToken token);
    Task<UnsubscribeToken?> GetByUserIdAsync(int userId);
    Task<UnsubscribeToken?> GetByTokenAsync(string token);
}
