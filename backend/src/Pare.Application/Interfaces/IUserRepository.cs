namespace Pare.Application.Interfaces;

public interface IUserRepository
{
    Task<Domain.Entities.User?> GetByEmailAsync(string email);
    Task<Domain.Entities.User?> GetByIdAsync(int id);
    Task<Domain.Entities.User?> GetByRefreshTokenAsync(string refreshToken);
    Task<Domain.Entities.User> CreateAsync(Domain.Entities.User user);
    Task<Domain.Entities.User> UpdateAsync(Domain.Entities.User user);
    Task<bool> DeleteByIdAsync(int id);
}
