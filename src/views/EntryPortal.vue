<template>
  <div class="entry-portal" ref="portalRef">
    <!-- Animated Background -->
    <div class="portal-bg">
      <div class="grid-lines"></div>
      <div class="particles-layer" ref="particlesLayerRef">
        <div
          v-for="p in particles"
          :key="p.id"
          class="particle"
          :style="p.style"
        ></div>
      </div>
      <div class="glow-orb glow-orb-1"></div>
      <div class="glow-orb glow-orb-2"></div>
      <div class="glow-orb glow-orb-3"></div>
    </div>

    <!-- Scanning Header -->
    <div class="portal-header">
      <div class="scan-title-wrap">
        <h1 class="scan-title" :class="{ 'glitch': isGlitching }" data-text="ATOMFLOW INTERFACE v1.0">
          CodingSphere v1.0
        </h1>
        <div class="scan-line"></div>
      </div>
      <div class="header-sub">
        <span class="status-badge">
          <span class="status-dot"></span>
          SYSTEM ONLINE
        </span>
        <span class="separator">·</span>
        <span class="version-tag">NESA AI EVALUATION PLATFORM</span>
      </div>
    </div>

    <!-- Dual Cards -->
    <div class="cards-container">
      <!-- Card: Single Sample -->
      <div
        class="portal-card card-single"
        :class="{ 'is-hovered': hoveredCard === 'single', 'is-launching': launchingCard === 'single' }"
        ref="cardSingleRef"
        @mouseenter="onCardEnter('single')"
        @mouseleave="onCardLeave"
        @mousemove="onCardMouseMove($event, 'single')"
        @click="launchMode('single_sample')"
      >
        <div class="card-inner">
          <!-- Icon: ripple rings -->
          <div class="card-icon single-icon">
            <div class="ripple-ring ring-1"></div>
            <div class="ripple-ring ring-2"></div>
            <div class="ripple-ring ring-3"></div>
            <div class="ripple-core">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <div class="card-content">
            <div class="card-label">MODE 01</div>
            <h2 class="card-title">单样本测试</h2>
            <p class="card-desc">精准注入单一测试用例，深度验证模型安全边界，即时获得评估反馈</p>
            <div class="card-tags">
              <span class="tag">精准打击</span>
              <span class="tag">即时反馈</span>
              <span class="tag">深度调试</span>
            </div>
          </div>

          <!-- Typewriter Log -->
          <div class="card-log">
            <span class="log-prefix">&gt;</span>
            <span class="log-text">{{ singleLog }}</span>
            <span class="log-cursor">_</span>
          </div>

          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Card glow edge -->
        <div class="card-glow-edge"></div>
      </div>

      <!-- Card: Dataset Batch -->
      <div
        class="portal-card card-dataset"
        :class="{ 'is-hovered': hoveredCard === 'dataset', 'is-launching': launchingCard === 'dataset' }"
        ref="cardDatasetRef"
        @mouseenter="onCardEnter('dataset')"
        @mouseleave="onCardLeave"
        @mousemove="onCardMouseMove($event, 'dataset')"
        @click="launchMode('dataset')"
      >
        <div class="card-inner">
          <!-- Icon: matrix blocks -->
          <div class="card-icon dataset-icon">
            <div class="matrix-grid">
              <div
                v-for="i in 16"
                :key="i"
                class="matrix-block"
                :style="{ animationDelay: `${(i * 0.12) % 1.8}s` }"
              ></div>
            </div>
          </div>

          <div class="card-content">
            <div class="card-label">MODE 02</div>
            <h2 class="card-title">数据集批量评测</h2>
            <p class="card-desc">高通量并发评估完整数据集，全面量化模型在各类攻击场景下的安全表现</p>
            <div class="card-tags">
              <span class="tag">高通量</span>
              <span class="tag">并发执行</span>
              <span class="tag">全量覆盖</span>
            </div>
          </div>

          <!-- Typewriter Log -->
          <div class="card-log">
            <span class="log-prefix">&gt;</span>
            <span class="log-text">{{ datasetLog }}</span>
            <span class="log-cursor">_</span>
          </div>

          <div class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Card glow edge -->
        <div class="card-glow-edge"></div>
      </div>
    </div>

    <!-- Bottom hint -->
    <div class="portal-footer">
      <span class="footer-text">选择评测模式开始工作</span>
      <span class="footer-hint">首次访问后直接进入工作台</span>
    </div>

    <!-- Jump overlay (full-screen cover during transition) -->
    <Transition name="jump">
      <div v-if="showJumpOverlay" class="jump-overlay" :class="`jump-${launchingCard}`"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const portalRef = ref<HTMLElement>()
