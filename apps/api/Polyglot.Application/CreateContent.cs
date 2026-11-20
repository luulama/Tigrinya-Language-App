using System.Text.Json;
using FluentValidation;
using MediatR;
using Polyglot.Domain.Content;
namespace Polyglot.Application;

public sealed record CreateContent(string LanguageTag, ContentKind Kind, string Title, JsonElement Payload) : IRequest<Guid>;
public sealed class CreateContentValidator : AbstractValidator<CreateContent>
{
    public CreateContentValidator()
    {
        RuleFor(x => x.LanguageTag).NotEmpty().MaximumLength(35).Matches("^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$");
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Payload).Must(x => x.ValueKind == JsonValueKind.Object).WithMessage("Payload must be a JSON object.");
    }
}
public sealed class CreateContentHandler(IContentStore store, ICurrentUser user, TimeProvider clock) : IRequestHandler<CreateContent, Guid>
{
    public async Task<Guid> Handle(CreateContent request, CancellationToken cancellationToken)
    {
        ContentPayloadValidator.Validate(request.Kind, request.Payload);
        var item = ContentItem.Create(request.LanguageTag, request.Kind, request.Title, user.Subject, request.Payload.GetRawText(), clock.GetUtcNow());
        await store.AddAsync(item, cancellationToken);
        await store.SaveAsync(cancellationToken);
        return item.Id;
    }
}
public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var failures = new List<FluentValidation.Results.ValidationFailure>();
        foreach (var validator in validators)
            failures.AddRange((await validator.ValidateAsync(request, cancellationToken)).Errors);
        if (failures.Count != 0)
            throw new ValidationException(failures);
        return await next();
    }
}
public static class ContentPayloadValidator
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow };
    public static Type TypeFor(ContentKind kind) => kind switch
    {
        ContentKind.Alphabet => typeof(Alphabet),
        ContentKind.Letter => typeof(Letter),
        ContentKind.LetterFamily => typeof(LetterFamily),
        ContentKind.Sound => typeof(Sound),
        ContentKind.Word => typeof(Word),
        ContentKind.Phrase => typeof(Phrase),
        ContentKind.Sentence => typeof(Sentence),
        ContentKind.Dialogue => typeof(Dialogue),
        ContentKind.Story => typeof(Story),
        ContentKind.ReadingPassage => typeof(ReadingPassage),
        ContentKind.Lesson => typeof(Lesson),
        ContentKind.Unit => typeof(Polyglot.Domain.Content.Unit),
        ContentKind.Module => typeof(Module),
        ContentKind.Course => typeof(Course),
        ContentKind.AudioAsset => typeof(AudioAsset),
        ContentKind.ImageAsset => typeof(ImageAsset),
        ContentKind.VideoAsset => typeof(VideoAsset),
        ContentKind.Assessment => typeof(Assessment),
        ContentKind.Question => typeof(Question),
        ContentKind.Quiz => typeof(Quiz),
        ContentKind.Grammar => typeof(Grammar),
        ContentKind.Culture => typeof(Culture),
        _ => throw new DomainException("Unsupported content kind.")
    };
    public static void Validate(ContentKind kind, JsonElement payload)
    {
        if (payload.ValueKind != JsonValueKind.Object)
            throw new DomainException("Content must be a JSON object.");
        if (payload.GetRawText().Length > 1000000)
            throw new DomainException("Content exceeds the size limit.");
        object value;
        try
        {
            value = payload.Deserialize(TypeFor(kind), JsonOptions) ?? throw new DomainException("Payload is required.");
        }
        catch (JsonException) { throw new DomainException("Payload does not match the selected content kind."); }
        ValidateObject(value);
        if (value is Question listening && listening.Skill.Equals("Listening", StringComparison.OrdinalIgnoreCase) && listening.AudioAssetId is null)
            throw new DomainException("Listening questions require a reviewed audio asset.");
        if (value is Course course && course.UnitIds.Count == 0 || value is Polyglot.Domain.Content.Unit unit && unit.ModuleIds.Count == 0 || value is Module module && module.LessonIds.Count == 0 || value is Lesson lesson && lesson.Activities.Count == 0 || value is Story story && story.Segments.Count == 0 || value is Quiz quiz && quiz.QuestionIds.Count == 0)
            throw new DomainException("A learning container needs actual content references.");

        if (value is Question question && !new[] { "Visual", "Reading", "Listening" }.Contains(question.Skill, StringComparer.OrdinalIgnoreCase))
            throw new DomainException("Choice questions measure recognition, not speaking or handwriting.");
        if (value is AudioAsset or ImageAsset or VideoAsset)
        {
            var name = payload.GetProperty("blobName").GetString()!;
            var hash = payload.GetProperty("sha256").GetString()!;
            var extension = Path.GetExtension(name).ToLowerInvariant();
            var supported = kind switch
            {
                ContentKind.AudioAsset => new[] { ".mp3", ".wav" }.Contains(extension),
                ContentKind.ImageAsset => new[] { ".png", ".jpg", ".jpeg", ".webp" }.Contains(extension),
                ContentKind.VideoAsset => extension == ".mp4",
                _ => false
            };
            if (!supported)
                throw new DomainException("The asset extension must match its content type.");
            if (name.StartsWith('/') || name.Contains("://", StringComparison.Ordinal) || name.Split('/').Contains("..") || !System.Text.RegularExpressions.Regex.IsMatch(hash, "^[a-f0-9]{64}$"))
                throw new DomainException("A safe asset name and SHA-256 digest are required.");
        }
        if (value is Question q && (q.Options.Count < 2 || q.Options.Distinct().Count() != q.Options.Count || !q.Options.Contains(q.Answer)))
            throw new DomainException("A question needs distinct options including its reviewed answer.");
        if (value is AudioAsset a && a.DurationMs <= 0 || value is VideoAsset v && v.DurationMs <= 0)
            throw new DomainException("Media duration must be positive.");
    }
    private static void ValidateObject(object value)
    {
        foreach (var property in value.GetType().GetProperties())
        {
            var current = property.GetValue(value);
            if (current is null)
            {
                if (Nullable.GetUnderlyingType(property.PropertyType) is null)
                    throw new DomainException($"{property.Name} is required.");
                continue;
            }
            if (current is string text && (string.IsNullOrWhiteSpace(text) || text.Length > 100000))
                throw new DomainException($"{property.Name} must contain text within the size limit.");
            if (current is Guid id && id == Guid.Empty)
                throw new DomainException($"{property.Name} must identify content.");
            if (current is System.Collections.IEnumerable items && current is not string)
                foreach (var child in items)
                {
                    if (child is null)
                        throw new DomainException("Content references cannot be empty.");
                    if (child is not string && child is not Guid)
                        ValidateObject(child);
                }
        }
    }
    public static IReadOnlySet<Guid> References(JsonElement payload, bool includeMembership = false)
    {
        var ids = new HashSet<Guid>();
        void Walk(JsonElement element, string key)
        {
            if (!includeMembership && key.Equals("familyId", StringComparison.OrdinalIgnoreCase))
                return;
            if (element.ValueKind == JsonValueKind.String && key.EndsWith("Id", StringComparison.OrdinalIgnoreCase) && Guid.TryParse(element.GetString(), out var id))
                ids.Add(id);
            if (element.ValueKind == JsonValueKind.Array)
                foreach (var child in element.EnumerateArray())
                {
                    if (key.EndsWith("Ids", StringComparison.OrdinalIgnoreCase) && child.ValueKind == JsonValueKind.String && Guid.TryParse(child.GetString(), out var gid))
                        ids.Add(gid);
                    else
                        Walk(child, key);
                }
            if (element.ValueKind == JsonValueKind.Object)
                foreach (var child in element.EnumerateObject())
                    Walk(child.Value, child.Name);
        }
        Walk(payload, "");
        return ids;
    }
}
