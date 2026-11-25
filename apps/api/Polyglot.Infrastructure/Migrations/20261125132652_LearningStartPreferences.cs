using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Polyglot.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LearningStartPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LearningStarts",
                columns: table => new
                {
                    LearnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Listening = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Speaking = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Reading = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Goal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Pace = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quiet = table.Column<bool>(type: "boolean", nullable: false),
                    Revision = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningStarts", x => x.LearnerId);
                    table.ForeignKey(
                        name: "FK_LearningStarts_Learners_LearnerId",
                        column: x => x.LearnerId,
                        principalTable: "Learners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LearningStarts");
        }
    }
}
