# classeviva worker

a small cloudflare worker that logs into classeviva (spaggiari) and proxies its rest api, so a browser app can call it without running into cors.

## what it does

- `POST /login` authenticates against classeviva and returns the session cookies plus the student id
- `GET /proxy?path=...` forwards a request to the classeviva rest api using the cookies you pass in

## endpoints

### POST /login

body is form urlencoded, the same as the web login:

```
cid=&uid=USERNAME&pwd=PASSWORD&pin=&target=
```

success response:

```json
{
  "cookies": { "webrole": "gen", "PHPSESSID": "..." },
  "studentId": 123456
}
```

errors:

- `401 credenziali non valide` the login json came back with `loggedIn: false`
- `401 login fallito` the response was not json, usually a waf block. `upstreamStatus` and `upstreamBody` are included for debugging
- `502 impossibile ottenere info studente` login worked but `whoami` failed

### GET /proxy

query parameter:

- `path` the classeviva path, must start with `/rest/w1/` or `/auth-p7/`

header:

- `X-CV-Cookie` the cookie string, for example `webrole=gen; PHPSESSID=...`

example:

```
GET /proxy?path=/rest/w1/students/123456/grades
X-CV-Cookie: webrole=gen; PHPSESSID=abc123
```

the upstream status and body are passed through unchanged.

## deploy

1. install wrangler and log in: `npm i -g wrangler && wrangler login`
2. deploy: `wrangler deploy`
   (or paste `worker.js` into the dashboard at dashboard.cloudflare.com/workers)

## configuration

at the top of `worker.js`:

- `ALLOWED_ORIGINS` list of origins allowed by cors. leave empty for `*` while developing, and set your app domain in production, for example `["https://yourapp.pages.dev"]`
- `SPOOF_HEADERS` the headers sent upstream. keep `Referer`, `Origin` and `X-Requested-With` or akamai will answer 403

## troubleshooting

- **403 access denied with an akamai page**: akamai is blocking the request. check that the headers and the `Cookie` are being sent. if they are and it still fails, cloudflare ips or their tls fingerprint are being filtered, and a worker cannot fix that. you would need a small server on a non-datacenter ip (a raspberry pi at home works) to make the call
- **401 credenziali non valide**: check the `auth` field in the response for the actual errors from classeviva
- **404 not found**: routes match by suffix, so the url must end in `/login` or `/proxy`
