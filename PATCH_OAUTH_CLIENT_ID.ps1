$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $PSScriptRoot 'manifest.json'

Write-Host ''
Write-Host 'MailBatch Gmail - OAuth Client ID Setup' -ForegroundColor Cyan
Write-Host '----------------------------------------'
Write-Host 'For a FRESH install only.'
Write-Host 'Paste the Chrome Extension OAuth Client ID from Google Cloud.'
Write-Host 'It normally ends with .apps.googleusercontent.com'
Write-Host ''

$clientId = Read-Host 'OAuth Client ID'
$clientId = $clientId.Trim()
if ([string]::IsNullOrWhiteSpace($clientId)) { throw 'Client ID cannot be empty.' }
if (-not $clientId.EndsWith('.apps.googleusercontent.com')) { throw 'That does not look like a Google OAuth Client ID.' }

$text = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8
$pattern = '"client_id"\s*:\s*"[^"]+"'
$replacement = '"client_id": "' + $clientId + '"'
if ($text -notmatch $pattern) { throw 'Could not find oauth2.client_id in manifest.json.' }
$text = [regex]::Replace($text, $pattern, $replacement, 1)
[System.IO.File]::WriteAllText($manifestPath, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host 'Updated manifest.json successfully.' -ForegroundColor Green
Write-Host 'Now open chrome://extensions and click Reload on MailBatch.'
Write-Host ''
Read-Host 'Press Enter to close'
