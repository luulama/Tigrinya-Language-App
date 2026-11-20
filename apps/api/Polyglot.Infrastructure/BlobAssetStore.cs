using Azure.Storage.Blobs;
using Polyglot.Application;
namespace Polyglot.Infrastructure;

public sealed class BlobAssetStore(BlobContainerClient container) : IAssetStore
{
    private static void Validate(string name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.StartsWith('/') || name.Split('/').Contains("..") || name.Contains("://", StringComparison.Ordinal))
            throw new ArgumentException("Invalid asset name.");
    }
    public async Task<Stream> OpenReadAsync(string name, CancellationToken cancellationToken)
    {
        Validate(name);
        return await container.GetBlobClient(name).OpenReadAsync(cancellationToken: cancellationToken);
    }
    public async Task UploadAsync(string name, Stream content, string contentType, CancellationToken cancellationToken)
    {
        Validate(name);
        await container.GetBlobClient(name).UploadAsync(content, new Azure.Storage.Blobs.Models.BlobUploadOptions { HttpHeaders = new() { ContentType = contentType }, Conditions = new() { IfNoneMatch = Azure.ETag.All } }, cancellationToken);
    }
    public async Task<bool> ExistsAsync(string name, CancellationToken cancellationToken)
    {
        Validate(name);
        return (await container.GetBlobClient(name).ExistsAsync(cancellationToken)).Value;
    }
}
