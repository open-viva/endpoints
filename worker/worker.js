/**
  * classeviva api proxy
 */

const CV_HOST   = "https://web.spaggiari.eu";
const AUTH_PATH = "/auth-p7/app/default/AuthApi4.php?a=aLoginPwd";

/* origini cors, vuoto per tutte */
const ALLOWED_ORIGINS = [];

/* header necessari */
const SPOOF_HEADERS = {
  "User-Agent":       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:157.0) Gecko/20100101 Firefox/157.0",
  "Accept":           "*/*",
  "Accept-Language":  "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
  "Origin":           "https://web.spaggiari.eu",
  "Referer":          "https://web.spaggiari.eu/home/app/default/login.php?target=atv&mode=",
  "X-Requested-With": "XMLHttpRequest",
};

/* cors */
function corsHeaders(origin) {
  let allowed = "*";
  if (ALLOWED_ORIGINS.length > 0) {
    allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  }
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-CV-Cookie",
    "Access-Control-Max-Age":       "86400",
    "Vary":                         "Origin",
  };
}

function jsonResponse(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

/* utility varie */
function randomSid(len = 32) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, b => chars[b % chars.length]).join("");
}

function parseCookies(setCookieValues) {
  // setCookieValues è un array di stringhe (una per cookie)
  const out  = {};
  const keep = new Set(["PHPSESSID", "webidentity", "webrole", "i18n_redirected"]);

  for (const header of setCookieValues) {
    const seg = header.split(";")[0].trim();
    const eq  = seg.indexOf("=");
    if (eq > 0) {
      const key = seg.slice(0, eq).trim();
      const val = seg.slice(eq + 1).trim();
      if (keep.has(key)) out[key] = val;
    }
  }
  return out;
}

/* login */
async function handleLogin(request, origin) {
  let body;
  try {
    body = await request.text();
  } catch {
    return jsonResponse({ error: "body non valido" }, 400, origin);
  }

  // genera phpsessid + webrole
  const sid = randomSid();

  const upstream = await fetch(`${CV_HOST}${AUTH_PATH}`, {
    method:  "POST",
    headers: {
      ...SPOOF_HEADERS,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie":       `webrole=gen; PHPSESSID=${sid}`,
    },
    body,
    redirect: "manual",
  });

  const text = await upstream.text().catch(() => "");
  let json = null;
  try { json = JSON.parse(text); } catch {}

  // risposta non json
  if (!json) {
    return jsonResponse({
      error:          "login fallito",
      upstreamStatus: upstream.status,
      upstreamBody:   text.slice(0, 500),
    }, 401, origin);
  }

  // Il successo si valuta dal JSON, non dai Set-Cookie
  if (!json.data?.auth?.loggedIn) {
    return jsonResponse({
      error: "credenziali non valide",
      auth:  json.data?.auth,
    }, 401, origin);
  }

  // usa nuovo phpsessid
  const setCookieHeaders = upstream.headers.getSetCookie
    ? upstream.headers.getSetCookie()
    : [upstream.headers.get("set-cookie") || ""];

  const cookies = {
    webrole:   "gen",
    PHPSESSID: sid,
    ...parseCookies(setCookieHeaders),
  };

  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");

  // recupera studentid
  const whoamiRes = await fetch(`${CV_HOST}/rest/w1/misc/whoami`, {
    headers: { ...SPOOF_HEADERS, "Cookie": cookieStr },
  });

  if (!whoamiRes.ok) {
    return jsonResponse({
      error:  "impossibile ottenere info studente",
      status: whoamiRes.status,
    }, 502, origin);
  }

  const whoami = await whoamiRes.json();

  return jsonResponse({ cookies, studentId: whoami.id }, 200, origin);
}

/* proxy intera api */
async function handleProxy(request, origin) {
  const url  = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path || !path.startsWith("/")) {
    return jsonResponse({ error: "path non valido" }, 400, origin);
  }

  // consenti solo percorsi API ClasseViva
  const allowedPrefixes = ["/rest/w1/", "/auth-p7/"];
  if (!allowedPrefixes.some(p => path.startsWith(p))) {
    return jsonResponse({ error: "path non consentito" }, 403, origin);
  }

  const cookieStr = request.headers.get("X-CV-Cookie") || "";

  const upstream = await fetch(`${CV_HOST}${path}`, {
    method:  request.method,
    headers: {
      ...SPOOF_HEADERS,
      "Cookie": cookieStr,
    },
  });

  // body così com'è
  const body        = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") || "application/json";

  return new Response(body, {
    status:  upstream.status,
    headers: {
      "Content-Type": contentType,
      ...corsHeaders(origin),
    },
  });
}

/* fetch handler */
export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const url    = new URL(request.url);
    // normalizzazione
    const path   = url.pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

    // preflight cors
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // match suffisso
    if (path.endsWith("/login") && request.method === "POST") {
      return handleLogin(request, origin);
    }

    if (path.endsWith("/proxy") && request.method === "GET") {
      return handleProxy(request, origin);
    }

    return jsonResponse({ error: "not found", path }, 404, origin);
  },
};
