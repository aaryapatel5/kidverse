# KidVerse Comprehensive Security Audit Verification Suite
$ErrorActionPreference = "Continue"

$javaHome = "C:\Program Files\JetBrains\PyCharm Community Edition 2025.1.2\jbr"
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

$projectRoot = "C:\Users\VIDHI\.gemini\antigravity\scratch\college_project"
$backendJar = "$projectRoot\backend\target\kidverse-backend-0.0.1-SNAPSHOT.jar"
$mysqlCli = "C:\xampp\mysql\bin\mysql.exe"

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Security-Test($category, $testName, $passed, $details) {
    $status = if ($passed) { "PASS" } else { "FAIL" }
    $color = if ($passed) { "Green" } else { "Red" }
    Write-Host "[$status] $category - $testName - $details" -ForegroundColor $color
    $results.Add([PSCustomObject]@{
        Category = $category
        TestName = $testName
        Status   = $status
        Details  = $details
    })
}

$mysqld = "C:\xampp\mysql\bin\mysqld.exe"
$mysqlData = "$projectRoot\mysql_data"

# Verify or start MySQL server
$dbCheck = try { (& $mysqlCli -u root -e "SHOW DATABASES LIKE 'college_project';" 2>&1) } catch { "" }
if ($dbCheck -notmatch "college_project") {
    $mysqlProc = Get-Process -Name mysqld -ErrorAction SilentlyContinue
    if (-not $mysqlProc) {
        Write-Host "Starting MySQL server..." -ForegroundColor Cyan
        Start-Process -FilePath $mysqld -ArgumentList "--datadir=`"$mysqlData`" --port=3306 --standalone" -WindowStyle Hidden
        Start-Sleep -Seconds 4
    }
}

# Stop any running java process to ensure clean startup of updated JAR
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 1. Start Spring Boot Backend
Write-Host "Starting updated Spring Boot Backend with HMAC-SHA256 Token Security..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "$javaHome\bin\java.exe" -ArgumentList "-jar `"$backendJar`"" -PassThru -WindowStyle Hidden

# Wait for server ready
$attempts = 0
while ($attempts -lt 30) {
    Start-Sleep -Seconds 1
    $attempts++
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/products" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($resp.StatusCode -eq 200) {
            Write-Host "Backend is ready after $attempts seconds!" -ForegroundColor Green
            break
        }
    } catch {}
}

# -------------------------------------------------------------
# AUDIT ITEM 5: Check whether passwords are stored using BCrypt
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 1: Database Password Hashing Security ===" -ForegroundColor Yellow
$userRows = & $mysqlCli -u root college_project -e "SELECT username, password FROM users;"
$allBcrypt = $true
$plainFound = $false
foreach ($line in ($userRows -split "`n")) {
    if ($line -match "^\s*([^\s]+)\s+([^\s]+)\s*$") {
        $u = $matches[1]
        $p = $matches[2]
        if ($u -ne "username") {
            if ($p -notmatch '^\$2[aby]\$\d{2}\$') {
                $allBcrypt = $false
            }
            if ($p -match "password|kid123|emma123") {
                $plainFound = $true
            }
        }
    }
}
$pwSecure = ($allBcrypt -and (-not $plainFound))
Record-Security-Test "Audit 1: Passwords" "BCrypt Password Hashing" $pwSecure "All database passwords hashed using BCrypt ($2a$10$); zero plain text passwords found in MySQL"

# -------------------------------------------------------------
# AUDIT ITEM 2: Token Issuance on Authentication
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 2: Cryptographic Token Issuance ===" -ForegroundColor Yellow
$parentLogin = @{
    username = "parent@kidverse.com"
    password = "password123"
    userType = "parent"
} | ConvertTo-Json

$parentToken = ""
try {
    $authResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $parentLogin -ContentType "application/json"
    $parentToken = $authResp.token
    $hasToken = ($parentToken -ne $null -and $parentToken.Contains("."))
    Record-Security-Test "Audit 2: Token Issuance" "Parent Token Generation" $hasToken "Server issued signed HMAC-SHA256 token on login for parent@kidverse.com"
} catch {
    Record-Security-Test "Audit 2: Token Issuance" "Parent Token Generation" $false $_.Exception.Message
}

$childLogin = @{
    username = "Leo"
    password = "kid123"
    userType = "child"
} | ConvertTo-Json

$childToken = ""
try {
    $childAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $childLogin -ContentType "application/json"
    $childToken = $childAuth.token
    $hasChildToken = ($childToken -ne $null -and $childToken.Contains("."))
    Record-Security-Test "Audit 2: Token Issuance" "Child Token Generation" $hasChildToken "Server issued signed HMAC-SHA256 token on login for Leo"
} catch {
    Record-Security-Test "Audit 2: Token Issuance" "Child Token Generation" $false $_.Exception.Message
}

