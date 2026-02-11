$ErrorActionPreference = 'Stop'

Set-Location -Path (Split-Path -Parent $PSScriptRoot)

$allowed = @(
  'DATABASE_URL',
  'ADMIN_TOKEN',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'ADMIN_WEBHOOK_URL',
  'S3_BUCKET',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_ENDPOINT'
)

function Unquote-Unescape([string]$value) {
  if ($null -eq $value) { return '' }
  $v = $value.Trim()
  if ($v.StartsWith('"') -and $v.EndsWith('"')) {
    $v = $v.Substring(1, $v.Length - 2)
  }
  # undo common escaping mistakes
  $v = $v -replace '\\"', '"'
  $v = $v -replace '^\\+"', '"'
  $v = $v -replace '"\\+$', '"'

  if ($v.StartsWith('"') -and $v.EndsWith('"')) {
    $v = $v.Substring(1, $v.Length - 2)
  }

  while ($v.StartsWith('\') -or $v.StartsWith('"')) {
    $v = $v.TrimStart('\', '"')
  }
  while ($v.EndsWith('\') -or $v.EndsWith('"')) {
    $v = $v.TrimEnd('\', '"')
  }

  return $v
}

function Normalize-DatabaseUrl([string]$url) {
  $u = Unquote-Unescape $url
  if ([string]::IsNullOrWhiteSpace($u)) { return $u }
  if ($u.StartsWith('postgres://')) {
    $u = 'postgresql://' + $u.Substring('postgres://'.Length)
  }
  return $u
}

$envPath = Join-Path (Get-Location) '.env'
$lines = Get-Content -Path $envPath -Encoding utf8

$map = @{}
foreach ($line in $lines) {
  $t = $line.Trim()
  if (-not $t -or $t.StartsWith('#')) { continue }
  $m = [regex]::Match($t, '^(?<k>[A-Za-z_][A-Za-z0-9_]*)=(?<v>.*)$')
  if (-not $m.Success) { continue }
  $k = $m.Groups['k'].Value
  if ($allowed -notcontains $k) { continue }
  $map[$k] = $m.Groups['v'].Value
}

if ($map.ContainsKey('DATABASE_URL')) {
  $map['DATABASE_URL'] = Normalize-DatabaseUrl $map['DATABASE_URL']
}

$out = New-Object System.Collections.Generic.List[string]
foreach ($k in $allowed) {
  if ($map.ContainsKey($k)) {
    $v = Unquote-Unescape $map[$k]
    $out.Add(('{0}="{1}"' -f $k, $v))
  }
}

Set-Content -Path $envPath -Value (($out -join "`r`n") + "`r`n") -Encoding utf8 -NoNewline
Write-Output 'OK'
