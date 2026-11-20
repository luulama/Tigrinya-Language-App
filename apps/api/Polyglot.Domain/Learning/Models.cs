namespace Polyglot.Domain.Learning;

public enum Skill
{
    Visual, Listening, Speaking, Reading, Writing
}
public enum ReviewOutcome
{
    Again = 1, Hard = 2, Good = 3, Easy = 4
}
public enum Visibility
{
    Private, Preview, Learner
}
public enum LearningKind
{
    Vocabulary, Phrase, Sentence, Grammar, Story, Dialogue, Listening, Speaking, Writing, Culture, Pronunciation, Form
}
public abstract record LearningObject(Guid ContentId, LearningKind Kind, double Difficulty, Visibility Visibility, string ApprovalState);
public sealed record VocabularyItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Vocabulary, Difficulty, Visibility, ApprovalState);
public sealed record PhraseItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Phrase, Difficulty, Visibility, ApprovalState);
public sealed record SentenceItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Sentence, Difficulty, Visibility, ApprovalState);
public sealed record GrammarItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Grammar, Difficulty, Visibility, ApprovalState);
public sealed record StoryItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Story, Difficulty, Visibility, ApprovalState);
public sealed record DialogueItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Dialogue, Difficulty, Visibility, ApprovalState);
public sealed record ListeningItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Listening, Difficulty, Visibility, ApprovalState);
public sealed record SpeakingItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Speaking, Difficulty, Visibility, ApprovalState);
public sealed record WritingItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Writing, Difficulty, Visibility, ApprovalState);
public sealed record CulturalItem(Guid ContentId, double Difficulty, Visibility Visibility, string ApprovalState) : LearningObject(ContentId, LearningKind.Culture, Difficulty, Visibility, ApprovalState);

public sealed class LearningState
{
    public Guid Id { get; set; } = Guid.NewGuid(); public string LearnerSubject { get; set; } = ""; public Guid ContentId
    {
        get; set;
    }
    public int ContentRevision
    {
        get; set;
    }
    public Skill Skill
    {
        get; set;
    }
    public string Algorithm { get; set; } = "sm2-v1";
    public DateTimeOffset DueAt
    {
        get; set;
    }
    public DateTimeOffset? LastReviewedAt
    {
        get; set;
    }
    public DateTimeOffset? LastExposureAt
    {
        get; set;
    }
    public double Ease { get; set; } = 2.5; public int Repetitions
    {
        get; set;
    }
    public int IntervalDays
    {
        get; set;
    }
    public int IndependentCorrect
    {
        get; set;
    }
    public int IndependentAttempts
    {
        get; set;
    }
    public int DelayedCorrect
    {
        get; set;
    }
    public int DelayedAttempts
    {
        get; set;
    }
    public Guid ConcurrencyStamp { get; set; } = Guid.NewGuid();
}
public sealed class ReviewSession
{
    public Guid Id
    {
        get; set;
    }
    public string LearnerSubject { get; set; } = ""; public DateTimeOffset StartedAt
    {
        get; set;
    }
    public DateTimeOffset? FinishedAt
    {
        get; set;
    }
}
public sealed class ReviewAttempt
{
    public Guid Id
    {
        get; set;
    }
    public string LearnerSubject { get; set; } = ""; public Guid ContentId
    {
        get; set;
    }
    public int ContentRevision
    {
        get; set;
    }
    public Guid QuestionId
    {
        get; set;
    }
    public int QuestionRevision
    {
        get; set;
    }
    public string SubmissionHash { get; set; } = ""; public Skill Skill
    {
        get; set;
    }
    public ReviewOutcome Outcome
    {
        get; set;
    }
    public bool Helped
    {
        get; set;
    }
    public bool Correct
    {
        get; set;
    }
    public DateTimeOffset OccurredAt
    {
        get; set;
    }
}
public sealed record MasteryScore(int Correct, int Attempts)
{
    public double? Value => Attempts >= 5 ? 100.0 * Correct / Attempts : null;
}
public sealed record RetentionScore(int Correct, int Attempts)
{
    public double? Observed => Attempts >= 5 ? 100.0 * Correct / Attempts : null; public double? Predicted => null;
}
public sealed record ReviewQueue(IReadOnlyList<LearningState> Items);
public interface IMemoryModel
{
    string Version
    {
        get;
    }
    void Apply(LearningState state, ReviewOutcome outcome, bool helped, DateTimeOffset now);
}
public sealed class Sm2MemoryModel : IMemoryModel
{
    public string Version => "sm2-v1";
    public void Apply(LearningState state, ReviewOutcome outcome, bool helped, DateTimeOffset now)
    {
        if (!Enum.IsDefined(outcome))
            throw new ArgumentOutOfRangeException(nameof(outcome));
        if (state.LastReviewedAt.HasValue && now < state.LastReviewedAt.Value)
            throw new ArgumentException("Review time cannot move backwards.");
        var lastExposure = state.LastExposureAt ?? state.LastReviewedAt;
        var delayed = lastExposure.HasValue && now - lastExposure.Value >= TimeSpan.FromDays(1);
        var independent = !helped && (!lastExposure.HasValue || delayed);
        var correct = outcome != ReviewOutcome.Again;
        if (independent)
        {
            state.IndependentAttempts++;
            if (correct)
                state.IndependentCorrect++;
            if (delayed)
            {
                state.DelayedAttempts++;
                if (correct)
                    state.DelayedCorrect++;
            }
        }
        if (helped || !correct)
        {
            state.Repetitions = 0;
            state.IntervalDays = 1;
            state.DueAt = now.AddDays(1);
        }
        else if (independent && now >= state.DueAt)
        {
            var quality = outcome switch
            {
                ReviewOutcome.Hard => 3,
                ReviewOutcome.Good => 4,
                _ => 5
            };
            state.IntervalDays = state.Repetitions switch
            {
                0 => 1,
                1 => 6,
                _ => Math.Min(36500, (int)Math.Round(state.IntervalDays * state.Ease))
            };
            state.Ease = Math.Max(1.3, state.Ease + .1 - (5 - quality) * (.08 + (5 - quality) * .02));
            state.Repetitions++;
            state.DueAt = now.AddDays(state.IntervalDays);
        }
        state.LastReviewedAt = now;
        state.LastExposureAt = now;
        state.ConcurrencyStamp = Guid.NewGuid();
    }
}
public sealed class SchedulingEngine(IEnumerable<IMemoryModel> models)
{
    public void Apply(LearningState state, ReviewOutcome outcome, bool helped, DateTimeOffset now) => (models.SingleOrDefault(x => x.Version == state.Algorithm) ?? throw new InvalidOperationException("Unsupported algorithm version.")).Apply(state, outcome, helped, now);
}

public sealed class LearningExposure
{
    public Guid Id
    {
        get; set;
    }
    public string LearnerSubject { get; set; } = ""; public Guid ContentId
    {
        get; set;
    }
    public int Revision
    {
        get; set;
    }
    public Skill Skill
    {
        get; set;
    }
    public DateTimeOffset At
    {
        get; set;
    }
}
