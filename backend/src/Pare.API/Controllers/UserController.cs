using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Pare.Application.User.DTOs;
using Pare.Application.User.Queries.GetUserById;
using Pare.Application.User.Commands.UpdateUserName;
using Pare.Application.User.Commands.ChangeUserEmail;
using Pare.Application.User.Commands.ChangeUserPassword;
using Pare.Application.User.Commands.UpdateUserCurrency;
using Pare.Application.User.Commands.DeleteUser;

namespace Pare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/user
    [HttpGet]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        var userId = GetUserId();
        var user = await _mediator.Send(new GetUserByIdQuery(userId));
        return Ok(user);
    }

    // PATCH /api/user/update-name
    [HttpPatch("update-name")]
    public async Task<IActionResult> UpdateNameAsync([FromBody] UpdateNameDto update)
    {
        var userId = GetUserId();
        var updated = await _mediator.Send(new UpdateUserNameCommand(userId, update));
        return Ok(updated);
    }

    // PATCH /api/user/change-email
    [HttpPatch("change-email")]
    public async Task<IActionResult> ChangeEmailAsync([FromBody] ChangeEmailDto change)
    {
        var userId = GetUserId();
        var changed = await _mediator.Send(new ChangeUserEmailCommand(userId, change));
        return Ok(changed);
    }

    // PATCH /api/user/change-password 
    [HttpPatch("change-password")]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordDto change)
    {
        var userId = GetUserId();
        var changed = await _mediator.Send(new ChangeUserPasswordCommand(userId, change));
        return Ok(changed);
    }

    // PATCH /api/user/update-currency
    [HttpPatch("update-currency")]
    public async Task<IActionResult> UpdateCurrencyAsync([FromBody] UpdateCurrencyDto update)
    {
        var userId = GetUserId();
        var updated = await _mediator.Send(new UpdateUserCurrencyCommand(userId, update));
        return Ok(updated);
    }

    // DELETE /api/user
    [HttpDelete]
    public async Task<IActionResult> DeleteByIdAsync()
    {
        var userId = GetUserId();
        var deleted = await _mediator.Send(new DeleteUserCommand(userId));
        if (!deleted) return BadRequest("Failed to delete user");

        return NoContent();
    }
}
