using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserPassword;

// CurrentRefreshToken identifies the session making the change, so it stays signed in.
// IRequest<Unit>, not plain IRequest: ValidationBehaviour only wraps IRequest<TResponse>,
// so a plain IRequest would silently skip the password rules in the validator.
public sealed record ChangeUserPasswordCommand(int Id, ChangePasswordDto Change, string? CurrentRefreshToken)
    : IRequest<Unit>;
