using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Data;

public class TransactionManager(AppDbContext db) : ITransactionManager
{
    private readonly AppDbContext _db = db;

    public async Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);

        await action();

        // If the action throws, CommitAsync is never reached and disposing the transaction rolls it back
        await transaction.CommitAsync(ct);
    }
}
