# Stage 1: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY LegalRecoveryPlatform.sln ./
COPY src/LegalRecovery.Domain/LegalRecovery.Domain.csproj src/LegalRecovery.Domain/
COPY src/LegalRecovery.Application/LegalRecovery.Application.csproj src/LegalRecovery.Application/
COPY src/LegalRecovery.Infrastructure/LegalRecovery.Infrastructure.csproj src/LegalRecovery.Infrastructure/
COPY src/LegalRecovery.Api/LegalRecovery.Api.csproj src/LegalRecovery.Api/
COPY tests/LegalRecovery.Domain.Tests/LegalRecovery.Domain.Tests.csproj tests/LegalRecovery.Domain.Tests/
COPY tests/LegalRecovery.Application.Tests/LegalRecovery.Application.Tests.csproj tests/LegalRecovery.Application.Tests/
RUN dotnet restore
COPY . .
RUN dotnet publish src/LegalRecovery.Api/LegalRecovery.Api.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "LegalRecovery.Api.dll"]
