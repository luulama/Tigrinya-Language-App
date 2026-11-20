using Polyglot.Domain.Content;
namespace Polyglot.Application;

public interface IContentStore
{
    Task<ContentItem?> FindAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(ContentItem item, CancellationToken cancellationToken);
    Task SaveAsync(CancellationToken cancellationToken);
}
public interface ICurrentUser
{
    string Subject
    {
        get;
    }
}
public interface IAssetStore
{
    Task<Stream> OpenReadAsync(string name, CancellationToken cancellationToken);
    Task UploadAsync(string name, Stream content, string contentType, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(string name, CancellationToken cancellationToken);
}
