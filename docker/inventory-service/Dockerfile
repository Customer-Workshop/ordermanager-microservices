# Stage 1: Build .NET Inventory Service
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY services/inventory-service/InventoryService.csproj services/inventory-service/
RUN dotnet restore services/inventory-service/InventoryService.csproj
COPY services/inventory-service/ services/inventory-service/
RUN dotnet publish services/inventory-service/InventoryService.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "InventoryService.dll"]
