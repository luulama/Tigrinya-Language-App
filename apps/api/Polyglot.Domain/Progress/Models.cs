namespace Polyglot.Domain.Progress;

public sealed class ActivityEvent
{
    public Guid Id
    {
        get; set;
    }
    public string LearnerSubject { get; set; } = ""; public Guid? ContentId
    {
        get; set;
    }
    public string Kind { get; set; } = ""; public DateTimeOffset At
    {
        get; set;
    }
    public int DurationSeconds
    {
        get; set;
    }
}
public sealed class Achievement
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string LearnerSubject { get; set; } = ""; public string Objective { get; set; } = ""; public DateTimeOffset EarnedAt
    {
        get; set;
    }
    public string EvidenceIds { get; set; } = "[]";
}
public sealed class Collection
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string LearnerSubject { get; set; } = ""; public Guid ContentId
    {
        get; set;
    }
}
public sealed record SkillProgress(string Skill, int Practised, int Independent, int Supported);
public sealed record UnitProgress(Guid UnitId, int Completed, int Total);
public sealed record ModuleProgress(Guid ModuleId, int Completed, int Total);
public sealed record CourseProgress(Guid CourseId, int Completed, int Total);
public sealed record StoryProgress(Guid StoryId, int Position, bool Complete);
public sealed record VocabularyProgress(Guid WordId, int Attempts, int Correct);
public sealed record SpeakingProgress(int HumanAssessed, int Practised);
public sealed record WritingProgress(int HumanAssessed, int Practised);
public sealed record DailyActivity(DateOnly Date, int Activities);
public sealed record LearningStreak(int ConsecutiveDays, bool Visible = false);
public sealed record MasteryTracking(Guid ContentId, double? EvidenceScore);
