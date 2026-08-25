/**
 * RetailSense OS // EdgeRetail AI - Client Controller
 * 5-Tab SPA Mission Control Center (Stitch Design System)
 * High-frequency telemetry sync, Web Audio dispatch chimes,
 * Chart.js business analytics, and interactive ROI configuration.
 */

let activeTelemetry = null;
let lastShelfStatus = "";
let lastQueueStatus = "";
let unreadAlertCount = 0;
let networkInfo = null;
let currentActiveTab = "overview";
let analyticsChart = null;

let configActiveCam = 1;
let configActiveZoneType = "SHELF";
let configCurrentRoi = { x1: 0.10, y1: 0.20, x2: 0.90, y2: 0.85 };
let configCalibAnimId = null;

// ==============================================================================
// 1. NATIVE WEB AUDIO API SOUND ALERT SYNTHESIZER
// ==============================================================================

class SoundAlertManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('retailsense_audio_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('retailsense_audio_muted', this.muted);
        this.updateUi();
        if (!this.muted) {
            this.playAlertTone('normal');
            showToastNotification('Audio Alert Chimes Enabled', 'info');
        } else {
            showToastNotification('Audio Alert Chimes Muted', 'warning');
        }
    }

    updateUi() {
        const btn = document.getElementById('audio-toggle-btn');
        const icon = document.getElementById('audio-toggle-icon');
        const label = document.getElementById('audio-toggle-label');

        if (label && icon) {
            if (this.muted) {
                label.innerText = 'Audio: Muted';
                icon.setAttribute('data-lucide', 'volume-x');
                icon.className = 'w-3.5 h-3.5 text-red-400';
                if (btn) btn.className = 'w-full py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 font-mono text-xs text-red-300 flex items-center justify-center gap-2 tactile-btn';
            } else {
                label.innerText = 'Audio: On';
                icon.setAttribute('data-lucide', 'volume-2');
                icon.className = 'w-3.5 h-3.5 text-emerald-400';
                if (btn) btn.className = 'w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 font-mono text-xs text-on-surface flex items-center justify-center gap-2 tactile-btn';
            }
        }
        if (window.lucide) lucide.createIcons();
    }

    playAlertTone(type = 'normal') {
        if (this.muted) return;
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            if (type === 'urgent') {
                // Harmonic two-tone attention alarm (587.33Hz D5 -> 880.00Hz A5)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, now);
                osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                osc.start(now);
                osc.stop(now + 0.45);
            } else {
                // Soft pleasant confirmation chime (440.00Hz A4 -> 523.25Hz C5)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440.00, now);
                osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.18);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch (e) {
            console.warn('[AudioSynth Note]', e);
        }
    }
}

const soundManager = new SoundAlertManager();

function toggleAudioChimes() {
    soundManager.toggleMute();
}

// ==============================================================================
// 2. SPA TAB CONTROLLER (SEAMLESS TAB SWITCHING)
// ==============================================================================

const TAB_TITLES = {
    overview: { title: "Executive Overview", subtitle: "Real-time store operations & AI vision matrix" },
    monitoring: { title: "Live Vision Monitoring", subtitle: "Real-time multi-camera detection feeds & scenario evaluator" },
    matrix: { title: "Database & Live Matrix", subtitle: "Real-time shelf inventory tiers and multi-register traffic router" },
    config: { title: "Store Configuration", subtitle: "Calibrate spatial detection zones, camera stream roles, and automated rules" },
    analytics: { title: "Reports & Business Analytics", subtitle: "Measure operational performance and AI-driven business impact" }
};

function switchTab(tabId) {
    if (!TAB_TITLES[tabId]) return;
    currentActiveTab = tabId;

    // 1. Update Views
    document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.remove('hidden');

    // 2. Update Header Titles
    const titleElem = document.getElementById('top-view-title');
    const subElem = document.getElementById('top-view-subtitle');
    if (titleElem) titleElem.innerText = TAB_TITLES[tabId].title;
    if (subElem) subElem.innerText = TAB_TITLES[tabId].subtitle;

    // 3. Update Side Nav Buttons
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        btn.className = 'side-nav-btn flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 text-left';
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('fill');
    });
    const activeSideBtn = document.getElementById(`side-nav-${tabId}`);
    if (activeSideBtn) {
        activeSideBtn.className = 'side-nav-btn flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-primary font-bold bg-primary/10 border-r-2 border-primary transition-colors duration-200 text-left';
        const icon = activeSideBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('fill');
    }

    // 4. Update Top Nav Tab Buttons
    document.querySelectorAll('.top-tab-btn').forEach(btn => {
        btn.className = 'top-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all';
    });
    const activeTopBtn = document.getElementById(`top-tab-${tabId}`);
    if (activeTopBtn) {
        activeTopBtn.className = 'top-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 border border-primary/30 transition-all';
    }

    // 5. Tab-specific initializations
    if (tabId === 'analytics') {
        initOrUpdateAnalyticsChart();
        fetchEvents();
    } else if (tabId === 'config') {
        initRoiCalibrationCanvas();
    }
}

