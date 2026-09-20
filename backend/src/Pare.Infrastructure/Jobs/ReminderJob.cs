using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Jobs;

public sealed class ReminderJob(IReminderService reminderService)
{
    public async Task ExecuteAsync(CancellationToken ct)
        => await reminderService.ExecuteAsync(ct);
}
