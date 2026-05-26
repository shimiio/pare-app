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
        var result = await _mediator.Send(new RegisterUserCommand(request));

        Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });

        return Created("", new { jwtToken = result.JwtToken });
    }

    // POST login
    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginUserCommand(request));

        Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });

        return Ok(new { jwtToken = result.JwtToken });
    }

    // POST logout
    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken != null)
            await _mediator.Send(new LogoutUserCommand(new RefreshTokenDto { RefreshToken = refreshToken }));

        Response.Cookies.Delete("refreshToken");
        return NoContent();
    }

    // POST refresh
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshAsync()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return Unauthorized();

        var result = await _mediator.Send(new RefreshUserCommand(new RefreshTokenDto { RefreshToken = refreshToken }));

        Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });

        return Ok(new { jwtToken = result.JwtToken });
    }
}
