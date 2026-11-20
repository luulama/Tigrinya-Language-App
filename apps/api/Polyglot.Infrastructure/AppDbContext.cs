using Microsoft.EntityFrameworkCore;
using Polyglot.Application;
using Polyglot.Domain.Content;
using Polyglot.Domain.Identity;
using Polyglot.Domain.Learning;
using Polyglot.Domain.Progress;
namespace Polyglot.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IContentStore
{
    public DbSet<Language> Languages => Set<Language>(); public DbSet<ContentItem> Content => Set<ContentItem>();
    public DbSet<ContentLink> Links => Set<ContentLink>(); public DbSet<Learner> Learners => Set<Learner>();
    public DbSet<Relationship> Relationships => Set<Relationship>(); public DbSet<Reviewer> Reviewers => Set<Reviewer>();
    public DbSet<LearningState> LearningStates => Set<LearningState>(); public DbSet<ReviewAttempt> Attempts => Set<ReviewAttempt>();
    public DbSet<LearningExposure> Exposures => Set<LearningExposure>();
    public DbSet<ReviewSession> ReviewSessions => Set<ReviewSession>(); public DbSet<ActivityEvent> Activities => Set<ActivityEvent>();
    public DbSet<Achievement> Achievements => Set<Achievement>(); public DbSet<Collection> Collections => Set<Collection>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Language>().HasKey(x => x.Tag);
        b.Entity<Language>().Property(x => x.Tag).HasMaxLength(35);
        b.Entity<ContentItem>(e => { e.HasKey(x => x.Id); e.Property(x => x.LanguageTag).HasMaxLength(35); e.Property(x => x.Title).HasMaxLength(200); e.Property(x => x.AuthorSubject).HasMaxLength(200); e.Property(x => x.State).HasConversion<string>(); e.Property(x => x.Kind).HasConversion<string>(); e.Property(x => x.ConcurrencyStamp).IsConcurrencyToken(); e.HasIndex(x => new { x.LanguageTag, x.Kind, x.State, x.UpdatedAt }); e.HasOne<Language>().WithMany().HasForeignKey(x => x.LanguageTag).OnDelete(DeleteBehavior.Restrict); e.HasMany(x => x.Versions).WithOne().HasForeignKey(x => x.ContentItemId).OnDelete(DeleteBehavior.Restrict); e.HasMany(x => x.Approvals).WithOne().HasForeignKey(x => x.ContentItemId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<ContentItem>().HasIndex(x => new { x.LanguageTag, x.Kind, x.Id }).HasFilter("\"PublishedRevision\" IS NOT NULL AND \"State\" <> 'Archived'");
        if (Database.IsNpgsql())
        {
            b.Entity<ContentItem>().Property<NpgsqlTypes.NpgsqlTsVector>("SearchVector").HasComputedColumnSql("to_tsvector('simple', coalesce(\"PublishedTitle\", ''))", stored: true);
            b.Entity<ContentItem>().HasIndex("SearchVector").HasMethod("GIN");
        }
        b.Entity<VersionHistory>().Property(x => x.Id).ValueGeneratedNever();
        b.Entity<ApprovalRecord>().Property(x => x.Id).ValueGeneratedNever();
        b.Entity<VersionHistory>().HasIndex(x => new { x.ContentItemId, x.Revision }).IsUnique();
        b.Entity<ApprovalRecord>().Property(x => x.Scope).HasConversion<string>();
        b.Entity<ApprovalRecord>().HasIndex(x => new { x.ContentItemId, x.Revision, x.Scope, x.DecidedAt });
        b.Entity<ContentLink>(e => { e.HasKey(x => new { x.SourceId, x.TargetId, x.Relation }); e.HasOne<ContentItem>().WithMany().HasForeignKey(x => x.SourceId).OnDelete(DeleteBehavior.Restrict); e.HasOne<ContentItem>().WithMany().HasForeignKey(x => x.TargetId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<Learner>().HasIndex(x => x.Subject).IsUnique();
        b.Entity<Learner>().Property(x => x.Subject).HasMaxLength(200);
        b.Entity<Reviewer>().HasIndex(x => new { x.Subject, x.LanguageTag }).IsUnique();
        b.Entity<Relationship>().HasIndex(x => new { x.AdultSubject, x.LearnerSubject, x.Kind }).IsUnique();
        b.Entity<LearningState>(e => { e.HasIndex(x => new { x.LearnerSubject, x.ContentId, x.ContentRevision, x.Skill }).IsUnique(); e.HasIndex(x => new { x.LearnerSubject, x.DueAt }); e.Property(x => x.ConcurrencyStamp).IsConcurrencyToken(); e.Property(x => x.Skill).HasConversion<string>(); e.HasOne<ContentItem>().WithMany().HasForeignKey(x => x.ContentId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<LearningExposure>().HasIndex(x => new { x.LearnerSubject, x.ContentId, x.At });
        b.Entity<LearningExposure>().HasOne<ContentItem>().WithMany().HasForeignKey(x => x.ContentId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ReviewAttempt>().HasIndex(x => new { x.LearnerSubject, x.OccurredAt });
        b.Entity<ReviewAttempt>().Property(x => x.Skill).HasConversion<string>();
        b.Entity<ReviewAttempt>().HasOne<ContentItem>().WithMany().HasForeignKey(x => x.ContentId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Collection>().HasIndex(x => new { x.LearnerSubject, x.ContentId }).IsUnique();
        b.Entity<Collection>().HasOne<ContentItem>().WithMany().HasForeignKey(x => x.ContentId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ActivityEvent>().HasIndex(x => new { x.LearnerSubject, x.At });
        // Store instants as UTC epoch milliseconds on both PostgreSQL and SQLite tests.
        foreach (var entity in b.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
            {
                if (property.ClrType == typeof(DateTimeOffset))
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTimeOffset, long>(v => v.ToUnixTimeMilliseconds(), v => DateTimeOffset.FromUnixTimeMilliseconds(v)));
                if (property.ClrType == typeof(DateTimeOffset?))
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTimeOffset?, long?>(v => v.HasValue ? v.Value.ToUnixTimeMilliseconds() : null, v => v.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(v.Value) : null));
            }
    }
    public Task<ContentItem?> FindAsync(Guid id, CancellationToken token) => Content.Include(x => x.Versions).Include(x => x.Approvals).AsSplitQuery().SingleOrDefaultAsync(x => x.Id == id, token);
    public async Task AddAsync(ContentItem item, CancellationToken token) => await Content.AddAsync(item, token);
    public async Task SaveAsync(CancellationToken token) => await SaveChangesAsync(token);
}
