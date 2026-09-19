namespace Pare.Application.Interfaces;

public interface ITransactionManager
{
    // Runs every repository call inside the action in one database transaction:
    // either all of their changes are committed, or none are
    Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default);
}
