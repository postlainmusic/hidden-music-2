Add-Type -AssemblyName System.Net.Http

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)

Write-Host "=== 1. API Health Check ==="
try {
    $res = $client.GetStringAsync("https://hidden-music-api.postlain-music.workers.dev/api/health").Result
    Write-Host "Health:" $res
} catch {
    Write-Host "Health Error:" $_
}

Write-Host "`n=== 2. API Tracks List ==="
try {
    $res = $client.GetStringAsync("https://hidden-music-api.postlain-music.workers.dev/api/tracks").Result
    Write-Host "Tracks Response Length:" $res.Length
} catch {
    Write-Host "Tracks Error:" $_
}

Write-Host "`n=== 3. API Stream Byte-Range ==="
try {
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, "https://hidden-music-api.postlain-music.workers.dev/api/stream/audio/01.%20Elegie.flac")
    $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 2048)
    $resp = $client.SendAsync($req).Result
    Write-Host "Status:" $resp.StatusCode
    Write-Host "Content-Type:" $resp.Content.Headers.ContentType.ToString()
    Write-Host "Content-Range:" $resp.Content.Headers.ContentRange.ToString()
    Write-Host "Content-Length:" $resp.Content.Headers.ContentLength
} catch {
    Write-Host "Stream Error:" $_
}

Write-Host "`n=== 4. Direct R2 Byte-Range ==="
try {
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, "https://media.postlain.com/audio/01.%20Elegie.flac")
    $req.Headers.Range = New-Object System.Net.Http.Headers.RangeHeaderValue(0, 2048)
    $resp = $client.SendAsync($req).Result
    Write-Host "Status:" $resp.StatusCode
    Write-Host "Content-Type:" $resp.Content.Headers.ContentType.ToString()
    Write-Host "Content-Range:" $resp.Content.Headers.ContentRange.ToString()
    Write-Host "Content-Length:" $resp.Content.Headers.ContentLength
} catch {
    Write-Host "Direct R2 Error:" $_
}

Write-Host "`n=== 5. Web Frontend HTML ==="
try {
    $res = $client.GetStringAsync("https://hidden-music-web.pages.dev").Result
    Write-Host "Web HTML Length:" $res.Length
} catch {
    Write-Host "Web Error:" $_
}
