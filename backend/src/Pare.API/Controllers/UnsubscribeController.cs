using MediatR;
using Microsoft.AspNetCore.Mvc;
using Pare.Application.EmailVerification.Commands.Unsubscribe;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnsubscribeController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Unsubscribe([FromQuery] string token)
    {
        await mediator.Send(new UnsubscribeCommand(token));
        return Ok();
    }
}
