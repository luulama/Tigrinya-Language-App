namespace Polyglot.Domain.Identity;

// Explicitly saved preferences, not assessed ability, emotional memory or consent.
public sealed class LearningStart
{
    public Guid LearnerId { get; set; }
    public string Listening { get; set; } = "unsure";
    public string Speaking { get; set; } = "unsure";
    public string Reading { get; set; } = "unsure";
    public string Goal { get; set; } = "reading";
    public string Pace { get; set; } = "step";
    public bool Quiet { get; set; }
    public Guid Revision { get; set; } = Guid.NewGuid();
    public DateTimeOffset UpdatedAt { get; set; }

    public static bool Valid(string? listening, string? speaking, string? reading, string? goal, string? pace) =>
        new[] { "new", "some", "comfortable", "unsure" }.Contains(listening) &&
        new[] { "new", "some", "comfortable", "unsure" }.Contains(speaking) &&
        new[] { "new", "some", "comfortable", "unsure" }.Contains(reading) &&
        new[] { "reading", "words" }.Contains(goal) && new[] { "step", "explore" }.Contains(pace);
}