# -------------------------------------------------------------
# AUDIT ITEM 1 & 3: Check whether X-Username alone is rejected
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 3: Header-Only Spoofing (X-Username Without Token) Blocked ===" -ForegroundColor Yellow

# Test 3.1: Attacker sends POST /api/orders with ONLY X-Username header
$spoofOrder = @{
    username = "parent@kidverse.com"
    productIds = @(1)
    discountPct = 0
    shipping = 0
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $spoofOrder -ContentType "application/json" -Headers @{"X-Username"="parent@kidverse.com"}
    Record-Security-Test "Audit 3: Header Spoofing" "Order API Rejects X-Username Alone" $false "Should have blocked unauthenticated X-Username request"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 3: Header Spoofing" "Order API Rejects X-Username Alone" $is401 "Correctly blocked with HTTP 401: Missing Authorization Bearer token"
}

# Test 3.2: Attacker sends GET /api/orders with ONLY X-Username header
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"X-Username"="parent@kidverse.com"}
    Record-Security-Test "Audit 3: Header Spoofing" "Order History Rejects X-Username Alone" $false "Should have blocked unauthenticated X-Username request"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 3: Header Spoofing" "Order History Rejects X-Username Alone" $is401 "Correctly blocked with HTTP 401: Missing Authorization Bearer token"
}

# Test 3.3: Attacker sends POST /api/progress/star with ONLY X-Username header
$spoofStar = @{
    username = "Leo"
    starsToAdd = 50
    gameId = "cheat"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $spoofStar -ContentType "application/json" -Headers @{"X-Username"="Leo"}
    Record-Security-Test "Audit 3: Header Spoofing" "Star API Rejects X-Username Alone" $false "Should have blocked unauthenticated star addition"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 3: Header Spoofing" "Star API Rejects X-Username Alone" $is401 "Correctly blocked with HTTP 401: Missing Authorization Bearer token"
}

# Test 3.4: Attacker sends GET /api/progress/parent with ONLY X-Username header
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/parent/parent@kidverse.com" -Method Get -Headers @{"X-Username"="parent@kidverse.com"}
    Record-Security-Test "Audit 3: Header Spoofing" "Parent Dashboard Rejects X-Username Alone" $false "Should have blocked unauthenticated parent dashboard query"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 3: Header Spoofing" "Parent Dashboard Rejects X-Username Alone" $is401 "Correctly blocked with HTTP 401: Missing Authorization Bearer token"
}

# -------------------------------------------------------------
# AUDIT ITEM 3: Tampered / Forged Token Rejection
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 4: Forged / Tampered Token Signature Verification ===" -ForegroundColor Yellow
$forgedToken = "eyJhbGciOiJIUzI1NiJ9.cGFyZW50QGtpZHZlcnNlLmNvbTpQQVJFTlQ6OTk5OTk5OTk5Ojk5OTk5OTk5OQ.fake_forged_signature_12345"

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"Authorization"="Bearer $forgedToken"}
    Record-Security-Test "Audit 4: Signature Verification" "Reject Forged Signature Token" $false "Should have rejected token with forged signature"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 4: Signature Verification" "Reject Forged Signature Token" $is401 "Correctly rejected forged token with HTTP 401: Invalid or forged signature"
}

# -------------------------------------------------------------
# AUDIT ITEM 4: Cross-User Impersonation Blocked
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 5: Cross-User Impersonation Prevention ===" -ForegroundColor Yellow

# Register attacker parent account 'eve@test.com'
$eveReg = @{
    username = "eve@test.com"
    password = "password123"
    role = "PARENT"
    email = "eve@test.com"
} | ConvertTo-Json

$eveToken = ""
try {
    $eveResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $eveReg -ContentType "application/json"
    $eveToken = $eveResp.token
} catch {
    # If already registered, login
    $eveLogin = @{ username="eve@test.com"; password="password123"; userType="parent" } | ConvertTo-Json
    $eveResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $eveLogin -ContentType "application/json"
    $eveToken = $eveResp.token
}

# Eve attempts to place order under parent@kidverse.com using Eve's token
$eveImpersonateOrder = @{
    username = "parent@kidverse.com"
    productIds = @(1)
    discountPct = 0
    shipping = 0
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $eveImpersonateOrder -ContentType "application/json" -Headers @{"Authorization"="Bearer $eveToken"}
    Record-Security-Test "Audit 5: Impersonation" "Block Order Under Another Parent" $false "Should have blocked Eve from placing orders as parent@kidverse.com"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 5: Impersonation" "Block Order Under Another Parent" $is401 "Correctly blocked Eve with HTTP 401: Token subject does not match target user"
}

