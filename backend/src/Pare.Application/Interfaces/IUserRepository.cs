namespace Pare.Application.Interfaces;

public interface IUserRepository
{
    Task<Domain.Entities.User?> GetByEmailAsync(string email, CancellationToken ct);
    Task<Domain.Entities.User?> GetByIdAsync(int id, CancellationToken ct);
    Task<Domain.Entities.User?> GetByHashedRefreshTokenAsync(string hashedRefreshToken, CancellationToken ct);
    Task<Domain.Entities.User> CreateAsync(Domain.Entities.User user, CancellationToken ct);
    Task<Domain.Entities.User> UpdateAsync(Domain.Entities.User user, CancellationToken ct);
    Task<bool> DeleteByIdAsync(int id, CancellationToken ct);
}
