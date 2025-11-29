# 📘 classeviva web endpoints documentation

documentazione non ufficiale degli endpoint web di classeviva, ottenuta tramite reverse-engineering del frontend ufficiale.

> ⚠️ **disclaimer**
> questi endpoint non sono documentati e possono cambiare in qualsiasi momento.
> usa queste informazioni responsabilmente.

---

# 🔐 1. autenticazione

## endpoint

**post**
`https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aloginpwd`

## esempio richiesta base

```bash
curl -x post "https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aloginpwd" \
  -h "content-type: application/x-www-form-urlencoded; charset=utf-8" \
  -d "cid=&uid=studentid&pwd=password&pin=&target="
```

## risposta

la risposta imposta un cookie di sessione, tipicamente:

```
phpsessid=ab91f0c3k7p2u9xq4mns8tjd6lre5bwh
domain=.spaggiari.eu
path=/
httponly=true
secure=true
```

## esempio con estrazione automatica dei cookie

```bash
curl -s -d "uid=xxxx&pwd=yyyy" \
  -c cookies.txt \
  "https://web.spaggiari.eu/auth-p7/app/default/authapi4.php?a=aloginpwd"
```

i cookie finiranno dentro `cookies.txt`.

---

# 🧪 2. voti (scraping html)

classeviva **non fornisce un’api json ufficiale** per i voti.
il frontend recupera la pagina html e poi la interpreta.

## endpoint

**get**
`https://web.spaggiari.eu/fml/app/default/giocator.php`

(o altri endpoint variabili a seconda della vista)

## esempio (ottenere html voti)

```bash
curl -b cookies.txt \
  "https://web.spaggiari.eu/fml/app/default/giocator.php?view=registro"
```

## parsing consigliato

* usa `cheerio` (node.js)
* oppure regex molto precise
* molti voti sono dentro `<span class="badge">` o `<tr>` con attributi custom

---

# 🗓️ 3. agenda / calendario

endpoint utilizzato dal frontend per caricare gli eventi.

## endpoint

**post**
`https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events`

## parametri più comuni

* `anno_scolastico` → es. `2024`
* `mese` → `01` – `12`
* `classe_id` → id classe (obbligatorio)
* `start` → timestamp unix
* `end` → timestamp unix
* `nascondi_av` → `0` o `1`

## esempio base

```bash
curl -x post \
  "https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events" \
  -h "origin: https://web.spaggiari.eu" \
  -h "referer: https://web.spaggiari.eu/fml/app/default/agenda_studenti.php" \
  -b "phpsessid=xxx; webrole=gen; webidentity=xxx" \
  --data "anno_scolastico=2024&mese=11&classe_id=1609700&gruppo_id=&nascondi_av=0&start=1761519600&end=1765148400"
```

## esempio completo generico

```bash
curl -x post \
  "https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events" \
  -b cookies.txt \
  --data "anno_scolastico=2024&mese=10&classe_id=123456&nascondi_av=0&start=1700000000&end=1700600000"
```

---

# 📌 4. bacheca (noticeboard)

## endpoint

**post**
`https://web.spaggiari.eu/sif/app/default/bacheca_personale.php`

## ottenere file / allegati

la bacheca usa due richieste:

1. una per listare i documenti
2. una seconda per scaricare l’allegato

### esempio: listare messaggi di bacheca

```bash
curl -x post \
  "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php" \
  -b cookies.txt \
  -d "ope=getlist&offset=0&rows=50"
```

### esempio: scaricare allegato

```bash
curl -o file.pdf \
  -b cookies.txt \
  "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php?ope=download&id_msg=123456&id_doc=1"
```

---

# 📝 5. assenze

## endpoint

**get**
`https://web.spaggiari.eu/fml/app/default/regclasse.php?ope=list_assenze`

### esempio semplice

```bash
curl -b cookies.txt \
  "https://web.spaggiari.eu/fml/app/default/regclasse.php?ope=list_assenze"
```

---

# 🎒 6. compiti / lezioni

## endpoint

**post**
`https://web.spaggiari.eu/fml/app/default/compiti_personali.php`

### esempio

```bash
curl -x post \
  "https://web.spaggiari.eu/fml/app/default/compiti_personali.php" \
  -b cookies.txt \
  -d "ope=list&offset=0&rows=20"
```

---

# 🔧 7. struttura cookie di classeviva

quando effettui l’accesso, ottieni tipicamente:

| cookie        | descrizione            |
| ------------- | ---------------------- |
| phpsessid     | sessione principale    |
| webidentity   | id utente interno      |
| webrole       | ruolo (gen, alun, doc) |
| orario_scuola | talvolta presente      |

### esempio fasullo completo

```
phpsessid=ab91f0c3k7p2u9xq4mns8tjd6lre5bwh  
webidentity=usr123456  
webrole=alun  
```

---

# 🛠️ 8. come usarli in node.js (esempio rapido)

```js
import axios from "axios";

const client = axios.create({
  baseURL: "https://web.spaggiari.eu",
  headers: {
    cookie: "phpsessid=abc123; webidentity=usr999; webrole=alun"
  }
});

const res = await client.post(
  "/fml/app/default/agenda_studenti.php?ope=get_events",
  "anno_scolastico=2024&mese=11&classe_id=1609700&nascondi_av=0"
);

console.log(res.data);
```
