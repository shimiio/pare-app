using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.UpdateUserCurrency;

public sealed record UpdateUserCurrencyCommand(int Id, UpdateCurrencyDto Update) : IRequest<UpdateCurrencyDto>;
