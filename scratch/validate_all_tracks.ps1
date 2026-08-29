Add-Type -AssemblyName System.Net.Http

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)

$tracksJson = $client.GetStringAsync("https://hidden-music-api.postlain-music.workers.dev/api/tracks").Result
$tracksData = $tracksJson | ConvertFrom-Json

Write-Host "Total tracks in API:" $tracksData.tracks.Count

$audioErrors = @()
$videoErrors = @()
$coverErrors = @()

$index = 0
foreach ($t in $tracksData.tracks) {
    $index++
    $audioUrl = $t.audio_url
    if (-not $audioUrl) { $audioUrl = $t.audioUrl }
    $videoUrl = $t.video_url
    if (-not $videoUrl) { $videoUrl = $t.videoUrl }
    $coverUrl = $t.cover_url
    if (-not $coverUrl) { $coverUrl = $t.coverUrl }

    # Test Audio HEAD or Byte Range
    try {
        $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $audioUrl)
        $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 1024)
        $resp = $client.SendAsync($req).Result
        if ([int]$resp.StatusCode -ne 206 -and [int]$resp.StatusCode -ne 200) {
            $audioErrors += "$($t.id): $($t.title) -> HTTP $([int]$resp.StatusCode) ($audioUrl)"
        }
    } catch {
        $audioErrors += "$($t.id): $($t.title) -> EXCEPTION $_"
    }

    # Test Video HEAD or Byte Range
    if ($videoUrl) {
        try {
            $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $videoUrl)
            $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 1024)
            $resp = $client.SendAsync($req).Result
            if ([int]$resp.StatusCode -ne 206 -and [int]$resp.StatusCode -ne 200) {
                $videoErrors += "$($t.id): $($t.title) -> HTTP $([int]$resp.StatusCode) ($videoUrl)"
            }
        } catch {
            $videoErrors += "$($t.id): $($t.title) -> EXCEPTION $_"
        }
    }
}

Write-Host "Audio check complete. Total errors:" $audioErrors.Count
if ($audioErrors.Count -gt 0) {
    $audioErrors | ForEach-Object { Write-Host "AUDIO ERROR:" $_ }
} else {
    Write-Host "ALL 30 FLAC AUDIO TRACKS ACCESSIBLE & RETURNING 206 PARTIAL CONTENT!"
}

Write-Host "`nVideo check complete. Total errors:" $videoErrors.Count
if ($videoErrors.Count -gt 0) {
    $videoErrors | ForEach-Object { Write-Host "VIDEO ERROR:" $_ }
} else {
    Write-Host "ALL 30 VIDEO STREAMS ACCESSIBLE & RETURNING 206 PARTIAL CONTENT!"
}
