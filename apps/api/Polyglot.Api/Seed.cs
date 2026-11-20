using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Polyglot.Domain.Content;
using Polyglot.Infrastructure;
namespace Polyglot.Api;

public static class Seed
{
    public static async Task RunAsync(AppDbContext db, string[] args)
    {
        if (!await db.Languages.AnyAsync(x => x.Tag == "ti"))
            db.Languages.Add(new Language { Tag = "ti", Name = "Tigrinya", Script = "Ethi", Direction = "ltr", ScriptModel = "abugida" });
        await db.SaveChangesAsync();
        var option = Array.IndexOf(args, "--drafts");
        if (option < 0)
            return;
        if (option + 1 >= args.Length)
            throw new ArgumentException("--drafts requires a source path.");
        using var document = JsonDocument.Parse(await File.ReadAllTextAsync(args[option + 1]));
        foreach (var draft in document.RootElement.EnumerateArray())
        {
            var id = draft.GetProperty("id").GetGuid();
            if (await db.Content.AnyAsync(x => x.Id == id))
                continue;
            var command = new Polyglot.Application.CreateContent(draft.GetProperty("languageTag").GetString()!, ContentKind.Word, draft.GetProperty("title").GetString()!, draft.GetProperty("payload"));
            Polyglot.Application.ContentPayloadValidator.Validate(command.Kind, command.Payload);
            var item = ContentItem.Create(command.LanguageTag, command.Kind, command.Title, "legacy-import", command.Payload.GetRawText(), DateTimeOffset.UtcNow);
            db.Entry(item).Property(x => x.Id).CurrentValue = id;
            foreach (var version in item.Versions)
                version.ContentItemId = id;
            db.Content.Add(item);
        }
        await db.SaveChangesAsync();
    }
}
