using Microsoft.AspNetCore.Mvc;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;
using Pare.Domain.Entities;

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

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = request.Password
        };

        var created = await _service.CreateAsync(user);
        return Created($"/api/user/{created.Id}", created);
    }
}
