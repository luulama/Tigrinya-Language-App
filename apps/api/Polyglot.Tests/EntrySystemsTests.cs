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

public sealed class EntrySystemsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static LearningStartRequest Plan(Guid? revision = null, string reading = "new") => new("comfortable", "some", reading, "reading", "step", false, revision);

    [Fact]
    public async Task PreferencesArePrivateExplicitAndDoNotGrantAdultOrAnalyticsAuthority()
    {
        using var anonymous = factory.Client();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/users/me/learning-start")).StatusCode);
        var subject = "entry-owner-" + Guid.NewGuid();
        using var owner = factory.Client(subject);
        using var stranger = factory.Client("entry-stranger-" + Guid.NewGuid());
        Assert.Equal(HttpStatusCode.OK, (await owner.PutAsJsonAsync("/api/users/me/learning-start", Plan())).StatusCode);
        Assert.Null(await stranger.GetFromJsonAsync<LearningStartResponse>("/api/users/me/learning-start"));
        Assert.Equal(HttpStatusCode.NoContent, (await stranger.DeleteAsync("/api/users/me/learning-start")).StatusCode);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var learner = await db.Learners.SingleAsync(x => x.Subject == subject);
        Assert.True(learner.IsChild); Assert.False(learner.AnalyticsConsent);
        Assert.True(await db.LearningStarts.AnyAsync(x => x.LearnerId == learner.Id));
    }

    [Fact]
    public async Task SaveRetryConcurrencyAndForgetAreBoundedToTheNewPreferences()
    {
        var subject = "entry-concurrency-" + Guid.NewGuid();
        using var client = factory.Client(subject);
        var created = await (await client.PutAsJsonAsync("/api/users/me/learning-start", Plan())).Content.ReadFromJsonAsync<LearningStartResponse>();
        var replayed = await (await client.PutAsJsonAsync("/api/users/me/learning-start", Plan())).Content.ReadFromJsonAsync<LearningStartResponse>();
        Assert.Equal(created!.Revision, replayed!.Revision);
        var updated = await (await client.PutAsJsonAsync("/api/users/me/learning-start", Plan(created.Revision, "some"))).Content.ReadFromJsonAsync<LearningStartResponse>();
        Assert.NotEqual(created.Revision, updated!.Revision);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PutAsJsonAsync("/api/users/me/learning-start", Plan(created.Revision, "comfortable"))).StatusCode);
        Assert.Equal((HttpStatusCode)428, (await client.DeleteAsync("/api/users/me/learning-start")).StatusCode);
        using var deletion = new HttpRequestMessage(HttpMethod.Delete, "/api/users/me/learning-start");
        deletion.Headers.TryAddWithoutValidation("If-Match", $"\"{updated.Revision}\"");
        Assert.Equal(HttpStatusCode.NoContent, (await client.SendAsync(deletion)).StatusCode);
        Assert.Null(await client.GetFromJsonAsync<LearningStartResponse>("/api/users/me/learning-start"));
        using var scope = factory.Services.CreateScope();
        Assert.True(await scope.ServiceProvider.GetRequiredService<AppDbContext>().Learners.AnyAsync(x => x.Subject == subject));
    }

    [Fact]
    public async Task PreferenceContractRejectsInventedLevelsAndAuthorityFields()
    {
        using var client = factory.Client("entry-invalid-" + Guid.NewGuid());
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/users/me/learning-start", Plan(reading:"advanced"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/users/me/learning-start", new { listening="new",speaking="new",reading="new",goal="reading",pace="step",quiet=false,isChild=false,analyticsConsent=true })).StatusCode);
    }

    [Fact]
    public async Task ParentSummaryRequiresBothRoleAndCurrentVerifiedRelationship()
    {
        var parent = "entry-parent-" + Guid.NewGuid(); var child = "entry-child-" + Guid.NewGuid();
        using var client = factory.Client(parent, "Parent");
        var url = $"/api/parents/learners/{child}/summary";
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(url)).StatusCode);
        Guid id;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var link = new Relationship { AdultSubject=parent,LearnerSubject=child,Kind="parent",Verified=true,VerificationEvidence="Synthetic test verification only" };
            id=link.Id; db.Relationships.Add(link); await db.SaveChangesAsync();
        }
        var response=await client.GetAsync(url); Assert.Equal(HttpStatusCode.OK,response.StatusCode); Assert.True(response.Headers.CacheControl!.NoStore);
        using var noRole = factory.Client(parent); Assert.Equal(HttpStatusCode.Forbidden,(await noRole.GetAsync(url)).StatusCode);
        using (var scope=factory.Services.CreateScope()) {var db=scope.ServiceProvider.GetRequiredService<AppDbContext>(); (await db.Relationships.SingleAsync(x=>x.Id==id)).Verified=false; await db.SaveChangesAsync();}
        Assert.Equal(HttpStatusCode.Forbidden,(await client.GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task WeeklySummaryUsesRealScopedPublishedEvidenceAndLabelsLaterTotalsSeparately()
    {
        var parent="entry-summary-parent-"+Guid.NewGuid();var child="entry-summary-child-"+Guid.NewGuid();
        using var client=factory.Client(parent,"Parent");
        using(var scope=factory.Services.CreateScope())
        {
            var db=scope.ServiceProvider.GetRequiredService<AppDbContext>();
            ContentItem Word(bool publish)
            {
                var item=ContentItem.Create("en",ContentKind.Word,"Synthetic summary target","test-author",JsonSerializer.Serialize(new{script="fixture",meaning="Storage test only",senseId="fixture",source="https://example.invalid",attribution="Synthetic automated fixture"}),DateTimeOffset.UtcNow);
                if(publish){item.Submit(DateTimeOffset.UtcNow);item.StartReview(DateTimeOffset.UtcNow);foreach(var required in item.RequiredScopes())item.Decide("independent-test-reviewer",required,true,"Test only",DateTimeOffset.UtcNow);item.Publish(DateTimeOffset.UtcNow);}
                db.Content.Add(item);return item;
            }
            var published=Word(true);var draft=Word(false);var now=DateTimeOffset.UtcNow;
            void Attempt(ContentItem target,string subject,bool helped,bool correct,DateTimeOffset at,int revision=1)=>db.Attempts.Add(new ReviewAttempt{Id=Guid.NewGuid(),LearnerSubject=subject,ContentId=target.Id,ContentRevision=revision,QuestionId=Guid.NewGuid(),QuestionRevision=1,Skill=Skill.Visual,Helped=helped,Correct=correct,Outcome=correct?ReviewOutcome.Good:ReviewOutcome.Again,OccurredAt=at});
            Attempt(published,child,false,true,now.AddHours(-2));Attempt(published,child,true,true,now.AddHours(-1));
            Attempt(published,"different-child",false,true,now);Attempt(draft,child,false,true,now);Attempt(published,child,false,true,now.AddDays(-8));Attempt(published,child,false,true,now.AddDays(1));Attempt(published,child,false,true,now.AddMinutes(-1),2);
            db.Relationships.Add(new Relationship{AdultSubject=parent,LearnerSubject=child,Kind="parent",Verified=true,VerificationEvidence="Test only"});
            db.LearningStates.Add(new LearningState{LearnerSubject=child,ContentId=published.Id,ContentRevision=1,Skill=Skill.Visual,DelayedCorrect=1,DelayedAttempts=2});
            await db.SaveChangesAsync();
        }
        var summary=await client.GetFromJsonAsync<JsonElement>($"/api/parents/learners/{child}/summary");
        Assert.Equal(2,summary.GetProperty("checks").GetInt32());Assert.Equal(1,summary.GetProperty("matchedWithHelp").GetInt32());Assert.Equal(1,summary.GetProperty("matchedWithoutAnswerHelp").GetInt32());Assert.Equal(1,summary.GetProperty("revisit").GetInt32());
        Assert.Equal("all_time",summary.GetProperty("laterScope").GetString());Assert.Equal(2,summary.GetProperty("laterAttempts").GetInt32());Assert.Equal(JsonValueKind.Null,summary.GetProperty("studyTime").ValueKind);Assert.Equal("not_assessed",summary.GetProperty("ability").GetString());
    }
}
