using Microsoft.AspNetCore.Mvc;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _service;

    public AuthController(IUserService service)
    {
        _service = service;
    }

    // POST register
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        var jwtToken = await _service.RegisterAsync(request);
        return jwtToken is null ? Conflict() : Created("", jwtToken);
    }

    // POST login
    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var jwtToken = await _service.LoginAsync(request);
        return jwtToken is null ? Unauthorized() : Ok(jwtToken);
    }
}
