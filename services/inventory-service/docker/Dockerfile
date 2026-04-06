# Stage 1: Build Angular frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client-app
COPY client-app/package*.json ./
RUN npm ci
COPY client-app/ ./
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY src/InventoryService.Api/InventoryService.Api.csproj src/InventoryService.Api/
RUN dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
COPY src/ src/
COPY --from=frontend-build /app/src/InventoryService.Api/wwwroot src/InventoryService.Api/wwwroot/
RUN dotnet publish src/InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
