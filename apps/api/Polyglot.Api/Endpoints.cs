using System.Text;
using System.Text.Json;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Polyglot.Application;
using Polyglot.Domain.Content;
using Polyglot.Domain.Identity;
using Polyglot.Domain.Learning;
using Polyglot.Domain.Progress;
using Polyglot.Infrastructure;
namespace Polyglot.Api;

public sealed record ContentResponse(Guid Id, string LanguageTag, ContentKind Kind, string Title, int Revision, WorkflowState State, Guid ConcurrencyStamp, JsonElement Payload);
public sealed record ContentPage(IReadOnlyList<ContentResponse> Items, int Offset, int Limit, bool HasMore);
public sealed record EditRequest(string Title, JsonElement Payload, Guid ConcurrencyStamp);
public sealed record ActionRequest(Guid ConcurrencyStamp, string Action, ApprovalScope? Scope, bool? Approved, string? Notes);
public sealed record ProfileRequest(string Presentation, string LanguageTag, string Goal, bool IsChild, bool AnalyticsConsent);
public sealed record ExposureRequest(Guid EventId, Guid ContentId, int Revision, Skill Skill);
public sealed record ReviewRequest(Guid EventId, Guid QuestionId, int Revision, string Answer, bool Helped, ReviewOutcome Confidence);
public sealed record QuestionResponse(Guid Id, int Revision, Guid TargetId, string Prompt, IReadOnlyList<string> Options, string Skill, Guid? AudioAssetId);
public sealed record ReviewerRequest(string Subject, string LanguageTag, IReadOnlyList<ApprovalScope> Scopes, string QualificationEvidence);
public sealed record LanguageRequest(string Tag, string Name, string Script, string Direction, string ScriptModel);
public sealed record RelationshipRequest(string AdultSubject, string LearnerSubject, string Kind, bool Verified, string VerificationEvidence);
public sealed record ActivityRequest(Guid EventId, string Kind, Guid? ContentId, int DurationSeconds);
public static class Endpoints
{
    public static void MapPolyglotEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").RequireRateLimiting("api");
        api.MapLearningStartEndpoints();
        api.MapGet("/languages", async (AppDbContext db, CancellationToken ct) => Results.Ok(await db.Languages.AsNoTracking().OrderBy(x => x.Tag).ToListAsync(ct)));
        var kinds = new Dictionary<string, ContentKind> { { "courses", ContentKind.Course }, { "lessons", ContentKind.Lesson }, { "words", ContentKind.Word }, { "stories", ContentKind.Story }, { "dialogs", ContentKind.Dialogue }, { "audio", ContentKind.AudioAsset }, { "images", ContentKind.ImageAsset } };
        foreach (var entry in kinds)
        {
            var kind = entry.Value;
            api.MapGet("/" + entry.Key, async (string? language, string? q, int? offset, int? limit, AppDbContext db, CancellationToken ct) => await ListAsync(kind, language, q, offset ?? 0, limit ?? 24, db, ct));
        }
        api.MapGet("/content/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) => { var item = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == id, ct); return item is null ? Results.NotFound() : Results.Ok(PublicResponse(item)); });
        api.MapGet("/media/{id:guid}", async (Guid id, AppDbContext db, IServiceProvider services, CancellationToken ct) =>
        {
            var item = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == id, ct);
            if (item is null || item.Kind is not (ContentKind.AudioAsset or ContentKind.ImageAsset or ContentKind.VideoAsset))
                return Results.NotFound();
            var store = services.GetService<IAssetStore>();
            if (store is null)
                return Results.Problem("Media storage is not configured.", statusCode: 503);
            var payload = PublicResponse(item).Payload;
            var name = payload.GetProperty("blobName").GetString()!;
            if (!await store.ExistsAsync(name, ct))
                return Results.NotFound();
            return Results.Stream(await store.OpenReadAsync(name, ct), MediaType(name) ?? "application/octet-stream", enableRangeProcessing: true);
        });
        var me = api.MapGroup("").RequireAuthorization("learner");
        me.MapGet("/users/me", async (AppDbContext db, ICurrentUser user, CancellationToken ct) => Results.Text(JsonSerializer.Serialize(await db.Learners.AsNoTracking().SingleOrDefaultAsync(x => x.Subject == user.Subject, ct), ContentPayloadValidator.JsonOptions), "application/json"));
        me.MapPut("/users/me", async (ProfileRequest request, AppDbContext db, ICurrentUser user, HttpContext http, TimeProvider clock, CancellationToken ct) =>
        {
            if (!new[] { "child", "teen", "adult" }.Contains(request.Presentation) || string.IsNullOrWhiteSpace(request.Goal) || request.Goal.Length > 100 || !await db.Languages.AnyAsync(x => x.Tag == request.LanguageTag, ct) || request.IsChild && request.AnalyticsConsent)
                return Results.BadRequest(new
                {
                    message = "Choose a supported language, presentation and goal. Child analytics are disabled."
                });
            if ((!request.IsChild || request.AnalyticsConsent) && !http.User.IsInRole("Administrator") && !http.User.HasClaim("polyglot_verified_adult", "true"))
                return Results.Forbid();
            var profile = await db.Learners.SingleOrDefaultAsync(x => x.Subject == user.Subject, ct);
            if (profile is null)
            {
                profile = new Learner { Subject = user.Subject };
                db.Learners.Add(profile);
            }
            profile.Presentation = request.Presentation;
            profile.LanguageTag = request.LanguageTag;
            profile.Goal = request.Goal;
            profile.IsChild = request.IsChild;
            profile.AnalyticsConsent = request.AnalyticsConsent;
            profile.UpdatedAt = clock.GetUtcNow();
            await db.SaveChangesAsync(ct);
            return Results.Ok(profile);
        });
        me.MapGet("/progress", ProgressAsync);
        me.MapGet("/reviews", async (AppDbContext db, ICurrentUser user, TimeProvider clock, CancellationToken ct) =>
        {
            var now = clock.GetUtcNow();
            var states = await db.LearningStates.AsNoTracking().Where(x => x.LearnerSubject == user.Subject && x.DueAt <= now).OrderBy(x => x.DueAt).Take(10).ToListAsync(ct);
            var queue = new List<QuestionResponse>();
            foreach (var state in states)
            {
                var candidates = await PublishedQuery(db)
                    .Where(x => x.Kind == ContentKind.Question && db.Links.Any(link => link.SourceId == x.Id && link.TargetId == state.ContentId && link.Relation == "target"))
                    .OrderBy(x => x.Id).ToListAsync(ct);
                var item = candidates.FirstOrDefault(x => ReadQuestion(x).Skill.Equals(state.Skill.ToString(), StringComparison.OrdinalIgnoreCase));
                if (item is not null)
                {
                    var question = ReadQuestion(item);
                    queue.Add(ToQuestion(item, question));
                }
            }
            return Results.Ok(queue);
        });
        me.MapGet("/reviews/questions/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) => { var item = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == id && x.Kind == ContentKind.Question, ct); return item is null ? Results.NotFound() : Results.Ok(ToQuestion(item, ReadQuestion(item))); });
        me.MapPost("/reviews", ReviewAsync);
        me.MapPost("/reviews/exposures", async (ExposureRequest request, AppDbContext db, ICurrentUser user, TimeProvider clock, CancellationToken ct) =>
        {
            if (request.EventId == Guid.Empty || !Enum.IsDefined(request.Skill))
                return Results.BadRequest();
            var existing = await db.Exposures.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.EventId, ct);
            if (existing is not null)
                return existing.LearnerSubject == user.Subject && existing.ContentId == request.ContentId && existing.Revision == request.Revision && existing.Skill == request.Skill ? Results.NoContent() : Results.Conflict();
            var content = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == request.ContentId && x.PublishedRevision == request.Revision, ct);
            if (content is null)
                return Results.Conflict();
            var now = clock.GetUtcNow();
            var state = await db.LearningStates.SingleOrDefaultAsync(x => x.LearnerSubject == user.Subject && x.ContentId == request.ContentId && x.ContentRevision == request.Revision && x.Skill == request.Skill, ct);
            if (state is null)
            {
                state = new LearningState { LearnerSubject = user.Subject, ContentId = request.ContentId, ContentRevision = request.Revision, Skill = request.Skill, DueAt = now.AddDays(1) };
                db.LearningStates.Add(state);
            }
            state.LastExposureAt = now;
            state.ConcurrencyStamp = Guid.NewGuid();
            db.Exposures.Add(new LearningExposure { Id = request.EventId, LearnerSubject = user.Subject, ContentId = request.ContentId, Revision = request.Revision, Skill = request.Skill, At = now });
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });
        me.MapGet("/achievements", async (AppDbContext db, ICurrentUser user, CancellationToken ct) => Results.Ok(await db.Achievements.AsNoTracking().Where(x => x.LearnerSubject == user.Subject).OrderByDescending(x => x.EarnedAt).Take(100).ToListAsync(ct)));
        me.MapGet("/collections", async (AppDbContext db, ICurrentUser user, CancellationToken ct) => Results.Ok(await db.Collections.AsNoTracking().Where(x => x.LearnerSubject == user.Subject).ToListAsync(ct)));
        me.MapPut("/collections/{contentId:guid}", async (Guid contentId, AppDbContext db, ICurrentUser user, CancellationToken ct) => { if (!await PublishedQuery(db).AnyAsync(x => x.Id == contentId, ct)) return Results.NotFound(); if (!await db.Collections.AnyAsync(x => x.LearnerSubject == user.Subject && x.ContentId == contentId, ct)) { db.Collections.Add(new Collection { LearnerSubject = user.Subject, ContentId = contentId }); await db.SaveChangesAsync(ct); } return Results.NoContent(); });
        me.MapDelete("/collections/{contentId:guid}", async (Guid contentId, AppDbContext db, ICurrentUser user, CancellationToken ct) => { await db.Collections.Where(x => x.LearnerSubject == user.Subject && x.ContentId == contentId).ExecuteDeleteAsync(ct); return Results.NoContent(); });
        me.MapGet("/recommendations", async (AppDbContext db, ICurrentUser user, TimeProvider clock, CancellationToken ct) =>
        {
            var due = await db.LearningStates.AsNoTracking().Where(x => x.LearnerSubject == user.Subject && x.DueAt <= clock.GetUtcNow()).OrderBy(x => x.DueAt).Select(x => x.ContentId).Take(3).ToListAsync(ct);
            if (due.Count > 0)
                return Results.Ok(new
                {
                    reason = "due_review",
                    contentIds = due
                });
            var language = await db.Learners.Where(x => x.Subject == user.Subject).Select(x => x.LanguageTag).SingleOrDefaultAsync(ct) ?? "ti";
            var lessons = await PublishedQuery(db).Where(x => x.LanguageTag == language && x.Kind == ContentKind.Lesson).OrderBy(x => x.UpdatedAt).Select(x => x.Id).Take(1).ToListAsync(ct);
            return Results.Ok(new
            {
                reason = lessons.Count == 0 ? "awaiting_reviewed_content" : "next_lesson",
                contentIds = lessons
            });
        });
        me.MapPost("/activities", async (ActivityRequest request, AppDbContext db, ICurrentUser user, TimeProvider clock, CancellationToken ct) =>
        {
            var allowed = new[] { "lesson_start", "lesson_finish", "review_complete", "story_complete", "speaking_attempt", "writing_attempt" };
            if (request.EventId == Guid.Empty || !allowed.Contains(request.Kind) || request.DurationSeconds is < 0 or > 14400)
                return Results.BadRequest();
            var consent = await db.Learners.AnyAsync(x => x.Subject == user.Subject && !x.IsChild && x.AnalyticsConsent, ct);
            if (!consent)
                return Results.NoContent();
            var existing = await db.Activities.FindAsync([request.EventId], ct);
            if (existing is not null)
                return existing.LearnerSubject == user.Subject ? Results.NoContent() : Results.Conflict();
            db.Activities.Add(new ActivityEvent { Id = request.EventId, LearnerSubject = user.Subject, Kind = request.Kind, ContentId = request.ContentId, DurationSeconds = request.DurationSeconds, At = clock.GetUtcNow() });
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });
        api.MapGet("/parents/learners", async (AppDbContext db, ICurrentUser user, CancellationToken ct) => Results.Ok(await db.Relationships.AsNoTracking().Where(x => x.AdultSubject == user.Subject && x.Verified && x.Kind == "parent").Select(x => x.LearnerSubject).ToListAsync(ct))).RequireAuthorization("learner");
        api.MapGet("/teachers/learners", async (AppDbContext db, ICurrentUser user, CancellationToken ct) => Results.Ok(await db.Relationships.AsNoTracking().Where(x => x.AdultSubject == user.Subject && x.Verified && x.Kind == "teacher").Select(x => x.LearnerSubject).ToListAsync(ct))).RequireAuthorization("teacher");
        api.MapGet("/parents/learners/{subject}/progress", async (string subject, AppDbContext db, ICurrentUser user, CancellationToken ct) => await db.Relationships.AnyAsync(x => x.AdultSubject == user.Subject && x.LearnerSubject == subject && x.Kind == "parent" && x.Verified, ct) ? await ProgressForAsync(db, subject, ct) : Results.Forbid()).RequireAuthorization("parent");
        api.MapGet("/teachers/learners/{subject}/progress", async (string subject, AppDbContext db, ICurrentUser user, CancellationToken ct) => await db.Relationships.AnyAsync(x => x.AdultSubject == user.Subject && x.LearnerSubject == subject && x.Kind == "teacher" && x.Verified, ct) ? await ProgressForAsync(db, subject, ct) : Results.Forbid()).RequireAuthorization("teacher");
        var cms = api.MapGroup("/admin");
        cms.MapGet("/content", async (int? offset, ContentKind? kind, AppDbContext db, ICurrentUser user, HttpContext http, CancellationToken ct) =>
        {
            if (offset is < 0)
                return Results.BadRequest();
            var content = db.Content.Include(x => x.Versions).AsQueryable();
            if (kind.HasValue)
                content = content.Where(x => x.Kind == kind.Value);
            if (!http.User.IsInRole("Reviewer") && !http.User.IsInRole("Administrator"))
                content = content.Where(x => x.AuthorSubject == user.Subject);
            var items = await content.OrderByDescending(x => x.UpdatedAt).Skip(offset ?? 0).Take(50).ToListAsync(ct);
            return Results.Ok(items.Select(PrivateResponse));
        }).RequireAuthorization("manage");
        cms.MapGet("/content/{id:guid}", async (Guid id, AppDbContext db, ICurrentUser user, HttpContext http, CancellationToken ct) => { var item = await db.FindAsync(id, ct); if (item is null) return Results.NotFound(); if (item.AuthorSubject != user.Subject && !http.User.IsInRole("Reviewer") && !http.User.IsInRole("Administrator")) return Results.Forbid(); return Results.Ok(new { item = PrivateResponse(item), versions = item.Versions, approvals = item.Approvals }); }).RequireAuthorization("manage");
        cms.MapPost("/content", async (CreateContent request, ISender sender, CancellationToken ct) => Results.Created("/api/admin/content", new { id = await sender.Send(request, ct) })).RequireAuthorization("edit");
        cms.MapPut("/content/{id:guid}", async (Guid id, EditRequest request, AppDbContext db, ICurrentUser user, TimeProvider clock, CancellationToken ct) =>
        {
            var item = await db.FindAsync(id, ct);
            if (item is null)
                return Results.NotFound();
            if (item.AuthorSubject != user.Subject)
                return Results.Forbid();
            if (item.ConcurrencyStamp != request.ConcurrencyStamp)
                return Results.Conflict();
            if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
                return Results.BadRequest();
            ContentPayloadValidator.Validate(item.Kind, request.Payload);
            item.Edit(request.Title, request.Payload.GetRawText(), clock.GetUtcNow());
            await db.SaveChangesAsync(ct);
            return Results.Ok(PrivateResponse(item));
        }).RequireAuthorization("edit");
        cms.MapPost("/content/{id:guid}/actions", ActionAsync).RequireAuthorization();
        cms.MapGet("/assets/{id:guid}/file", async (Guid id, AppDbContext db, ICurrentUser user, HttpContext http, IServiceProvider services, CancellationToken ct) =>
        {
            var item = await db.FindAsync(id, ct);
            if (item is null || item.Kind is not (ContentKind.AudioAsset or ContentKind.ImageAsset or ContentKind.VideoAsset))
                return Results.NotFound();
            if (item.AuthorSubject != user.Subject && !http.User.IsInRole("Reviewer") && !http.User.IsInRole("Administrator"))
                return Results.Forbid();
            var store = services.GetService<IAssetStore>();
            if (store is null)
                return Results.Problem("Media storage is not configured.", statusCode: 503);
            using var payload = JsonDocument.Parse(item.Payload);
            var name = payload.RootElement.GetProperty("blobName").GetString()!;
            if (!await store.ExistsAsync(name, ct))
                return Results.NotFound();
            http.Response.Headers.CacheControl = "no-store";
            return Results.Stream(await store.OpenReadAsync(name, ct), MediaType(name) ?? "application/octet-stream", enableRangeProcessing: true);
        }).RequireAuthorization("manage");
        cms.MapPut("/assets/{id:guid}/file", async (Guid id, HttpRequest request, AppDbContext db, ICurrentUser user, IServiceProvider services, CancellationToken ct) =>
        {
            var item = await db.FindAsync(id, ct);
            if (item is null)
                return Results.NotFound();
            if (item.AuthorSubject != user.Subject)
                return Results.Forbid();
            if (item.State is not (WorkflowState.Draft or WorkflowState.NeedsRevision) || item.Kind is not (ContentKind.AudioAsset or ContentKind.ImageAsset or ContentKind.VideoAsset))
                return Results.Conflict();
            var assets = services.GetService<IAssetStore>();
            if (assets is null)
                return Results.Problem("Media storage is not configured.", statusCode: 503);
            using var payload = JsonDocument.Parse(item.Payload);
            var name = payload.RootElement.GetProperty("blobName").GetString()!;
            var type = MediaType(name);
            if (type is null)
                return Results.BadRequest(new
                {
                    message = "Use a supported PNG, JPEG, WebP, MP3, WAV or MP4 file."
                });
            using var data = new MemoryStream();
            await request.Body.CopyToAsync(data, ct);
            if (data.Length == 0)
                return Results.BadRequest();
            data.Position = 0;
            var digest = Convert.ToHexStringLower(await System.Security.Cryptography.SHA256.HashDataAsync(data, ct));
            if (digest != payload.RootElement.GetProperty("sha256").GetString())
                return Results.BadRequest(new
                {
                    message = "The file does not match the draft's SHA-256 digest."
                });
            data.Position = 0;
            await assets.UploadAsync(name, data, type, ct);
            return Results.NoContent();
        }).RequireAuthorization("edit");
        cms.MapPut("/reviewers", async (ReviewerRequest request, AppDbContext db, CancellationToken ct) => { if (string.IsNullOrWhiteSpace(request.Subject) || request.Subject.Length > 200 || string.IsNullOrWhiteSpace(request.QualificationEvidence) || request.Scopes is null || request.Scopes.Count == 0 || request.Scopes.Any(x => !Enum.IsDefined(x)) || !await db.Languages.AnyAsync(x => x.Tag == request.LanguageTag, ct)) return Results.BadRequest(); var reviewer = await db.Reviewers.SingleOrDefaultAsync(x => x.Subject == request.Subject && x.LanguageTag == request.LanguageTag, ct); if (reviewer is null) { reviewer = new Reviewer { Subject = request.Subject, LanguageTag = request.LanguageTag }; db.Reviewers.Add(reviewer); } reviewer.Scopes = string.Join(',', request.Scopes.Distinct()); reviewer.QualificationEvidence = request.QualificationEvidence; await db.SaveChangesAsync(ct); return Results.Ok(reviewer); }).RequireAuthorization("admin");
        cms.MapPut("/relationships", async (RelationshipRequest request, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.AdultSubject) || request.AdultSubject.Length > 200 || !new[] { "parent", "teacher" }.Contains(request.Kind) || string.IsNullOrWhiteSpace(request.VerificationEvidence) || !await db.Learners.AnyAsync(x => x.Subject == request.LearnerSubject, ct))
                return Results.BadRequest();
            var relation = await db.Relationships.SingleOrDefaultAsync(x => x.AdultSubject == request.AdultSubject && x.LearnerSubject == request.LearnerSubject && x.Kind == request.Kind, ct);
            if (relation is null)
            {
                relation = new Relationship { AdultSubject = request.AdultSubject, LearnerSubject = request.LearnerSubject, Kind = request.Kind };
                db.Relationships.Add(relation);
            }
            relation.Verified = request.Verified;
            relation.VerificationEvidence = request.VerificationEvidence;
            await db.SaveChangesAsync(ct);
            return Results.Ok(relation);
        }).RequireAuthorization("admin");
        cms.MapPut("/languages", async (LanguageRequest request, AppDbContext db, CancellationToken ct) => { if (string.IsNullOrWhiteSpace(request.Tag) || request.Tag.Length > 35 || !new[] { "ltr", "rtl" }.Contains(request.Direction) || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Script) || string.IsNullOrWhiteSpace(request.ScriptModel)) return Results.BadRequest(); var language = await db.Languages.FindAsync([request.Tag], ct); if (language is null) { language = new Language { Tag = request.Tag }; db.Languages.Add(language); } language.Name = request.Name; language.Script = request.Script; language.Direction = request.Direction; language.ScriptModel = request.ScriptModel; await db.SaveChangesAsync(ct); return Results.Ok(language); }).RequireAuthorization("admin");
    }
    private static string? MediaType(string name) => Path.GetExtension(name).ToLowerInvariant() switch { ".png" => "image/png", ".jpg" or ".jpeg" => "image/jpeg", ".webp" => "image/webp", ".mp3" => "audio/mpeg", ".wav" => "audio/wav", ".mp4" => "video/mp4", _ => null };
    private static IQueryable<ContentItem> PublishedQuery(AppDbContext db) => db.Content.AsNoTracking().Include(x => x.Versions).Where(x => x.PublishedRevision != null && x.State != WorkflowState.Archived);
    private static ContentResponse PrivateResponse(ContentItem x) => new(x.Id, x.LanguageTag, x.Kind, x.Title, x.Revision, x.State, x.ConcurrencyStamp, JsonDocument.Parse(x.Payload).RootElement.Clone());
    private static ContentResponse PublicResponse(ContentItem item)
    {
        var version = item.Versions.Single(x => x.Revision == item.PublishedRevision);
        var payload = JsonDocument.Parse(version.Payload).RootElement.Clone();
        if (item.Kind == ContentKind.Question)
        {
            var q = JsonSerializer.Deserialize<Question>(version.Payload, ContentPayloadValidator.JsonOptions)!;
            payload = JsonSerializer.SerializeToElement(new
            {
                q.TargetId,
                q.Prompt,
                q.Options,
                q.Skill
            }, ContentPayloadValidator.JsonOptions);
        }
        return new(item.Id, item.LanguageTag, item.Kind, version.Title, version.Revision, WorkflowState.Published, item.ConcurrencyStamp, payload);
    }
    private static T Deserialize<T>(ContentItem item) => PublicResponse(item).Payload.Deserialize<T>(ContentPayloadValidator.JsonOptions)!;
    private static Question ReadQuestion(ContentItem item)
    {
        var version = item.Versions.Single(x => x.Revision == item.PublishedRevision);
        return JsonSerializer.Deserialize<Question>(version.Payload, ContentPayloadValidator.JsonOptions)!;
    }
    private static QuestionResponse ToQuestion(ContentItem item, Question question) => new(item.Id, item.PublishedRevision!.Value, question.TargetId, question.Prompt, question.Options, question.Skill, question.AudioAssetId);
    private static async Task<IResult> ListAsync(ContentKind kind, string? language, string? q, int offset, int limit, AppDbContext db, CancellationToken ct)
    {
        if (offset < 0 || limit is < 1 or > 100 || q?.Length > 100 || language?.Length > 35)
            return Results.BadRequest();
        var query = PublishedQuery(db).Where(x => x.Kind == kind);
        if (language is not null)
            query = query.Where(x => x.LanguageTag == language);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var normal = q.Normalize(NormalizationForm.FormC);
            query = db.Database.IsNpgsql() ? query.Where(x => EF.Property<NpgsqlTypes.NpgsqlTsVector>(x, "SearchVector").Matches(EF.Functions.PlainToTsQuery("simple", normal))) : query.Where(x => x.PublishedTitle.Contains(normal));
        }
        var items = await query.OrderBy(x => x.Id).Skip(offset).Take(limit + 1).ToListAsync(ct);
        return Results.Ok(new ContentPage(items.Take(limit).Select(PublicResponse).ToList(), offset, limit, items.Count > limit));
    }
    private static Task<IResult> ProgressAsync(AppDbContext db, ICurrentUser user, CancellationToken ct) => ProgressForAsync(db, user.Subject, ct);
    private static async Task<IResult> ProgressForAsync(AppDbContext db, string subject, CancellationToken ct)
    {
        var states = await db.LearningStates.AsNoTracking().Where(x => x.LearnerSubject == subject).ToListAsync(ct);
        return Results.Ok(new
        {
            skills = states.GroupBy(x => x.Skill).Select(g => new { skill = g.Key, practised = g.Count(), independentCorrect = g.Sum(x => x.IndependentCorrect), independentAttempts = g.Sum(x => x.IndependentAttempts), retention = new RetentionScore(g.Sum(x => x.DelayedCorrect), g.Sum(x => x.DelayedAttempts)) }),
            activities = await db.Activities.Where(x => x.LearnerSubject == subject).CountAsync(ct),
            proficiency = "not_assessed"
        });
    }
    private static async Task<IResult> ReviewAsync(ReviewRequest request, AppDbContext db, ICurrentUser user, SchedulingEngine scheduler, TimeProvider clock, CancellationToken ct)
    {
        if (request.EventId == Guid.Empty || request.QuestionId == Guid.Empty || string.IsNullOrWhiteSpace(request.Answer) || request.Answer.Length > 1000 || request.Revision < 1 || !Enum.IsDefined(request.Confidence))
            return Results.BadRequest();
        var fingerprint = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(request))));
        var existing = await db.Attempts.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.EventId, ct);
        if (existing is not null)
        {
            if (existing.LearnerSubject != user.Subject || existing.SubmissionHash != fingerprint)
                return Results.Conflict();
            var historical = await db.Content.AsNoTracking().Include(x => x.Versions).SingleOrDefaultAsync(x => x.Id == existing.QuestionId && x.State != WorkflowState.Archived, ct);
            if (historical is null)
                return Results.Conflict();
            var previous = historical.Versions.Single(x => x.Revision == existing.QuestionRevision);
            var correction = JsonSerializer.Deserialize<Question>(previous.Payload, ContentPayloadValidator.JsonOptions)!;
            return Results.Ok(new
            {
                correct = existing.Correct,
                helped = existing.Helped,
                model = existing.Correct ? null : correction.Answer,
                explanation = existing.Correct ? null : correction.Explanation,
                replayed = true
            });
        }
        var item = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == request.QuestionId && x.Kind == ContentKind.Question, ct);
        if (item is null)
            return Results.NotFound();
        if (item.PublishedRevision != request.Revision)
            return Results.Conflict(new
            {
                message = "This question has a newer version. Reload it before answering."
            });
        var q = ReadQuestion(item);
        if (!Enum.TryParse<Skill>(q.Skill, true, out var skill))
            return Results.UnprocessableEntity();
        var target = await PublishedQuery(db).SingleOrDefaultAsync(x => x.Id == q.TargetId, ct);
        if (target is null)
            return Results.Conflict();
        var correct = string.Equals(request.Answer.Trim().Normalize(NormalizationForm.FormC), q.Answer.Trim().Normalize(NormalizationForm.FormC), StringComparison.Ordinal);
        var now = clock.GetUtcNow();
        var state = await db.LearningStates.SingleOrDefaultAsync(x => x.LearnerSubject == user.Subject && x.ContentId == target.Id && x.ContentRevision == target.PublishedRevision && x.Skill == skill, ct);
        if (state is null)
        {
            state = new LearningState { LearnerSubject = user.Subject, ContentId = target.Id, ContentRevision = target.PublishedRevision!.Value, Skill = skill, DueAt = now };
            db.LearningStates.Add(state);
        }
        // Recorded model/correction help is authoritative even if a client omits its flag.
        var since = now.AddDays(-1);
        var helped = request.Helped
            || await db.Exposures.AnyAsync(x => x.LearnerSubject == user.Subject && x.ContentId == target.Id && x.Revision == target.PublishedRevision && x.Skill == skill && x.At > since && x.At <= now, ct)
            || await db.Attempts.AnyAsync(x => x.LearnerSubject == user.Subject && x.ContentId == target.Id && x.ContentRevision == target.PublishedRevision && x.Skill == skill && !x.Correct && x.OccurredAt > since && x.OccurredAt <= now, ct);
        var outcome = correct && request.Confidence != ReviewOutcome.Again ? request.Confidence : ReviewOutcome.Again;
        scheduler.Apply(state, outcome, helped, now);
        db.Attempts.Add(new ReviewAttempt { Id = request.EventId, LearnerSubject = user.Subject, ContentId = target.Id, ContentRevision = target.PublishedRevision!.Value, QuestionId = item.Id, QuestionRevision = request.Revision, SubmissionHash = fingerprint, Skill = skill, Outcome = outcome, Helped = helped, Correct = correct, OccurredAt = now });
        await db.SaveChangesAsync(ct);
        return Results.Ok(new
        {
            correct,
            helped,
            model = correct ? null : q.Answer,
            explanation = correct ? null : q.Explanation,
            nextReview = state.DueAt,
            replayed = false
        });
    }
    private static async Task<IResult> ActionAsync(Guid id, ActionRequest request, AppDbContext db, ICurrentUser user, HttpContext http, IServiceProvider services, TimeProvider clock, CancellationToken ct)
    {
        var item = await db.FindAsync(id, ct);
        if (item is null)
            return Results.NotFound();
        if (item.ConcurrencyStamp != request.ConcurrencyStamp)
            return Results.Conflict();
        var now = clock.GetUtcNow();
        bool Role(string role) => http.User.IsInRole(role) || http.User.IsInRole("Administrator");
        switch (request.Action)
        {
            case "submit":
            case "revise":
                if (!Role("Editor") || item.AuthorSubject != user.Subject)
                    return Results.Forbid();
                if (request.Action == "submit")
                    item.Submit(now);
                else
                    item.CreateRevision(now);
                break;
            case "review":
                if (!Role("Reviewer"))
                    return Results.Forbid();
                item.StartReview(now);
                break;
            case "decide":
                if (!Role("Reviewer") || request.Scope is null || request.Approved is null || !Enum.IsDefined(request.Scope.Value))
                    return Results.Forbid();
                var qualification = await db.Reviewers.SingleOrDefaultAsync(x => x.Subject == user.Subject && x.LanguageTag == item.LanguageTag, ct);
                if (qualification is null || !qualification.Scopes.Split(',').Contains(request.Scope.Value.ToString()))
                    return Results.Forbid();
                item.Decide(user.Subject, request.Scope.Value, request.Approved.Value, request.Notes ?? "", now);
                break;
            case "publish":
                if (!http.User.IsInRole("Administrator"))
                    return Results.Forbid();
                using (var doc = JsonDocument.Parse(item.Payload))
                {
                    var ids = ContentPayloadValidator.References(doc.RootElement);
                    var membership = ContentPayloadValidator.References(doc.RootElement, true).Except(ids).ToArray();
                    if (membership.Length > 0 && await db.Content.CountAsync(x => membership.Contains(x.Id) && x.Kind == ContentKind.LetterFamily, ct) != membership.Length)
                        throw new DomainException("Letter membership must reference an existing family.");
                    if (ids.Contains(item.Id))
                        throw new DomainException("Content cannot require itself.");
                    var visited = new HashSet<Guid>();
                    var frontier = ids.ToList();
                    while (frontier.Count > 0)
                    {
                        if (frontier.Contains(item.Id))
                            throw new DomainException("Content dependencies must not form a cycle.");
                        var current = frontier.Where(x => visited.Add(x)).ToArray();
                        if (current.Length == 0)
                            break;
                        if (visited.Count > 10000)
                            throw new DomainException("Dependency graph exceeds the publication limit.");
                        frontier = await db.Links.Where(x => current.Contains(x.SourceId)).Select(x => x.TargetId).ToListAsync(ct);
                    }
                    var published = await PublishedQuery(db).Where(x => ids.Contains(x.Id)).Select(x => x.Id).ToListAsync(ct);
                    if (published.Count != ids.Count)
                        throw new DomainException("Referenced content must be published first.");
                    if (item.Kind == ContentKind.AudioAsset)
                    {
                        var audio = doc.RootElement.Deserialize<AudioAsset>(ContentPayloadValidator.JsonOptions)!;
                        if (item.LanguageTag == "ti" && audio.Generated)
                            throw new DomainException("Tigrinya teaching requires reviewed native recordings.");
                    }
                    if (item.Kind is ContentKind.AudioAsset or ContentKind.ImageAsset or ContentKind.VideoAsset)
                    {
                        var assets = services.GetService<IAssetStore>();
                        if (assets is null || !await assets.ExistsAsync(doc.RootElement.GetProperty("blobName").GetString()!, ct))
                            throw new DomainException("The reviewed media asset must exist before publishing.");
                        await using var stream = await assets.OpenReadAsync(doc.RootElement.GetProperty("blobName").GetString()!, ct);
                        var digest = Convert.ToHexStringLower(await System.Security.Cryptography.SHA256.HashDataAsync(stream, ct));
                        if (digest != doc.RootElement.GetProperty("sha256").GetString())
                            throw new DomainException("The asset no longer matches its reviewed digest.");
                    }
                    db.Links.RemoveRange(await db.Links.Where(x => x.SourceId == item.Id).ToListAsync(ct));
                    foreach (var targetId in ids)
                        db.Links.Add(new ContentLink { SourceId = item.Id, TargetId = targetId, Relation = item.Kind == ContentKind.Question ? "target" : "requires" });
                }
                item.Publish(now);
                break;
            case "archive":
                if (!http.User.IsInRole("Administrator"))
                    return Results.Forbid();
                if (await db.Links.AnyAsync(x => x.TargetId == item.Id, ct))
                    throw new DomainException("Archive dependent content first.");
                item.Archive(now);
                db.Links.RemoveRange(await db.Links.Where(x => x.SourceId == item.Id).ToListAsync(ct));
                break;
            default:
                return Results.BadRequest();
        }
        await db.SaveChangesAsync(ct);
        return Results.Ok(PrivateResponse(item));
    }
}
