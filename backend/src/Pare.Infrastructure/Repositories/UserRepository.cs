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

    // GET by email
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    // GET by id
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    // POST create new user
    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return user;
    }

    // PUT update user data (name, email, password, currency)
    public async Task<User> UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();

        return user;
    }

    // DELETE delete user by id
    public async Task<bool> DeleteByIdAsync(int id)
    {
        return false;
    }
}
