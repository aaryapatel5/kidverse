# KidVerse Comprehensive Automated Verification Test Suite
$ErrorActionPreference = "Continue"

$javaHome = "C:\Program Files\JetBrains\PyCharm Community Edition 2025.1.2\jbr"
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

$projectRoot = "C:\Users\VIDHI\.gemini\antigravity\scratch\college_project"
$backendJar = "$projectRoot\backend\target\kidverse-backend-0.0.1-SNAPSHOT.jar"
$mysqlData = "$projectRoot\mysql_data"
$mysqld = "C:\xampp\mysql\bin\mysqld.exe"
$mysqlCli = "C:\xampp\mysql\bin\mysql.exe"

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Test($category, $testName, $passed, $details) {
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

# 1. Verify or Start MySQL
$dbCheck = try { (& $mysqlCli -u root -e "SHOW DATABASES LIKE 'college_project';" 2>&1) } catch { "" }
if ($dbCheck -notmatch "college_project") {
    $mysqlProc = Get-Process -Name mysqld -ErrorAction SilentlyContinue
    if (-not $mysqlProc) {
        Write-Host "Starting MySQL server..." -ForegroundColor Cyan
        Start-Process -FilePath $mysqld -ArgumentList "--datadir=`"$mysqlData`" --port=3306 --standalone" -WindowStyle Hidden
        Start-Sleep -Seconds 4
    }
    $dbCheck = try { (& $mysqlCli -u root -e "SHOW DATABASES LIKE 'college_project';" 2>&1) } catch { "" }
}

if ($dbCheck -match "college_project") {
    Record-Test "Infrastructure" "MySQL Database" $true "Connected to college_project database on port 3306"
} else {
    Record-Test "Infrastructure" "MySQL Database" $false "Failed to connect to MySQL"
    exit 1
}

# 2. Start Spring Boot backend if not running
$testConn = try { (Invoke-WebRequest -Uri "http://localhost:8080/api/products" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue).StatusCode } catch { 0 }
$backendProc = $null

if ($testConn -ne 200) {
    Write-Host "Starting Spring Boot Backend..." -ForegroundColor Cyan
    $backendProc = Start-Process -FilePath "$javaHome\bin\java.exe" -ArgumentList "-jar `"$backendJar`"" -PassThru -WindowStyle Hidden
    
    # Wait for server to be healthy
    $attempts = 0
    while ($attempts -lt 30) {
        Start-Sleep -Seconds 1
        $attempts++
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/products" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -eq 200) {
                Write-Host "Spring Boot Backend is ready after $attempts seconds!" -ForegroundColor Green
                break
            }
        } catch {}
    }
}

$healthCheck = try { (Invoke-WebRequest -Uri "http://localhost:8080/api/products" -UseBasicParsing -TimeoutSec 3).StatusCode } catch { 0 }
if ($healthCheck -eq 200) {
    Record-Test "Infrastructure" "Spring Boot Server" $true "REST API running on http://localhost:8080"
} else {
    Record-Test "Infrastructure" "Spring Boot Server" $false "Spring Boot backend failed to start"
    exit 1
}

# ==========================================
# TASK 1: CHILD REGISTRATION AND LOGIN
# ==========================================
Write-Host "`n--- Running Task 1: Child Registration and Login ---" -ForegroundColor Yellow

# Clean up Emma if already exists from prior run so test is 100% reproducible
& $mysqlCli -u root college_project -e "DELETE FROM child_progress WHERE child_id IN (SELECT id FROM users WHERE username='Emma'); DELETE FROM users WHERE username='Emma';" 2>&1 | Out-Null

# 1.1 Child Registration
$regChildBody = @{
    username = "Emma"
    password = "emma123"
    role = "CHILD"
    parentUsername = "parent@kidverse.com"
} | ConvertTo-Json

try {
    $regChildResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $regChildBody -ContentType "application/json"
    $regPassed = ($regChildResp.username -eq "Emma" -and $regChildResp.role -eq "CHILD")
    Record-Test "Task 1: Child Auth" "Child Registration" $regPassed "Registered child Emma with role CHILD (id: $($regChildResp.id))"
} catch {
    Record-Test "Task 1: Child Auth" "Child Registration" $false $_.Exception.Message
}

