using Microsoft.EntityFrameworkCore;
using Pare.Domain.Entities;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    // POST
    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return user;
    }
}
