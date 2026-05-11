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
    public async Task<IActionResult> UpdateUsernameAsync(int id, [FromBody] UpdateUsernameDto change)
    {
        var updated = await _service.UpdateUsernameAsync(id, change);
        return Ok(updated);
    }

    // PUT change email


    // PUT change password


    // PUT update default currency


    // DELETE deactivate user

}