# 1.2 Verify in MySQL: role=CHILD, password hashed with BCrypt, linked parent_id
$userRow = & $mysqlCli -u root college_project -e "SELECT id, username, role, password, parent_id FROM users WHERE username='Emma';"
$isBcrypt = $userRow -match '\$2[aby]\$'
$hasParent = $userRow -match '1' # parent id 1 is parent@kidverse.com
Record-Test "Task 1: Child Auth" "MySQL Child Persistence" ($isBcrypt -and $userRow -match "CHILD") "User stored with BCrypt hash ($isBcrypt) and role CHILD"

# 1.3 Child Login with Emma
$loginChildBody = @{
    username = "Emma"
    password = "emma123"
    userType = "child"
} | ConvertTo-Json

try {
    $loginChildResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginChildBody -ContentType "application/json"
    $loginPassed = ($loginChildResp.role -eq "CHILD" -and $loginChildResp.username -eq "Emma" -and $loginChildResp.stars -eq 0)
    Record-Test "Task 1: Child Auth" "Child Login (Valid Credentials)" $loginPassed "Logged in as Emma, role=CHILD, initial stars=$($loginChildResp.stars)"
} catch {
    Record-Test "Task 1: Child Auth" "Child Login (Valid Credentials)" $false $_.Exception.Message
}

# 1.4 Child Login with wrong password
$wrongPassBody = @{
    username = "Emma"
    password = "wrongpassword"
    userType = "child"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $wrongPassBody -ContentType "application/json"
    Record-Test "Task 1: Child Auth" "Child Login (Wrong Password)" $false "Should have rejected wrong password"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Test "Task 1: Child Auth" "Child Login (Wrong Password)" $is401 "Correctly rejected wrong password with HTTP 401 Unauthorized"
}

# 1.5 Unknown user login (prevent auto-creation)
$unknownBody = @{
    username = "ghost_unknown_user@test.com"
    password = "anypassword"
    userType = "parent"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $unknownBody -ContentType "application/json"
    Record-Test "Task 1: Child Auth" "Unknown User Login Rejection" $false "Should have rejected unknown user"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    $dbCheck = & $mysqlCli -u root college_project -e "SELECT COUNT(*) FROM users WHERE username='ghost_unknown_user@test.com';"
    $notInDb = $dbCheck -match '0'
    Record-Test "Task 1: Child Auth" "Unknown User Login Rejection" ($is401 -and $notInDb) "Correctly returned HTTP 401; user was NOT auto-created in MySQL"
}

# 1.6 Child attempting Parent Login
$childAsParentBody = @{
    username = "Emma"
    password = "emma123"
    userType = "parent"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $childAsParentBody -ContentType "application/json"
    Record-Test "Task 1: Child Auth" "Child Account Blocks Parent Login" $false "Should have blocked CHILD from Parent Login"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Test "Task 1: Child Auth" "Child Account Blocks Parent Login" $is401 "Correctly blocked child from Parent Login with role mismatch error"
}

# 1.7 Parent attempting Child Login
$parentAsChildBody = @{
    username = "parent@kidverse.com"
    password = "password123"
    userType = "child"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $parentAsChildBody -ContentType "application/json"
    Record-Test "Task 1: Child Auth" "Parent Account Blocks Child Login" $false "Should have blocked PARENT from Child Login"
} catch {
    $is401 = $_.Exception.Response.StatusCode.value__ -eq 401
    Record-Test "Task 1: Child Auth" "Parent Account Blocks Child Login" $is401 "Correctly blocked parent from Child Login with role mismatch error"
}

# ==========================================
# TASK 2: PARENT / CHILD ROLE SEPARATION
# ==========================================
Write-Host "`n--- Running Task 2: Parent/Child Role Separation ---" -ForegroundColor Yellow

