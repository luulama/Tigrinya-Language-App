using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Polyglot.Application;
using Polyglot.Domain.Content;
using Polyglot.Domain.Identity;
using Polyglot.Infrastructure;

namespace Polyglot.Api;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record LearningStartRequest(string Listening, string Speaking, string Reading, string Goal, string Pace, bool Quiet, Guid? Revision);
public sealed record LearningStartResponse(string Listening, string Speaking, string Reading, string Goal, string Pace, bool Quiet, Guid Revision, DateTimeOffset UpdatedAt);

public static class LearningStartEndpoints
{
    public static void MapLearningStartEndpoints(this RouteGroupBuilder api)
    {
        var me = api.MapGroup("/users/me/learning-start").RequireAuthorization("learner");
        me.MapGet("", async (AppDbContext db, ICurrentUser user, HttpContext http, CancellationToken ct) =>
        {
            http.Response.Headers.CacheControl = "no-store";
            var row = await (from start in db.LearningStarts.AsNoTracking() join learner in db.Learners on start.LearnerId equals learner.Id where learner.Subject == user.Subject select start).SingleOrDefaultAsync(ct);
            return Results.Text(JsonSerializer.Serialize(row is null ? null : View(row), ContentPayloadValidator.JsonOptions), "application/json");
        });
        me.MapPut("", async (LearningStartRequest request, AppDbContext db, ICurrentUser user, HttpContext http, TimeProvider clock, CancellationToken ct) =>
        {
            http.Response.Headers.CacheControl = "no-store";
            if (!LearningStart.Valid(request.Listening, request.Speaking, request.Reading, request.Goal, request.Pace))
                return Results.BadRequest(new { detail = "Choose the available learning preferences. No ability score is saved." });
            var learner = await db.Learners.SingleOrDefaultAsync(x => x.Subject == user.Subject, ct);
            if (learner is null)
            {
                learner = new Learner { Subject = user.Subject, UpdatedAt = clock.GetUtcNow() };
                db.Learners.Add(learner); // Existing child-safe defaults; never changes adult/analytics authority.
            }
            var row = await db.LearningStarts.SingleOrDefaultAsync(x => x.LearnerId == learner.Id, ct);
            if (row is not null && row.Listening == request.Listening && row.Speaking == request.Speaking && row.Reading == request.Reading && row.Goal == request.Goal && row.Pace == request.Pace && row.Quiet == request.Quiet)
                return Results.Ok(View(row)); // An identical uncertain retry creates no new version.
            if (row is null && request.Revision is not null || row is not null && request.Revision != row.Revision)
                return Results.Conflict(new { detail = "Your saved plan changed. Load it before saving again." });
            if (row is null)
            {
                row = new LearningStart { LearnerId = learner.Id };
                db.LearningStarts.Add(row);
            }
            row.Listening = request.Listening; row.Speaking = request.Speaking; row.Reading = request.Reading;
            row.Goal = request.Goal; row.Pace = request.Pace; row.Quiet = request.Quiet;
            row.Revision = Guid.NewGuid(); row.UpdatedAt = clock.GetUtcNow();
            await db.SaveChangesAsync(ct);
            return Results.Ok(View(row));
        });
        me.MapDelete("", async (AppDbContext db, ICurrentUser user, HttpContext http, CancellationToken ct) =>
        {
            http.Response.Headers.CacheControl = "no-store";
            var row = await (from start in db.LearningStarts join learner in db.Learners on start.LearnerId equals learner.Id where learner.Subject == user.Subject select start).SingleOrDefaultAsync(ct);
            if (row is null) return Results.NoContent();
            if (!Guid.TryParse(http.Request.Headers.IfMatch.ToString().Trim('"'), out var revision))
                return Results.StatusCode(428);
            if (row.Revision != revision) return Results.Conflict();
            db.LearningStarts.Remove(row);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        api.MapGet("/parents/learners/{subject}/summary", SummaryAsync).RequireAuthorization("learner", "parent");
    }

    private static LearningStartResponse View(LearningStart row) => new(row.Listening, row.Speaking, row.Reading, row.Goal, row.Pace, row.Quiet, row.Revision, row.UpdatedAt);

    private static async Task<IResult> SummaryAsync(string subject, AppDbContext db, ICurrentUser user, HttpContext http, TimeProvider clock, CancellationToken ct)
    {
        http.Response.Headers.CacheControl = "no-store";
        if (!await db.Relationships.AsNoTracking().AnyAsync(x => x.AdultSubject == user.Subject && x.LearnerSubject == subject && x.Kind == "parent" && x.Verified, ct)) return Results.Forbid();
        var until = clock.GetUtcNow(); var from = until.AddDays(-7);
        var recent = await db.Attempts.AsNoTracking().Where(x => x.LearnerSubject == subject && x.OccurredAt >= from && x.OccurredAt <= until).OrderByDescending(x=>x.OccurredAt).ThenBy(x=>x.Id).Take(5001).ToListAsync(ct);
        var partial = recent.Count > 5000;
        var attempts = recent.Take(5000).ToArray();
        // Only publishable, exact target revisions may supply learner-facing titles.
        var ids = attempts.Select(x => x.ContentId).Distinct().ToArray();
        var targets = await db.Content.AsNoTracking().Where(x => ids.Contains(x.Id) && x.PublishedRevision != null && x.State != WorkflowState.Archived).ToListAsync(ct);
        var visible = attempts.Where(a => targets.Any(t => t.Id == a.ContentId && t.PublishedRevision == a.ContentRevision)).ToArray();
        var latest = visible.GroupBy(a => new { a.ContentId, a.Skill }).Select(g => g.OrderByDescending(a => a.OccurredAt).ThenBy(a => a.Id).First()).ToArray();
        var later = await db.LearningStates.AsNoTracking().Where(x => x.LearnerSubject == subject).ToListAsync(ct);
        var topics = targets.Where(t => visible.Any(a => a.ContentId == t.Id)).OrderBy(t => t.Id).Take(3).Select(t => new { id = t.Id, title = t.PublishedTitle }).ToArray();
        return Results.Ok(new
        {
            from, until, partial, checks = visible.Length,
            matchedWithHelp = visible.Count(x => x.Correct && x.Helped),
            matchedWithoutAnswerHelp = visible.Count(x => x.Correct && !x.Helped),
            revisit = latest.Count(x => !x.Correct || x.Helped), topics,
            laterCorrect = later.Sum(x => x.DelayedCorrect), laterAttempts = later.Sum(x => x.DelayedAttempts),
            laterScope = "all_time", ability = "not_assessed", studyTime = (int?)null,
            nextAction = visible.Length == 0 ? "Start a small activity together." : "Revisit one familiar item another day. Offer the model if it helps."
        });
    }
}
