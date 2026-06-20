# Aphrodite Windows Studio

Aphrodite Studio is a future Windows operator app for Владислав.

## Overview
- It wraps and uses the existing Aphrodite web dashboard later.
- It is designed for channel monitoring, dry-run review, publishing calendar, package reports, GitHub/Vercel status, and Telegram safety status.
- No separate desktop app is created now.
- No Tauri or Electron dependencies are installed now.

## Safety and Architecture
- No live publish from desktop by default.
- No unsafe token storage on the local system.
- The web dashboard will continue to act as the primary, safe interface until the Windows Studio wrapper is eventually developed in the future.
