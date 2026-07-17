using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pare.Application.EmailVerification.Commands.SendEmailVerification;
using Pare.Application.EmailVerification.Commands.VerifyEmail;
using Pare.Application.EmailVerification.DTOs;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
public class EmailVerificationController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // POST send
    [HttpPost("send")]
    [EnableRateLimiting("global")]
    public async Task<IActionResult> EmailVerificationAsync()
    {
        var userId = GetUserId();
        var verify = await _mediator.Send(new SendEmailVerificationCommand(userId));
        return Ok(verify);
    }

    // POST verify
    [HttpPost("verify")]
    [EnableRateLimiting("global")]
    public async Task<IActionResult> VerifyEmailAsync([FromBody] VerifyCodeDto verify)
    {
        var userId = GetUserId();
        await _mediator.Send(new VerifyEmailCommand(userId, verify));
        return Ok();
    }
}
