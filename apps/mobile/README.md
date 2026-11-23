# Tigrinya mobile development target

This independent Capacitor target bundles the existing learning activities locally. It adds an offline home, safe-area navigation, a private eight-second native voice recorder, and an optional read-only API connection check. It does not export or modify Next.js, start the backend, connect to PostgreSQL, create accounts or submit anything to Apple. The [audit](AUDIT.md) explains the architecture and remaining release work.

For step-by-step instructions in Swedish, including your own app name, bundle ID, Apple team and physical-device tests, see [Installera och testa på din iPhone](IPHONE_SETUP.sv.md).

## Check Xcode and install the matching runtime

```sh
bash scripts/tool.sh npm run ios:doctor --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run ios:install-runtime --prefix apps/mobile --workspaces=false
```

`ios:doctor` is read-only. It checks installed tools, simulator runtime availability, disk space, offline configuration and required owner choices without reading Apple Accounts or Keychain. Exit code 1 means a requirement or owner choice remains outstanding; it does not start a backend or perform an installation. Add `-- --json` for a machine-readable report.

The installer uses the official `xcodebuild -downloadPlatform iOS -buildVersion <installed simulator SDK version> -architectureVariant <arm64|universal>` command after a preflight. It neither accepts a licence nor answers an account prompt. It requires 30 GiB free as this project's conservative safety margin for download, expansion, build output and the running OS, not an Apple-published size or installation guarantee. It never deletes files to free space.

