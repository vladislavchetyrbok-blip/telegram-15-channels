param(
  [string]$PostId = "",
  [switch]$All,
  [switch]$IncludePublished,
  [switch]$AuditOnly
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$planPath = Join-Path $root "data\runtime\weekly-content-plan.json"
$reportPath = Join-Path $root "data\runtime\premium-visual-report.json"
$backupRoot = Join-Path $root "public\assets\telegram-posts-backup\pre-premium-v2"

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$width = 1080
$height = 1350
$badFragments = @("RUB", "₽", "руб", "ruble", "rouble", "Рџ", "РЅ", "Рё", "Рµ", "Р°", "Ð", "Ñ", "�", "test post", "local-model", "Failed first draft")

$profiles = @{
  "money-opportunities" = @{ preset = "premium_finance_dashboard"; palette = "dark_teal_gold"; accent = "#22d3ee"; gold = "#f5c76b"; elements = @("dashboard", "chart", "checklist", "calendar") }
  "ai-tech" = @{ preset = "ai_tech_command_center"; palette = "dark_cyan_violet"; accent = "#67e8f9"; gold = "#a78bfa"; elements = @("neural grid", "chip", "code", "command center") }
  "ukraine-market" = @{ preset = "premium_business_editorial"; palette = "dark_teal_gold"; accent = "#38bdf8"; gold = "#facc15"; elements = @("market", "documents", "city", "programs") }
  "mens-style" = @{ preset = "men_style_lifestyle"; palette = "dark_graphite_leather"; accent = "#cbd5e1"; gold = "#d4af37"; elements = @("watch", "leather", "fabric", "metal") }
  "home-tech" = @{ preset = "home_tech_comfort"; palette = "dark_clean_comfort"; accent = "#7dd3fc"; gold = "#e2e8f0"; elements = @("smart home", "device", "interior", "comfort") }
  "fishing-rest" = @{ preset = "fishing_rest_city"; palette = "dark_lifestyle_city"; accent = "#67e8f9"; gold = "#86efac"; elements = @("water", "gear", "route", "morning") }
  "dnipro-city" = @{ preset = "fishing_rest_city"; palette = "dark_lifestyle_city"; accent = "#38bdf8"; gold = "#facc15"; elements = @("city", "map", "route", "river") }
  "auto-comfort" = @{ preset = "home_tech_comfort"; palette = "dark_clean_comfort"; accent = "#f87171"; gold = "#cbd5e1"; elements = @("car interior", "road", "comfort", "controls") }
  "business-ideas" = @{ preset = "premium_finance_dashboard"; palette = "dark_teal_gold"; accent = "#34d399"; gold = "#facc15"; elements = @("business board", "sales", "calendar", "chart") }
  "personal-progress" = @{ preset = "fishing_rest_city"; palette = "dark_lifestyle_city"; accent = "#818cf8"; gold = "#2dd4bf"; elements = @("planner", "focus", "habit", "progress") }
  "dnipro-real-estate-ru" = @{ preset = "real_estate_premium"; palette = "dark_real_estate_gold"; accent = "#38bdf8"; gold = "#fbbf24"; elements = @("building", "map pin", "keys", "floor plan") }
  "dnipro-real-estate-ua" = @{ preset = "real_estate_premium"; palette = "dark_real_estate_gold"; accent = "#38bdf8"; gold = "#facc15"; elements = @("building", "map pin", "keys", "floor plan") }
  "commercial-real-estate" = @{ preset = "real_estate_premium"; palette = "dark_real_estate_gold"; accent = "#22d3ee"; gold = "#cbd5e1"; elements = @("facade", "office", "warehouse", "plan") }
  "land-houses" = @{ preset = "real_estate_premium"; palette = "dark_real_estate_gold"; accent = "#84cc16"; gold = "#facc15"; elements = @("land", "house", "road", "utilities") }
  "real-estate-investments" = @{ preset = "premium_finance_dashboard"; palette = "dark_teal_gold"; accent = "#38bdf8"; gold = "#fbbf24"; elements = @("buildings", "yield chart", "documents", "risk") }
}

function ColorFromHex([string]$hex, [int]$alpha = 255) {
  $clean = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb($alpha, [Convert]::ToInt32($clean.Substring(0,2),16), [Convert]::ToInt32($clean.Substring(2,2),16), [Convert]::ToInt32($clean.Substring(4,2),16))
}

function Has-BadText([string]$value) {
  foreach ($fragment in $badFragments) {
    if ($value -and $value.IndexOf($fragment, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
  }
  return $false
}

function Set-JsonProperty($object, [string]$name, $value) {
  if ($object.PSObject.Properties.Name -contains $name) {
    $object.$name = $value
  } else {
    $object | Add-Member -NotePropertyName $name -NotePropertyValue $value
  }
}

function New-RoundedRect([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Glow($g, [int]$x, [int]$y, [int]$size, [System.Drawing.Color]$color) {
  for ($i = 6; $i -ge 1; $i--) {
    $alpha = [Math]::Max(8, [int](36 / $i))
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
    $s = $size * $i / 3
    $g.FillEllipse($brush, $x - $s / 2, $y - $s / 2, $s, $s)
    $brush.Dispose()
  }
}

function Wrap-Lines($g, [string]$text, $font, [int]$maxWidth, [int]$maxLines) {
  $words = $text -split "\s+"
  $lines = New-Object System.Collections.Generic.List[string]
  $current = ""
  foreach ($word in $words) {
    $candidate = if ($current) { "$current $word" } else { $word }
    $size = $g.MeasureString($candidate, $font)
    if ($size.Width -le $maxWidth) {
      $current = $candidate
    } else {
      if ($current) { $lines.Add($current) }
      $current = $word
      if ($lines.Count -ge $maxLines) { break }
    }
  }
  if ($current -and $lines.Count -lt $maxLines) { $lines.Add($current) }
  return @($lines)
}

function Limit-Words([string]$text, [int]$maxWords) {
  $words = @($text -split "\s+" | Where-Object { $_ })
  if ($words.Count -le $maxWords) { return $text }
  return (($words | Select-Object -First $maxWords) -join " ")
}

function Draw-TextLines($g, [string[]]$lines, $font, $brush, [int]$x, [int]$y, [int]$lineHeight) {
  $yy = $y
  foreach ($line in $lines) {
    $g.DrawString($line, $font, $brush, $x, $yy)
    $yy += $lineHeight
  }
  return $yy
}

function Draw-Chart($g, $profile, [int]$seed) {
  $accent = ColorFromHex $profile.accent 210
  $gold = ColorFromHex $profile.gold 220
  $panel = New-RoundedRect 600 235 330 250 34
  $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(82, 7, 18, 31))
  $g.FillPath($panelBrush, $panel)
  $panelBrush.Dispose()
  for ($i = 0; $i -lt 5; $i++) {
    $h = 62 + (($seed + $i * 37) % 130)
    $barColor = $gold
    if ($i % 2 -eq 0) { $barColor = $accent }
    $brush = New-Object System.Drawing.SolidBrush $barColor
    $g.FillRectangle($brush, 640 + $i * 48, 430 - $h, 26, $h)
    $brush.Dispose()
  }
  $pen = New-Object System.Drawing.Pen $accent, 5
  $g.DrawBezier($pen, 625, 410, 700, 305, 805, 390, 910, 285)
  $pen.Dispose()
}

function Draw-ThemedObject($g, [string]$channelId, $profile, [int]$seed) {
  $accent = ColorFromHex $profile.accent 230
  $gold = ColorFromHex $profile.gold 220
  $soft = [System.Drawing.Color]::FromArgb(120, 226, 232, 240)
  $penAccent = New-Object System.Drawing.Pen $accent, 5
  $penGold = New-Object System.Drawing.Pen $gold, 4
  $brushAccent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, $accent.R, $accent.G, $accent.B))
  $brushGold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(135, $gold.R, $gold.G, $gold.B))

  if ($profile.preset -eq "ai_tech_command_center") {
    for ($i = 0; $i -lt 11; $i++) {
      $x = 555 + (($seed + $i * 73) % 320)
      $y = 190 + (($seed + $i * 51) % 290)
      $g.FillEllipse($brushAccent, $x, $y, 18, 18)
      if ($i -gt 0) { $g.DrawLine($penAccent, $x, $y, 555 + (($seed + ($i - 1) * 73) % 320), 190 + (($seed + ($i - 1) * 51) % 290)) }
    }
    $g.DrawRectangle($penGold, 640, 500, 230, 120)
  } elseif ($profile.preset -eq "real_estate_premium") {
    $g.FillRectangle($brushAccent, 610, 285, 120, 285)
    $g.FillRectangle($brushGold, 755, 220, 140, 350)
    for ($x = 632; $x -lt 885; $x += 44) {
      for ($y = 320; $y -lt 540; $y += 54) { $g.FillRectangle($brushGold, $x, $y, 16, 18) }
    }
    $g.DrawLine($penAccent, 585, 585, 925, 585)
  } elseif ($profile.preset -eq "men_style_lifestyle") {
    $g.FillEllipse($brushGold, 680, 265, 180, 180)
    $g.DrawEllipse($penAccent, 710, 295, 120, 120)
    $g.FillRectangle($brushAccent, 600, 520, 310, 42)
  } elseif ($profile.preset -eq "home_tech_comfort") {
    $g.FillRectangle($brushAccent, 610, 260, 310, 210)
    $g.FillRectangle($brushGold, 655, 305, 210, 34)
    $g.DrawArc($penAccent, 660, 380, 180, 85, 180, 180)
  } elseif ($profile.preset -eq "fishing_rest_city") {
    for ($i = 0; $i -lt 7; $i++) {
      $g.DrawBezier($penAccent, 560, 360 + $i * 32, 650, 315 + $i * 22, 770, 390 + $i * 12, 910, 340 + $i * 28)
    }
    $g.FillRectangle($brushGold, 620, 545, 270, 36)
  } else {
    Draw-Chart $g $profile $seed
  }

  $penAccent.Dispose()
  $penGold.Dispose()
  $brushAccent.Dispose()
  $brushGold.Dispose()
}

function Draw-PremiumImage($item, [string]$targetPath) {
  $profile = $profiles[$item.channelId]
  if (-not $profile) { $profile = $profiles["money-opportunities"] }
  $seed = [Math]::Abs(($item.postId.GetHashCode()))
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
  $bg1 = [System.Drawing.Color]::FromArgb(255, 4, 12, 22)
  $bg2 = [System.Drawing.Color]::FromArgb(255, 17, 37, 51)
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bg1, $bg2, 65
  $g.FillRectangle($gradient, $rect)
  $gradient.Dispose()

  Draw-Glow $g (245 + ($seed % 70)) 205 520 (ColorFromHex $profile.accent)
  Draw-Glow $g 930 980 620 (ColorFromHex $profile.gold)
  Draw-Glow $g 80 1150 430 ([System.Drawing.Color]::FromArgb(255, 20, 184, 166))

  $framePen = New-Object System.Drawing.Pen (ColorFromHex $profile.accent 130), 3
  $g.DrawRectangle($framePen, 54, 58, $width - 108, $height - 116)
  $framePen.Dispose()

  $glass = New-RoundedRect 76 92 928 1158 38
  $glassBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(74, 9, 18, 31))
  $g.FillPath($glassBrush, $glass)
  $glassBrush.Dispose()

  Draw-ThemedObject $g $item.channelId $profile $seed
  Draw-Chart $g $profile $seed

  $fontBadge = New-Object System.Drawing.Font "Segoe UI Semibold", 24, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fontTitle = New-Object System.Drawing.Font "Segoe UI Semibold", 66, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fontSubtitle = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fontBullet = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fontFooter = New-Object System.Drawing.Font "Segoe UI", 22, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 248, 250, 252))
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(205, 203, 213, 225))
  $accentBrush = New-Object System.Drawing.SolidBrush (ColorFromHex $profile.accent 245)
  $goldBrush = New-Object System.Drawing.SolidBrush (ColorFromHex $profile.gold 245)
  $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 2, 8, 15))

  $badgePath = New-RoundedRect 100 125 430 58 22
  $g.FillPath($darkBrush, $badgePath)
  $g.DrawString((Limit-Words $item.channelName 4).ToUpperInvariant(), $fontBadge, $accentBrush, 124, 139)

  $headline = Limit-Words $item.title 9
  $titleLines = Wrap-Lines $g $headline $fontTitle 820 4
  $afterTitle = Draw-TextLines $g $titleLines $fontTitle $white 100 245 76

  $subtitle = "$($item.contentTopic)"
  $subtitleLines = Wrap-Lines $g $subtitle $fontSubtitle 780 2
  $afterSubtitle = Draw-TextLines $g $subtitleLines $fontSubtitle $muted 104 ($afterTitle + 26) 40

  $bulletPanel = New-RoundedRect 100 ($afterSubtitle + 48) 570 245 30
  $g.FillPath($darkBrush, $bulletPanel)
  $bodySentences = @($item.body -split "(?<=[.!?])\s+" | Where-Object { $_ -and $_.Trim().Length -gt 24 })
  $bullets = @($bodySentences | Select-Object -Skip 1 -First 3 | ForEach-Object { Limit-Words $_.Trim() 5 })
  if ($bullets.Count -lt 3) {
    $bullets = @($item.contentTopic, (Limit-Words $item.title 5), (Limit-Words $item.channelName 3))
  }
  $yy = $afterSubtitle + 80
  foreach ($bullet in $bullets) {
    $g.FillEllipse($goldBrush, 130, $yy + 9, 12, 12)
    $g.DrawString($bullet, $fontBullet, $white, 158, $yy)
    $yy += 58
  }

  $g.FillRectangle($accentBrush, 100, 1170, 170, 5)
  $g.FillRectangle($goldBrush, 286, 1170, 72, 5)

  $fontBadge.Dispose(); $fontTitle.Dispose(); $fontSubtitle.Dispose(); $fontBullet.Dispose(); $fontFooter.Dispose()
  $white.Dispose(); $muted.Dispose(); $accentBrush.Dispose(); $goldBrush.Dispose(); $darkBrush.Dispose()

  mkdir -Force (Split-Path -Parent $targetPath) | Out-Null
  $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bitmap.Dispose()
}

