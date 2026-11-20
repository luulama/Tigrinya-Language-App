namespace Polyglot.Domain.Identity;

public enum PlatformRole
{
    Learner, Parent, Teacher, Reviewer, Editor, Administrator, SubscriptionManager, AiCoach
}
public static class Permissions
{
    public const string Edit = "content:edit"; public const string Review = "content:review"; public const string Publish = "content:publish"; public const string Admin = "platform:admin"; public const string Teach = "class:teach";
}
public sealed class Learner
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string Subject { get; set; } = ""; public string Presentation { get; set; } = "child"; public string LanguageTag { get; set; } = "ti"; public string Goal { get; set; } = "literacy"; public bool AnalyticsConsent
    {
        get; set;
    }
    public bool IsChild { get; set; } = true; public DateTimeOffset UpdatedAt
    {
        get; set;
    }
}
public sealed class Relationship
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string AdultSubject { get; set; } = ""; public string LearnerSubject { get; set; } = ""; public string Kind { get; set; } = "parent"; public bool Verified
    {
        get; set;
    }
    public string VerificationEvidence { get; set; } = "";
}
public sealed class Reviewer
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string Subject { get; set; } = ""; public string LanguageTag { get; set; } = ""; public string Scopes { get; set; } = ""; public string QualificationEvidence { get; set; } = "";
}

public sealed record LearnerPreferences(string Presentation, string LanguageTag, string Goal);
public sealed record Parent(string Subject, IReadOnlyList<Relationship> Learners);
public sealed record Teacher(string Subject, IReadOnlyList<Relationship> Learners);
public sealed record Editor(string Subject, IReadOnlySet<string> Permissions);
public sealed record Administrator(string Subject, IReadOnlySet<string> Permissions);
public sealed record SubscriptionManager(string Subject, IReadOnlySet<string> Permissions);
public sealed record AiCoach(string ServicePrincipal, IReadOnlySet<string> AllowedObjectives);
