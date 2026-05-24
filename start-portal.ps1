$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js nao foi encontrado. Instale o Node.js ou abra o projeto em uma maquina com Node disponivel."
  exit 1
}

$portalUrl = "http://localhost:3000"
$isRunning = $false

try {
  $response = Invoke-WebRequest -Uri $portalUrl -TimeoutSec 3
  $isRunning = $response.StatusCode -eq 200
} catch {
  $isRunning = $false
}

if (-not $isRunning) {
  Start-Process -FilePath "node" -ArgumentList "--use-system-ca", "server.js" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

Start-Process $portalUrl
Write-Host "Portal aberto em $portalUrl"
