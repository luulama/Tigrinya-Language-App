using Polyglot.Api;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Azure.Storage.Blobs;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Polyglot.Application;
using Polyglot.Domain.Content;
using Polyglot.Domain.Learning;
using Polyglot.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 25 * 1024 * 1024);
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("Database") ?? "Host=localhost;Database=polyglot;Username=polyglot;Timeout=3;Command Timeout=5");
if (builder.Configuration.GetValue<bool>("Database:UseManagedIdentity"))
{
    var credential = new Azure.Identity.DefaultAzureCredential();
    dataSourceBuilder.UsePeriodicPasswordProvider(async (_, ct) => (await credential.GetTokenAsync(new Azure.Core.TokenRequestContext(["https://ossrdbms-aad.database.windows.net/.default"]), ct)).Token, TimeSpan.FromMinutes(50), TimeSpan.FromSeconds(30));
}
builder.Services.AddSingleton(dataSourceBuilder.Build());
builder.Services.AddDbContext<AppDbContext>((services, options) => options.UseNpgsql(services.GetRequiredService<Npgsql.NpgsqlDataSource>()));
builder.Services.AddScoped<IContentStore>(provider => provider.GetRequiredService<AppDbContext>());
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddMediatR(config => config.RegisterServicesFromAssemblyContaining<CreateContent>());
builder.Services.AddValidatorsFromAssemblyContaining<CreateContent>();
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddSingleton<IMemoryModel, Sm2MemoryModel>();
builder.Services.AddScoped<SchedulingEngine>();
var authority = builder.Configuration["Entra:Authority"];
var audience = builder.Configuration["Entra:Audience"];
if (builder.Environment.IsProduction() && (string.IsNullOrWhiteSpace(authority) || string.IsNullOrWhiteSpace(audience) || string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("Database")))) throw new InvalidOperationException("Production requires Database and Entra configuration.");
if (!string.IsNullOrWhiteSpace(authority) && (!Uri.TryCreate(authority, UriKind.Absolute, out var authorityUri) || authorityUri.Scheme != "https")) throw new InvalidOperationException("Entra authority must use HTTPS.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = authority;
    options.Audience = audience;
    options.MapInboundClaims = false;
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters { ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true, NameClaimType = "sub", RoleClaimType = "roles", ClockSkew = TimeSpan.FromMinutes(1) };
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("learner", policy => policy.RequireAuthenticatedUser().RequireAssertion(context => context.User.HasClaim(c => c.Type == "scp" && c.Value.Split(' ').Contains(builder.Configuration["Entra:ScopeName"] ?? "access_as_user"))));
    options.AddPolicy("manage", policy => policy.RequireAuthenticatedUser().RequireRole("Editor", "Reviewer", "Administrator"));
    options.AddPolicy("edit", policy => policy.RequireAuthenticatedUser().RequireRole("Editor", "Administrator"));
    options.AddPolicy("review", policy => policy.RequireAuthenticatedUser().RequireRole("Reviewer", "Administrator"));
    options.AddPolicy("publish", policy => policy.RequireAuthenticatedUser().RequireRole("Administrator"));
    options.AddPolicy("admin", policy => policy.RequireAuthenticatedUser().RequireRole("Administrator"));
    options.AddPolicy("parent", policy => policy.RequireAuthenticatedUser().RequireRole("Parent", "Administrator"));
    options.AddPolicy("teacher", policy => policy.RequireAuthenticatedUser().RequireRole("Teacher", "Administrator"));
});
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
if (builder.Environment.IsProduction())
{
    allowedOrigins = allowedOrigins.Where(value => Uri.TryCreate(value, UriKind.Absolute, out var origin) && origin.Scheme == "https" && origin.AbsolutePath == "/" && origin.Query.Length == 0 && origin.Fragment.Length == 0 && origin.UserInfo.Length == 0).Select(value => new Uri(value).GetLeftPart(UriPartial.Authority)).Distinct().ToArray();
    if (allowedOrigins.Length == 0)
        throw new InvalidOperationException("Production requires explicit HTTPS web origins.");
}
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddRateLimiter(options => { options.RejectionStatusCode = 429; options.AddPolicy("api", context => System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(context.User.Identity?.IsAuthenticated == true ? "user:" + (context.User.FindFirstValue("oid") ?? context.User.FindFirstValue("sub") ?? "unknown") : "ip:" + (context.Connection.RemoteIpAddress?.ToString() ?? "unknown"), _ => new() { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 })); });
var blobEndpoint = builder.Configuration["Storage:ServiceUri"];
var blobConnection = builder.Configuration["Storage:ConnectionString"];
if (!string.IsNullOrWhiteSpace(blobConnection))
    builder.Services.AddSingleton<IAssetStore>(new BlobAssetStore(new BlobContainerClient(blobConnection, builder.Configuration["Storage:Container"] ?? "content")));
else if (!string.IsNullOrWhiteSpace(blobEndpoint))
    builder.Services.AddSingleton<IAssetStore>(new BlobAssetStore(new BlobContainerClient(new Uri(blobEndpoint), new Azure.Identity.DefaultAzureCredential())));
if (builder.Configuration.GetValue<bool>("Telemetry:Enabled")) builder.Services.AddApplicationInsightsTelemetry(options => { options.ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]; options.EnableRequestTrackingTelemetryModule = false; options.EnableDependencyTrackingTelemetryModule = false; options.EnablePerformanceCounterCollectionModule = false; options.EnableQuickPulseMetricStream = false; });
var app = builder.Build();
app.UseExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
app.MapGet("/health/ready", async (AppDbContext db, CancellationToken ct) => { try { return await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ready" }) : Results.Problem("Database is unavailable.", statusCode: 503); } catch (Exception) { return Results.Problem("Database is unavailable.", statusCode: 503); } });
app.MapGet("/api/auth/config", () => Results.Ok(new { enabled = !string.IsNullOrWhiteSpace(authority) && !string.IsNullOrWhiteSpace(audience), authority, clientId = builder.Configuration["Entra:WebClientId"], scope = builder.Configuration["Entra:ApiScope"] }));
if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.MapPolyglotEndpoints();
if (args.Contains("--migrate")) { await using var scope = app.Services.CreateAsyncScope(); await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync(); return; }
if (args.Contains("--seed")) { await using var scope = app.Services.CreateAsyncScope(); await Seed.RunAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), args); return; }
app.Run();
public partial class Program;
public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public string Subject => accessor.HttpContext?.User.FindFirstValue("oid") ?? accessor.HttpContext?.User.FindFirstValue("sub") ?? throw new UnauthorizedAccessException();
}
public sealed class ApiExceptionHandler(IProblemDetailsService problems, ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken token)
    {
        var status = exception switch
        {
            ValidationException => 400,
            DomainException => 422,
            ArgumentException => 400,
            System.Text.Json.JsonException => 400,
            DbUpdateConcurrencyException => 409,
            UnauthorizedAccessException => 401,
            DbUpdateException => 409,
            Azure.RequestFailedException azure => azure.Status == 409 ? 409 : 503,
            Npgsql.NpgsqlException => 503,
            _ => 500
        };
        if (status == 500)
            logger.LogError("Unhandled request error of type {ExceptionType}", exception.GetType().Name);
        context.Response.StatusCode = status;
        return await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = context, ProblemDetails = new() { Status = status, Title = status == 500 ? "An unexpected error occurred." : status == 503 ? "Database is unavailable." : "Request could not be completed.", Detail = status is 400 or 422 ? exception.Message : null } });
    }
}
