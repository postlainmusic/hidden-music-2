Add-Type -AssemblyName System.Net.Http

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)

Write-Host "=== 1. Albums Endpoint ==="
try {
    $res = $client.GetStringAsync("https://hidden-music-api.postlain-music.workers.dev/api/albums").Result
    Write-Host "Albums:" $res
} catch {
    Write-Host "Albums Error:" $_
}

Write-Host "`n=== 2. Auth ME Endpoint (Unauthenticated) ==="
try {
    $res = $client.GetStringAsync("https://hidden-music-api.postlain-music.workers.dev/api/auth/me").Result
    Write-Host "Auth ME:" $res
} catch {
    Write-Host "Auth ME Error:" $_
}

Write-Host "`n=== 3. Favorites Endpoint (Test User) ==="
try {
    # Generate test session token
    $testUser = '{"id":"usr_test_123","email":"test@postlain.com","name":"Test User","avatarUrl":""}'
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($testUser)
    $b64 = [Convert]::ToBase64String($bytes)
    $token = "sess_$b64"

    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, "https://hidden-music-api.postlain-music.workers.dev/api/favorites")
    $req.Headers.Add("Authorization", "Bearer $token")
    $res = $client.SendAsync($req).Result
    $body = $res.Content.ReadAsStringAsync().Result
    Write-Host "Favorites GET:" $body

    # Toggle favorite
    $toggleReq = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, "https://hidden-music-api.postlain-music.workers.dev/api/favorites/toggle")
    $toggleReq.Headers.Add("Authorization", "Bearer $token")
    $toggleReq.Content = New-Object System.Net.Http.StringContent('{"trackId":"mck-01"}', [System.Text.Encoding]::UTF8, "application/json")
    $toggleRes = $client.SendAsync($toggleReq).Result
    $toggleBody = $toggleRes.Content.ReadAsStringAsync().Result
    Write-Host "Favorites TOGGLE (add):" $toggleBody

    # Check favorites again
    $req2 = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, "https://hidden-music-api.postlain-music.workers.dev/api/favorites")
    $req2.Headers.Add("Authorization", "Bearer $token")
    $res2 = $client.SendAsync($req2).Result
    $body2 = $res2.Content.ReadAsStringAsync().Result
    Write-Host "Favorites GET after add:" $body2

    # Toggle favorite off
    $toggleReq2 = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, "https://hidden-music-api.postlain-music.workers.dev/api/favorites/toggle")
    $toggleReq2.Headers.Add("Authorization", "Bearer $token")
    $toggleReq2.Content = New-Object System.Net.Http.StringContent('{"trackId":"mck-01"}', [System.Text.Encoding]::UTF8, "application/json")
    $toggleRes2 = $client.SendAsync($toggleReq2).Result
    $toggleBody2 = $toggleRes2.Content.ReadAsStringAsync().Result
    Write-Host "Favorites TOGGLE (remove):" $toggleBody2
} catch {
    Write-Host "Favorites Error:" $_
}