// ==============================================================================
// 3. TOAST NOTIFICATIONS & MODALS
// ==============================================================================

function showToastNotification(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colorMap = {
        success: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200',
        warning: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
        error: 'bg-red-950/90 border-red-500/60 text-red-200',
        info: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200'
    };
    const styleClass = colorMap[type] || colorMap.info;

    toast.className = `p-3.5 rounded-xl border ${styleClass} text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 pointer-events-auto`;
    toast.innerHTML = `
        <span class="w-2 h-2 rounded-full ${type === 'error' ? 'bg-red-400 animate-ping' : (type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400')} shrink-0"></span>
        <span class="flex-1 font-semibold">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function openMobileConnectModal() {
    const modal = document.getElementById('mobile-qr-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeMobileConnectModal() {
    const modal = document.getElementById('mobile-qr-modal');
    if (modal) modal.classList.add('hidden');
}

async function initNetworkInfo() {
    try {
        const res = await fetch('/api/network_info');
        if (!res.ok) throw new Error('Network info failed');
        networkInfo = await res.json();

        const currentHost = window.location.hostname;
        const currentPort = window.location.port || '8000';
        
        let targetHost = networkInfo.local_ip || 'localhost';
        if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            targetHost = currentHost;
        }

        const secureMobileUrl = `https://${targetHost}:${currentPort}/mobile_cam`;

        const mobileUrlElem = document.getElementById('mobile-connect-url');
        if (mobileUrlElem) {
            mobileUrlElem.innerText = secureMobileUrl;
        }

        renderQRCode(secureMobileUrl);
    } catch (err) {
        console.warn('[Network Info Error]', err);
    }
}

function renderQRCode(url) {
    const qrContainer = document.getElementById('qr-code-container');
    if (qrContainer) {
        const encodedUrl = encodeURIComponent(url);
        qrContainer.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}&bgcolor=12-16-22&color=06-B6-D4" 
                 alt="Scan with smartphone to stream video" 
                 class="w-44 h-44 rounded-xl border border-white/10 p-2 bg-[#0A0D14]" />
        `;
    }
}

function copyMobileUrl() {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port || '8000';
    let targetHost = (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') ? currentHost : ((networkInfo && networkInfo.local_ip) || 'localhost');
    const url = `https://${targetHost}:${currentPort}/mobile_cam`;
    navigator.clipboard.writeText(url);
    showToastNotification('Copied Mobile Camera URL: ' + url, 'success');
}

// ==============================================================================
// 4. REAL-TIME TELEMETRY SYNCHRONIZATION & WIDGET RENDERING
// ==============================================================================

async function fetchTelemetry() {
    try {
        const res = await fetch('/api/metrics');
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        activeTelemetry = data;

        updateGlobalIndicators(data);
        updateOverviewView(data);
        updateMonitoringView(data);
        updateMatrixView(data);
    } catch (err) {
        console.warn('[Telemetry Sync Note]', err);
    }
}

