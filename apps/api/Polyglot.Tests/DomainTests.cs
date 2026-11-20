using System.Text.Json;
using Polyglot.Domain.Content;
using Polyglot.Domain.Learning;
using Polyglot.Application;
using Xunit;
namespace Polyglot.Tests;

public sealed class DomainTests
{
    private static ContentItem Draft() => ContentItem.Create("en", ContentKind.Word, "A test word", "author", "{}", DateTimeOffset.UnixEpoch);
    [Fact]
    public void SelfApprovalAndUnreviewedPublishingAreRejected()
    {
        var item = Draft();
        Assert.Throws<DomainException>(() => item.Publish(DateTimeOffset.UtcNow));
        item.Submit(DateTimeOffset.UtcNow);
        item.StartReview(DateTimeOffset.UtcNow);
        Assert.Throws<DomainException>(() => item.Decide("author", ApprovalScope.Language, true, "notes", DateTimeOffset.UtcNow));
    }
    [Fact]
    public void EveryScopeMustBeApprovedAndNewRevisionPreservesPublishedSnapshot()
    {
        var item = Draft();
        item.Submit(DateTimeOffset.UtcNow);
        item.StartReview(DateTimeOffset.UtcNow);
        foreach (var scope in item.RequiredScopes().ToList())
            item.Decide("qualified-reviewer", scope, true, "Qualified test decision", DateTimeOffset.UtcNow);
        Assert.Equal(WorkflowState.Approved, item.State);
        item.Publish(DateTimeOffset.UtcNow);
        item.CreateRevision(DateTimeOffset.UtcNow);
        item.Edit("Changed", "{\"changed\":true}", DateTimeOffset.UtcNow);
        Assert.Equal(1, item.PublishedRevision);
        Assert.Equal("{}", item.Versions.Single(v => v.Revision == 1).Payload);
        item.Submit(DateTimeOffset.UtcNow);
        item.StartReview(DateTimeOffset.UtcNow);
        Assert.Throws<DomainException>(() => item.Publish(DateTimeOffset.UtcNow));
    }
    [Fact]
    public void SupportedAndRepeatedAnswersCannotCreateIndependentEvidence()
    {
        var model = new Sm2MemoryModel();
        var start = DateTimeOffset.UnixEpoch;
        var state = new LearningState { DueAt = start };
        model.Apply(state, ReviewOutcome.Good, true, start);
        model.Apply(state, ReviewOutcome.Good, false, start.AddMinutes(1));
        Assert.Equal(0, state.IndependentAttempts);
        Assert.Equal(0, state.Repetitions);
        model.Apply(state, ReviewOutcome.Good, false, start.AddDays(2));
        Assert.Equal(1, state.IndependentAttempts);
        Assert.Equal(1, state.DelayedCorrect);
    }
    [Fact]
    public void PayloadValidationRejectsMissingFieldsAndUnreviewableQuestions()
    {
        using var empty = JsonDocument.Parse("{}");
        Assert.Throws<DomainException>(() => ContentPayloadValidator.Validate(ContentKind.Word, empty.RootElement));
        var invalid = JsonSerializer.SerializeToElement(new
        {
            targetId = Guid.NewGuid(),
            prompt = "Test prompt",
            options = new[] { "one", "one" },
            answer = "one",
            explanation = "Test explanation",
            skill = "Reading"
        });
        Assert.Throws<DomainException>(() => ContentPayloadValidator.Validate(ContentKind.Question, invalid));
    }
    [Fact]
    public void ReferenceExtractionFindsNestedTargetsWithoutTreatingSourceTextAsIds()
    {
        var id = Guid.NewGuid();
        var json = JsonSerializer.SerializeToElement(new
        {
            activities = new[] { new { targetId = id } },
            source = "https://source.invalid"
        });
        Assert.Contains(id, ContentPayloadValidator.References(json));
    }

    [Fact]
    public void RecentModelsCannotBeCountedAsDelayedRecall()
    {
        var state = new LearningState { DueAt = DateTimeOffset.UnixEpoch, LastReviewedAt = DateTimeOffset.UnixEpoch, LastExposureAt = DateTimeOffset.UnixEpoch.AddDays(7) };
        new Sm2MemoryModel().Apply(state, ReviewOutcome.Good, false, DateTimeOffset.UnixEpoch.AddDays(7).AddMinutes(1));
        Assert.Equal(0, state.IndependentAttempts);
        Assert.Equal(0, state.DelayedAttempts);
    }
    [Fact]
    public void FamilyMembershipIsStructuralAndDoesNotCreateAPublishingCycle()
    {
        var family = Guid.NewGuid();
        var letter = JsonSerializer.SerializeToElement(new
        {
            familyId = family
        });
        Assert.Empty(ContentPayloadValidator.References(letter));
        Assert.Contains(family, ContentPayloadValidator.References(letter, true));
    }
}
