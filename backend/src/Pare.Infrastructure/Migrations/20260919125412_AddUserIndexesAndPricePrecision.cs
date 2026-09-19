using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIndexesAndPricePrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "subscriptions",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            // Existing emails were stored as typed; normalize them so the index compares like the app does.
            // If two accounts collide after lowercasing, CreateIndex fails and the whole migration rolls back.
            migrationBuilder.Sql("""UPDATE users SET "Email" = LOWER(TRIM("Email"));""");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_RefreshToken",
                table: "users",
                column: "RefreshToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_Email",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_RefreshToken",
                table: "users");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "subscriptions",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldPrecision: 12,
                oldScale: 2);
        }
    }
}
