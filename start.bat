@echo off
chcp 65001 >nul
title GenPhoto Launcher

echo ========================================
echo         GenPhoto 启动脚本
echo ========================================
echo.

:: 构建后端
echo [1/3] 构建后端...
cd /d %~dp0
call mvnw.cmd package -DskipTests -q
if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

:: 启动后端 (Spring Boot)
echo [2/3] 启动后端服务 (Spring Boot)...
start "GenPhoto-Backend" cmd /k "cd /d %~dp0 && java -jar genphoto-web/target/genphoto-web-1.0.0-SNAPSHOT.jar"

:: 等待5秒让后端启动
timeout /t 5 /nobreak >nul

:: 启动前端 (Vite)
echo [3/3] 启动前端服务 (Vite)...
start "GenPhoto-Frontend" cmd /k "cd /d %~dp0genphoto-frontend && npm run dev"

echo.
echo ========================================
echo  后端和前端已在新窗口中启动
echo  后端: http://localhost:8080
echo  前端: http://localhost:5173
echo ========================================
echo.
echo 关闭对应窗口即可停止服务
pause
