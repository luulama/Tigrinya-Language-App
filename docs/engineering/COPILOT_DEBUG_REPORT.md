# Felsökning med GitHub Copilot

Datum: 20 november 2026. Ändringarna är lokala. Ingen commit, pull request, push, publicering eller deployment har gjorts i denna felsökning.

## Granskning och källor

GitHub Copilot granskade den aktuella lokala koden, inklusive ännu ospårade filer, i VS Code-sessionen **Kodgranskning av Tigrinya-Language-App**. Granskningen var skrivskyddad. Copilot rapporterade fem problem; de kontrollerades med reproducerande tester innan rättning.

GitHubs connector kunde inte läsa repositoryt: repository/commits gav 404 och issue-/PR-sökningen gav 422. Issues och pull requests kunde därför inte granskas. Git över den befintliga autentiserade anslutningen kunde däremot läsa `origin`: fjärrens `main` pekade på samma commit som lokal HEAD, `2da78236e860facca454f645b5a263b4394ad41c`.

Repositorykällor som lästes från denna commit:

- [Commit 2da7823: Improve Unit 2 picture-to-word literacy flow](https://github.com/luulama/Tigrinya-Language-App/commit/2da78236e860facca454f645b5a263b4394ad41c)
- [README.md](https://github.com/luulama/Tigrinya-Language-App/blob/2da78236e860facca454f645b5a263b4394ad41c/README.md)
- [Unit 2-planen](https://github.com/luulama/Tigrinya-Language-App/blob/2da78236e860facca454f645b5a263b4394ad41c/unit-02-first-words/unit-2-plan.md)
- [Befintliga läsövningskontroller](https://github.com/luulama/Tigrinya-Language-App/blob/2da78236e860facca454f645b5a263b4394ad41c/unit-02-first-words/tests/check_unit2_literacy.cjs)

De användes för att kontrollera befintligt läsflöde, principen att undervisa före testning och prototypens innehållsgränser. Det nya monorepot under `apps/` är fortfarande lokalt ospårat; GitHub-committen innehåller inte dessa nya appdelar. Lokal dokumentation och källkod granskades också. Copilots fynd gäller den lokala koden, inte en genomförd GitHub Actions-körning eller PR-granskning.

GitHubs officiella dokumentation för [Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review) och [CLI-programmatisk användning](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-programmatic-reference) kontrollerades vid val av granskningssätt. Själva granskningen genomfördes i VS Code.

## Verifierade fel och rättningar

| Fel | Grundorsak och lokal rättning |
| --- | --- |
| En direktöppnad fråga visade rubrik men inga svarsknappar. | `ContentReader` hanterade inte `Question`. Direktöppnade och inbäddade frågor använder nu samma frågekomponent. |
| Hjälpflaggan i svarshistoriken kunde motsäga hjälp som servern redan kände till. | API:t litade på klientens `Helped` vid lagring och svar. Det tar nu även hänsyn till registrerad modellvisning och tidigare felsvar med rättning för samma elev, mål, revision och färdighet under det senaste dygnet. Samma resultat bevaras vid återförsök med samma händelse-ID. Schemaläggaren hade redan visst skydd för registrerade exponeringar; rättningen gör även lagring/svar konsekventa och täcker rättningsvisning. |
| Repetitionskön kunde missa en färdighet för ett ord som hade flera frågor. | Den första länkade frågan valdes före färdighetskontrollen. Kön väljer nu bland publicerade frågor som matchar rätt färdighet. |
| En inaktuell fråga kunde fastna i återförsök. | Svarshändelsen frystes även efter ett permanent revisionsfel, utan återhämtning. HTTP 409/404 ger nu en tydlig omladdningsknapp. Tillfälliga nätfel återanvänder fortfarande exakt samma svarshändelse. Inloggningslänken visas bara vid HTTP 401. |
| Misslyckad lagring av inställningar kunde visas som lyckad. | Ett fel från `localStorage` stängde av sparandet utan meddelande. Nu behålls valet för besöket och ett statusmeddelande berättar att det inte sparades. Tidigare sparade värden skrivs inte över vid felet. |

Produktionsfiler: `apps/web/components/learning.tsx`, `apps/web/components/shell.tsx`, `apps/web/lib/preferences.ts`, `apps/api/Polyglot.Api/Endpoints.cs`. Regressionstester lades till i frontend-, API- och webbläsarsviterna. Inga Tigrinyaöversättningar, uttal, godkännanden eller språkexempel skapades. Testinnehållet är syntetisk engelska och används bara i tester.

## Reproduktion och verifiering

Före rättning misslyckades tre komponenttester, tre API-tester och två desktop-webbläsartester på de identifierade felen. Efter rättning:

| Kommando/kontroll | Resultat |
| --- | --- |
| `bash scripts/tool.sh npm test` | 16 tester i 6 filer godkända |
| `bash scripts/tool.sh dotnet test apps/api/Polyglot.Tests/Polyglot.Tests.csproj` | 18 tester godkända med SQLite |
| `bash scripts/tool.sh npm run test:postgres` | 18 tester godkända med PostgreSQL 16; migrationer och import av utkast godkända |
| `bash scripts/tool.sh npm run typecheck` | Godkänd |
| `bash scripts/tool.sh npm run build` | Produktionsbygget godkänt |
| `COPILOT_TEST_URL=http://127.0.0.1:3002 bash scripts/tool.sh npm exec playwright test -- --config=/private/tmp/copilot-playwright.config.mjs` | 10 tester godkända, desktop och telefonemulering |
| `python3 scripts/check_all.py` | Befintliga innehålls-, Unicode-, källgransknings-, JavaScript- och beteendekontroller godkända |
| `git diff --check` | Godkänd |

En tillfällig Playwright-konfiguration pekade på det korrigerade produktionsbygget på port 3002 och använde projektets befintliga testsamling. Direktfrågetestet ersätter bara innehållssvaret med en testfråga; det är inte ett fullständigt test av riktig inloggning och svarsinlämning i webbläsaren. Den serverdelen testades separat via API-testerna. Inställningsfelet återskapades i en isolerad testsida genom att låta webbläsarlagringen kasta ett fel efter uttryckligt samtycke till sparande.

Kontroll mot filhashar före arbetet visar endast avsedda ändringar i befintliga app-/testfiler samt genererad TypeScript-byggcache. Befintliga Product Bible-, shared- och unit-filer bevarades. PostgreSQL-testet använde en separat tillfällig testdatabas; befintlig användardata raderades inte.

## Kvarvarande gränser

- GitHub-connectorns repositoryåtkomst behöver fungera för att även kunna granska issues och pull requests. Fungerande Git-åtkomst innebär inte att connectorn har samma behörighet.
- Hjälp utanför appen eller en modellvisning som aldrig registrerades kan inte verifieras av servern. Kända modellvisningar och rättningar hanteras nu konsekvent.
- Riktig Entra-inloggning, Azure Blob, fysisk mobil/stylus, VoiceOver och verklig elevanvändning verifierades inte här. Godkända kodtester ersätter inte dessa kontroller eller kvalificerad Tigrinyagranskning.
- Den rättade webbappen startades lokalt på **http://127.0.0.1:3002**. Den redan körande äldre processen på port 3000 ersattes inte av denna testkörning. Ingen webbplats uppdaterades.
