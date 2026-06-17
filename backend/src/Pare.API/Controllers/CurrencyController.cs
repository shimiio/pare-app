using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pare.Application.Currency.Queries.GetCurrencyRates;

namespace Pare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
public class CurrencyController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    // GET /api/currency/EUR
    [HttpGet("{currencyCode}")]
    public async Task<IActionResult> GetCurrencyRates(string currencyCode)
    {
        return Ok(await _mediator.Send(new GetCurrencyRatesQuery(currencyCode)));
    }
}
