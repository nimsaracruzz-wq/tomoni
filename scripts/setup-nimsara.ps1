$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'C:\Users\isuru\Downloads\Tomoni-Homepage'
& node --env-file-if-exists=.env scripts/create-admin.mjs --name 'Nimsara Liyanage' --email 'nimsarasean@gmail.com'
if ($LASTEXITCODE -eq 0) { Write-Host 'Your account is ready. Sign in at http://127.0.0.1:3000/admin/login' }