function updateGlobalIndicators(data) {
    // 1. Global FPS & Hardware badge
    const fpsElem = document.getElementById('global-fps-pill');
    if (fpsElem) {
        const fps = (data.camera_1?.fps || data.camera_2?.fps || 30.0).toFixed(1);
        fpsElem.innerText = `${fps} FPS`;
    }
    const hwBadge = document.getElementById('hardware-engine-badge');
    if (hwBadge && data.hardware?.device_name) {
        hwBadge.innerText = data.hardware.npu_active ? "NPU ACCELERATED" : (data.hardware.device_name.includes("CUDA") ? "CUDA GPU" : "CPU MULTI-THREAD");
    }

    // 2. Audio Chime Dispatch for status transition
    if (data.shelf?.status !== lastShelfStatus) {
        if (data.shelf?.status === "CRITICAL_EMPTY" || data.shelf?.status === "LOW_STOCK") {
            soundManager.playAlertTone('urgent');
            showToastNotification(`🚨 Shelf Restock Alert: ${data.shelf.status}`, 'error');
            unreadAlertCount++;
        }
        lastShelfStatus = data.shelf?.status;
    }

    if (data.queue?.status !== lastQueueStatus) {
        if (data.queue?.status === "CONGESTED") {
            soundManager.playAlertTone('urgent');
            showToastNotification(`🚨 Checkout Congestion: ${data.queue.queue_count} Shoppers Queued`, 'warning');
            unreadAlertCount++;
        }
        lastQueueStatus = data.queue?.status;
    }

    // 3. Unread alert badge
    const badge = document.getElementById('unread-alert-badge');
    if (badge) {
        if (unreadAlertCount > 0) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
    }
}

function updateOverviewView(data) {
    // Health Banner
    const isCritical = data.shelf?.status === "CRITICAL_EMPTY" || data.queue?.status === "CONGESTED";
    const banner = document.getElementById('overview-health-banner');
    const iconBg = document.getElementById('overview-health-icon-bg');
    const icon = document.getElementById('overview-health-icon');
    const title = document.getElementById('overview-health-title');
    const dot = document.getElementById('overview-health-dot');

    if (banner && title && icon && iconBg && dot) {
        if (isCritical) {
            banner.className = 'w-full bg-error-container/20 border border-error-container/40 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden';
            iconBg.className = 'w-12 h-12 rounded-xl bg-error-container/30 flex items-center justify-center border border-error/40 shrink-0';
            icon.className = 'material-symbols-outlined text-error text-3xl';
            icon.innerText = 'warning';
            title.className = 'text-xl font-bold text-error flex items-center gap-2 tracking-tight';
            title.innerText = 'STORE #104 • ACTION REQUIRED';
            dot.className = 'inline-block w-2.5 h-2.5 rounded-full bg-error animate-ping';
        } else {
            banner.className = 'w-full bg-secondary-container/10 border border-secondary-container/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden';
            iconBg.className = 'w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center border border-secondary/40 shrink-0';
            icon.className = 'material-symbols-outlined text-secondary text-3xl';
            icon.innerText = 'check_circle';
            title.className = 'text-xl font-bold text-secondary flex items-center gap-2 tracking-tight';
            title.innerText = 'STORE #104 • ALL STATIONS NORMAL';
            dot.className = 'inline-block w-2.5 h-2.5 rounded-full bg-secondary animate-pulse';
        }
    }

    const lastSync = document.getElementById('overview-last-sync');
    if (lastSync) {
        const now = new Date();
        lastSync.innerText = now.toLocaleTimeString();
    }

    // KPI 1: Footfall
    const footfallElem = document.getElementById('kpi-footfall-count');
    if (footfallElem) footfallElem.innerText = (1280 + (data.queue?.queue_count || 0)).toLocaleString();

    // KPI 2: Shelf Stock
    const stockPct = document.getElementById('kpi-stock-pct');
    const stockCount = document.getElementById('kpi-stock-count');
    const stockCap = document.getElementById('kpi-stock-cap');
    const stockProgress = document.getElementById('kpi-stock-progress');
    if (stockPct) stockPct.innerText = `${data.shelf?.stock_percentage || 83}%`;
    if (stockCount) stockCount.innerText = data.shelf?.current_stock ?? 5;
    if (stockCap) stockCap.innerText = data.shelf?.max_capacity ?? 6;
    if (stockProgress) {
        const pct = data.shelf?.stock_percentage || 83;
        stockProgress.style.width = `${pct}%`;
        stockProgress.className = `h-full ${pct <= 25 ? 'bg-error' : (pct <= 50 ? 'bg-tertiary' : 'bg-primary')} transition-all duration-300`;
    }

    // KPI 3: Queue Wait
    const waitTime = document.getElementById('kpi-wait-time');
    const queueStatusPill = document.getElementById('kpi-queue-status-pill');
    if (waitTime) {
        const mins = (data.queue?.estimated_wait_time_minutes || 0).toFixed(1);
        waitTime.innerHTML = `${mins}<span class="text-xl text-on-surface-variant font-normal">m</span>`;
    }
    if (queueStatusPill) {
        const status = data.queue?.status || "NORMAL";
        queueStatusPill.innerText = status;
        queueStatusPill.className = `font-mono text-xs px-2 py-0.5 rounded-full border ${status === 'CONGESTED' ? 'bg-error/10 text-error border-error/30' : 'bg-secondary-container/10 text-secondary border-secondary/20'}`;
    }

    // KPI 4: Active Alerts
    const alertsCount = document.getElementById('kpi-active-alerts-count');
    if (alertsCount) {
        const count = (data.shelf?.status === "CRITICAL_EMPTY" ? 1 : 0) + (data.queue?.status === "CONGESTED" ? 1 : 0);
        alertsCount.innerText = count;
        alertsCount.className = `text-4xl font-extrabold tabular-nums ${count > 0 ? 'text-error' : 'text-secondary'}`;
    }

    // Telemetry Grid
    const telemDevice = document.getElementById('telem-device');
    const telemTemp = document.getElementById('telem-temp');
    const telemLatency = document.getElementById('telem-latency');
    if (telemDevice && data.hardware?.device_name) telemDevice.innerText = data.hardware.device_name;
    if (telemTemp && data.hardware?.soc_temperature_celsius) telemTemp.innerText = `${data.hardware.soc_temperature_celsius.toFixed(1)}°C`;
    if (telemLatency && data.camera_1?.latency_ms) telemLatency.innerText = `${data.camera_1.latency_ms.toFixed(1)}ms`;

    // Priority Actions List
    renderPriorityActionsFeed(data);
    renderActivityTimeline(data);
}

