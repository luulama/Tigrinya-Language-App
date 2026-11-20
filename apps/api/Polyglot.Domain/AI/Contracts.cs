namespace Polyglot.Domain.AI;

public sealed record CoachRequest(string LearnerSubject, string LanguageTag, string Objective, IReadOnlyList<Guid> ApprovedContentIds, string Input);
public sealed record CoachResponse(string Text, IReadOnlyList<Guid> SourceContentIds, bool Abstained, string? Reason);
public interface IAiTutor
{
    Task<CoachResponse> ExplainAsync(CoachRequest request, CancellationToken cancellationToken);
}
public interface IAiConversationPartner
{
    Task<CoachResponse> RespondAsync(CoachRequest request, CancellationToken cancellationToken);
}
public interface IAiPronunciationCoach
{
    Task<CoachResponse> AssessAsync(CoachRequest request, Stream recording, CancellationToken cancellationToken);
}
public interface IAiWritingCoach
{
    Task<CoachResponse> ReviewAsync(CoachRequest request, CancellationToken cancellationToken);
}
public interface IAiRecommendationService
{
    Task<IReadOnlyList<Guid>> RecommendAsync(CoachRequest request, CancellationToken cancellationToken);
}
public interface IAiLessonAssistant
{
    Task<CoachResponse> DraftAsync(CoachRequest request, CancellationToken cancellationToken);
}
public interface IAiReviewerAssistant
{
    Task<CoachResponse> FlagAsync(CoachRequest request, CancellationToken cancellationToken);
}