const cardSingleRef = ref<HTMLElement>()
const cardDatasetRef = ref<HTMLElement>()
const particlesLayerRef = ref<HTMLElement>()

const hoveredCard = ref<'single' | 'dataset' | null>(null)
const launchingCard = ref<'single' | 'dataset' | null>(null)
const showJumpOverlay = ref(false)
const isGlitching = ref(false)

// --- Particles ---
const PARTICLE_COUNT = 40
const particles = ref(
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      opacity: `${0.1 + Math.random() * 0.4}`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${4 + Math.random() * 6}s`,
      '--tx': `${(Math.random() - 0.5) * 120}px`,
      '--ty': `${(Math.random() - 0.5) * 120}px`,
    } as Record<string, string>
  }))
)

// --- Typewriter Logs ---
const singleLogs = [
  'STATUS: ENVIRONMENT SCANNING...',
  'TARGET ACQUIRED: SINGLE SAMPLE',
  'LOADING ATTACK VECTORS...',
  'INJECTION POINT DETECTED',
  'PAYLOAD READY: STATIC_FILE',
  'READY FOR PRECISION STRIKE',
]
const datasetLogs = [
  'INITIALIZING BATCH PIPELINE...',
  'DATASET LOADED: IPI_WEB_DATASET',
  'CONCURRENCY THREADS: 4',
  'SCANNING EVALUATION METRICS...',
  'QUEUE SIZE: 256 SAMPLES',
  'HIGH-THROUGHPUT MODE ACTIVE',
]

const singleLog = ref('')
const datasetLog = ref('')

let singleLogIdx = 0
let datasetLogIdx = 0
let singleTypeTimer: ReturnType<typeof setTimeout>
let datasetTypeTimer: ReturnType<typeof setTimeout>
let singleLogTimer: ReturnType<typeof setInterval>
let datasetLogTimer: ReturnType<typeof setInterval>

function typeLog(text: string, target: typeof singleLog) {
  let i = 0
  target.value = ''
  const step = () => {
    if (i < text.length) {
      target.value += text[i]
      i++
      return setTimeout(step, 40 + Math.random() * 30)
    }
  }
  return step()
}

function startSingleLogs() {
  typeLog(singleLogs[singleLogIdx], singleLog)
  singleLogTimer = setInterval(() => {
    singleLogIdx = (singleLogIdx + 1) % singleLogs.length
    clearTimeout(singleTypeTimer)
    singleTypeTimer = typeLog(singleLogs[singleLogIdx], singleLog) as ReturnType<typeof setTimeout>
  }, 3200)
}

function startDatasetLogs() {
  datasetLogIdx = 2
  typeLog(datasetLogs[datasetLogIdx], datasetLog)
  datasetLogTimer = setInterval(() => {
    datasetLogIdx = (datasetLogIdx + 1) % datasetLogs.length
    clearTimeout(datasetTypeTimer)
    datasetTypeTimer = typeLog(datasetLogs[datasetLogIdx], datasetLog) as ReturnType<typeof setTimeout>
  }, 3200)
}

// --- Glitch on title ---
let glitchTimer: ReturnType<typeof setInterval>
function startGlitch() {
  glitchTimer = setInterval(() => {
    isGlitching.value = true
    setTimeout(() => {
      isGlitching.value = false
    }, 500)
  }, 3000)
}

// --- 3D Tilt ---
function onCardMouseMove(e: MouseEvent, card: 'single' | 'dataset') {
  const el = card === 'single' ? cardSingleRef.value : cardDatasetRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = (e.clientX - cx) / (rect.width / 2)
  const dy = (e.clientY - cy) / (rect.height / 2)
  const rotX = -dy * 10
  const rotY = dx * 10
  el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`
}

function onCardEnter(card: 'single' | 'dataset') {
  hoveredCard.value = card
}

function onCardLeave() {
  hoveredCard.value = null
  const reset = (el: HTMLElement | undefined) => {
    if (el) el.style.transform = ''
  }
  reset(cardSingleRef.value)
  reset(cardDatasetRef.value)
}

// --- Launch / Space Jump ---
async function launchMode(mode: 'single_sample' | 'dataset') {
  if (launchingCard.value) return
  launchingCard.value = mode === 'single_sample' ? 'single' : 'dataset'

  // Expand the card, then show overlay
  await new Promise(r => setTimeout(r, 350))
  showJumpOverlay.value = true

  // Write localStorage so next visit skips entry
  localStorage.setItem('entry_seen', 'true')

  // Navigate after overlay starts covering
  await new Promise(r => setTimeout(r, 400))
  router.push({ path: '/tasks/new', query: { mode } })
}

