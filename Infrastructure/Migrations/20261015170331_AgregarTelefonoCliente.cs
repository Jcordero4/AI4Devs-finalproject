using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTelefonoCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Telefono",
                table: "Clientes",
                type: "varchar(15)",
                maxLength: 15,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            // MySQL agrega la columna al final; se reposiciona para respetar el orden de la definición de tabla.
            migrationBuilder.Sql("ALTER TABLE `Clientes` MODIFY COLUMN `Telefono` varchar(15) CHARACTER SET utf8mb4 NULL AFTER `Altura`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Telefono",
                table: "Clientes");
        }
    }
}
