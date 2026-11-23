# Installera och testa Tigrinya på din iPhone

Mobilprojektet finns i `apps/mobile`. Det fungerar utan konto och backend. Appens namn, bundle-ID och Apple-team måste väljas av dig innan en installation på din egen telefon kan förberedas. Du ska inte skicka lösenord, certifikat eller tokens i chatten.

## 1 Kontrollera din Mac

Öppna en terminal i projektets huvudmapp:

```sh
cd /Users/luulaman/Documents/Codex/Tigrinya-Language-App
bash scripts/tool.sh npm run ios:doctor --prefix apps/mobile --workspaces=false
```

Kontrollen läser Xcode-version, installerat SDK, simulatorruntime, ledigt utrymme och vilka projektvärden som saknas. Den startar ingen backend, använder ingen databas, laddar inte ned något och loggar inte in på ditt Apple-konto. Den avslutas med kod 1 så länge något som behövs fortfarande saknas; läs raderna ovanför felkoden.

Vid kontrollen den 21 november 2026 fanns Xcode 26.3 och iOS-SDK 26.2, men ingen tillgänglig iOS-simulatorruntime. Macen hade cirka 4,7 GiB ledigt. [Apples simulatorkatalog](https://devimages-cdn.apple.com/downloads/xcode/simulators/index2.dvtdownloadableindex) angav 8 388 683 973 byte, cirka 7,8 GiB, för enbart iOS 26.2-nedladdningen för Apple Silicon. Installation och byggfiler behöver också utrymme. Därför startades ingen nedladdning och inga användarfiler raderades för att frigöra utrymme.

Frigör utrymme själv, exempelvis genom att flytta egna filer till en annan disk eller hantera oanvända komponenter i Xcode. Projektets automatiska installation kräver minst **30 GiB ledigt** som försiktighetsmarginal. Detta är projektets säkerhetsgräns, inte Apples angivna installationsstorlek eller en garanti att alla framtida runtimes ryms. Xcode kan ange ett större behov.

## 2 Installera rätt Xcode-komponent

Det officiella kommandot stöds av den installerade Xcode-versionen. När tillräckligt utrymme finns kan du köra:

```sh
bash scripts/tool.sh npm run ios:install-runtime --prefix apps/mobile --workspaces=false
```

Kommandot kontrollerar först utrymme och att Xcodes första start redan är klar. Sedan väljer det samma iOS-version som ditt installerade simulator-SDK och rätt Mac-arkitektur. På den här Macen motsvarar installationen:

```sh
xcodebuild -downloadPlatform iOS -buildVersion 26.2 -architectureVariant arm64
```

Inga licensvillkor eller Apple-inloggningsfrågor besvaras automatiskt. Om Xcode ber om sådant måste du göra det själv i Xcode. Det laddas inte ned andra plattformar, och ingen enhet provisioneras.

Du kan även göra installationen i **Xcode → Settings… → Components → Platform Support → iOS → Get**. För en äldre eller särskild version: välj **Add Platforms (+)**, filtrera på **iOS 26.2** och välj **Download & Install**. Vänta tills installationen är klar. Knapparnas placering kan skilja mellan Xcode-versioner; använd den version som diagnostiken anger.

Apples [instruktioner för Xcode-komponenter](https://developer.apple.com/documentation/xcode/downloading-and-installing-additional-xcode-components) beskriver det officiella kommandot och inställningspanelen. Uppgradera inte Xcode eller andra plattformar som ett felsökningsförsök utan att först kontrollera behovet.

## 3 Fyll i dina två appvärden

Skapa en lokal identitetsfil utan att skriva över någon befintlig fil:

```sh
cp -n apps/mobile/device.example.json apps/mobile/device.local.json
```

Öppna `apps/mobile/device.local.json` i VS Code. Ersätt de två `null`-värdena med dina egna strängar:

| Fält      | Det du väljer                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appName` | Namnet som ska visas under appikonen på telefonen.                                                                                                    |
| `appId`   | Ditt unika bundle-ID i omvänd domänform. Xcode/Apple måste kunna använda det med ditt team. Ett exempel-ID i dokumentationen är inte en registrering. |

Filen ignoreras av Git och kopieras inte in som en fil i appen. Namn och bundle-ID är offentlig appidentitet, inte hemligheter. Filen accepterar endast dessa två värden. Lägg inte Apple-konto, lösenord, signing team, API-adress eller databasinställningar i den.

Värdena används vid kommande mobilbyggen även när du öppnar en ny terminal. Du kan fortfarande ange `MOBILE_APP_ID` och `MOBILE_APP_NAME` i miljön för ett särskilt bygge; sådana uttryckliga värden har företräde. Ändra din lokala fil när du vill byta identitet. Projektet kontrollerar formatet, men kan inte bekräfta att bundle-ID:t är ledigt hos Apple utan ditt konto.

Förbered filerna och öppna det befintliga mobilprojektet:

```sh
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run ios:open --prefix apps/mobile --workspaces=false
```

## 4 Välj ditt Apple-team i Xcode

1. Om ditt konto saknas: öppna **Xcode → Settings… → Apple Accounts** och logga in själv.
2. Välj projektet **App** i vänsterpanelen och sedan målappen **App** under Targets.
3. Öppna **Signing & Capabilities**. Kontrollera att **Bundle Identifier** motsvarar ditt eget `appId`.
4. Välj ditt faktiska **Team**. Om du vill låta Xcode hantera utvecklingssigneringen, använd **Automatically manage signing**. Vi väljer inget team och skapar inga certifikat åt dig.
5. Läs och åtgärda eventuella meddelanden om registrering, profil eller identifierare i Xcode. Använd ditt konto och ditt val, inte någon föreslagen testidentitet.

Ett kostnadsfritt Personal Team kan räcka för egen utvecklingstestning, med Apples begränsningar. En utvecklingssignerad installation kan behöva byggas och installeras på nytt när profilen löper ut. Det är skilt från publicering eller TestFlight.

## 5 Anslut din iPhone och kör appen

1. Anslut telefonen till Macen med kabel och lås upp den.
2. Godkänn **Trust/Lita på den här datorn** på telefonen om frågan visas.
3. Välj din iPhone som körmål i Xcode. Om den saknas, använd **Window → Devices and Simulators** eller **Device Hub/Manage Devices** i den aktuella Xcode-versionen för att para den.
4. Om Xcode begär Developer Mode: aktivera **Inställningar → Integritet och säkerhet → Utvecklarläge** på iPhone. Starta om och bekräfta när iOS ber om det.
5. Kontrollera att schemat **App** och din telefon är valda. Klicka på **Run ▶** i Xcode.
6. Om iOS uttryckligen begär förtroende för utvecklarprofilen, följ iOS anvisningar under **Inställningar → Allmänt → VPN och enhetshantering**. Gör detta endast för ditt eget team.

Detta installerar en utvecklingsversion på din telefon. Kommandot `ios:build:device` nedan bygger däremot bara en **osignerad** app och kan inte ensamt installera den på en fysisk iPhone.

Se Apples [anvisningar för att köra på en enhet](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices) och [Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device/) om Xcode eller iOS kräver ett manuellt steg.

## 6 Testa innan du använder appen vidare

| Test                                           | Förväntat beteende                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Öppna Fidäl och skriv                          | Tecknen visas korrekt från vänster till höger. Fingerritning och textinmatning fungerar.        |
| Öppna First words, Games och Stories           | Lektioner, spel och hela berättelser är tillgängliga som lokala filer.                          |
| Stäng av internet och starta om appen          | De paketerade övningarna fungerar utan backend eller inloggning.                                |
| Öppna My voice och välj Record my try          | Först nu får mikrofonen användas. iOS kan fråga om tillstånd.                                   |
| Neka mikrofonen                                | Appen visar ett vänligt alternativ att säga orden högt och fortsätta.                           |
| Tillåt, spela in och lyssna                    | Inspelningen stannar efter högst åtta sekunder. Din röst går att spela upp men betygsätts inte. |
| Avbryt, byt sida eller lägg appen i bakgrunden | Inspelningen stoppas och klippet tas bort från den aktuella övningen.                           |
| Aktivera VoiceOver och Minska rörelse          | Kontroller går att hitta, fokus är begripligt och rörelse krävs inte för att öva.               |

Lämna backend avstängd under dessa tester. Standardläget är `offline`, med `apiUrl: null` och ingen databasanslutning. Ingen API-adress eller godkänd ljudmodell har lagts till. Om du tidigare har exporterat API-inställningar i terminalen återgår du till standardläget med:

```sh
unset MOBILE_ENV MOBILE_API_URL MOBILE_ALLOW_PRODUCTION_API
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
```

Språk, innehåll och modellinspelningar är fortfarande markerade som väntande på kvalificerad granskning. Egen testning, fungerande signering och godkända kodtester ändrar inte den statusen.

## Kontroller utan inloggning eller publicering

```sh
bash scripts/tool.sh npm run ios:build --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run ios:build:device --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run ios:typecheck --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run check --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run typecheck --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm test --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run test:e2e --prefix apps/mobile --workspaces=false -- --workers=2
```

Det första bygget gäller simulatorn, det andra iPhone-hårdvara. Båda stänger uttryckligen av kodsignering. De laddar inte upp, provisionerar inte, installerar inte på en telefon och startar ingen backend. Körning på fysisk enhet görs separat av dig i Xcode med ditt team. Om byggverktyget saknar plattformsstöd måste den komponenten först bli klar; ett godkänt Swift-typkontrolltest är inte samma sak som ett fullständigt appbygge.
