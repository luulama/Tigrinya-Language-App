FROM mcr.microsoft.com/dotnet/sdk:10.0.404 AS build
WORKDIR /src
COPY Directory.Build.props global.json PolyglotCore.sln ./
COPY apps/api/ apps/api/
RUN dotnet restore apps/api/Polyglot.Api --locked-mode
RUN dotnet publish apps/api/Polyglot.Api -c Release --no-restore -o /out /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
USER $APP_UID
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["dotnet","Polyglot.Api.dll"]