function Backup-Image([string]$filePath) {
  if (-not (Test-Path -LiteralPath $filePath)) { return $null }
  $relative = $filePath.Substring((Join-Path $root "public\assets\telegram-posts").Length).TrimStart("\")
  $backupPath = Join-Path $backupRoot $relative
  mkdir -Force (Split-Path -Parent $backupPath) | Out-Null
  if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $filePath -Destination $backupPath -Force
  }
  return $backupPath
}

function Get-PngDimensions([string]$filePath) {
  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  if ($bytes.Length -lt 24) { return @{ width = 0; height = 0 } }
  $wBytes = $bytes[16..19]; [Array]::Reverse($wBytes)
  $hBytes = $bytes[20..23]; [Array]::Reverse($hBytes)
  return @{ width = [BitConverter]::ToInt32($wBytes, 0); height = [BitConverter]::ToInt32($hBytes, 0) }
}

if (-not (Test-Path -LiteralPath $planPath)) {
  throw "weekly-content-plan.json not found"
}

$state = Get-Content -LiteralPath $planPath -Raw -Encoding UTF8 | ConvertFrom-Json
$items = @($state.items)
$selected = if ($PostId) {
  @($items | Where-Object { $_.postId -eq $PostId -or $_.id -eq $PostId })
} elseif ($All) {
  @($items)
} else {
  @($items | Where-Object { $_.status -eq "ready_to_publish" -or $_.status -eq "scheduled" })
}
$generated = 0
$failed = 0
$skipped = 0
$strong = 0
$medium = 0
$weak = 0
$errors = New-Object System.Collections.Generic.List[object]
$presets = @{}

