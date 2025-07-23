function runTest() {
  const red = '\x1b[31m'
  const green = '\x1b[32m'
  const yellow = '\x1b[33m'
  const cyan = '\x1b[36m'
  const reset = '\x1b[0m'

  if (!window.Vue || typeof Vue.compile !== 'function') {
    console.error(`${red}Vue is not available or compile() missing.${reset}`)
    return
  }

  console.log(`[test patch] ${cyan}Vue version:${reset}`, Vue.version)

  // ⛔️ Malicious input that causes regex backtracking in unpatched versions
  const payload = '<script>' + ' </'.repeat(100000) + '<\\/script>'

  let capturedMessage = ''

  const start = performance.now()

  suppressAndCapture(
    () => {
      Vue.compile(payload)
    },
    msg => {
      if (!capturedMessage) {
        capturedMessage = msg.slice(0, 50) + '...'
      }
    }
  )

  const duration = performance.now() - start

  if (capturedMessage) {
    console.warn(`${yellow}[Compile Warning]${reset} ${capturedMessage}`)
  }

  console.log(`${cyan}Time:${reset} ${duration.toFixed(2)} ms`)

  if (duration > 1000) {
    console.error(`${red}VULNERABLE - CVE-2024-9506 triggered${reset}`)
  } else {
    console.log(`${green}Not vulnerable (fast parse)${reset}`)
  }
}

function suppressAndCapture(fn, onMsg) {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('Error compiling template')) {
      msg = `\x1b[31m${msg}\x1b[0m`
    }
    if (typeof onMsg === 'function') onMsg(msg)
  }

  console.error = (msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('Error compiling template')) {
      msg = `\x1b[31m${msg}\x1b[0m`
    }
    if (typeof onMsg === 'function') onMsg(msg)
  }

  try {
    fn()
  } finally {
    console.warn = originalWarn
    console.error = originalError
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTest)
} else {
  runTest()
}