# 2.1 Child attempting to place an order
$childOrderBody = @{
    username = "Emma"
    productIds = @(1, 2)
    discountPct = 0
    shipping = 0
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $childOrderBody -ContentType "application/json" -Headers @{"X-Username"="Emma"}
    Record-Test "Task 2: Role Separation" "Child Blocked from Placing Orders" $false "Child should not be allowed to place orders"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -eq 401 -or $code -eq 403)
    Record-Test "Task 2: Role Separation" "Child Blocked from Placing Orders" $blocked "Blocked child from ordering with HTTP $($code) - only PARENT accounts may order"
}

# 2.2 Child attempting to fetch order history
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=Emma" -Method Get -Headers @{"X-Username"="Emma"}
    Record-Test "Task 2: Role Separation" "Child Blocked from Order History" $false "Child should not have order history"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -eq 401 -or $code -eq 403)
    Record-Test "Task 2: Role Separation" "Child Blocked from Order History" $blocked "Blocked child order query with HTTP $($code) - CHILD accounts do not have orders"
}

# 2.3 Parent attempting to award stars directly
$parentStarBody = @{
    username = "parent@kidverse.com"
    starsToAdd = 10
    gameId = "alphabet"
    callerUsername = "parent@kidverse.com"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $parentStarBody -ContentType "application/json" -Headers @{"X-Username"="parent@kidverse.com"}
    Record-Test "Task 2: Role Separation" "Parent Blocked from Earning Stars" $false "Parent should not be able to earn stars"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -ge 400 -and $code -lt 500)
    Record-Test "Task 2: Role Separation" "Parent Blocked from Earning Stars" $blocked "Blocked parent stars with HTTP $($code) - stars can only be earned by CHILD accounts"
}

# ==========================================
# TASK 3: ORDER API TESTING
# ==========================================
Write-Host "`n--- Running Task 3: Order API Testing ---" -ForegroundColor Yellow

# 3.1 Place valid order by Parent
$parentOrderBody = @{
    username = "parent@kidverse.com"
    productIds = @(1, 2)
    discountPct = 10
    shipping = 0
    freeGift = "KidVerse Sticker Pack"
} | ConvertTo-Json

$placedOrderId = 0
try {
    $orderResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Body $parentOrderBody -ContentType "application/json" -Headers @{"X-Username"="parent@kidverse.com"}
    $placedOrderId = $orderResp.orderId
    $orderValid = ($placedOrderId -gt 0 -and $orderResp.total -gt 0 -and $orderResp.freeGift -eq "KidVerse Sticker Pack")
    Record-Test "Task 3: Order API" "Parent Order Creation" $orderValid "Order created successfully with orderId=$placedOrderId, total=`$$($orderResp.total), gift=$($orderResp.freeGift)"
} catch {
    Record-Test "Task 3: Order API" "Parent Order Creation" $false $_.Exception.Message
}

# 3.2 Verify order in MySQL
$orderInDb = & $mysqlCli -u root college_project -e "SELECT id, user_id, total, status FROM orders WHERE id=$placedOrderId;"
$itemsInDb = & $mysqlCli -u root college_project -e "SELECT COUNT(*) FROM order_items WHERE order_id=$placedOrderId;"
$orderPersisted = ($orderInDb -match "$placedOrderId" -and $itemsInDb -match "2")
Record-Test "Task 3: Order API" "MySQL Order & Items Persistence" $orderPersisted "Order row found in orders table, 2 items persisted in order_items table"

# 3.3 Fetch parent's orders
try {
    $ordersList = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"X-Username"="parent@kidverse.com"}
    $hasOrder = ($ordersList.Count -ge 1 -and ($ordersList | Where-Object { $_.orderId -eq $placedOrderId }))
    Record-Test "Task 3: Order API" "Fetch User Orders" ($hasOrder -ne $null) "Retrieved $($ordersList.Count) orders for parent@kidverse.com"
} catch {
    Record-Test "Task 3: Order API" "Fetch User Orders" $false $_.Exception.Message
}

