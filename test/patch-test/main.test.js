function runTest() {

  if (!window.Vue) {
    const red = '\x1b[31m', reset = '\x1b[0m'
    console.error(`${red}Vue is not available.${reset}`)
    return
  }

  const cyan = '\x1b[36m', reset = '\x1b[0m';
  console.log(`[test patch] ${cyan}Vue version:${reset}`, Vue.version)

  const payload = `
    <div>
      <script>${'<'.repeat(100000)}</textarea>
    </div>
  `

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

  const yellow = '\x1b[33m'
  if (capturedMessage) {
    console.warn(`${yellow}[Compile Warning]\x1b[0m ${capturedMessage}`)
  }

  console.log(`${cyan} Time:${reset}`, duration.toFixed(2), 'ms')

  const red = '\x1b[31m'
  const green = '\x1b[32m'

  console.log(
    duration > 1000
      ? `${red}❗ VULNERABLE — CVE-2024-9506 triggered${reset}`
      : `${green} Not vulnerable (fast parse)${reset}`
  )
}

function suppressAndCapture(fn, onMsg) {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (msg, ...args) => {
    const red = '\x1b[31m', reset = '\x1b[0m'
    if (typeof msg === 'string' && msg.includes('Error compiling template')) {
      msg = `${red}${msg}${reset}`
    }
    if (typeof onMsg === 'function') onMsg(msg)
  }

  console.error = (msg, ...args) => {
    const red = '\x1b[31m', reset = '\x1b[0m'
    if (typeof msg === 'string' && msg.includes('Error compiling template')) {
      msg = `${red}${msg}${reset}`
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
