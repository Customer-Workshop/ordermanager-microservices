# Stage 1: Build Angular client
FROM node:20-alpine AS client-build
WORKDIR /app/client-app
COPY client-app/package*.json ./
RUN npm ci
COPY client-app/ ./
RUN npx ng build --configuration production

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /app
COPY InventoryService.sln ./
COPY src/InventoryService.Api/InventoryService.Api.csproj src/InventoryService.Api/
COPY tests/InventoryService.Api.Tests/InventoryService.Api.Tests.csproj tests/InventoryService.Api.Tests/
RUN dotnet restore
COPY src/ src/
COPY tests/ tests/
RUN dotnet publish src/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=api-build /app/publish .
COPY --from=client-build /app/client-app/dist/inventory-client/browser wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
