# Stage 1: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/InventoryService.Api/InventoryService.Api.csproj ./src/InventoryService.Api/
RUN dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
COPY src/ ./src/
RUN dotnet publish src/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/publish .

USER appuser
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
