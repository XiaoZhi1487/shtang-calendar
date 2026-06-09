# ============================================================
# 沙塘圩日历 · 一键打包脚本 (PowerShell)
# 使用方法：在项目根目录 (archive2) 执行  .\一键打包.ps1
# 或右键 → 使用 PowerShell 运行
# ============================================================

$ErrorActionPreference = "Stop"

# ---------- 0. 环境与路径 ----------
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Java 路径 (Android Studio JBR)
$javaHome = "C:\Program Files\Android\Android Studio\jbr"

# 从 userStore.ts 提取 APP_VERSION
$userStorePath = Join-Path $projectRoot "src\store\userStore.ts"
$versionMatch = Select-String -Path $userStorePath -Pattern "APP_VERSION\s*=\s*['`"]([^'`"]+)['`"]" | Select-Object -First 1
if (-not $versionMatch) {
    Write-Host "[错误] 未能在 src\store\userStore.ts 中找到 APP_VERSION" -ForegroundColor Red
    pause
    exit 1
}
$appVersion = $versionMatch.Matches[0].Groups[1].Value

# 从 build.gradle 提取 versionCode / versionName
$gradlePath = Join-Path $projectRoot "android\app\build.gradle"
$vcMatch = Select-String -Path $gradlePath -Pattern "versionCode\s+(\d+)" | Select-Object -First 1
$vnMatch = Select-String -Path $gradlePath -Pattern 'versionName\s+["'']([^"'']+)["'']' | Select-Object -First 1
$versionCode = if ($vcMatch) { $vcMatch.Matches[0].Groups[1].Value } else { "未知" }
$versionName = if ($vnMatch) { $vnMatch.Matches[0].Groups[1].Value } else { "未知" }

# ---------- 1. 版本信息确认 ----------
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  沙塘圩日历 - 一键打包" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  应用内版本 (APP_VERSION):  $appVersion" -ForegroundColor Yellow
Write-Host "  Android versionCode:       $versionCode" -ForegroundColor Yellow
Write-Host "  Android versionName:       $versionName" -ForegroundColor Yellow
Write-Host ""

if ($appVersion -ne $versionName) {
    Write-Host "[警告] APP_VERSION 与 build.gradle 的 versionName 不一致！" -ForegroundColor Red
    Write-Host "       建议先同步后再继续打包。" -ForegroundColor Red
    $continue = Read-Host "是否仍然继续？(y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "已取消。" -ForegroundColor Yellow
        pause
        exit 0
    }
}

# ---------- 2. 构建前端 ----------
Write-Host ""
Write-Host "[1/4] 执行 npm run build ..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 前端构建失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[1/4] 前端构建成功 ✓" -ForegroundColor Green

# ---------- 3. 同步到 Android ----------
Write-Host ""
Write-Host "[2/4] 执行 npx cap sync ..." -ForegroundColor Cyan
npx cap sync
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Capacitor 同步失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[2/4] Capacitor 同步成功 ✓" -ForegroundColor Green

# ---------- 4. 配置 Java 并打包 ----------
Write-Host ""
Write-Host "[3/4] 配置 Java 环境并构建 APK ..." -ForegroundColor Cyan

if (-not (Test-Path $javaHome)) {
    Write-Host "[错误] 未找到 Java 路径: $javaHome" -ForegroundColor Red
    Write-Host "       请确认已安装 Android Studio 或修改脚本中的 javaHome 路径" -ForegroundColor Red
    pause
    exit 1
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;" + $env:PATH

Set-Location (Join-Path $projectRoot "android")
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] APK 构建失败" -ForegroundColor Red
    Set-Location $projectRoot
    pause
    exit 1
}
Set-Location $projectRoot
Write-Host "[3/4] APK 构建成功 ✓" -ForegroundColor Green

# ---------- 5. 复制重命名到根目录 ----------
Write-Host ""
Write-Host "[4/4] 复制并重命名 APK ..." -ForegroundColor Cyan

$apkSrc = Join-Path $projectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDst = Join-Path $projectRoot "沙塘圩日历_v$appVersion.apk"

if (-not (Test-Path $apkSrc)) {
    Write-Host "[错误] 未找到 APK 产物: $apkSrc" -ForegroundColor Red
    pause
    exit 1
}

# 若目标已存在，强制覆盖
if (Test-Path $apkDst) {
    Remove-Item $apkDst -Force
}
Copy-Item $apkSrc $apkDst

$sizeMB = [math]::Round((Get-Item $apkDst).Length / 1MB, 2)

# ---------- 完成 ----------
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  打包完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  APK:        $apkDst" -ForegroundColor White
Write-Host "  大小:       $sizeMB MB" -ForegroundColor White
Write-Host "  版本号:     v$appVersion (versionCode=$versionCode)" -ForegroundColor White
Write-Host ""
Write-Host "  按任意键关闭..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