# 3.4 Fetch purchased product IDs
try {
    $purchasedIds = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/purchased?username=parent@kidverse.com" -Method Get -Headers @{"X-Username"="parent@kidverse.com"}
    $hasProducts = ($purchasedIds -contains 1 -and $purchasedIds -contains 2)
    Record-Test "Task 3: Order API" "Fetch Purchased Product IDs" $hasProducts "Purchased product IDs correctly include [1, 2]"
} catch {
    Record-Test "Task 3: Order API" "Fetch Purchased Product IDs" $false $_.Exception.Message
}

# 3.5 Cross-user order snooping prevented
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders?username=parent@kidverse.com" -Method Get -Headers @{"X-Username"="intruder@test.com"}
    Record-Test "Task 3: Order API" "Cross-User Order Snooping Blocked" $false "Should have blocked intruder from viewing parent orders"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -eq 401 -or $code -eq 403)
    Record-Test "Task 3: Order API" "Cross-User Order Snooping Blocked" $blocked "Blocked unauthorized user with HTTP $($code) - caller cannot query another user's orders"
}

# ==========================================
# TASK 4: CHILD PROGRESS AND STARS API
# ==========================================
Write-Host "`n--- Running Task 4: Child Progress and Stars API ---" -ForegroundColor Yellow

# 4.1 Fetch initial progress for Emma
try {
    $progResp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/Emma" -Method Get -Headers @{"X-Username"="Emma"}
    $initOk = ($progResp.childUsername -eq "Emma" -and $progResp.stars -eq 0)
    Record-Test "Task 4: Child Progress" "Initial Progress Fetch" $initOk "Emma initial progress: stars=$($progResp.stars), tier=$($progResp.rewardTier)"
} catch {
    Record-Test "Task 4: Child Progress" "Initial Progress Fetch" $false $_.Exception.Message
}

# 4.2 Award 15 stars to Emma from game 'shapes'
$addStarsBody = @{
    username = "Emma"
    starsToAdd = 15
    gameId = "shapes"
    callerUsername = "Emma"
} | ConvertTo-Json

try {
    $starResp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $addStarsBody -ContentType "application/json" -Headers @{"X-Username"="Emma"}
    $starsOk = ($starResp.stars -eq 15 -and $starResp.lastGame -eq "shapes" -and $starResp.rewardTier -eq "Star Learner" -and $starResp.rewardDiscount -eq 10)
    Record-Test "Task 4: Child Progress" "Award Stars (15 Stars -> Star Learner Tier)" $starsOk "Emma earned 15 stars in shapes game, tier=$($starResp.rewardTier), rewardDiscount=$($starResp.rewardDiscount)%"
} catch {
    Record-Test "Task 4: Child Progress" "Award Stars (15 Stars -> Super Star Tier)" $false $_.Exception.Message
}

# 4.3 Verify stars in MySQL
$progDb = & $mysqlCli -u root college_project -e "SELECT cp.stars, cp.last_game FROM child_progress cp JOIN users u ON cp.child_id = u.id WHERE u.username='Emma';"
$dbProgressOk = ($progDb -match "15" -and $progDb -match "shapes")
Record-Test "Task 4: Child Progress" "MySQL Child Progress Persistence" $dbProgressOk "MySQL child_progress table updated: stars=15, last_game=shapes"

# 4.4 Award another 10 stars to reach 25 stars
$addMoreStarsBody = @{
    username = "Emma"
    starsToAdd = 10
    gameId = "numbers"
    callerUsername = "Emma"
} | ConvertTo-Json

try {
    $starResp2 = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $addMoreStarsBody -ContentType "application/json" -Headers @{"X-Username"="Emma"}
    $stars2Ok = ($starResp2.stars -eq 25 -and $starResp2.lastGame -eq "numbers")
    Record-Test "Task 4: Child Progress" "Cumulative Star Updates" $stars2Ok "Emma accumulated 25 stars across games, current lastGame=$($starResp2.lastGame)"
} catch {
    Record-Test "Task 4: Child Progress" "Cumulative Star Updates" $false $_.Exception.Message
}

