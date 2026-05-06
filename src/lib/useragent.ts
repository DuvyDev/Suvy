export interface UserAgentInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  ip: string;
  raw: string;
}

const UA_REGEXES = [
  /^(?:my|mi|what'?s|what\s+is|cual\s+es|cuál\s+es|show|mostrar|ver|detectar|detect)\s*(?:my|mi|el|la)?\s*(?:user\s*agent|useragent|ua|browser|navegador|explorador|os|sistema\s*operativo|sistema|plataforma|device|dispositivo)$/i,
  /^(?:user\s*agent|useragent|ua|mi\s*ua|my\s*ua)$/i,
  /^(?:navegador|browser|explorador)$/i,
  /^(?:que\s*navegador\s*(?:uso|tengo)|what\s*browser\s*(?:am\s*i\s*using|do\s*i\s*use)|what\s*is\s*my\s*browser)$/i,
  /^(?:que\s*sistema\s*(?:uso|tengo)|what\s*is\s*my\s*os|what\s*os\s*am\s*i\s*using|mi\s*sistema\s*operativo)$/i,
  /^(?:my|mi|what'?s|what\s+is|cual\s+es|cuál\s+es)\s*(?:my|mi)?\s*(?:ip|ip\s*address|direccion\s*ip|dirección\s*ip|ip\s*publica|ip\s*pública|public\s*ip|wan\s*ip)$/i,
  /^(?:ip|mi\s*ip|my\s*ip|cual\s*es\s*mi\s*ip|cuál\s*es\s*mi\s*ip|what\s*is\s*my\s*ip|what'?s\s*my\s*ip)$/i,
];

export function detectUserAgentQuery(query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  for (const re of UA_REGEXES) {
    if (re.test(trimmed)) return true;
  }
  return false;
}

export function parseUserAgent(ua: string, ip: string): UserAgentInfo {
  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let device = 'Desktop';

  if (!ua) {
    return { browser, browserVersion, os, osVersion, device, ip, raw: ua || '' };
  }

  if (/Edg\//.test(ua)) {
    browser = 'Edge';
    const m = ua.match(/Edg\/(\d+(?:\.\d+)?)/);
    browserVersion = m ? m[1] : '';
  } else if (/OPR\//.test(ua) || /Opera/.test(ua)) {
    browser = 'Opera';
    const m = ua.match(/OPR\/(\d+(?:\.\d+)?)/);
    browserVersion = m ? m[1] : '';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
    const m = ua.match(/Firefox\/(\d+(?:\.\d+)?)/);
    browserVersion = m ? m[1] : '';
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    browser = 'Safari';
    const m = ua.match(/Version\/(\d+(?:\.\d+)?)/);
    browserVersion = m ? m[1] : '';
  } else if (/Chrome\//.test(ua)) {
    browser = 'Chrome';
    const m = ua.match(/Chrome\/(\d+(?:\.\d+)?)/);
    browserVersion = m ? m[1] : '';
  }

  if (/Windows NT/.test(ua)) {
    os = 'Windows';
    const m = ua.match(/Windows NT (\d+\.\d+)/);
    if (m) {
      const v = m[1];
      if (v === '10.0') osVersion = '10/11';
      else if (v === '6.3') osVersion = '8.1';
      else if (v === '6.2') osVersion = '8';
      else if (v === '6.1') osVersion = '7';
      else osVersion = v;
    }
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS';
    const m = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/);
    osVersion = m ? m[1].replace(/_/g, '.') : '';
  } else if (/Android/.test(ua)) {
    os = 'Android';
    const m = ua.match(/Android (\d+(?:\.\d+)?)/);
    osVersion = m ? m[1] : '';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    const m = ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/);
    osVersion = m ? m[1].replace(/_/g, '.') : '';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  } else if (/CrOS/.test(ua)) {
    os = 'Chrome OS';
  }

  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    if (/iPad/.test(ua)) device = 'Tablet';
    else device = 'Mobile';
  }

  return { browser, browserVersion, os, osVersion, device, ip, raw: ua };
}