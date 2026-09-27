$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

$source = (Resolve-Path $PSScriptRoot).Path
Write-Host ''
Write-Host 'MailBatch Gmail V1.6 - Existing Install Updater' -ForegroundColor Cyan
Write-Host '------------------------------------------------'
Write-Host 'Select the folder Chrome currently loads as your MailBatch extension.'
Write-Host 'Your OAuth Client ID and extension key will be preserved.'
Write-Host ''

$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Select your CURRENT MailBatch extension folder'
$dialog.ShowNewFolderButton = $false
if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
    Write-Host 'Update cancelled.'
    exit 0
}

$target = (Resolve-Path $dialog.SelectedPath).Path
if ($target -eq $source) {
    throw 'Choose your existing MailBatch folder, not the new V1.6 package folder.'
}

$oldManifestPath = Join-Path $target 'manifest.json'
if (-not (Test-Path $oldManifestPath)) {
    throw 'No manifest.json was found in the selected folder.'
}

$newManifestPath = Join-Path $source 'manifest.json'
$oldManifest = Get-Content -LiteralPath $oldManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$newManifest = Get-Content -LiteralPath $newManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json

if ($oldManifest.name -ne 'MailBatch for Gmail') {
    throw 'The selected folder does not appear to be MailBatch for Gmail.'
}

$clientId = [string]$oldManifest.oauth2.client_id
$key = [string]$oldManifest.key
if ([string]::IsNullOrWhiteSpace($clientId) -or $clientId.StartsWith('REPLACE_WITH_')) {
    throw 'The existing install does not contain a configured OAuth Client ID.'
}
if ([string]::IsNullOrWhiteSpace($key)) {
    throw 'The existing install does not contain the extension key.'
}

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backup = Join-Path $target ("_mailbatch_backup_" + $stamp)
New-Item -ItemType Directory -Path $backup | Out-Null

$important = @('manifest.json','app.html','app.css','app.js','content.js','service-worker.js')
foreach ($name in $important) {
    $path = Join-Path $target $name
    if (Test-Path $path) { Copy-Item -LiteralPath $path -Destination $backup -Force }
}

$skip = @('manifest.json','UPDATE_EXISTING.bat','UPDATE_EXISTING.ps1')
Get-ChildItem -LiteralPath $source -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($source.Length).TrimStart('\')
    if ($skip -contains $_.Name -and $_.DirectoryName -eq $source) { return }
    $destination = Join-Path $target $relative
    $destinationDir = Split-Path -Parent $destination
    if (-not (Test-Path $destinationDir)) { New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null }
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

$newManifest.oauth2.client_id = $clientId
$newManifest.key = $key
$newJson = $newManifest | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($oldManifestPath, $newJson, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host 'Update complete.' -ForegroundColor Green
Write-Host ('Target: ' + $target)
Write-Host ('Backup: ' + $backup)
Write-Host ('OAuth preserved: ' + $clientId)
Write-Host ''
Write-Host 'Next:'
Write-Host '1. Open chrome://extensions'
Write-Host '2. Click Reload on MailBatch for Gmail'
Write-Host '3. Refresh Gmail with Ctrl+Shift+R'
Write-Host '4. Your existing Gmail authorization and local project data should remain available.'
Write-Host ''
Read-Host 'Press Enter to close'
