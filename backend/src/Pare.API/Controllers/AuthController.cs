using Microsoft.AspNetCore.Mvc;
using MediatR;
using Pare.Application.User.DTOs;
using Pare.Application.User.Commands.RegisterUser;
using Pare.Application.User.Commands.LoginUser;
using Pare.Application.User.Commands.RefreshUser;
using Pare.Application.User.Commands.LogoutUser;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    // POST register
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        var jwtToken = await _mediator.Send(new RegisterUserCommand(request));
        return Created("", jwtToken);
    }

    // POST login
    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var jwtToken = await _mediator.Send(new LoginUserCommand(request));
        return Ok(jwtToken);
    }

    // POST logout
    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync([FromBody] RefreshTokenDto refreshToken)
    {
        await _mediator.Send(new LogoutUserCommand(refreshToken));
        return NoContent();
    }

    // POST refresh
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshAsync([FromBody] RefreshTokenDto refreshToken)
    {
        var jwtToken = await _mediator.Send(new RefreshUserCommand(refreshToken));
        return Ok(jwtToken);
    }
}