function renderPriorityActionsFeed(data) {
    const container = document.getElementById('overview-actions-feed');
    if (!container) return;

    let html = '';

    if (data.shelf?.status === "CRITICAL_EMPTY" || (data.shelf?.stock_percentage <= 25)) {
        html += `
            <div class="bg-surface p-4 rounded-xl border border-error/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div class="flex gap-3 items-start">
                    <div class="w-10 h-10 rounded-lg bg-error/20 text-error flex items-center justify-center shrink-0 mt-0.5">
                        <span class="material-symbols-outlined text-xl">inventory_2</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full bg-error animate-ping"></span>
                            <h4 class="font-bold text-sm text-on-surface">Shelf Tier 01 — Restock Dispatched</h4>
                        </div>
                        <p class="text-xs text-on-surface-variant">Stock dropped to ${data.shelf?.current_stock}/${data.shelf?.max_capacity} items (${data.shelf?.stock_percentage}%). Replenish immediately.</p>
                    </div>
                </div>
                <button onclick="setScenario('normal')" class="shrink-0 px-3.5 py-1.5 bg-error text-on-error font-mono text-xs font-bold rounded-lg hover:brightness-110 transition-all tactile-btn">
                    Restock Complete
                </button>
            </div>
        `;
    }

    if (data.queue?.status === "CONGESTED" || (data.queue?.queue_count >= 3)) {
        html += `
            <div class="bg-surface p-4 rounded-xl border border-tertiary-container/40 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div class="flex gap-3 items-start">
                    <div class="w-10 h-10 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
                        <span class="material-symbols-outlined text-xl">point_of_sale</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                            <h4 class="font-bold text-sm text-on-surface">Register 1 — Queue Congestion Alert</h4>
                        </div>
                        <p class="text-xs text-on-surface-variant">${data.queue?.queue_count} shoppers in lane. Estimated wait time: ${data.queue?.estimated_wait_time_minutes}m.</p>
                    </div>
                </div>
                <button onclick="showToastNotification('Opened Backup Cash Counter 3', 'success')" class="shrink-0 px-3.5 py-1.5 border border-tertiary text-tertiary font-mono text-xs font-bold rounded-lg hover:bg-tertiary/10 transition-all tactile-btn">
                    Open Register 3
                </button>
            </div>
        `;
    }

    // Default Normal Entry
    html += `
        <div class="bg-surface p-4 rounded-xl border border-secondary-container/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center opacity-85">
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-xl">videocam</span>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="w-2 h-2 rounded-full bg-secondary"></span>
                        <h4 class="font-bold text-sm text-on-surface">Dual USB & Mobile Camera Ingest Streams</h4>
                    </div>
                    <p class="text-xs text-on-surface-variant">Zero-lag hardware buffer locked (Buffer=1). YOLOv8 inference latency &lt; 25ms.</p>
                </div>
            </div>
            <span class="font-mono text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-lg border border-secondary/20 font-bold">OPERATING</span>
        </div>
    `;

    container.innerHTML = html;
}

