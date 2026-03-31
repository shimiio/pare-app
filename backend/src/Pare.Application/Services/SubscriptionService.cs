using Pare.Application.DTOs;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _repo;

    public SubscriptionService(ISubscriptionRepository repo)
    {
        _repo = repo;
    }

    // GET all
    public async Task<IEnumerable<SubscriptionDto>> GetAllAsync()
    {
        var subscriptions = await _repo.GetAllAsync();
        return subscriptions.Select(ToSubscriptionDto);
    }

    // GET by id
    public async Task<SubscriptionDto?> GetByIdAsync(int id)
    {
        var subscription = await _repo.GetByIdAsync(id);
        return subscription is null ? null : ToSubscriptionDto(subscription);
    }

    // POST
    public async Task<SubscriptionDto> CreateAsync(SubscriptionWriteDto createDto)
    {
        var subscription = new Subscription
        {
            Name = createDto.Name,
            Price = createDto.Price,
            Currency = createDto.Currency,
            BillingCycle = createDto.BillingCycle,
            Status = createDto.Status,
            NextBillingDate = createDto.NextBillingDate,
            StartDate = createDto.StartDate,
        };

        var created = await _repo.CreateAsync(subscription);
        return ToSubscriptionDto(created);
    }

    // PUT
    public async Task<SubscriptionDto?> UpdateAsync(int id, SubscriptionWriteDto updateDto)
    {
        var subscription = new Subscription
        {
            Name = updateDto.Name,
            Price = updateDto.Price,
            Currency = updateDto.Currency,
            BillingCycle = updateDto.BillingCycle,
            Status = updateDto.Status,
            NextBillingDate = updateDto.NextBillingDate,
            StartDate = updateDto.StartDate
        };

        var updated = await _repo.UpdateAsync(id, subscription);
        return updated is null ? null : ToSubscriptionDto(updated);
    }

    // DELETE
    public async Task<bool> DeleteByIdAsync(int id)
    {
        return await _repo.DeleteByIdAsync(id);
    }

    private static SubscriptionDto ToSubscriptionDto(Subscription subscription) => new SubscriptionDto
    {
        Id = subscription.Id,
        Name = subscription.Name,
        Price = subscription.Price,
        Currency = subscription.Currency,
        BillingCycle = subscription.BillingCycle,
        Status = subscription.Status,
        NextBillingDate = subscription.NextBillingDate,
        StartDate = subscription.StartDate
    };
}
