#!/usr/bin/env bash
set -euo pipefail
: "${RESOURCE_GROUP:?}" "${ACR_NAME:?}" "${API_APP:?}" "${WEB_APP:?}" "${MIGRATION_JOB:?}" "${API_URL:?}" "${GITHUB_SHA:?}"
ACR_SERVER="$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)"
az acr login --name "$ACR_NAME"
docker build -f infrastructure/docker/api.Dockerfile -t "$ACR_SERVER/polyglot-api:$GITHUB_SHA" .
docker build -f infrastructure/docker/web.Dockerfile --build-arg "NEXT_PUBLIC_API_URL=$API_URL" -t "$ACR_SERVER/polyglot-web:$GITHUB_SHA" .
docker push "$ACR_SERVER/polyglot-api:$GITHUB_SHA"
docker push "$ACR_SERVER/polyglot-web:$GITHUB_SHA"
az containerapp job update --name "$MIGRATION_JOB" --resource-group "$RESOURCE_GROUP" --image "$ACR_SERVER/polyglot-api:$GITHUB_SHA" >/dev/null
EXECUTION="$(az containerapp job start --name "$MIGRATION_JOB" --resource-group "$RESOURCE_GROUP" --query name -o tsv)"
for ((attempt=0; attempt<60; attempt++)); do
 STATUS="$(az containerapp job execution show --name "$MIGRATION_JOB" --resource-group "$RESOURCE_GROUP" --job-execution-name "$EXECUTION" --query properties.status -o tsv)"
 if [[ "$STATUS" == "Succeeded" ]]; then break; fi
 if [[ "$STATUS" == "Failed" || "$attempt" == 59 ]]; then echo 'Migration did not succeed; apps were not updated.' >&2; exit 1; fi
 sleep 5
done
az containerapp update --name "$API_APP" --resource-group "$RESOURCE_GROUP" --image "$ACR_SERVER/polyglot-api:$GITHUB_SHA" >/dev/null
az containerapp update --name "$WEB_APP" --resource-group "$RESOURCE_GROUP" --image "$ACR_SERVER/polyglot-web:$GITHUB_SHA" >/dev/null
curl --fail --retry 8 --retry-delay 5 "$API_URL/health/ready"