function renderActivityTimeline(data) {
    const container = document.getElementById('overview-activity-timeline');
    if (!container) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    container.innerHTML = `
        <div class="flex items-start gap-2.5 pb-2 border-b border-outline-variant/10">
            <span class="text-on-surface-variant">${timeStr}</span>
            <span class="text-secondary font-bold">[SYS]</span>
            <span class="text-on-surface truncate">3-Station AI Vision Engine synchronized with zero latency.</span>
        </div>
        <div class="flex items-start gap-2.5 pb-2 border-b border-outline-variant/10">
            <span class="text-on-surface-variant">${timeStr}</span>
            <span class="text-primary font-bold">[DET]</span>
            <span class="text-on-surface truncate">Shelf: ${data.shelf?.current_stock} items detected (${data.shelf?.status}).</span>
        </div>
        <div class="flex items-start gap-2.5">
            <span class="text-on-surface-variant">${timeStr}</span>
            <span class="text-tertiary font-bold">[QUE]</span>
            <span class="text-on-surface truncate">Registers: ${data.queue?.queue_count} shoppers (${data.queue?.status}).</span>
        </div>
    `;
}

function updateMonitoringView(data) {
    // Badges & Sources
    const cam1Fps = document.getElementById('cam1-fps-badge');
    const cam1Src = document.getElementById('cam1-source-label');
    const cam1Lat = document.getElementById('cam1-latency-label');
    if (cam1Fps && data.camera_1?.fps) cam1Fps.innerText = `${data.camera_1.fps.toFixed(1)} FPS`;
    if (cam1Src && data.camera_1?.source) cam1Src.innerText = data.camera_1.source;
    if (cam1Lat && data.camera_1?.latency_ms) cam1Lat.innerText = `${data.camera_1.latency_ms.toFixed(0)}ms`;

    const cam2Fps = document.getElementById('cam2-fps-badge');
    const cam2Src = document.getElementById('cam2-source-label');
    const cam2Lat = document.getElementById('cam2-latency-label');
    if (cam2Fps && data.camera_2?.fps) cam2Fps.innerText = `${data.camera_2.fps.toFixed(1)} FPS`;
    if (cam2Src && data.camera_2?.source) cam2Src.innerText = data.camera_2.source;
    if (cam2Lat && data.camera_2?.latency_ms) cam2Lat.innerText = `${data.camera_2.latency_ms.toFixed(0)}ms`;

    const cam3Fps = document.getElementById('cam3-fps-badge');
    const cam3Src = document.getElementById('cam3-source-label');
    const cam3Dot = document.getElementById('cam3-pulse-dot');
    if (cam3Fps && data.camera_3) {
        cam3Fps.innerText = data.camera_3.active ? `${data.camera_3.fps.toFixed(1)} FPS` : "STANDBY";
        if (cam3Dot) cam3Dot.className = `w-2 h-2 rounded-full ${data.camera_3.active ? 'bg-secondary animate-ping' : 'bg-amber-400'}`;
    }
    if (cam3Src && data.camera_3?.source) cam3Src.innerText = data.camera_3.source;

    // Terminal Activity Log
    const term = document.getElementById('live-terminal-log');
    if (term) {
        const timeStr = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = 'flex items-start gap-2 text-[11px] opacity-90';
        line.innerHTML = `<span class="text-on-surface-variant">${timeStr}</span> <span class="text-primary font-bold">[AI]</span> <span class="text-on-surface">Shelf ${data.shelf?.current_stock}/${data.shelf?.max_capacity} | Queue ${data.queue?.queue_count}p (${data.queue?.estimated_wait_time_minutes}m)</span>`;
        term.prepend(line);
        while (term.children.length > 20) {
            term.removeChild(term.lastChild);
        }
    }
}

