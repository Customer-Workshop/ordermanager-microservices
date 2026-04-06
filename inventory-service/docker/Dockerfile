# Stage 1: Build Angular client
FROM node:20-alpine AS client-build
WORKDIR /app/client-app
COPY client-app/package*.json ./
RUN npm ci
COPY client-app/ ./
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
COPY src/InventoryService.Api/InventoryService.Api.csproj ./InventoryService.Api/
RUN dotnet restore ./InventoryService.Api/InventoryService.Api.csproj
COPY src/ ./
RUN dotnet publish ./InventoryService.Api/InventoryService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=api-build /app/publish .
COPY --from=client-build /app/client-app/dist/inventory-client/browser ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InventoryService.Api.dll"]
