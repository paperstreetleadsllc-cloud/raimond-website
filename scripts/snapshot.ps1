param([string]$Message = "manual snapshot")
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
git add -A
git commit -m "SNAPSHOT $stamp - $Message" | Out-Null
git tag "snap-$stamp"
Write-Host "Saved snapshot tag: snap-$stamp"