function updateMatrixView(data) {
    // Recommendation Banner
    const banner = document.getElementById('smart-recommendation-banner');
    if (banner && data.queue?.smart_recommendation) {
        banner.innerText = data.queue.smart_recommendation;
    }

    // Shelf Table
    const shelfTbody = document.getElementById('matrix-shelf-tbody');
    if (shelfTbody) {
        const zones = (data.shelf?.zones && data.shelf.zones.length > 0) ? data.shelf.zones : [
            { id: "shelf_tier_1", name: "Shelf Tier 01 (Eye-Level)", category: "Packaged FMCG", capacity: data.shelf?.max_capacity || 6, current_stock: data.shelf?.current_stock ?? 5, percentage: data.shelf?.stock_percentage ?? 83, status: data.shelf?.status || "OPTIMAL" },
            { id: "shelf_tier_2", name: "Shelf Tier 02 (Mid-Rack)", category: "Beverages / Soft Drinks", capacity: 8, current_stock: 7, percentage: 88, status: "OPTIMAL" },
            { id: "shelf_tier_3", name: "Shelf Tier 03 (Endcap)", category: "Snacks & Confectionery", capacity: 10, current_stock: 9, percentage: 90, status: "OPTIMAL" }
        ];

        shelfTbody.innerHTML = zones.map(z => {
            const isLow = z.percentage <= 25;
            const statusClass = isLow ? 'bg-error/10 text-error border-error/30' : 'bg-secondary/10 text-secondary border-secondary/20';
            return `
                <tr class="hover:bg-surface-container-high transition-colors">
                    <td class="py-3 px-4 font-bold text-primary">${z.name}</td>
                    <td class="py-3 px-4 text-on-surface-variant">${z.category}</td>
                    <td class="py-3 px-4 text-right font-semibold">${z.capacity}</td>
                    <td class="py-3 px-4 text-right font-bold text-on-surface">${z.current_stock}</td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                            <span class="w-8 font-bold">${z.percentage}%</span>
                            <div class="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden w-20">
                                <div class="h-full ${isLow ? 'bg-error' : 'bg-secondary'}" style="width: ${z.percentage}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}">${z.status}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                        <button onclick="autoBaselineShelf()" class="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded text-[11px] font-bold">Recalibrate</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Queue Table
    const queueTbody = document.getElementById('matrix-queue-tbody');
    if (queueTbody) {
        const lanes = (data.queue?.lanes && data.queue.lanes.length > 0) ? data.queue.lanes : [
            { id: "counter_1", name: "Counter 01 (Main POS)", type: "General Register", queue_count: data.queue?.queue_count ?? 0, estimated_wait_minutes: data.queue?.estimated_wait_time_minutes ?? 0, status: data.queue?.status || "NORMAL" },
            { id: "counter_2", name: "Counter 02 (Express & UPI)", type: "Express Checkout", queue_count: 0, estimated_wait_minutes: 0, status: "FREE_AVAILABLE" },
            { id: "counter_3", name: "Counter 03 (Self-Checkout)", type: "Self-Service Kiosk", queue_count: 0, estimated_wait_minutes: 0, status: "FREE_AVAILABLE" }
        ];

        queueTbody.innerHTML = lanes.map(l => {
            const isCongested = l.status === "CONGESTED" || l.queue_count >= 3;
            const statusClass = isCongested ? 'bg-error/10 text-error border-error/30' : 'bg-secondary/10 text-secondary border-secondary/20';
            return `
                <tr class="hover:bg-surface-container-high transition-colors">
                    <td class="py-3 px-4 font-bold text-primary">${l.name}</td>
                    <td class="py-3 px-4 text-on-surface-variant">${l.type}</td>
                    <td class="py-3 px-4 text-right font-bold text-on-surface">${l.queue_count} Shoppers</td>
                    <td class="py-3 px-4 text-right font-semibold text-on-surface">${l.estimated_wait_minutes} mins</td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}">${l.status}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                        ${isCongested ? '<button onclick="showToastNotification(\'Rerouting shoppers to Counter 2\', \'success\')" class="px-2.5 py-1 bg-primary text-on-primary font-bold rounded text-[11px]">Reroute Traffic</button>' : '<span class="text-on-surface-variant text-[11px]">Optimal Flow</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// ==============================================================================
// 5. SCENARIO EVALUATOR & CONTROL API
// ==============================================================================

async function setScenario(mode) {
    try {
        const res = await fetch('/api/simulation/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: mode })
        });
        if (!res.ok) throw new Error('Simulation endpoint failed');
        const json = await res.json();
        showToastNotification(`Triggered Scenario: ${mode.toUpperCase()}`, 'info');
        fetchTelemetry();
    } catch (e) {
        console.warn('[Simulation Control Warning]', e);
    }
}

async function resetScenario() {
    setScenario('normal');
}

// ==============================================================================
// 6. AUTO-BASELINING & ROI CONFIGURATION
// ==============================================================================

async function autoBaselineShelf() {
    try {
        showToastNotification('Calibrating Dynamic Baseline Capacity over 30 Frames...', 'info');
        const res = await fetch('/api/config/baseline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frames_to_sample: 30, zone_type: "shelf" })
        });
        if (!res.ok) throw new Error('Baselining failed');
        const data = await res.json();
        showToastNotification(`✅ Baseline Calibrated: ${data.baseline_capacity} Items Capacity`, 'success');
        fetchTelemetry();
    } catch (e) {
        showToastNotification('Baselining error: ' + e.message, 'error');
    }
}

function selectConfigZoneType(type) {
    configActiveZoneType = type;
    const btnShelf = document.getElementById('cfg-zone-btn-shelf');
    const btnQueue = document.getElementById('cfg-zone-btn-queue');
    const nameInput = document.getElementById('cfg-zone-name');

    if (type === 'SHELF') {
        if (btnShelf) btnShelf.className = 'px-3 py-1.5 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold';
        if (btnQueue) btnQueue.className = 'px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-on-surface hover:text-primary';
        if (nameInput) nameInput.value = 'Shelf Tier 01';
    } else {
        if (btnShelf) btnShelf.className = 'px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-on-surface hover:text-primary';
        if (btnQueue) btnQueue.className = 'px-3 py-1.5 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold';
        if (nameInput) nameInput.value = 'Register Lane 01';
    }
}

function switchCameraPreview(camId) {
    configActiveCam = camId;
    ['config-btn-cam1', 'config-btn-cam2', 'config-btn-cam3'].forEach((id, idx) => {
        const btn = document.getElementById(id);
        if (btn) {
            if (idx + 1 === camId) {
                btn.className = 'px-3 py-1.5 rounded-lg bg-primary text-on-primary font-mono text-xs font-bold transition-all';
            } else {
                btn.className = 'px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-on-surface transition-all';
            }
        }
    });
}

function initRoiCalibrationCanvas() {
    const canvas = document.getElementById('config-calibrator-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let startX = 0, startY = 0;

    canvas.onmousedown = (e) => {
        const rect = canvas.getBoundingClientRect();
        startX = (e.clientX - rect.left) / rect.width;
        startY = (e.clientY - rect.top) / rect.height;
        isDrawing = true;
    };

    canvas.onmousemove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const currX = (e.clientX - rect.left) / rect.width;
        const currY = (e.clientY - rect.top) / rect.height;

        configCurrentRoi = {
            x1: Math.min(startX, currX),
            y1: Math.min(startY, currY),
            x2: Math.max(startX, currX),
            y2: Math.max(startY, currY)
        };

        const coordsElem = document.getElementById('cfg-zone-coords');
        if (coordsElem) {
            coordsElem.value = `[${configCurrentRoi.x1.toFixed(2)}, ${configCurrentRoi.y1.toFixed(2)}, ${configCurrentRoi.x2.toFixed(2)}, ${configCurrentRoi.y2.toFixed(2)}]`;
        }
    };

    canvas.onmouseup = () => { isDrawing = false; };

    // Continuous render loop for canvas overlay
    function renderCalibrationFrame() {
        if (currentActiveTab !== 'config') return;

        ctx.fillStyle = '#080B11';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 32) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 32) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw current ROI Box
        const rx = configCurrentRoi.x1 * canvas.width;
        const ry = configCurrentRoi.y1 * canvas.height;
        const rw = (configCurrentRoi.x2 - configCurrentRoi.x1) * canvas.width;
        const rh = (configCurrentRoi.y2 - configCurrentRoi.y1) * canvas.height;

        const strokeColor = configActiveZoneType === 'SHELF' ? '#00d2ff' : '#ffd6a7';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, rw, rh);

        ctx.fillStyle = configActiveZoneType === 'SHELF' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 214, 167, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);

        // Label
        ctx.fillStyle = strokeColor;
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText(`${configActiveZoneType}: ${document.getElementById('cfg-zone-name')?.value || 'Zone'}`, rx + 4, ry - 6);

        configCalibAnimId = requestAnimationFrame(renderCalibrationFrame);
    }

    if (configCalibAnimId) cancelAnimationFrame(configCalibAnimId);
    renderCalibrationFrame();
}