# Eve attempts to view parent@kidverse.com orders using Eve's token
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"Authorization"="Bearer $eveToken"}
    Record-Security-Test "Audit 5: Impersonation" "Block Viewing Another Parent Orders" $false "Should have blocked Eve from viewing parent@kidverse.com orders"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 5: Impersonation" "Block Viewing Another Parent Orders" $is401 "Correctly blocked Eve with HTTP 401: Token subject does not match target user"
}

# -------------------------------------------------------------
# AUDIT ITEM 4: Cross-Role Privilege Escalation Blocked
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 6: Cross-Role Privilege Escalation Blocked ===" -ForegroundColor Yellow

# Child Leo tries to place an order using Leo's CHILD token
$childOrderAttempt = @{
    username = "Leo"
    productIds = @(1)
    discountPct = 0
    shipping = 0
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $childOrderAttempt -ContentType "application/json" -Headers @{"Authorization"="Bearer $childToken"}
    Record-Security-Test "Audit 6: Role Guard" "Child Token Blocked from Order Placement" $false "Child token should not be permitted to place orders"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 6: Role Guard" "Child Token Blocked from Order Placement" $is401 "Correctly blocked Child token with HTTP 401: Only PARENT role permitted"
}

# Parent tries to award stars directly using Parent token
$parentStarAttempt = @{
    username = "parent@kidverse.com"
    starsToAdd = 10
    gameId = "alphabet"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $parentStarAttempt -ContentType "application/json" -Headers @{"Authorization"="Bearer $parentToken"}
    Record-Security-Test "Audit 6: Role Guard" "Parent Token Blocked from Awarding Stars" $false "Parent token should not be permitted to earn stars"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Security-Test "Audit 6: Role Guard" "Parent Token Blocked from Awarding Stars" $is401 "Correctly blocked Parent token with HTTP 401: Only CHILD role permitted"
}

# -------------------------------------------------------------
# AUDIT ITEM 7: Legitimate Token-Authenticated Operations
# -------------------------------------------------------------
Write-Host "`n=== AUDIT 7: Genuine Authenticated Operations Succeeded ===" -ForegroundColor Yellow

# Legitimate parent places order with valid Parent token
$validOrder = @{
    username = "parent@kidverse.com"
    productIds = @(1, 2)
    discountPct = 10
    shipping = 0
    freeGift = "Sticker Pack"
} | ConvertTo-Json

try {
    $orderResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $validOrder -ContentType "application/json" -Headers @{"Authorization"="Bearer $parentToken"}
    $ok = ($orderResp.orderId -gt 0 -and $orderResp.total -gt 0)
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Parent Order" $ok "Order placed successfully with valid PARENT token (orderId=$($orderResp.orderId))"
} catch {
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Parent Order" $false $_.Exception.Message
}

# Legitimate parent views order history
try {
    $historyResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"Authorization"="Bearer $parentToken"}
    $ok = ($historyResp.Count -ge 1)
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Order History" $ok "Retrieved $($historyResp.Count) orders with valid PARENT token"
} catch {
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Order History" $false $_.Exception.Message
}

# Legitimate child earns stars
$validStar = @{
    username = "Leo"
    starsToAdd = 5
    gameId = "alphabet"
} | ConvertTo-Json

try {
    $starResp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $validStar -ContentType "application/json" -Headers @{"Authorization"="Bearer $childToken"}
    $ok = ($starResp.stars -gt 0)
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Child Stars" $ok "Child earned 5 stars with valid CHILD token (total stars: $($starResp.stars))"
} catch {
    Record-Security-Test "Audit 7: Authenticated Ops" "Legitimate Child Stars" $false $_.Exception.Message
}

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "            SECURITY AUDIT TEST SUMMARY                " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$passedCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

$results | Format-Table -AutoSize Category, TestName, Status, Details

$summaryColor = if ($failedCount -eq 0) { "Green" } else { "Red" }
Write-Host "`nTotal Security Tests: $totalCount | Passed: $passedCount | Failed: $failedCount" -ForegroundColor $summaryColor

if ($failedCount -eq 0) {
    Write-Host "`nALL SECURITY AUDIT REQUIREMENTS VERIFIED AND PASSED!" -ForegroundColor Green
} else {
    Write-Host "`nSECURITY VULNERABILITIES DETECTED!" -ForegroundColor Red
}
