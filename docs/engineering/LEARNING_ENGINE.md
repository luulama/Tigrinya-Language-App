# Learning engine

The shared TypeScript engine implements the MemoryModel interface and SchedulingEngine wrapper. Sm2MemoryModel implements SM-2 intervals and ease updates. FsrsMemoryModel calls the pinned ts-fsrs implementation using FSRS-7 presets, deterministic fuzz settings and explicit version identity. These are real adapters with tests, not aliases that silently run the same algorithm.

The .NET API initially uses sm2-v1 as its authoritative scheduler. A state cannot silently switch algorithms. FSRS is available in the shared package for explicit migration/integration; it is not falsely advertised as a server-selectable algorithm. Before enabling it server-side, define persisted FSRS memory state and a versioned migration preserving existing due dates and review history.

Each state belongs to one learner, content revision and skill. Model exposures and scored attempts are distinct. Showing a script model or playing target audio records an exposure for a signed-in learner; an immediate response cannot become delayed retention evidence. The client also remembers recent models in memory, so a failed exposure upload cannot make the next in-tab answer appear unaided.

Assisted or incorrect responses return to near-term practice. Repeated same-day successes cannot inflate independent/delayed totals or increase spacing. The engine rejects time rollback and incompatible algorithm versions. Database uniqueness and optimistic concurrency prevent concurrent requests from creating duplicate states; duplicate submission IDs return the saved result only when their request fingerprints match.

Observed retention is the fraction of eligible delayed correct responses, with denominator. It remains absent below five observations and is not a calibrated predicted probability. MasteryScore similarly describes evidence, not percent fluency. No model prediction is presented as Tigrinya-validated retention.

Queues include only approved learner-visible objects with satisfied prerequisites. Due items precede new recommendations; query limits keep a short session manageable. The API derives recommendations from due states and published lessons without an AI provider. Word/phrase/sentence/story/grammar/listening/pronunciation objects can have independent states; correct production cannot be inferred from a different modality's recognition answer.
