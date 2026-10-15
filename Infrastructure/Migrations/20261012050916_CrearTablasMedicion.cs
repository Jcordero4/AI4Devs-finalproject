using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CrearTablasMedicion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mediciones",
                columns: table => new
                {
                    ClienteId = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaMedicion = table.Column<DateOnly>(type: "date", nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Grasa = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    MasaMuscular = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Agua = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    GrasaVisceral = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Imc = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mediciones", x => new { x.ClienteId, x.FechaMedicion });
                    table.ForeignKey(
                        name: "FK_Mediciones_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PlanesNutricionales",
                columns: table => new
                {
                    ClienteId = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaMedicion = table.Column<DateOnly>(type: "date", nullable: false),
                    Lacteo = table.Column<int>(type: "int", nullable: false),
                    Fruta = table.Column<int>(type: "int", nullable: false),
                    Vegetales = table.Column<int>(type: "int", nullable: false),
                    Harinas = table.Column<int>(type: "int", nullable: false),
                    Proteina = table.Column<int>(type: "int", nullable: false),
                    Grasa = table.Column<int>(type: "int", nullable: false),
                    Agua = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanesNutricionales", x => new { x.ClienteId, x.FechaMedicion });
                    table.ForeignKey(
                        name: "FK_PlanesNutricionales_Mediciones_ClienteId_FechaMedicion",
                        columns: x => new { x.ClienteId, x.FechaMedicion },
                        principalTable: "Mediciones",
                        principalColumns: new[] { "ClienteId", "FechaMedicion" },
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Tratamientos",
                columns: table => new
                {
                    ClienteId = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaMedicion = table.Column<DateOnly>(type: "date", nullable: false),
                    Secuencia = table.Column<int>(type: "int", nullable: false),
                    Producto = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Dosis = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tratamientos", x => new { x.ClienteId, x.FechaMedicion, x.Secuencia });
                    table.ForeignKey(
                        name: "FK_Tratamientos_Mediciones_ClienteId_FechaMedicion",
                        columns: x => new { x.ClienteId, x.FechaMedicion },
                        principalTable: "Mediciones",
                        principalColumns: new[] { "ClienteId", "FechaMedicion" },
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanesNutricionales");

            migrationBuilder.DropTable(
                name: "Tratamientos");

            migrationBuilder.DropTable(
                name: "Mediciones");
        }
    }
}
