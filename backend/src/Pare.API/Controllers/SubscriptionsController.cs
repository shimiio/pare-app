using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Subscriptions.Queries.GetAllSubscriptions;
using Pare.Application.Subscriptions.Queries.GetSubscriptionById;
using Pare.Application.Subscriptions.Commands.CreateSubscription;
using Pare.Application.Subscriptions.Commands.UpdateSubscription;
using Pare.Application.Subscriptions.Commands.DeleteSubscription;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/subscriptions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        int userId = GetUserId();
        var subscriptions = await _mediator.Send(new GetAllSubscriptionsQuery(userId));
        return Ok(subscriptions);
    }

    // GET /api/subscriptions/id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        int userId = GetUserId();
        var subscription = await _mediator.Send(new GetSubscriptionByIdQuery(id, userId));
        return Ok(subscription);
    }

    // POST /api/subscriptions
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SubscriptionWriteDto createDto)
    {
        int userId = GetUserId();
        var created = await _mediator.Send(new CreateSubscriptionCommand(userId, createDto));
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, createDto);
    }

    // PUT /api/subscriptions/id
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SubscriptionWriteDto updateDto)
    {
        int userId = GetUserId();
        var updated = await _mediator.Send(new UpdateSubscriptionCommand(id, userId, updateDto));
        return Ok(updated);
    }

    // DELETE /api/subscriptions/id
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        int userId = GetUserId();
        await _mediator.Send(new DeleteSubscriptionCommand(id, userId));
        return NoContent();
    }
}
