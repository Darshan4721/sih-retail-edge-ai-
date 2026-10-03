# Smart Retail Edge AI: Person Detection, Dwell Analytics & Live Matrix

## 1. Executive Summary & Problem Statement
Built for the **Smart India Hackathon (SIH)**, this project delivers an on-premise, real-time computer vision edge intelligence solution for retail store management. It converts commodity surveillance streams (dual USB webcams + roaming mobile LAN camera) into actionable retail telemetry:
- Real-time customer footfall & store occupancy estimation.
- Heatmap zone generation & customer dwell-time analytics.
- Checkout queue length detection & cashier bottleneck alerts.
- Executive 5-tab web dashboard for store operations and management.

---

## 2. System Architecture & Tech Stack

```text
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ USB Camera 1 (Entrance)│      │ USB Camera 2 (Aisles)  │      │ Mobile Roaming (RTSP)  │
└───────────┬────────────┘      └───────────┬────────────┘      └───────────┬────────────┘
            │                               │                               │
            └───────────────────────┬───────┴───────────────────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │     OpenCV Video Capture    │
                     │  + Frame Resizing & Buffer  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ YOLOv8n Object Detection    │
                     │  (Ultralytics Nano Model)   │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │  Flask Streaming Web Server │
                     │   + SQLite Event Analytics  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │  Executive 5-Tab Dashboard  │
                     │ (Overview, Matrix, Reports) │
                     └─────────────────────────────┘
```

- **Backend / Core Engine**: Python 3.10+, Flask, OpenCV (`opencv-python`), Ultralytics YOLOv8 (`yolov8n.pt`).
- **Telemetry Database**: SQLite (`retail_events.db`).
- **Frontend**: Responsive dashboard with real-time MJPEG live feeds, interactive metric cards, and CSS grid layout.
- **Design System**: 5-Tab executive design suite located in `front-end-design/stitch_ai_person_detection_system/` (Executive Overview, Live Matrix, Live Monitoring, Analytics Reports, Store Config).

---

## 3. Quick Start & Dependency Reinstallation Guide

If `.venv/` has been wiped to reclaim disk space, follow these exact 1-command setup instructions to restore the working application:

### Step 1: Create and Activate Virtual Environment
```powershell
# In PowerShell inside D:\tmp\sih
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Step 2: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

*(Requirements include `ultralytics`, `opencv-python-headless`, `Flask`, `numpy`, `pillow`)*.

### Step 3: Run the Application
- **Standard HTTP mode**:
  ```powershell
  python app.py
  # Or run: .\run.ps1
  ```
- **Secure HTTPS mode (Mobile LAN camera pairing)**:
  ```powershell
  .\run_https.ps1
  ```
- Open your browser at `http://localhost:5000` (or `https://localhost:5000`).

---

## 4. Verification & Testing Utilities
- `verify_dual_cam.py`: Probes hardware indexes to verify USB webcam availability without launching the full web server.
- `verify_server.py`: Automated self-test verifying HTTP route availability and telemetry endpoints.
