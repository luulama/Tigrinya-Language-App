using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Polyglot.Domain.Content;

public enum ContentKind
{
    Alphabet, Letter, LetterFamily, Sound, Word, Phrase, Sentence, Dialogue, Story, ReadingPassage, Lesson, Unit, Module, Course, AudioAsset, ImageAsset, VideoAsset, Assessment, Question, Quiz, Grammar, Culture
}
public enum WorkflowState
{
    Draft, Submitted, UnderReview, Approved, NeedsRevision, Published, Archived
}
public enum ApprovalScope
{
    Language, Teaching, Rights, Accessibility, Audio, Culture, Strokes
}
public sealed class DomainException(string message) : Exception(message);

public sealed class ContentItem
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string LanguageTag { get; private set; } = "";
    public ContentKind Kind
    {
        get; private set;
    }
    public string Title { get; private set; } = "";
    public string PublishedTitle { get; private set; } = "";
    public string AuthorSubject { get; private set; } = "";
    public WorkflowState State
    {
        get; private set;
    }
    public int Revision { get; private set; } = 1;
    public int? PublishedRevision
    {
        get; private set;
    }
    public Guid ConcurrencyStamp { get; private set; } = Guid.NewGuid();
    public string Payload { get; private set; } = "{}";
    public string PayloadHash { get; private set; } = "";
    public DateTimeOffset UpdatedAt
    {
        get; private set;
    }
    public List<VersionHistory> Versions { get; private set; } = [];
    public List<ApprovalRecord> Approvals { get; private set; } = [];
    private ContentItem()
    {
    }
    public static ContentItem Create(string language, ContentKind kind, string title, string author, string payload, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(language) || string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(author))
            throw new DomainException("Language, title and author are required.");
        using var parsed = JsonDocument.Parse(payload);
        if (parsed.RootElement.ValueKind != JsonValueKind.Object)
            throw new DomainException("Content must be an object.");
        var item = new ContentItem { LanguageTag = language, Kind = kind, Title = title.Trim(), AuthorSubject = author, Payload = payload, UpdatedAt = now };
        item.Snapshot();
        return item;
    }
    public void Edit(string title, string payload, DateTimeOffset now)
    {
        if (State is not (WorkflowState.Draft or WorkflowState.NeedsRevision))
            throw new DomainException("Create a new draft revision before changing reviewed content.");
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Title is required.");
        using var parsed = JsonDocument.Parse(payload);
        if (parsed.RootElement.ValueKind != JsonValueKind.Object)
            throw new DomainException("Content must be an object.");
        Revision++;
        Title = title.Trim();
        Payload = payload;
        Touch(now);
        Snapshot();
    }
    public void CreateRevision(DateTimeOffset now)
    {
        if (State is not (WorkflowState.Published or WorkflowState.Approved or WorkflowState.Archived))
            throw new DomainException("A draft already exists.");
        Revision++;
        State = WorkflowState.Draft;
        Touch(now);
        Snapshot();
    }
    public void Submit(DateTimeOffset now)
    {
        Require(WorkflowState.Draft, WorkflowState.NeedsRevision);
        State = WorkflowState.Submitted;
        Touch(now);
    }
    public void StartReview(DateTimeOffset now)
    {
        Require(WorkflowState.Submitted);
        State = WorkflowState.UnderReview;
        Touch(now);
    }
    public void Decide(string reviewer, ApprovalScope scope, bool approved, string notes, DateTimeOffset now)
    {
        Require(WorkflowState.UnderReview);
        if (reviewer == AuthorSubject)
            throw new DomainException("Authors cannot approve their own content.");
        if (string.IsNullOrWhiteSpace(notes))
            throw new DomainException("Review notes are required.");
        Approvals.Add(new ApprovalRecord { ContentItemId = Id, Revision = Revision, PayloadHash = PayloadHash, ReviewerSubject = reviewer, Scope = scope, Approved = approved, Notes = notes, DecidedAt = now });
        if (!approved)
            State = WorkflowState.NeedsRevision;
        else if (RequiredScopes().All(required => Approvals.Any(a => a.Revision == Revision && a.PayloadHash == PayloadHash && a.Scope == required && a.Approved)))
            State = WorkflowState.Approved;
        Touch(now);
    }
    public void Publish(DateTimeOffset now)
    {
        Require(WorkflowState.Approved);
        State = WorkflowState.Published;
        PublishedRevision = Revision;
        PublishedTitle = Title;
        Touch(now);
    }
    public void Archive(DateTimeOffset now)
    {
        if (State == WorkflowState.Archived)
            return;
        State = WorkflowState.Archived;
        Touch(now);
    }
    public IEnumerable<ApprovalScope> RequiredScopes()
    {
        yield return ApprovalScope.Language;
        yield return ApprovalScope.Teaching;
        yield return ApprovalScope.Rights;
        yield return ApprovalScope.Accessibility;
        if (Kind is ContentKind.AudioAsset or ContentKind.Sound)
            yield return ApprovalScope.Audio;
        if (Kind == ContentKind.Culture)
            yield return ApprovalScope.Culture;
        using var document = JsonDocument.Parse(Payload);
        if (document.RootElement.TryGetProperty("strokePaths", out _))
            yield return ApprovalScope.Strokes;
    }
    private void Require(params WorkflowState[] allowed)
    {
        if (!allowed.Contains(State))
            throw new DomainException($"This action is not available from {State}.");
    }
    private void Touch(DateTimeOffset now)
    {
        UpdatedAt = now;
        ConcurrencyStamp = Guid.NewGuid();
    }
    private void Snapshot()
    {
        PayloadHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(Payload)));
        Versions.Add(new VersionHistory { ContentItemId = Id, Revision = Revision, Title = Title, Payload = Payload, PayloadHash = PayloadHash, AuthorSubject = AuthorSubject, CreatedAt = UpdatedAt });
    }
}
public sealed class VersionHistory
{
    public Guid Id { get; set; } = Guid.NewGuid(); public Guid ContentItemId
    {
        get; set;
    }
    public int Revision
    {
        get; set;
    }
    public string Title { get; set; } = ""; public string Payload { get; set; } = "{}"; public string PayloadHash { get; set; } = ""; public string AuthorSubject { get; set; } = ""; public DateTimeOffset CreatedAt
    {
        get; set;
    }
}
public sealed class ApprovalRecord
{
    public Guid Id { get; set; } = Guid.NewGuid(); public Guid ContentItemId
    {
        get; set;
    }
    public int Revision
    {
        get; set;
    }
    public string PayloadHash { get; set; } = ""; public string ReviewerSubject { get; set; } = ""; public ApprovalScope Scope
    {
        get; set;
    }
    public bool Approved
    {
        get; set;
    }
    public string Notes { get; set; } = ""; public DateTimeOffset DecidedAt
    {
        get; set;
    }
}
public sealed class Language
{
    public string Tag { get; set; } = ""; public string Name { get; set; } = ""; public string Script { get; set; } = ""; public string Direction { get; set; } = "ltr"; public string ScriptModel { get; set; } = "";
}
public sealed class ContentLink
{
    public Guid SourceId
    {
        get; set;
    }
    public Guid TargetId
    {
        get; set;
    }
    public string Relation { get; set; } = "requires";
}
