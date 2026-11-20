using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Polyglot.Api;
using Polyglot.Domain.Content;
using Polyglot.Domain.Identity;
using Polyglot.Domain.Learning;
using Polyglot.Infrastructure;
using Xunit;
namespace Polyglot.Tests;

public sealed class ApiTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory factory;
    public ApiTests(ApiFactory factory) => this.factory = factory;
    private static object WordPayload() => new { script = "test", meaning = "Test-only meaning", senseId = "test-sense", source = "https://source.invalid/test", attribution = "Synthetic automated-test fixture", imageAssetId = (Guid?)null, audioAssetId = (Guid?)null };

    private async Task<(Guid TargetId, Guid ReadingId)> ReviewFixture(bool includeVisual = false)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        ContentItem Publish(ContentKind kind, object payload)
        {
            var item = ContentItem.Create("en", kind, "Synthetic review fixture", "test-author", JsonSerializer.Serialize(payload), DateTimeOffset.UtcNow);
            item.Submit(DateTimeOffset.UtcNow);
            item.StartReview(DateTimeOffset.UtcNow);
            foreach (var required in item.RequiredScopes().ToArray())
                item.Decide("test-reviewer", required, true, "Automated test only", DateTimeOffset.UtcNow);
            item.Publish(DateTimeOffset.UtcNow);
            db.Content.Add(item);
            return item;
        }
        var target = Publish(ContentKind.Word, WordPayload());
        ContentItem Question(string skill)
        {
            var question = Publish(ContentKind.Question, new { targetId = target.Id, prompt = "Test-only prompt", options = new[] { "alpha", "beta" }, answer = "alpha", explanation = "Test-only model", skill });
            db.Links.Add(new ContentLink { SourceId = question.Id, TargetId = target.Id, Relation = "target" });
            return question;
        }
        var reading = Question("Reading");
        if (includeVisual) Question("Visual");
        await db.SaveChangesAsync();
        return (target.Id, reading.Id);
    }

    [Fact]
    public async Task DueReviewsChooseAPublishedQuestionForEachMatchingSkill()
    {
        var subject = "queue-regression-" + Guid.NewGuid();
        using var client = factory.Client(subject);
        var fixture = await ReviewFixture(includeVisual: true);
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            foreach (var skill in new[] { Skill.Reading, Skill.Visual })
                db.LearningStates.Add(new LearningState { LearnerSubject = subject, ContentId = fixture.TargetId, ContentRevision = 1, Skill = skill, DueAt = DateTimeOffset.UtcNow.AddDays(-1) });
            await db.SaveChangesAsync();
        }
        var queue = await client.GetFromJsonAsync<QuestionResponse[]>("/api/reviews");
        Assert.NotNull(queue);
        Assert.Equal(2, queue.Length);
        Assert.Equal(new[] { "Reading", "Visual" }, queue.Select(x => x.Skill).OrderBy(x => x).ToArray());
    }

    [Fact]
    public async Task RegisteredModelHelpCannotBeHiddenByTheClientAndReplayPreservesIt()
    {
        var subject = "model-help-regression-" + Guid.NewGuid();
        using var client = factory.Client(subject);
        var fixture = await ReviewFixture();
        var exposure = await client.PostAsJsonAsync("/api/reviews/exposures", new { eventId = Guid.NewGuid(), contentId = fixture.TargetId, revision = 1, skill = "Reading" });
        Assert.Equal(HttpStatusCode.NoContent, exposure.StatusCode);
        var submission = new { eventId = Guid.NewGuid(), questionId = fixture.ReadingId, revision = 1, answer = "alpha", helped = false, confidence = "Good" };
        foreach (var replayed in new[] { false, true })
        {
            var response = await client.PostAsJsonAsync("/api/reviews", submission);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(result.GetProperty("helped").GetBoolean());
            Assert.Equal(replayed, result.GetProperty("replayed").GetBoolean());
        }
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var attempt = await db.Attempts.SingleAsync(x => x.LearnerSubject == subject);
        Assert.True(attempt.Helped);
        var state = await db.LearningStates.SingleAsync(x => x.LearnerSubject == subject);
        Assert.Equal(0, state.IndependentCorrect);
    }

    [Fact]
    public async Task CorrectionModelMakesTheNextAttemptSupportedEvenIfClientDeniesHelp()
    {
        var subject = "correction-help-regression-" + Guid.NewGuid();
        using var client = factory.Client(subject);
        var fixture = await ReviewFixture();
        var wrong = await client.PostAsJsonAsync("/api/reviews", new { eventId = Guid.NewGuid(), questionId = fixture.ReadingId, revision = 1, answer = "beta", helped = false, confidence = "Good" });
        Assert.Equal(HttpStatusCode.OK, wrong.StatusCode);
        var corrected = await client.PostAsJsonAsync("/api/reviews", new { eventId = Guid.NewGuid(), questionId = fixture.ReadingId, revision = 1, answer = "alpha", helped = false, confidence = "Good" });
        Assert.Equal(HttpStatusCode.OK, corrected.StatusCode);
        Assert.True((await corrected.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("helped").GetBoolean());
    }
    [Fact]
    public async Task HealthAndRoleBoundariesAreReal()
    {
        using var anonymous = factory.Client();
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health/live")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/progress")).StatusCode);
        using var learner = factory.Client("ordinary");
        Assert.Equal(HttpStatusCode.Forbidden, (await learner.GetAsync("/api/admin/content")).StatusCode);
    }
    [Fact]
    public async Task DraftContentIsHiddenAndInvalidPayloadsAreRejected()
    {
        using var editor = factory.Client("draft-writer", "Editor");
        var invalid = await editor.PostAsJsonAsync("/api/admin/content", new
        {
            languageTag = "en",
            kind = "Word",
            title = "Empty",
            payload = new
            {
            }
        });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, invalid.StatusCode);
        var response = await editor.PostAsJsonAsync("/api/admin/content", new
        {
            languageTag = "en",
            kind = "Word",
            title = "Unpublished test",
            payload = WordPayload()
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var id = (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        using var anonymous = factory.Client();
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync("/api/content/" + id)).StatusCode);
    }
    [Fact]
    public async Task ReviewWorkflowRequiresQualifiedIndependentScopesAndKeepsPublishedVersionReadable()
    {
        var author = "workflow-author-" + Guid.NewGuid();
        var reviewer = "workflow-reviewer-" + Guid.NewGuid();
        using var editor = factory.Client(author, "Editor");
        using var admin = factory.Client(reviewer, "Administrator");
        var response = await editor.PostAsJsonAsync("/api/admin/content", new
        {
            languageTag = "en",
            kind = "Word",
            title = "Workflow test",
            payload = WordPayload()
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var id = (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        async Task<ContentResponse> Current()
        {
            var value = await editor.GetFromJsonAsync<JsonElement>($"/api/admin/content/{id}");
            return value.GetProperty("item").Deserialize<ContentResponse>(new JsonSerializerOptions(JsonSerializerDefaults.Web) { Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() } })!;
        }
        async Task<HttpResponseMessage> Action(HttpClient client, string action, string? scope = null, bool? approved = null)
        {
            var current = await Current();
            return await client.PostAsJsonAsync($"/api/admin/content/{id}/actions", new
            {
                action,
                concurrencyStamp = current.ConcurrencyStamp,
                scope,
                approved,
                notes = "Qualified test review"
            });
        }
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Action(admin, "publish")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Action(editor, "submit")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Action(admin, "review")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Action(admin, "decide", "Language", true)).StatusCode);
        var qualification = await admin.PutAsJsonAsync("/api/admin/reviewers", new
        {
            subject = reviewer,
            languageTag = "en",
            scopes = new[] { "Language", "Teaching", "Rights", "Accessibility" },
            qualificationEvidence = "Automated test fixture only"
        });
        Assert.Equal(HttpStatusCode.OK, qualification.StatusCode);
        foreach (var scope in new[] { "Language", "Teaching", "Rights", "Accessibility" })
            Assert.Equal(HttpStatusCode.OK, (await Action(admin, "decide", scope, true)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Action(admin, "publish")).StatusCode);
        using var anonymous = factory.Client();
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/api/content/" + id)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Action(editor, "revise")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/api/content/" + id)).StatusCode);
    }
    [Fact]
    public async Task PrivateProgressCannotBeSelectedWithAnotherLearnerQuery()
    {
        using var a = factory.Client("learner-a");
        using var b = factory.Client("learner-b");
        var profile = await a.PutAsJsonAsync("/api/users/me", new
        {
            presentation = "child",
            languageTag = "en",
            goal = "literacy",
            isChild = true,
            analyticsConsent = false
        });
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        var other = await b.GetAsync("/api/users/me?subject=learner-a");
        Assert.Equal("null", await other.Content.ReadAsStringAsync());
    }
    [Fact]
    public async Task RelationalIndexesPreventDuplicateLearningState()
    {
        using var client = factory.Client();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var item = ContentItem.Create("en", ContentKind.Word, "Relational test", "test", JsonSerializer.Serialize(WordPayload()), DateTimeOffset.UtcNow);
        db.Content.Add(item);
        await db.SaveChangesAsync();
        db.LearningStates.Add(new()
        {
            LearnerSubject = "constraint",
            ContentId = item.Id,
            ContentRevision = 1
        });
        db.LearningStates.Add(new()
        {
            LearnerSubject = "constraint",
            ContentId = item.Id,
            ContentRevision = 1
        });
        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task AnswersAreGradedOnTheServerAndRetriesCannotInflateProgress()
    {
        using var client = factory.Client("review-test-" + Guid.NewGuid());
        Guid questionId, targetId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            ContentItem Publish(ContentKind kind, string title, string payload)
            {
                var item = ContentItem.Create("en", kind, title, "fixture-author", payload, DateTimeOffset.UtcNow);
                item.Submit(DateTimeOffset.UtcNow);
                item.StartReview(DateTimeOffset.UtcNow);
                foreach (var required in item.RequiredScopes().ToArray())
                    item.Decide("fixture-reviewer", required, true, "Automated test fixture", DateTimeOffset.UtcNow);
                item.Publish(DateTimeOffset.UtcNow);
                return item;
            }
            var word = Publish(ContentKind.Word, "Review fixture", JsonSerializer.Serialize(WordPayload()));
            db.Content.Add(word);
            var question = Publish(ContentKind.Question, "Question fixture", JsonSerializer.Serialize(new
            {
                targetId = word.Id,
                prompt = "Test-only prompt",
                options = new[] { "alpha", "beta" },
                answer = "alpha",
                explanation = "Test-only explanation",
                skill = "Reading"
            }));
            questionId = question.Id;
            targetId = word.Id;
            db.Content.Add(question);
            db.Links.Add(new ContentLink { SourceId = question.Id, TargetId = word.Id, Relation = "target" });
            await db.SaveChangesAsync();
        }
        using var anonymous = factory.Client();
        var content = await anonymous.GetFromJsonAsync<JsonElement>("/api/content/" + questionId);
        Assert.False(content.GetProperty("payload").TryGetProperty("answer", out _));
        var exposure = await client.PostAsJsonAsync("/api/reviews/exposures", new
        {
            eventId = Guid.NewGuid(),
            contentId = targetId,
            revision = 1,
            skill = "Reading"
        });
        Assert.Equal(HttpStatusCode.NoContent, exposure.StatusCode);
        var eventId = Guid.NewGuid();
        var submission = new
        {
            eventId,
            questionId,
            revision = 1,
            answer = "beta",
            helped = false,
            confidence = "Easy",
            correct = true
        };
        var response = await client.PostAsJsonAsync("/api/reviews", submission);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var first = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(first.GetProperty("correct").GetBoolean());
        Assert.Equal("alpha", first.GetProperty("model").GetString());
        var replay = await client.PostAsJsonAsync("/api/reviews", submission);
        var again = await replay.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(again.GetProperty("replayed").GetBoolean());
        Assert.Equal("alpha", again.GetProperty("model").GetString());
        var changed = await client.PostAsJsonAsync("/api/reviews", new
        {
            eventId,
            questionId,
            revision = 1,
            answer = "alpha",
            helped = false,
            confidence = "Easy"
        });
        Assert.Equal(HttpStatusCode.Conflict, changed.StatusCode);
        using var verification = factory.Services.CreateScope();
        var states = verification.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await states.Attempts.CountAsync(x => x.Id == eventId));
        Assert.Equal(0, (await states.LearningStates.SingleAsync(x => x.ContentId == targetId)).IndependentAttempts);
    }

    [Fact]
    public async Task PrivateMediaPreviewRequiresTheOwnerOrReviewRole()
    {
        using var owner = factory.Client("media-owner", "Editor");
        Guid id;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var payload = JsonSerializer.Serialize(new
            {
                blobName = "draft/image.png",
                altText = "Test-only draft",
                rights = "Synthetic test fixture",
                sha256 = new string('a', 64),
                meaning = "Synthetic test association"
            });
            var draft = ContentItem.Create("en", ContentKind.ImageAsset, "Private draft", "media-owner", payload, DateTimeOffset.UtcNow);
            id = draft.Id;
            db.Content.Add(draft);
            await db.SaveChangesAsync();
        }
        using var anonymous = factory.Client();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/admin/assets/{id}/file")).StatusCode);
        using var other = factory.Client("different-editor", "Editor");
        Assert.Equal(HttpStatusCode.Forbidden, (await other.GetAsync($"/api/admin/assets/{id}/file")).StatusCode);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await owner.GetAsync($"/api/admin/assets/{id}/file")).StatusCode);
    }

    [Fact]
    public async Task AChildCannotEnableAnalyticsByDeclaringAnAdultProfile()
    {
        using var child = factory.Client("unverified-age-" + Guid.NewGuid());
        var response = await child.PutAsJsonAsync("/api/users/me", new
        {
            presentation = "adult",
            languageTag = "en",
            goal = "literacy",
            isChild = false,
            analyticsConsent = true
        });
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("null", await (await child.GetAsync("/api/users/me")).Content.ReadAsStringAsync());
    }
}
