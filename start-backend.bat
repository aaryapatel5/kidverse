@echo off
title KidVerse - Spring Boot Backend
echo ========================================================
echo Starting KidVerse Java Spring Boot Backend (Port 8080)
echo ========================================================

:: Detect Java: use system java or JAVA_HOME if set, otherwise check common install locations
where java >nul 2>nul
if %errorlevel% neq 0 (
    if defined JAVA_HOME (
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    ) else if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    ) else if exist "C:\Program Files\JetBrains\PyCharm Community Edition 2025.1.2\jbr\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\JetBrains\PyCharm Community Edition 2025.1.2\jbr"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    )
)

cd /d "%~dp0backend"
if exist "target\kidverse-backend-0.0.1-SNAPSHOT.jar" (
    echo Launching packaged Spring Boot JAR...
    java -jar target\kidverse-backend-0.0.1-SNAPSHOT.jar
) else (
    echo Running via Maven...
    if exist "..\tools\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        call "..\tools\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
    ) else (
        call mvn spring-boot:run
    )
)
pause