On 21 November 2026 this Mac had only about 4.7 GiB free, no available iOS runtime, and Apple's release iOS 26.2 arm64 download alone was 8,388,683,973 bytes (about 7.8 GiB). The preflight therefore refused the download. Free disk space yourself before retrying. The GUI location is **Xcode → Settings → Components → Platform Support → iOS → Get**; for a specific older version use **Add Platforms (+) → iOS 26.2 → Download & Install**. See [Apple's official component instructions](https://developer.apple.com/documentation/xcode/downloading-and-installing-additional-xcode-components).

## Requirements

- Node 24, Python 3 and the repository's existing tool wrapper.
- macOS with Xcode 26 or later and the iOS platform/simulator components selected in Xcode Settings → Components. The minimum target is iOS 15, following Capacitor 8.
- The owner supplies a bundle identifier, display name and Apple signing team before a physical-device release. No team, credentials or provisioning profile is included.

`apps/mobile` deliberately has its own `package.json`, exact versions and `package-lock.json`. It is not added to root npm workspaces. Use `--prefix apps/mobile --workspaces=false` from the repository root; the existing root web commands retain their meaning.

## Install and build offline

Run these commands from the master repository:

```sh
bash scripts/tool.sh npm ci --prefix apps/mobile --workspaces=false --ignore-scripts
bash scripts/tool.sh npm run build --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run check --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run typecheck --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm test --prefix apps/mobile --workspaces=false
```

The mobile builder reads the literal runtime inventory from `scripts/build_site.py` as data, verifies its paths and copies the current source files. It never executes that script or any web generator. Non-HTML lesson/content files are byte-for-byte copies. Only generated HTML receives mobile style/script references, safe-area viewport metadata and a CSP. `www/mobile/build-manifest.json` records every source and output hash. `www/` and the generated `capacitor.config.json` are disposable and ignored by Git; source learning data and practice histories are never removed by a build.

Default mode is `offline`, with no API address. No `.env` file is loaded automatically. Only the optional `device.local.json` identity file described below is read. `config.example.json` lists public environment configuration keys; it is a reference, not an active configuration. Never put credentials or tokens in mobile configuration: packaged values are readable by app users.

## Prepare and open Xcode

```sh
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
bash scripts/tool.sh npm run ios:open --prefix apps/mobile --workspaces=false
```

Preparation builds assets, applies the explicit environment's identity to the mobile project, syncs local assets and checks native wiring. It does not generate or replace your signing team. The checked-in Xcode project uses Swift Package Manager with Capacitor **8.6.2**, not CocoaPods. Its generated public folder and configuration are ignored. Keep the small native Swift source files and project/storyboards in Git.

The initial identifier `com.example.tigrinya.placeholder`, display name `Tigrinya Preview`, template icon and template version/build numbers are conspicuous development placeholders. They are not registered or approved product identity or App Store metadata. For persistent owner choices:

```sh
cp -n apps/mobile/device.example.json apps/mobile/device.local.json
```

Replace the two `null` values with your actual `appId` and `appName`. The local file is ignored by Git, accepts only these two public identity values, and is excluded from app assets. It cannot configure an API, database, signing team, password or token. This avoids resetting your chosen identity to placeholders when a later terminal session has no identity environment variables. Enter your real signing team in Xcode; it is not inferred from an account.

For a specific build, explicit nonempty environment values override the local identity:

```sh
export MOBILE_APP_ID='YOUR_REGISTERED_REVERSE_DOMAIN_ID'
export MOBILE_APP_NAME='YOUR_APPROVED_DISPLAY_NAME'
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
```

Replace those two placeholder strings before running the example. In Xcode select the **App** target, enter your actual Apple team under Signing & Capabilities, select your connected iPhone and press Run. Pair/trust the device and enable Developer Mode when iOS requests it. An Apple Personal Team can be used for development subject to Apple's provisioning limits. Signing and installation require the owner's account and device; neither is automated here.

For an unsigned simulator compilation:

```sh
bash scripts/tool.sh npm run ios:build --prefix apps/mobile --workspaces=false
```

This always uses `CODE_SIGNING_ALLOWED=NO` and `CODE_SIGNING_REQUIRED=NO`. It never archives, provisions, uploads or submits. If Xcode reports that iOS 26.2 (or another selected version) is not installed, install that platform and an iPhone simulator runtime in **Xcode → Settings → Components**, then rerun. Selecting a physical iPhone additionally requires a compatible installed platform.

An unsigned hardware-target build can also be checked separately, without installing on an iPhone:

```sh
bash scripts/tool.sh npm run ios:build:device --prefix apps/mobile --workspaces=false
```

It uses `iphoneos`, `generic/platform=iOS`, its own `.build/DerivedData-device` folder and the same no-signing flags. It does not provision or install on a device. Both simulator and hardware attempts on this Mac currently stop at Xcode's missing-iOS-26.2 platform check, before application compilation. Supply your identity/team and use Xcode Run for a signed physical-device installation after platform support is ready.

## API environments

The first slice needs no API to teach its bundled activities. No web fallback, loopback address, database password or production URL is supplied.

- `MOBILE_ENV=offline` is default and rejects `MOBILE_API_URL` if present.
- `MOBILE_ENV=staging` requires an explicit `MOBILE_API_URL` containing an HTTPS **origin**, without credentials, path, query or fragment. IP literals, loopback aliases and reserved placeholder domains are rejected. Use a real staging DNS name with a trusted certificate; the server's data environment is the owner's responsibility.
- `MOBILE_ENV=production` additionally requires `MOBILE_ALLOW_PRODUCTION_API=yes` and real `MOBILE_APP_ID`/`MOBILE_APP_NAME`. This deliberately explicit switch does not approve the content or make a release eligible.

Supply the actual address through your shell or local, ignored environment tooling; there is no sample backend address to accidentally contact:

```sh
export MOBILE_ENV=staging
export MOBILE_API_URL='YOUR_STAGING_HTTPS_ORIGIN'
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
```

Replace `YOUR_STAGING_HTTPS_ORIGIN` before running. The configured origin is visible under **About this preview & connection**. Only choosing **Check API connection** sends a GET to the backend's existing `/health/live`, with timeouts and redirects disabled. This checks process availability, not database readiness, content publication or identity configuration. Offline lessons remain available on errors. No build or app startup sends an API request.

The explicit native request uses `CapacitorHttp.get`; general fetch/XHR patching stays disabled. This avoids changing web CORS or adding broad native origins to production. A browser preview uses normal fetch and needs the server's existing exact CORS permission. Authenticated APIs remain unavailable: future native accounts require a separate Entra public-client registration, system-browser/MSAL iOS flow, PKCE, a real callback URI and Keychain tokens. Do not insert MSAL Browser into an embedded sign-in form, add a client secret or disable API authorization.

To return to offline development, unset the API environment variables before preparing again:

```sh
unset MOBILE_ENV MOBILE_API_URL MOBILE_ALLOW_PRODUCTION_API
bash scripts/tool.sh npm run ios:prepare --prefix apps/mobile --workspaces=false
```

## Recording and privacy

**My voice** is a mobile-only recording surface. `PrivateVoicePlugin.swift` uses AVAudioRecorder for a mono AAC/MP4 clip of at most eight seconds. It requests permission only after Record my try. The microphone usage description accurately explains this feature. It has no camera, contacts, location, speech-recognition or background-audio permission.

Only the plugin's owned temporary directory is used. Completion converts the clip to bounded in-memory data and removes its temporary file. Cancel, permission failure, navigation, app backgrounding and audio interruption stop capture and remove the temporary file; stale permission callbacks cannot restart a cancelled capture. JavaScript owns one blob URL and revokes it on deletion, new attempts, navigation or backgrounding. Clips are never uploaded, included in practice storage or graded. A speak-aloud fallback remains when recording is unavailable.

The existing pronunciation cards retain their browser recorder and reviewed-audio gates unchanged. Browser recording still requires a secure context and browser support. The mobile **My voice** route provides the native alternative; it does not invent model audio, phonetic scores or native approvals. Test audio is generated silence under `tests/fixtures`, excluded from all app assets.

Existing optional practice saving remains local to this WebView and separate from Safari's storage. The new shell adds no analytics, accounts, automatic network calls or persistent child profile. External web links stay closed in this preview; source addresses and attribution remain in bundled review notes. A public release still needs a complete privacy/retention review and accurate owner-supplied disclosures.

## Icons and release gates

Replace the Capacitor template images in `ios/App/App/Assets.xcassets/AppIcon.appiconset` with approved original artwork. Use Xcode's AppIcon asset editor and [Apple's current app-icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons/) for the selected deployment target; do not ship a template icon or assume the mascot preview is approved icon artwork. Inspect legibility at small sizes, light/dark presentation where supported, and keep required icon variants/opaque backgrounds valid for their slots. Record real owner approval in `icon-review.json` only after it occurs. Do not fabricate it or a signing team.

