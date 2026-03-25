# Stage 1: Build Angular client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY src/inventory-service/client-app/package*.json ./
RUN npm ci
COPY src/inventory-service/client-app/ ./
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
COPY InventoryService.sln ./
COPY src/inventory-service/InventoryService.Api/InventoryService.Api.csproj src/inventory-service/InventoryService.Api/
COPY tests/inventory-service/InventoryService.Api.Tests/InventoryService.Api.Tests.csproj tests/inventory-service/InventoryService.Api.Tests/
RUN dotnet restore
COPY . .
COPY --from=client-build /app/client/dist/inventory-client/browser src/inventory-service/InventoryService.Api/wwwroot/
RUN dotnet publish src/inventory-service/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=api-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
