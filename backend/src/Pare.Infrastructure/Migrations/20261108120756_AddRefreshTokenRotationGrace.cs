using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenRotationGrace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviousTokenHash",
                table: "refresh_tokens",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RotatedAtUtc",
                table: "refresh_tokens",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_PreviousTokenHash",
                table: "refresh_tokens",
                column: "PreviousTokenHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_refresh_tokens_PreviousTokenHash",
                table: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "PreviousTokenHash",
                table: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "RotatedAtUtc",
                table: "refresh_tokens");
        }
    }
}
