using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Pare.Infrastructure.Migrations
{
    /// <inheritdoc />
    // Hand-edited: the scaffolded version dropped the users columns before creating the table,
    // which would have logged everyone out. Order here: create, copy, then drop.
    public partial class MoveRefreshTokensToOwnTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    TokenHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_TokenHash",
                table: "refresh_tokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UserId",
                table: "refresh_tokens",
                column: "UserId");

            // Keep everyone signed in: each user's current session becomes their first row.
            // Expired tokens are skipped, and so is anything that is not a 64-char SHA-256 hex
            // hash (it could never match a cookie anyway and would not fit the column).
            migrationBuilder.Sql("""
                INSERT INTO refresh_tokens ("UserId", "TokenHash", "ExpiresAtUtc", "CreatedAtUtc")
                SELECT "Id", "RefreshToken", "RefreshTokenExpiry", now()
                FROM users
                WHERE "RefreshToken" IS NOT NULL
                  AND "RefreshTokenExpiry" > now()
                  AND length("RefreshToken") = 64;
                """);

            migrationBuilder.DropIndex(
                name: "IX_users_RefreshToken",
                table: "users");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiry",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiry",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            // The old schema holds one session per user: keep the one that lives longest
            migrationBuilder.Sql("""
                UPDATE users AS u
                SET "RefreshToken" = t."TokenHash",
                    "RefreshTokenExpiry" = t."ExpiresAtUtc"
                FROM (
                    SELECT DISTINCT ON ("UserId") "UserId", "TokenHash", "ExpiresAtUtc"
                    FROM refresh_tokens
                    ORDER BY "UserId", "ExpiresAtUtc" DESC
                ) AS t
                WHERE u."Id" = t."UserId";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_users_RefreshToken",
                table: "users",
                column: "RefreshToken",
                unique: true);

            migrationBuilder.DropTable(
                name: "refresh_tokens");
        }
    }
}
