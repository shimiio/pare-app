using Microsoft.AspNetCore.Mvc;
using Pare.Application.Interfaces;
using Pare.Application.DTOs;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IJwtTokenService _jwtService;

    public AuthController(IUserService service, IJwtTokenService jwtService)
    {
        _service = service;
        _jwtService = jwtService;
    }

    // POST register
    [HttpPost]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        var created = await _service.RegisterAsync(request);
        return created is null ? Conflict() : Created($"/api/users/{created.Id}", created);
    }
}
