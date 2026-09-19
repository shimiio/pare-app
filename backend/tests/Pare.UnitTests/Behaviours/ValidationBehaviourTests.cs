using FluentAssertions;
using FluentValidation;
using MediatR;
using Pare.Application.Behaviours;

namespace Pare.UnitTests.Behaviours;

public sealed class ValidationBehaviourTests
{
    public sealed record TestRequest(string Email) : IRequest<string>;

    // a validator with an async rule, like a future "is this email already taken?" database check
    private sealed class AsyncEmailValidator : AbstractValidator<TestRequest>
    {
        public AsyncEmailValidator()
        {
            RuleFor(x => x.Email)
                .MustAsync(async (email, ct) =>
                {
                    await Task.Delay(1, ct);
                    return email.Contains('@');
                })
                .WithMessage("Invalid email format");
        }
    }

    private static Task<string> Next(CancellationToken ct) => Task.FromResult("handled");

    [Fact]
    public async Task Handle_WithFailingAsyncRule_ShouldThrowValidationException()
    {
        // Arrange
        var behaviour = new ValidationBehaviour<TestRequest, string>([new AsyncEmailValidator()]);

        // Act
        var act = async () => await behaviour.Handle(new TestRequest("no-at-sign"), Next, CancellationToken.None);

        // Assert
        var thrown = await act.Should().ThrowAsync<ValidationException>();
        thrown.Which.Errors.Should().ContainSingle(e => e.ErrorMessage == "Invalid email format");
    }

    [Fact]
    public async Task Handle_WithPassingAsyncRule_ShouldCallTheHandler()
    {
        // Arrange
        var behaviour = new ValidationBehaviour<TestRequest, string>([new AsyncEmailValidator()]);

        // Act
        var result = await behaviour.Handle(new TestRequest("user@mail.com"), Next, CancellationToken.None);

        // Assert
        result.Should().Be("handled");
    }

    [Fact]
    public async Task Handle_WithoutValidators_ShouldCallTheHandler()
    {
        // Arrange
        var behaviour = new ValidationBehaviour<TestRequest, string>([]);

        // Act
        var result = await behaviour.Handle(new TestRequest("anything"), Next, CancellationToken.None);

        // Assert
        result.Should().Be("handled");
    }
}
