$ErrorActionPreference = 'Stop'

$envPath = Join-Path (Split-Path -Parent $PSScriptRoot) '.env'
$content = Get-Content -Path $envPath -Raw -Encoding utf8

$m = [regex]::Match($content, '(?m)^DATABASE_URL=(.+)$')
if (-not $m.Success) {
  Write-Output 'NO_DATABASE_URL'
  exit 1
}

$v = $m.Groups[1].Value.Trim()
if ($v.StartsWith('"') -and $v.EndsWith('"')) {
  $v = $v.Substring(1, $v.Length - 2)
}

try {
  $u = [Uri]$v
  Write-Output ('HOST=' + $u.Host)
  Write-Output ('PORT=' + $u.Port)
  Write-Output ('SCHEME=' + $u.Scheme)
  Write-Output ('HAS_PGBOUNCER=' + ($u.Query -match 'pgbouncer=true'))
  Write-Output ('HAS_SSLMODE=' + ($u.Query -match 'sslmode=require'))
} catch {
  Write-Output 'URI_PARSE_FAILED'
  Write-Output ('VALUE_START=' + $v.Substring(0, [Math]::Min(80, $v.Length)))
  exit 2
}
