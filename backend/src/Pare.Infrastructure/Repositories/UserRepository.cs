using Microsoft.EntityFrameworkCore;
using Npgsql;
using Pare.Domain.Entities;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public sealed class UserRepository(AppDbContext db) : IUserRepository
{
    private readonly AppDbContext _db = db;
    private const string EmailUniqueIndex = "IX_users_Email";

    // GET by email
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    // GET by id
    public async Task<User?> GetByIdAsync(int id, CancellationToken ct)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    // GET by hashed refresh token
    public async Task<User?> GetByHashedRefreshTokenAsync(string hashedRefreshToken, CancellationToken ct)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == hashedRefreshToken, ct);
    }

    // POST create new user
    public async Task<User> CreateAsync(User user, CancellationToken ct)
    {
        _db.Users.Add(user);
        await SaveChangesAsync(ct);

        return user;
    }

    // PUT update user data (name, email, password, currency)
    public async Task<User> UpdateAsync(User user, CancellationToken ct)
    {
        _db.Users.Update(user);
        await SaveChangesAsync(ct);

        return user;
    }

    // DELETE delete user by id
    public async Task<bool> DeleteByIdAsync(int id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);

        return true;
    }

    // Translate the unique email index violation into a 409 (two requests raced past the email check)
    private async Task SaveChangesAsync(CancellationToken ct)
    {
        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
            ConstraintName: EmailUniqueIndex
        })
        {
            throw new ConflictException("Email already exists");
        }
    }
}
