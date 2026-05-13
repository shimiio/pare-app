using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    // GET /api/users/id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        var user = await _service.GetByIdAsync(id);
        return Ok(user);
    }

    // PUT /api/users/id/update-username
    [HttpPut("{id}/update-username")]
    public async Task<IActionResult> UpdateUsernameAsync(int id, [FromBody] UpdateUsernameDto update)
    {
        var updated = await _service.UpdateUsernameAsync(id, update);
        return Ok(updated);
    }

    // PUT /api/users/id/change-email
    [HttpPut("{id}/change-email")]
    public async Task<IActionResult> ChangeEmailAsync(int id, [FromBody] ChangeEmailDto change)
    {
        var changed = await _service.ChangeEmailAsync(id, change);
        return Ok(changed);
    }

    // PUT /api/users/id/change-password 
    [HttpPut("{id}/change-password")]
    public async Task<IActionResult> ChangePasswordAsync(int id, [FromBody] ChangePasswordDto change)
    {
        var changed = await _service.ChangePasswordAsync(id, change);
        return Ok(changed);
    }

    // PUT /api/users/id/update-currency
    [HttpPut("{id}/update-currency")]
    public async Task<IActionResult> UpdateCurrencyAsync(int id, [FromBody] UpdateCurrencyDto update)
    {
        var updated = await _service.UpdateCurrencyAsync(id, update);
        return Ok(updated);
    }

    // DELETE /api/users/id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteByIdAsync(int id)
    {
        var deleted = await _service.DeleteByIdAsync(id);
        if (!deleted) return BadRequest("Failed to delete user");

        return NoContent();
    }
}
