using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _service;

    public SubscriptionsController(ISubscriptionService service)
    {
        _service = service;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/subscriptions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        int userId = GetUserId();
        var subscriptions = await _service.GetAllAsync(userId);
        return Ok(subscriptions);
    }

    // GET /api/subscriptions/id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        int userId = GetUserId();
        var subscription = await _service.GetByIdAsync(id, userId);
        return Ok(subscription);
    }

    // POST /api/subscriptions
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SubscriptionWriteDto createDto)
    {
        int userId = GetUserId();
        var created = await _service.CreateAsync(userId, createDto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, createDto);
    }

    // PUT /api/subscriptions/id
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SubscriptionWriteDto updateDto)
    {
        int userId = GetUserId();
        var updated = await _service.UpdateAsync(id, userId, updateDto);
        return Ok(updated);
    }

    // DELETE /api/subscriptions/id
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        int userId = GetUserId();
        await _service.DeleteByIdAsync(id, userId);
        return NoContent();
    }
}