foreach ($item in $selected) {
  if (-not $IncludePublished -and ($item.status -eq "published" -or $item.telegramMessageId -or $item.publishResult -eq "success")) {
    $skipped += 1
    continue
  }

  $profile = $profiles[$item.channelId]
  if (-not $profile) { $profile = $profiles["money-opportunities"] }
  $presets[$item.channelId] = $profile.preset

  if (Has-BadText "$($item.title)`n$($item.contentTopic)`n$($item.channelName)") {
    $failed += 1
    $weak += 1
    $errors.Add([pscustomobject]@{ postId = $item.postId; channelId = $item.channelId; error = "bad overlay text" })
    continue
  }

  if (-not $AuditOnly) {
    $backup = Backup-Image $item.telegramImagePath
    Draw-PremiumImage $item $item.telegramImagePath
    Set-JsonProperty $item "backupImagePath" $backup
  }

  $dimensions = Get-PngDimensions $item.telegramImagePath
  $size = (Get-Item -LiteralPath $item.telegramImagePath).Length
  $ratio = if ($dimensions.height -gt 0) { $dimensions.width / $dimensions.height } else { 0 }
  $ok = (Test-Path -LiteralPath $item.telegramImagePath) -and $size -gt 80000 -and $dimensions.width -ge 1000 -and [Math]::Abs($ratio - 0.8) -lt 0.04

  Set-JsonProperty $item "visualStyle" "$($profile.preset), $($profile.palette), high-end Telegram cover"
  Set-JsonProperty $item "visualPreset" $profile.preset
  Set-JsonProperty $item "visualVersion" "premium_v2"
  Set-JsonProperty $item "visualGeneratedAt" (Get-Date).ToUniversalTime().ToString("o")
  Set-JsonProperty $item "previewPath" $item.imageUrl
  Set-JsonProperty $item "provider" "local_template"
  Set-JsonProperty $item "fallbackProvider" "local_template"
  Set-JsonProperty $item "fallbackUsed" $false
  Set-JsonProperty $item "premiumVersion" "premium_v2"
  Set-JsonProperty $item "source" "template"
  Set-JsonProperty $item "imageDimensions" ([pscustomobject]@{ width = $dimensions.width; height = $dimensions.height })
  Set-JsonProperty $item "visualMetadata" ([pscustomobject]@{
    width = $dimensions.width
    height = $dimensions.height
    format = "png"
    visualStyle = "$($profile.preset), $($profile.palette), premium editorial Telegram cover"
    visualPreset = $profile.preset
    textStatus = "OK"
    qualityStatus = if ($ok) { "strong" } else { "weak" }
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    version = "premium_v2"
    provider = "local_template"
    fallbackProvider = "local_template"
    fallbackUsed = $false
    premiumVersion = "premium_v2"
    source = "template"
  })
  $item.telegramImageStatus = if ($ok) { "OK" } else { "broken_file" }
  $item.imageQuality = if ($ok) { "strong" } else { "weak" }
  if ($ok) {
    $item.qualityIssues = @($item.qualityIssues | Where-Object { $_ -notin @("weak_image", "telegram_image_not_ready", "image_quality_failed", "placeholder_image_detected") })
    if ($item.qualityIssues.Count -eq 0 -and $item.status -eq "blocked") { $item.status = "ready_to_publish" }
    $generated += 1
    $strong += 1
  } else {
    $failed += 1
    $weak += 1
    $item.qualityIssues = @($item.qualityIssues + "image_quality_failed" | Select-Object -Unique)
    $item.status = "blocked"
    $errors.Add([pscustomobject]@{ postId = $item.postId; channelId = $item.channelId; error = "image quality failed"; width = $dimensions.width; height = $dimensions.height; size = $size })
  }
}