// Lifecycle
onMounted(() => {
  startSingleLogs()
  startDatasetLogs()
  startGlitch()
})

onUnmounted(() => {
  clearInterval(singleLogTimer)
  clearInterval(datasetLogTimer)
  clearInterval(glitchTimer)
  clearTimeout(singleTypeTimer)
  clearTimeout(datasetTypeTimer)
})
</script>

<style scoped>
/* =============================================
   PORTAL ROOT
   ============================================= */
.entry-portal {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-dark-primary);
  overflow: hidden;
  font-family: 'Courier New', 'SF Mono', monospace;
  gap: 0;
}

/* =============================================
   ANIMATED BACKGROUND
   ============================================= */
.portal-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px);
  background-size: 60px 60px;
}

.particles-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--color-accent-purple-light);
  animation: particle-float var(--duration, 6s) ease-in-out infinite alternate;
}

@keyframes particle-float {
  from { transform: translate(0, 0) scale(1); opacity: inherit; }
  to { transform: translate(var(--tx, 60px), var(--ty, -60px)) scale(1.5); opacity: 0.05; }
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.glow-orb-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%);
}

.glow-orb-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: -80px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
}

.glow-orb-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
}

/* =============================================
   SCANNING HEADER
   ============================================= */
.portal-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 48px;
}

.scan-title-wrap {
  position: relative;
  display: inline-block;
}

.scan-title {
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
  background: linear-gradient(90deg, #818CF8, #A78BFA, #F472B6, #818CF8);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-shimmer 6s linear infinite;
}

@keyframes title-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* Glitch effect */
.scan-title.glitch {
  animation: title-shimmer 6s linear infinite, glitch-skew 0.5s steps(2) forwards;
}

.scan-title.glitch::before,
.scan-title.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: inherit;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.scan-title.glitch::before {
  left: 2px;
  text-shadow: -1px 0 #06B6D4;
  clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%);
  animation: glitch-anim-1 0.5s steps(2) forwards;
}

.scan-title.glitch::after {
  left: -2px;
  text-shadow: 2px 0 #EC4899;
  clip-path: polygon(0 55%, 100% 55%, 100% 70%, 0 70%);
  animation: glitch-anim-2 0.5s steps(2) forwards;
}

@keyframes glitch-skew {
  0%, 100% { transform: skewX(0deg); }
  25% { transform: skewX(1deg); }
  75% { transform: skewX(-1deg); }
}

@keyframes glitch-anim-1 {
  0% { clip-path: polygon(0 10%, 100% 10%, 100% 25%, 0 25%); }
  50% { clip-path: polygon(0 40%, 100% 40%, 100% 55%, 0 55%); }
  100% { clip-path: none; }
}

@keyframes glitch-anim-2 {
  0% { clip-path: polygon(0 65%, 100% 65%, 100% 80%, 0 80%); }
  50% { clip-path: polygon(0 20%, 100% 20%, 100% 30%, 0 30%); }
  100% { clip-path: none; }
}

/* Scan line */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), rgba(6, 182, 212, 0.8), transparent);
  animation: scan-sweep 3s ease-in-out infinite;
  opacity: 0;
}

@keyframes scan-sweep {
  0%   { top: 0;    opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.header-sub {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-accent-green-light);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-green);
  box-shadow: 0 0 8px var(--color-accent-green);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 4px var(--color-accent-green); }
  50% { box-shadow: 0 0 12px var(--color-accent-green), 0 0 24px rgba(16, 185, 129, 0.4); }
}

.separator {
  opacity: 0.4;
}

.version-tag {
  color: var(--text-muted);
}

/* =============================================
   CARDS CONTAINER
   ============================================= */
.cards-container {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 32px;
  align-items: stretch;
}

/* =============================================
   PORTAL CARD BASE
   ============================================= */
.portal-card {
  position: relative;
  width: 340px;
  min-height: 460px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(26, 26, 62, 0.65);
  backdrop-filter: blur(24px);
  cursor: pointer;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 3D transform applied via JS */
  will-change: transform;
  transform-style: preserve-3d;
  transition: transform 0.12s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.portal-card:not(.is-hovered) {
  transition: transform 0.4s var(--ease-out-cubic), box-shadow 0.3s ease, border-color 0.3s ease;
}

.card-single.is-hovered {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow:
    0 0 40px rgba(139, 92, 246, 0.25),
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-dataset.is-hovered {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow:
    0 0 40px rgba(6, 182, 212, 0.25),
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Launching animation */
.portal-card.is-launching {
  animation: card-launch 0.4s var(--ease-out-expo) forwards;
}

@keyframes card-launch {
  0%   { transform: scale(1); filter: blur(0); }
  60%  { transform: scale(1.08); filter: blur(2px); }
  100% { transform: scale(2.5); filter: blur(20px); opacity: 0; }
}

/* Glow edge decoration */
.card-glow-edge {
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.card-single .card-glow-edge {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), transparent 40%, transparent 60%, rgba(236, 72, 153, 0.2));
}

.card-dataset .card-glow-edge {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), transparent 40%, transparent 60%, rgba(59, 130, 246, 0.2));
}

