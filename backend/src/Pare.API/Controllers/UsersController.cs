using Microsoft.AspNetCore.Mvc;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

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

    // PUT change password


    // PUT /api/users/id/change-currency
    [HttpPut("{id}/change-currency")]
    public async Task<IActionResult> UpdateCurrencyAsync(int id, [FromBody] UpdateDefaultCurrencyDto update)
    {
        var updated = await _service.UpdateDefaultCurrencyAsync(id, update);
        return Ok(updated);
    }

    // DELETE deactivate user

}