if (-not $AuditOnly) {
  $state.updatedAt = (Get-Date).ToUniversalTime().ToString("o")
  Set-JsonProperty $state "premiumVisualSummary" ([pscustomobject]@{
    version = "premium_v2"
    width = $width
    height = $height
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    postsProcessed = @($selected).Count
    imagesGenerated = $generated
    failed = $failed
  })
  $json = $state | ConvertTo-Json -Depth 40
  [System.IO.File]::WriteAllText($planPath, $json, [System.Text.UTF8Encoding]::new($false))
}

$report = [pscustomobject]@{
  ok = ($failed -eq 0)
  mode = if ($AuditOnly) { "audit" } else { "generate" }
  size = "${width}x${height}"
  selected = @($selected).Count
  imagesRegenerated = $generated
  skipped = $skipped
  failed = $failed
  imageQualityStrong = $strong
  imageQualityMedium = $medium
  imageQualityWeak = $weak
  telegramImageOk = @($items | Where-Object { $_.telegramImageStatus -eq "OK" }).Count
  visualVersion = "premium_v2"
  presets = $presets
  errors = $errors
  telegramSent = $false
  autopublishEnabledChanged = $false
  targetsChanged = $false
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
}

mkdir -Force (Split-Path -Parent $reportPath) | Out-Null
$reportJson = $report | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($reportPath, $reportJson, [System.Text.UTF8Encoding]::new($false))
Write-Output $reportJson