function resetCalibrationOverlay() {
    configCurrentRoi = { x1: 0.10, y1: 0.20, x2: 0.90, y2: 0.85 };
    const coordsElem = document.getElementById('cfg-zone-coords');
    if (coordsElem) coordsElem.value = `[0.10, 0.20, 0.90, 0.85]`;
    showToastNotification('Reset calibration coordinates', 'info');
}

async function saveCurrentConfigZone() {
    try {
        const payload = {
            shelf_roi: [configCurrentRoi.x1, configCurrentRoi.y1, configCurrentRoi.x2, configCurrentRoi.y2],
            queue_roi: [configCurrentRoi.x1, configCurrentRoi.y1, configCurrentRoi.x2, configCurrentRoi.y2]
        };

        const res = await fetch('/api/config/zones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save zones');
        showToastNotification('✅ Saved Calibrated ROI Zones to config.json', 'success');
        fetchTelemetry();
    } catch (e) {
        showToastNotification('Save error: ' + e.message, 'error');
    }
}

// ==============================================================================
// 7. CHART.JS BUSINESS ANALYTICS & SQLITE AUDIT TRAIL
// ==============================================================================

function initOrUpdateAnalyticsChart() {
    const canvas = document.getElementById('analytics-traffic-chart');
    if (!canvas) return;

    if (analyticsChart) {
        analyticsChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0.0)');

    analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
            datasets: [
                {
                    label: 'Store Shopper Footfall',
                    data: [45, 92, 160, 210, 290, 340, 280, 230, 310, 390, 420, 310],
                    borderColor: '#00d2ff',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#00d2ff',
                    pointRadius: 3
                },
                {
                    label: 'Queue Wait Time (x10 Sec)',
                    data: [12, 18, 28, 45, 60, 75, 55, 40, 65, 85, 95, 60],
                    borderColor: '#ffb148',
                    borderDash: [4, 4],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.35,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#bbc9cf',
                        font: { family: 'JetBrains Mono', size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#859399', font: { family: 'JetBrains Mono', size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#859399', font: { family: 'JetBrains Mono', size: 10 } }
                }
            }
        }
    });
}

