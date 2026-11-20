using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Polyglot.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LearningExposureEvidence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "LastExposureAt",
                table: "LearningStates",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Exposures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LearnerSubject = table.Column<string>(type: "text", nullable: false),
                    ContentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    Skill = table.Column<int>(type: "integer", nullable: false),
                    At = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exposures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Exposures_Content_ContentId",
                        column: x => x.ContentId,
                        principalTable: "Content",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exposures_ContentId",
                table: "Exposures",
                column: "ContentId");

            migrationBuilder.CreateIndex(
                name: "IX_Exposures_LearnerSubject_ContentId_At",
                table: "Exposures",
                columns: new[] { "LearnerSubject", "ContentId", "At" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Exposures");

            migrationBuilder.DropColumn(
                name: "LastExposureAt",
                table: "LearningStates");
        }
    }
}