```sh
bash scripts/tool.sh npm run release:check --prefix apps/mobile --workspaces=false
```

This intentionally exits nonzero while identity/icons are placeholders or learning content is pending review. There is no skip/approve environment flag. A future release workflow must bind real approval records, licences, app privacy requirements, device QA and reviewed native assets. The current slice cannot be submitted merely by setting an API URL.

## Browser and native checks

The root Playwright dev dependency is used without changing root configuration. Install root development dependencies first if needed, then:

```sh
bash scripts/tool.sh npm exec -- playwright install webkit
bash scripts/tool.sh npm run test:e2e --prefix apps/mobile --workspaces=false -- --workers=2
```

This starts a loopback-only server for the generated mobile bundle and exercises desktop Chrome and phone WebKit. It checks entry routes, actual Fidäl input/drawing, word-path launch/revisit, both game collections, full Stories, no automatic API calls, CSP-compatible assets, external-link blocking, reduced motion, small layouts, unavailable recording, and the native bridge transport using a clearly labelled silent fixture. Transport fixtures do not test the iOS microphone permission UI or physical capture.

For a native compiler-only check after resolving dependencies:

```sh
bash scripts/tool.sh npm run ios:typecheck --prefix apps/mobile --workspaces=false
```

`ios:build` resolves the Swift package into `.build/SourcePackages`. If a runtime is unavailable, dependencies alone can be resolved from `apps/mobile` with `xcodebuild -resolvePackageDependencies -project ios/App/App.xcodeproj -clonedSourcePackagesDirPath .build/SourcePackages`. The compiler check then type-checks both Swift files against the real simulator SDK and pinned Capacitor frameworks. It does not establish that storyboard compilation, linking, code signing, installation or microphone capture succeeded.

For a browser-only visual preview:

```sh
bash scripts/tool.sh npm run serve --prefix apps/mobile --workspaces=false
```

Open `http://127.0.0.1:4310`. Keep this terminal running. The native iOS app uses its bundled `capacitor://localhost` origin; that local WebView origin is not a backend or database address. No remote `server.url`, cleartext exception, development team, credential or App Store submission is configured.
