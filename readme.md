# classeviva's web endpoints

endpoints found while reverse-engineering classeviva’s web frontend.
most of these pages do not expose a real api and require html scraping.

---

## access

* **post** `https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aloginpwd`

### how to request (example)

```bash
curl -x post "https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aLoginPwd" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -d "cid=&uid=studentid&pwd=password&pin=&target="
```

this endpoint returns a `phpsessid` cookie, for example:

```
phpsessid
domain     ".spaggiari.eu"
httponly   true
path       "/"
secure     true
value      "ab91f0c3k7p2u9xq4mns8tjd6lre5bwh"   <-- example only
```

note: this endpoint works even if the studentid is an email.

---

## grades

classeviva doesn't provide a web api for grades.
it relies on:

* `phpsessid`
* `webidentity`
* `webrole`

you must scrape the html and convert it into json.
see: [`grades/grades.js`](grades/grades.js)

---

## calendar

* **post** `https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events`

### how to request (example)

```bash
curl -x post "https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/fml/app/default/agenda_studenti.php" \
  -b "phpsessid=xxx; webrole=gen; webidentity=xxx" \
  --data "anno_scolastico=xxxx&mese=xx&classe_id=xxx&gruppo_id=&nascondi_av=x&start=xxx&end=xxx"
```

---

## noticeboard (bacheca)

* **post** `https://web.spaggiari.eu/sif/app/default/bacheca_personale.php`

### how to request (example)

```bash
curl -x post "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/" \
  -h "cookie: phpsessid=xxxxxx; webrole=gen; webidentity=xxxxx" \
  --data-urlencode "action=get_comunicazioni" \
  --data-urlencode "cerca=" \
  --data-urlencode "ncna=0" \
  --data-urlencode "tipo_com="
```

### understanding communication types

* `tipo_com=1` → scuola/famiglia
* `tipo_com=2` → modulistica
* `tipo_com=3` → news
* `tipo_com=4` → circolare
* `tipo_com=docsdg` → documenti segreteria digitale

---

## absences

classeviva doesn’t have a web api for absences.
it uses `phpsessid`, `webidentity`, and `webrole`.

scrape the html from:

* **get** `https://web.spaggiari.eu/tic/app/default/consultasingolo.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/tic/app/default/consultasingolo.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## didattica

same situation as absences: html scraping is required.

* **get** `https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## colloqui

html scraping required.

* **get** `https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

### colloqui generali

* **get** `https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## activity

html scraping required.

* **get** `https://web.spaggiari.eu/fml/app/default/attivita_studente.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/attivita_studente.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

### additional activity endpoints

```
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_stato_giorno&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_notifiche&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_note_disciplinari&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_annotazioni&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_lezioni&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_lezioni_extracurriculari&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_eventi_smart&data=date
https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_eventi_smart_extracurriculari&data=date
```

---

## sportello

html scraping required.

* **get** `https://web.spaggiari.eu/fml/app/default/alunni_sportello.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/alunni_sportello.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## class

html scraping required.

* **get** `https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php" \
 -h "user-agent: cvvs/std/4.1.7 android/10" \
 -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
 -h "origin: https://web.spaggiari.eu" \
 -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
 -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

### additional class endpoints

```
https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php?action=loadlezioni&materia=idmateria&autori_id=idautore
```

---

## annotations (note)

html scraping required.

* **get** `https://web.spaggiari.eu/fml/app/default/gioprof_note_studente.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/fml/app/default/gioprof_note_studente.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## scrutini

html scraping required.

* **get** `https://web.spaggiari.eu/sol/app/default/documenti_sol.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/sol/app/default/documenti_sol.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

---

## payments

* **post** `https://web.spaggiari.eu/rest/w1/parents/13464007/pagoonline/payments/`

### how to request (example)

```bash
curl -x post "https://web.spaggiari.eu/rest/w1/parents/13464007/pagoonline/payments/" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```

note: do not use this endpoint to pay.
you assume full responsibility for its usage.

---

## username retrieval

you can get the username associated with `phpsessid`, `webrole`, and `webidentity`.

* **get** `https://web.spaggiari.eu/tools/app/default/get_username.php`

### how to request (example)

```bash
curl -x get "https://web.spaggiari.eu/tools/app/default/get_username.php" \
  -h "user-agent: cvvs/std/4.1.7 android/10" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "phpsessid=xxxx; webrole=gen; webidentity=xxxx"
```
