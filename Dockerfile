# Imagen de la API NutriTrack (contexto de build = raíz del repo)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restaurar primero (cache de capas)
COPY Domain/NutriTrack.Domain.csproj Domain/
COPY Application/NutriTrack.Application.csproj Application/
COPY Infrastructure/NutriTrack.Infrastructure.csproj Infrastructure/
COPY API/NutriTrackAPI.csproj API/
RUN dotnet restore API/NutriTrackAPI.csproj

COPY Domain/ Domain/
COPY Application/ Application/
COPY Infrastructure/ Infrastructure/
COPY API/ API/
RUN dotnet publish API/NutriTrackAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render inyecta PORT; por defecto 10000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=10000
EXPOSE 10000
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT} exec dotnet NutriTrackAPI.dll"]
