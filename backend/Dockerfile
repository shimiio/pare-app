# 1. Runtime baseline image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# 2. Build image (SDK - contains all dotnet utilities)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy projects to restore dependencies
COPY src/Pare.API/Pare.API.csproj ./Pare.API/
COPY src/Pare.Application/Pare.Application.csproj ./Pare.Application/
COPY src/Pare.Domain/Pare.Domain.csproj ./Pare.Domain/
COPY src/Pare.Infrastructure/Pare.Infrastructure.csproj ./Pare.Infrastructure/

# Restore dependencies
RUN dotnet restore Pare.API/Pare.API.csproj

# Copy the rest of the source code
COPY src/ ./

# Build and publish the project (using publish instead of build)
RUN dotnet publish /src/Pare.API/Pare.API.csproj \
    -c Release \
    --no-restore \
    -o /app/publish

# 3. Final stage
FROM base AS final
WORKDIR /app

# Copy the published artifacts from the build stage (not from a non-existent publish)
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Pare.API.dll"]
