using Pare.Application.DTOs;
using Pare.Application.Interfaces;
using Pare.Application.Exceptions;
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
    public async Task<IEnumerable<SubscriptionDto>> GetAllAsync(int userId)
    {
        var subscriptions = await _repo.GetAllAsync(userId);
        return subscriptions.Select(ToSubscriptionDto);
    }

    // GET by id
    public async Task<SubscriptionDto?> GetByIdAsync(int id, int userId)
    {
        var subscription = await _repo.GetByIdAsync(id, userId);
        if (subscription is null) throw new NotFoundException("Subscription not found");
        return ToSubscriptionDto(subscription);
    }

    // POST
    public async Task<SubscriptionDto> CreateAsync(int userId, SubscriptionWriteDto createDto)
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
            UserId = userId
        };

        var created = await _repo.CreateAsync(subscription);
        return ToSubscriptionDto(created);
    }

    // PUT
    public async Task<SubscriptionDto?> UpdateAsync(int id, int userId, SubscriptionWriteDto updateDto)
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

        var updated = await _repo.UpdateAsync(id, userId, subscription);
        if (updated is null) throw new NotFoundException("Subscription not found");
        return ToSubscriptionDto(updated);
    }

    // DELETE
    public async Task<bool> DeleteByIdAsync(int id, int userId)
    {
        bool deleted = await _repo.DeleteByIdAsync(id, userId);
        if (deleted is false) throw new NotFoundException("Subscription not found");
        return deleted;
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
