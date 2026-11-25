using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polyglot.Domain.Content;
using Polyglot.Infrastructure;
namespace Polyglot.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private static readonly object InitialisationLock = new();
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        connection.Open();
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options =>
            {
                var postgres = Environment.GetEnvironmentVariable("POLYGLOT_TEST_POSTGRES");
                if (!string.IsNullOrWhiteSpace(postgres))
                {
                    if (!new Npgsql.NpgsqlConnectionStringBuilder(postgres).Database!.EndsWith("_test", StringComparison.Ordinal))
                        throw new InvalidOperationException("Integration tests require a dedicated _test database.");
                    options.UseNpgsql(postgres);
                }
                else
                    options.UseSqlite(connection);
            });
            services.AddAuthentication(options => { options.DefaultAuthenticateScheme = "Test"; options.DefaultChallengeScheme = "Test"; options.DefaultForbidScheme = "Test"; }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }
    public HttpClient Client(string? subject = null, params string[] roles)
    {
        var client = CreateClient();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Test classes can create factories concurrently against the same isolated
        // PostgreSQL cluster. Seed the shared reference row once, without races.
        lock (InitialisationLock)
        {
            db.Database.EnsureCreated();
            if (!db.Languages.Any(x => x.Tag == "en"))
            {
                db.Languages.Add(new Language { Tag = "en", Name = "English", Script = "Latn", Direction = "ltr", ScriptModel = "alphabet" });
                db.SaveChanges();
            }
        }
        if (subject is not null)
        {
            client.DefaultRequestHeaders.Add("X-Test-User", subject);
            client.DefaultRequestHeaders.Add("X-Test-Roles", string.Join(',', roles));
        }
        return client;
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
            connection.Dispose();
    }
}
public sealed class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Test-User", out var subject))
            return Task.FromResult(AuthenticateResult.NoResult());
        var claims = new List<Claim> { new("sub", subject.ToString()), new("scp", "access_as_user") };
        claims.AddRange(Request.Headers["X-Test-Roles"].ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(role => new Claim("roles", role)));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims, "Test", "sub", "roles")), "Test")));
    }
}
