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

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var created = await _service.CreateAsync(request);
        return Created($"/api/users/{created.Id}", created);
    }
}
