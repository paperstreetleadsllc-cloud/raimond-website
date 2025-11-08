param([string]$Tag)
if (-not $Tag) { Write-Error "Usage: .\scripts\restore.ps1 -Tag snap-YYYYMMDD-HHMMSS"; exit 1 }
# Create a safety branch from current state before switching
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "safety-$stamp"
git checkout -B "restore-$Tag" $Tag
Write-Host "Checked out branch restore-$Tag from $Tag. Your working copy now matches that snapshot."
