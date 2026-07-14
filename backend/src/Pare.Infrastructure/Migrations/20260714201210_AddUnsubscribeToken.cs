using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUnsubscribeToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TokenHash",
                table: "unsubscribe_tokens",
                newName: "Token");

            migrationBuilder.RenameIndex(
                name: "IX_unsubscribe_tokens_TokenHash",
                table: "unsubscribe_tokens",
                newName: "IX_unsubscribe_tokens_Token");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Token",
                table: "unsubscribe_tokens",
                newName: "TokenHash");

            migrationBuilder.RenameIndex(
                name: "IX_unsubscribe_tokens_Token",
                table: "unsubscribe_tokens",
                newName: "IX_unsubscribe_tokens_TokenHash");
        }
    }
}