.portal-card.is-hovered .card-glow-edge {
  opacity: 1;
}

/* Inner layout */
.card-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 28px 24px;
}

/* =============================================
   CARD ICONS
   ============================================= */
.card-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 28px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ripple rings (single sample) */
.single-icon {
  color: var(--color-accent-purple);
}

.ripple-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  animation: ripple-expand 2.4s ease-out infinite;
  opacity: 0;
}

.ripple-ring.ring-1 { width: 40px; height: 40px; animation-delay: 0s; }
.ripple-ring.ring-2 { width: 65px; height: 65px; animation-delay: 0.6s; }
.ripple-ring.ring-3 { width: 95px; height: 95px; animation-delay: 1.2s; }

@keyframes ripple-expand {
  0%   { opacity: 0.8; transform: scale(0.6); }
  100% { opacity: 0;   transform: scale(1); }
}

.ripple-core {
  width: 36px;
  height: 36px;
  background: rgba(139, 92, 246, 0.2);
  border: 1.5px solid rgba(139, 92, 246, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.ripple-core svg {
  width: 18px;
  height: 18px;
  color: var(--color-accent-purple-light);
}

/* Matrix grid (dataset) */
.dataset-icon {
  color: var(--color-accent-cyan);
}

.matrix-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  width: 76px;
  height: 76px;
}

.matrix-block {
  border-radius: 3px;
  background: rgba(6, 182, 212, 0.25);
  border: 1px solid rgba(6, 182, 212, 0.4);
  animation: matrix-jump 1.8s ease-in-out infinite;
}

@keyframes matrix-jump {
  0%, 80%, 100% { transform: scale(1); background: rgba(6, 182, 212, 0.25); }
  40%           { transform: scale(1.15); background: rgba(6, 182, 212, 0.7); box-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }
}

/* =============================================
   CARD CONTENT
   ============================================= */
.card-content {
  flex: 1;
  text-align: center;
}

.card-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.card-desc {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.7;
  margin: 0 0 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.card-tags {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.5px;
}

/* =============================================
   TYPEWRITER LOG
   ============================================= */
.card-log {
  margin-top: 20px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  font-size: 11px;
  color: var(--color-accent-green-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-prefix {
  color: var(--color-accent-cyan);
  flex-shrink: 0;
}

.log-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-cursor {
  animation: blink 1s step-end infinite;
  color: var(--color-accent-green);
  flex-shrink: 0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* =============================================
   CARD ARROW
   ============================================= */
.card-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  background: rgba(255, 255, 255, 0.05);
}

.card-arrow svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.portal-card.is-hovered .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* =============================================
   FOOTER
   ============================================= */
.portal-footer {
  position: relative;
  z-index: 2;
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.footer-text {
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.footer-hint {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* =============================================
   JUMP OVERLAY
   ============================================= */
.jump-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.jump-single {
  background: radial-gradient(circle at center, rgba(79, 70, 229, 0.95) 0%, rgba(139, 92, 246, 0.9) 30%, rgba(15, 15, 35, 0.98) 80%);
}

.jump-dataset {
  background: radial-gradient(circle at center, rgba(6, 182, 212, 0.95) 0%, rgba(59, 130, 246, 0.9) 30%, rgba(15, 15, 35, 0.98) 80%);
}

.jump-enter-active {
  transition: opacity 0.5s ease;
}

.jump-leave-active {
  transition: opacity 0.3s ease;
}

.jump-enter-from {
  opacity: 0;
}

.jump-leave-to {
  opacity: 0;
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 780px) {
  .cards-container {
    flex-direction: column;
    gap: 20px;
    padding: 0 16px;
  }

  .portal-card {
    width: 100%;
    max-width: 400px;
    min-height: auto;
  }

  .portal-header {
    margin-bottom: 32px;
    padding: 0 16px;
  }

  .scan-title {
    font-size: 16px;
    letter-spacing: 2px;
  }
}
</style>