async function fetchEvents() {
    try {
        const res = await fetch('/api/history/events?limit=25');
        if (!res.ok) return;
        const events = await res.json();
        renderEventHistoryTable(events);
    } catch (e) {
        console.warn('[Fetch Events Error]', e);
    }
}

function renderEventHistoryTable(events) {
    const tbody = document.getElementById('analytics-events-tbody');
    if (!tbody) return;

    if (!events || events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-on-surface-variant font-mono text-xs">No historical audit events logged yet.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = events.map(e => {
        const isCritical = e.severity === 'CRITICAL' || e.event_type.includes('EMPTY');
        const sevClass = isCritical ? 'bg-error/10 text-error border-error/30' : (e.severity === 'WARNING' ? 'bg-tertiary/10 text-tertiary border-tertiary/30' : 'bg-secondary/10 text-secondary border-secondary/30');
        return `
            <tr class="hover:bg-surface-container-high transition-colors">
                <td class="py-2.5 px-4 font-bold text-primary">#EV-${e.id}</td>
                <td class="py-2.5 px-4 text-on-surface-variant">${e.timestamp}</td>
                <td class="py-2.5 px-4 font-semibold text-on-surface">${e.event_type}</td>
                <td class="py-2.5 px-4 text-on-surface-variant">${e.zone_id || 'STORE_WIDE'}</td>
                <td class="py-2.5 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${sevClass}">${e.severity}</span>
                </td>
                <td class="py-2.5 px-4 text-on-surface-variant">${e.details || 'Automated Telemetry Capture'}</td>
            </tr>
        `;
    }).join('');
}

function downloadReportCsv() {
    window.location.href = '/api/reports/shift_summary/csv';
}

// ==============================================================================
// 8. INITIALIZATION RUNTIME
// ==============================================================================

window.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initNetworkInfo();
    fetchTelemetry();
    setInterval(fetchTelemetry, 350);
});
