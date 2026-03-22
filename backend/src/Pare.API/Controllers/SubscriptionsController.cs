using Microsoft.AspNetCore.Mvc;
using Pare.Application.Interfaces;
using Pare.Domain.Models;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _service;

    public SubscriptionsController(ISubscriptionService service)
    {
        _service = service;
    }

    // GET /api/subscriptions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subscriptions = await _service.GetAllAsync();
        return Ok(subscriptions);
    }

    // GET /api/subscriptions/id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var subscription = await _service.GetByIdAsync(id);
        return subscription is null ? NotFound() : Ok(subscription);
    }

    // POST /api/subscriptions
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Subscription subscription)
    {
        var created = await _service.CreateAsync(subscription);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/subscriptions/id
    [HttpPut]
    public async Task<IActionResult> Update(int id, [FromBody] Subscription subscription)
    {
        var updated = await _service.UpdateAsync(id, subscription);
        return updated is null ? NotFound() : Ok(updated);
    }

    // DELETE /api/subscriptions/id
    [HttpDelete]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteByIdAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
