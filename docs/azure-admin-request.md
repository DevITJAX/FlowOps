# Azure Admin Request - Service Principal for FlowOps

## Request
Please create a service principal for GitHub Actions CI/CD deployment.

## Commands Needed (Run as Azure Admin)

```bash
# 1. Create Service Principal
az ad sp create-for-rbac --name "flowops-github" \
  --role contributor \
  --scopes /subscriptions/760d0ae8-ba29-4890-833e-93f6891eedb9/resourceGroups/flowops-rg \
  --sdk-auth
```

## Expected Output
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "760d0ae8-ba29-4890-833e-93f6891eedb9",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "...",
  "resourceManagerEndpointUrl": "...",
  ...
}
```

## What I Need
The **entire JSON output** above - this goes into GitHub as a secret called `AZURE_CREDENTIALS`.

## Purpose
This allows GitHub Actions to:
- Build Docker images
- Push to Azure Container Registry (flowopsacr)
- Deploy to App Service (flowops-backend, flowops-frontend)

## Resources Already Created
- Resource Group: `flowops-rg`
- Container Registry: `flowopsacr.azurecr.io`
- App Service Plan: `flowops-plan`
- Web Apps: `flowops-backend`, `flowops-frontend`
