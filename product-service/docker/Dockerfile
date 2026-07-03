# Stage 1: Build Angular client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client-app/package*.json ./
RUN npm install
COPY client-app/ ./
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
COPY ProductService.sln ./
COPY src/ProductService.Api/ProductService.Api.csproj src/ProductService.Api/
COPY tests/ProductService.Api.Tests/ProductService.Api.Tests.csproj tests/ProductService.Api.Tests/
RUN dotnet restore
COPY . .
COPY --from=client-build /app/client/dist/client-app/browser src/ProductService.Api/wwwroot/
RUN dotnet publish src/ProductService.Api/ProductService.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=api-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ProductService.Api.dll"]
