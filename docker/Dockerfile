# Stage 1: Build Angular frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client-app
COPY client-app/package*.json ./
RUN npm ci
COPY client-app/ ./
RUN npx ng build --configuration production

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY InventoryService.sln ./
COPY src/InventoryService.Api/InventoryService.Api.csproj src/InventoryService.Api/
COPY tests/InventoryService.Api.Tests/InventoryService.Api.Tests.csproj tests/InventoryService.Api.Tests/
RUN dotnet restore
COPY src/ src/
COPY tests/ tests/
RUN dotnet test --no-restore --verbosity normal
RUN dotnet publish src/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish
COPY --from=frontend-build /app/client-app/dist/client-app/browser /app/publish/wwwroot

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
