using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MediatR;
using Pare.Application.User.DTOs;
using Pare.Application.User.Commands.RegisterUser;
using Pare.Application.User.Commands.LoginUser;
using Pare.Application.User.Commands.RefreshUser;
using Pare.Application.User.Commands.LogoutUser;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    // POST register
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterUserCommand(request));

        SetRefreshTokenCookie(result.RefreshToken);

        return Created("", new { jwtToken = result.JwtToken });
    }

    // POST login
    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginUserCommand(request));

        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new { jwtToken = result.JwtToken });
    }

    // POST logout
    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken != null)
            await _mediator.Send(new LogoutUserCommand(new RefreshTokenDto { RefreshToken = refreshToken }));

        ClearRefreshTokenCookie();
        return NoContent();
    }

    // POST refresh
    [HttpPost("refresh")]
    [EnableRateLimiting("refresh")]
    public async Task<IActionResult> RefreshAsync()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return Unauthorized();

        var result = await _mediator.Send(new RefreshUserCommand(new RefreshTokenDto { RefreshToken = refreshToken }));

        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new { jwtToken = result.JwtToken });
    }

    // One definition for the refresh cookie, so every endpoint sets identical attributes.
    // SameSite=Strict: the frontend and the API are the same site behind Caddy, so the browser
    // never needs to send this cookie from another site, and a cross-site request cannot use it.
    private static CookieOptions RefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(30)
    };

    private void SetRefreshTokenCookie(string refreshToken)
        => Response.Cookies.Append("refreshToken", refreshToken, RefreshTokenCookieOptions());

    private void ClearRefreshTokenCookie()
        => Response.Cookies.Delete("refreshToken", RefreshTokenCookieOptions());
}
