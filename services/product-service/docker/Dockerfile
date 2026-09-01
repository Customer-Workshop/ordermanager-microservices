FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ProductService.sln ./
COPY src/ProductService.Api/ProductService.Api.csproj src/ProductService.Api/
COPY tests/ProductService.Api.Tests/ProductService.Api.Tests.csproj tests/ProductService.Api.Tests/
RUN dotnet restore
COPY . .
RUN dotnet publish src/ProductService.Api/ProductService.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ProductService.Api.dll"]
