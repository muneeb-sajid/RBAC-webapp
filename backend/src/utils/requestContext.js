// Small, dependency-free helpers for pulling security-relevant context
// (IP, device, browser) out of an Express request. Good enough for
// activity/session labeling; not meant to be a full UA-parsing library.

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || req.socket?.remoteAddress || null
}

function detectBrowser(ua) {
  if (!ua) return 'Unknown browser'
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/CriOS\//.test(ua)) return 'Chrome'
  if (/FxiOS\//.test(ua)) return 'Firefox'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari'
  if (/MSIE|Trident/.test(ua)) return 'Internet Explorer'
  return 'Unknown browser'
}

function detectOS(ua) {
  if (!ua) return 'Unknown OS'
  if (/Windows/.test(ua)) return 'Windows'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Unknown OS'
}

export function parseUserAgent(userAgent) {
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)
  return {
    browser,
    device: `${browser} / ${os}`,
  }
}

export function getRequestContext(req) {
  const userAgent = req.headers['user-agent'] || null
  const { browser, device } = parseUserAgent(userAgent)
  return {
    ipAddress: getClientIp(req),
    userAgent,
    browser,
    device,
  }
}
