# classeviva web endpoints 🔍

endpoints trovati tramite reverse-engineering del frontend web di classeviva.
molte pagine **non espongono una vera api** e richiedono **html scraping**.
questo documento serve solo come riferimento tecnico 🧪

---

## 🔐 accesso (login)

### endpoint

**post**
`https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aloginpwd`

### esempio richiesta

```bash
curl -X POST "https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aLoginPwd" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -d "cid=&uid=studentid&pwd=password&pin=&target="
```

### esempio phpsessid restituito

```
PHPSESSID
domain     ".spaggiari.eu"
httponly   true
path       "/"
secure     true
value      "ab91f0c3k7p2u9xq4mns8tjd6lre5bwh"   <-- esempio fake
```

nota 📝: funziona anche se lo studentid è un’email.

---

## 📝 voti (grades)

non esiste un’api json tramite web.
usa solo cookie:

* `PHPSESSID`
* `WebIdentity`
* `WebRole`

bisogna fare scraping della pagina html.
vedi `grades/grades.js`.

---

## 📅 calendario

### endpoint

**post**
`https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events`

### esempio richiesta

```bash
curl -X POST "https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/fml/app/default/agenda_studenti.php" \
  -b "PHPSESSID=xxx; WebRole=gen; WebIdentity=xxx" \
  --data "anno_scolastico=xxxx&mese=xx&classe_id=xxx&gruppo_id=&nascondi_av=x&start=xxx&end=xxx"
```

---

## 📌 bacheca (noticeboard)

### endpoint

**post**
`https://web.spaggiari.eu/sif/app/default/bacheca_personale.php`

### esempio richiesta

```bash
curl -X POST "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/" \
  -H "Cookie: PHPSESSID=xxxxxx; WebRole=gen; WebIdentity=xxxxx" \
  --data-urlencode "action=get_comunicazioni" \
  --data-urlencode "cerca=" \
  --data-urlencode "ncna=0" \
  --data-urlencode "tipo_com="
```

### tipi comunicazione

* `1` → scuola/famiglia 🏫
* `2` → modulistica 📝
* `3` → news 📰
* `4` → circolari 📄
* `docsdg` → documenti segreteria digitale 📁

## download
**https://web.spaggiari.eu/sif/app/default/bacheca_personale.php?action=file_download&com_id=IDCOMUNICAZIONE**

example
```
curl -L \
  -H "Cookie: PHPSESSID=ab91f0c3k7p2u9xq4mns8tjd6lre5bwh; Webidentity=ID; Webrole=gen" \
  "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php?action=file_download&com_id=IDCOMUNICAZIONE" \ --output file.pdf
```

---

## 🚫 assenze

nessun json api → solo scraping.

### endpoint

`https://web.spaggiari.eu/tic/app/default/consultasingolo.php`

### esempio richiesta

```bash
curl -X GET "https://web.spaggiari.eu/tic/app/default/consultasingolo.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 📚 didattica

richiede scraping.

### endpoint

`https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php`

### esempio richiesta

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 👥 colloqui

richiede scraping.

### endpoint principale

`https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php`

### esempio richiesta

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

### colloqui generali

`https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php`

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 🎯 attività studente

richiede scraping.

### endpoint pagina

`https://web.spaggiari.eu/fml/app/default/attivita_studente.php`

### richiesta

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/attivita_studente.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

### endpoint aggiuntivi 📌

```
.../attivita_studente.php?a=get_stato_giorno&data=date
.../attivita_studente.php?a=get_notifiche&data=date
.../attivita_studente.php?a=get_note_disciplinari&data=date
.../attivita_studente.php?a=get_annotazioni&data=date
.../attivita_studente.php?a=get_lezioni&data=date
.../attivita_studente.php?a=get_lezioni_extracurriculari&data=date
.../attivita_studente.php?a=get_eventi_smart&data=date
.../attivita_studente.php?a=get_eventi_smart_extracurriculari&data=date
```

---

## 🧑‍🏫 sportello

scraping.

### endpoint

`https://web.spaggiari.eu/fml/app/default/alunni_sportello.php`

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/alunni_sportello.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 🏫 classe

### endpoint

`https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php`

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

### endpoint secondario

```
.../regclasse_lezioni_xstudenti.php?action=loadlezioni&materia=idmateria&autori_id=idautore
```

---

## 🧿 annotazioni (note)

scraping.

### endpoint

`https://web.spaggiari.eu/fml/app/default/gioprof_note_studente.php`

```bash
curl -X GET "https://web.spaggiari.eu/fml/app/default/gioprof_note_studente.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 🗃️ scrutini

### endpoint

`https://web.spaggiari.eu/sol/app/default/documenti_sol.php`

```bash
curl -X GET "https://web.spaggiari.eu/sol/app/default/documenti_sol.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

---

## 💳 pagamenti (pagoonline)

### endpoint

`https://web.spaggiari.eu/rest/w1/parents/xxx/pagoonline/payments/`

```bash
curl -X POST "https://web.spaggiari.eu/rest/w1/parents/xxx/pagoonline/payments/" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```

⚠️ non usare questo endpoint per effettuare pagamenti reali.

---

## 🧾 recupero username

### endpoint

`https://web.spaggiari.eu/tools/app/default/get_username.php`

```bash
curl -X GET "https://web.spaggiari.eu/tools/app/default/get_username.php" \
  -H "User-Agent: CVVS/std/4.1.7 android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; WebRole=gen; WebIdentity=xxxx"
```