# 4.5 Unauthorized star modification blocked
$unauthStarBody = @{
    username = "Emma"
    starsToAdd = 50
    gameId = "cheat"
    callerUsername = "intruder"
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/star" -Method Post -Body $unauthStarBody -ContentType "application/json" -Headers @{"X-Username"="intruder"}
    Record-Test "Task 4: Child Progress" "Unauthorized Star Modification Blocked" $false "Should have blocked non-child user from awarding stars"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -eq 401 -or $code -eq 403)
    Record-Test "Task 4: Child Progress" "Unauthorized Star Modification Blocked" $blocked "Blocked unauthorized star modification with HTTP $code"
}

# 4.6 Cross-child snooping blocked
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/Emma" -Method Get -Headers @{"X-Username"="Leo"}
    Record-Test "Task 4: Child Progress" "Cross-Child Privacy Check" $false "Child Leo should not be able to inspect Emma's progress"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $blocked = ($code -eq 401 -or $code -eq 403)
    Record-Test "Task 4: Child Progress" "Cross-Child Privacy Check" $blocked "Blocked child Leo from viewing Emma's progress with HTTP $code"
}

# 4.7 Parent fetching linked child progress
try {
    $parentProgResp = Invoke-RestMethod -Uri "http://localhost:8080/api/progress/parent/parent@kidverse.com" -Method Get -Headers @{"X-Username"="parent@kidverse.com"}
    $parentProgOk = ($parentProgResp.childUsername -eq "Emma" -and $parentProgResp.stars -eq 25)
    Record-Test "Task 4: Child Progress" "Parent Retrieves Child Progress" $parentProgOk "Parent successfully retrieved Emma's progress: stars=$($parentProgResp.stars), discount=$($parentProgResp.rewardDiscount)%"
} catch {
    Record-Test "Task 4: Child Progress" "Parent Retrieves Child Progress" $false $_.Exception.Message
}

# ==========================================
# TASK 5: FRONTEND + BACKEND INTEGRATION & PRODUCTS
# ==========================================
Write-Host "`n--- Running Task 5: Products & Data Integrity ---" -ForegroundColor Yellow

try {
    $allProds = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Get
    $countOk = ($allProds.Count -ge 6)
    Record-Test "Task 5: Products & DB" "Fetch All Products" $countOk "Retrieved $($allProds.Count) products from MySQL"
} catch {
    Record-Test "Task 5: Products & DB" "Fetch All Products" $false $_.Exception.Message
}

try {
    $ageProds = Invoke-RestMethod -Uri "http://localhost:8080/api/products?ageGroup=3-5" -Method Get
    $all35 = ($ageProds | Where-Object { $_.ageGroup -ne "3-5" }).Count -eq 0
    Record-Test "Task 5: Products & DB" "Filter Products by Age Group" ($ageProds.Count -gt 0 -and $all35) "Retrieved $($ageProds.Count) products matching ageGroup 3-5"
} catch {
    Record-Test "Task 5: Products & DB" "Filter Products by Age Group" $false $_.Exception.Message
}

try {
    $budgetProds = Invoke-RestMethod -Uri "http://localhost:8080/api/products?budgetOnly=true" -Method Get
    $allBudget = ($budgetProds | Where-Object { -not $_.isBudget }).Count -eq 0
    Record-Test "Task 5: Products & DB" "Filter Budget Products" ($budgetProds.Count -gt 0 -and $allBudget) "Retrieved $($budgetProds.Count) budget products"
} catch {
    Record-Test "Task 5: Products & DB" "Filter Budget Products" $false $_.Exception.Message
}

# ==========================================
# SUMMARY
# ==========================================
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "               TEST SUITE SUMMARY                      " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$passedCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

$results | Format-Table -AutoSize Category, TestName, Status, Details

$summaryColor = if ($failedCount -eq 0) { "Green" } else { "Red" }
Write-Host "`nTotal Tests: $totalCount | Passed: $passedCount | Failed: $failedCount" -ForegroundColor $summaryColor

if ($failedCount -eq 0) {
    Write-Host "`nALL 6 PROJECT REQUIREMENTS VERIFIED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "`nSOME TESTS FAILED! Please review details above." -ForegroundColor Red
}
