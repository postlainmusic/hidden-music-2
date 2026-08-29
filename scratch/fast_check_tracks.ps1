Add-Type -AssemblyName System.Net.Http

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(8)

$tracksJson = [System.IO.File]::ReadAllText("c:\Users\Admin\Documents\github\hidden-music-2\scratch\tracks_fresh.json", [System.Text.Encoding]::UTF8)
$tracksData = $tracksJson | ConvertFrom-Json

Write-Host "Checking 30 tracks with ResponseHeadersRead..."

$audioOk = 0
$videoOk = 0
$audioFail = @()
$videoFail = @()

foreach ($t in $tracksData.tracks) {
    # Check audio
    try {
        $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $t.audio_url)
        $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 1024)
        $resp = $client.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).Result
        if ([int]$resp.StatusCode -eq 206 -or [int]$resp.StatusCode -eq 200) {
            $audioOk++
        } else {
            $audioFail += "$($t.id): HTTP $([int]$resp.StatusCode) ($($t.audio_url))"
        }
        $resp.Dispose()
    } catch {
        $audioFail += "$($t.id): EXCEPTION $_"
    }

    # Check video
    if ($t.video_url) {
        try {
            $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $t.video_url)
            $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 1024)
            $resp = $client.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).Result
            if ([int]$resp.StatusCode -eq 206 -or [int]$resp.StatusCode -eq 200) {
                $videoOk++
            } else {
                $videoFail += "$($t.id): HTTP $([int]$resp.StatusCode) ($($t.video_url))"
            }
            $resp.Dispose()
        } catch {
            $videoFail += "$($t.id): EXCEPTION $_"
        }
    }
}

Write-Host "Audio check result: $audioOk / $($tracksData.tracks.Count) OK"
if ($audioFail.Count -gt 0) {
    Write-Host "Audio Failures:"
    $audioFail | ForEach-Object { Write-Host " - " $_ }
}

Write-Host "Video check result: $videoOk / $($tracksData.tracks.Count) OK"
if ($videoFail.Count -gt 0) {
    Write-Host "Video Failures:"
    $videoFail | ForEach-Object { Write-Host " - " $_ }
}
