# Stage 1: Build Angular client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY services/inventory-service/client-app/package*.json ./
RUN npm ci
COPY services/inventory-service/client-app/ ./
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
COPY services/inventory-service/InventoryService.sln ./
COPY services/inventory-service/src/InventoryService.Api/InventoryService.Api.csproj src/InventoryService.Api/
COPY services/inventory-service/tests/InventoryService.Api.Tests/InventoryService.Api.Tests.csproj tests/InventoryService.Api.Tests/
RUN dotnet restore
COPY services/inventory-service/ .
COPY --from=client-build /app/client/dist/client-app/browser src/InventoryService.Api/wwwroot/
RUN dotnet publish src/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=api-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
