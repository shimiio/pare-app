using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;

    public UserController(IUserService service)
    {
        _service = service;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/user
    [HttpGet]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        var userId = GetUserId();
        var user = await _service.GetByIdAsync(userId);
        return Ok(user);
    }

    // PATCH /api/user/update-name
    [HttpPatch("update-name")]
    public async Task<IActionResult> UpdateNameAsync([FromBody] UpdateNameDto update)
    {
        var userId = GetUserId();
        var updated = await _service.UpdateNameAsync(userId, update);
        return Ok(updated);
    }

    // PATCH /api/user/change-email
    [HttpPatch("change-email")]
    public async Task<IActionResult> ChangeEmailAsync([FromBody] ChangeEmailDto change)
    {
        var userId = GetUserId();
        var changed = await _service.ChangeEmailAsync(userId, change);
        return Ok(changed);
    }

    // PATCH /api/user/change-password 
    [HttpPatch("change-password")]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordDto change)
    {
        var userId = GetUserId();
        var changed = await _service.ChangePasswordAsync(userId, change);
        return Ok(changed);
    }

    // PATCH /api/user/update-currency
    [HttpPatch("update-currency")]
    public async Task<IActionResult> UpdateCurrencyAsync([FromBody] UpdateCurrencyDto update)
    {
        var userId = GetUserId();
        var updated = await _service.UpdateCurrencyAsync(userId, update);
        return Ok(updated);
    }

    // DELETE /api/user
    [HttpDelete]
    public async Task<IActionResult> DeleteByIdAsync()
    {
        var userId = GetUserId();
        var deleted = await _service.DeleteByIdAsync(userId);
        if (!deleted) return BadRequest("Failed to delete user");

        return NoContent();
    }
}
