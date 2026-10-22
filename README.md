# ClasseViva Web API Docs
Documentazione non ufficiale, mantenuta dalla community, delle API REST di ClasseViva (Spaggiari) usate dal client web su `web.spaggiari.eu`.

> [!WARNING]
> Questa documentazione è il risultato di un'analisi indipendente.
> Non è affiliata, approvata né supportata da Spaggiari.
> Usala a tuo rischio e nel rispetto dei termini di servizio applicabili.

> [!IMPORTANT]
> se pensi di usare le API da una cdn o simili,
> devi configurare un cloudflare worker che faccia da proxy.
> vedi come configurarlo [qui](./worker/README.md).

Una descrizione OpenAPI 3.0 è disponibile in [`openapi.yaml`](./openapi.yaml).

---

## Indice

- [Autenticazione](#autenticazione)
- [Endpoint](#endpoint)
  - [Info utente](#info-utente)
  - [Menu / Funzioni](#menu--funzioni)
  - [Periodi](#periodi)
  - [Tessera studente](#tessera-studente)
  - [Portfolio](#portfolio)
  - [Dashboard](#dashboard)
  - [Panoramica giornaliera](#panoramica-giornaliera)
  - [Materie](#materie)
  - [Voti](#voti)
  - [Medie](#medie)
  - [Assenze](#assenze)
  - [Agenda](#agenda)
  - [Lezioni](#lezioni)
  - [Bacheca](#bacheca)
  - [Comunicazioni](#comunicazioni)
  - [Didattica (Materiali)](#didattica-materiali)
  - [Compiti](#compiti)
  - [Note](#note)
  - [Documenti](#documenti)
  - [Colloqui](#colloqui)
  - [Pagamenti](#pagamenti)
  - [Libri di testo](#libri-di-testo)
  - [Altri endpoint](#altri-endpoint)
- [Riferimento tipi di dato](#riferimento-tipi-di-dato)
  - [Particolarità da gestire](#particolarità-da-gestire)
- [Contribuire](#contribuire)

---

## URL di base

| Servizio | URL di base |
|---|---|
| API REST | `https://web.spaggiari.eu/rest/w1/` |
| CDN documenti | `https://cdndoc.spaggiari.eu/` |
| Autenticazione | `https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php` |

`{studentId}` nei percorsi qui sotto è l'`id` numerico restituito da `whoami` (di solito il numero dopo la "S"), non il codice identificativo `S12345678C`.

---

## Autenticazione

### Login

```
POST https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd
```

**Campi del form** (application/x-www-form-urlencoded):

| Campo | Descrizione |
|---|---|
| `uid` | Nome utente |
| `pwd` | Password |
| `cid` | Codice scuola (può essere vuoto) |
| `pin` | PIN (se impostato, altrimenti vuoto) |
| `target` | Può essere vuoto |

Esempio di body:

```
cid=&uid=USERNAME&pwd=PASSWORD&pin=&target=
```

**Risposta:**

```json
{
  "time": "2026-10-21T20:05:06+02:00",
  "data": {
    "auth": {
      "verified": true,
      "loggedIn": true,
      "actionRequested": false,
      "hints": [],
      "errors": [],
      "accountInfo": { "type": "S", "id": 12345678, "cognome": "ROSSI", "nome": "MARIO", "cid": "PGXX0000" },
      "redirects": [],
      "aMode": "sam",
      "mMode": "SEML",
      "errCod": []
    },
    "pfolio": false
  },
  "error": [],
  "api": { "env": "production", "AuthSpa": { "version": "2.10.3" } }
}
```

**Note:**
- Il successo è `data.auth.loggedIn === true`. Non fare affidamento su `Set-Cookie` per rilevarlo: se la richiesta porta già un `PHPSESSID`, il server può non inviarne uno nuovo.
- `verified: true` con `loggedIn: false` significa che corrispondono più account e bisogna sceglierne uno: `POST AuthApi4.php?a=aLoginSam` con `uid=<account scelto>`.
- `actionRequested: "changePasswordDialog"` significa che la password è scaduta.
- Un 401 su qualsiasi chiamata REST significa che la sessione non è più valida.

Se il login riesce, il server imposta questi cookie, che vanno inviati in tutte le richieste successive:

| Cookie | Descrizione |
|---|---|
| `PHPSESSID` | Token di sessione |
| `webidentity` | Identificativo dell'account (`S{studentId}C`) |
| `webrole` | Identificativo del ruolo (es. `gen`) |
| `i18n_redirected` | Lingua (`it`) |

---

## Endpoint

Tutti gli endpoint usano **GET** salvo diversa indicazione e richiedono i cookie di sessione descritti sopra. Le date nei percorsi sono `YYYYMMDD`.

### Info utente

```
GET /rest/w1/misc/whoami
```

**Risposta:**

```json
{
  "id": "12345678",
  "account_type": "S",
  "sede_codice": "PGXX0000",
  "anno_scol": "2026",
  "cognome": "ROSSI",
  "nome": "MARIO",
  "classe_ident": "1234567",
  "classe_desc": "5A LICEO SCIENTIFICO",
  "data_nascita": "1911-01-01",
  "codice_fisc": "RSSMRA11A01H501X",
  "login_type": null,
  "last_login_at": null,
  "email": "mario.rossi@example.com",
  "schoolpass": "512345678"
}
```

> `id` è l'ID numerico dello studente usato in tutti gli endpoint `/students/{id}/...`. `anno_scol` è solo l'anno di inizio (`"2026"` = 2026/27).

---

### Menu / Funzioni

```
GET /rest/w1/students/{studentId}/_functions
```

Restituisce quali sezioni la scuola ha abilitato, più le opzioni di interfaccia per sezione.

**Risposta:**

```json
{
  "functions": {
    "dashboard": { "title": "Dashboard", "desc": "Dashboard", "type": "function", "url": null, "options": [], "readonly": false },
    "valutazioni": {
      "title": "Valutazioni", "desc": "Valutazioni", "type": "function", "url": null,
      "options": { "opt:votiHideAverage": true, "opt:votiWeightEnab": false, "opt:votiUsaNuoveCompetenze": false },
      "readonly": false
    },
    "assenze": { "title": "Assenze", "type": "function", "options": { "opt:librettoWebEnabled": false }, "readonly": false }
  },
  "appEnabled": ["ALWSTD", "CVVSTD"]
}
```

**Chiavi delle funzioni:** `dashboard`, `oas`, `old_bacheca`, `valutazioni`, `didattica`, `agenda`, `assenze`, `lezioni`, `note_disciplinari`, `colloqui`, `scrutini`, `pol`, `feedback`, `other`, `ap`.

> Le opzioni controllano solo ciò che mostra l'interfaccia web. Ad esempio `opt:votiHideAverage` nasconde le medie nella pagina, ma `/avg/` le restituisce comunque.

---

### Periodi

```
GET /rest/w1/students/{studentId}/periods
```

**Risposta:**

```json
{
  "periods": [
    { "periodCode": "Q1", "periodPos": 1, "periodDesc": "1° PERIODO", "periodLabel": "1° PERIODO", "isFinal": false, "dateStart": "2026-09-01", "dateEnd": "2026-12-04", "miurDivisionCode": null },
    { "periodCode": "Q3", "periodPos": 3, "periodDesc": "2° PERIODO", "periodLabel": "2° PERIODO", "isFinal": true, "dateStart": "2026-12-05", "dateEnd": "2027-06-08", "miurDivisionCode": null }
  ]
}
```

> `periodPos` non è sequenziale (1 e 3 con due periodi).

---

### Tessera studente

```
GET /rest/w1/students/{studentId}/card
```

**Risposta:**

```json
{
  "card": {
    "ident": "S12345678C",
    "usrType": "S",
    "usrId": 12345678,
    "miurSchoolCode": "PGXX000000",
    "miurDivisionCode": "PGXX000000",
    "firstName": "MARIO",
    "lastName": "ROSSI",
    "birthDate": "1911-01-01",
    "fiscalCode": "RSSMRA11A01H501X",
    "schCode": "PGXX0000",
    "schName": "ISTITUTO D'ISTRUZIONE SUPERIORE",
    "schDedication": "...",
    "schCity": "CITTA",
    "schProv": "PG"
  }
}
```

> `schName` e `schDedication` arrivano con spazi finali di riempimento.

---

### Portfolio

```
GET /rest/w1/xauth/myportfolio
```

Restituisce gli account collegati al login.

**Risposta:**

```json
{
  "currentIdent": "S12345678C",
  "portfolio": {
    "master": {
      "id": 1000000,
      "masterId": null,
      "authType": "email",
      "authString": "mario.rossi@example.com",
      "authDesc": "mario.rossi@example.com",
      "emlFlags": 0,
      "passChanged": "2025-09-17T15:05:54+02:00",
      "passRemindExpire": null,
      "validationNeeded": false,
      "validationExpire": null,
      "insertDT": "2025-09-17T15:05:28+02:00"
    },
    "items": [
      {
        "id": 2000000,
        "target": "tic",
        "cid": "PGXX0000",
        "ident": "S12345678C",
        "userType": "S",
        "userId": 12345678,
        "description": "",
        "spsPrivacyFlags": 0,
        "insertDT": "2025-09-17T15:05:28+02:00",
        "personalInfo": {
          "firstName": "MARIO",
          "lastName": "ROSSI",
          "birthDate": "1911-01-01",
          "fiscalCode": "RSSMRA11A01H501X",
          "classDesc": "5A LICEO SCIENTIFICO",
          "schoolYY": 2026
        }
      }
    ]
  }
}
```

Gestione account: `POST /rest/w1/xauth/connect`, `POST /rest/w1/xauth/disconnect`, `POST /rest/w1/xauth/changepassword`.

---

### Dashboard

```
GET /rest/w1/students/{studentId}/dashboard
```

Tutto ciò che serve alla dashboard in una sola chiamata.

**Risposta:**

```json
{
  "subjectAverages": {},
  "generalAverages": {},
  "latestGrades": [],
  "latestAbsences": [],
  "latestLessons": [],
  "documents": { "documents": [], "schoolReports": [] },
  "homeworks": []
}
```

> Ogni chiave ha la stessa forma del suo endpoint dedicato (`avg`, `grades26`, `absences/details`, `lessons`, `homeworks/index`).

---

### Panoramica giornaliera

```
GET /rest/w1/students/{studentId}/overview/all26/{dateFrom}/{dateTo}
```

Restituisce lezioni, agenda, compiti e note per l'intervallo dato (`YYYYMMDD`, di solito un solo giorno).

**Risposta:**

```json
{
  "virtualClassesAgenda": [],
  "lessons": [
    {"evtId": 1, "evtDate": "2026-09-15", "evtCode": "LSF0", "evtHPos": 1, "evtDuration": 1, "classDesc": "5A LICEO SCIENTIFICO", "authorName": "Docente A", "subjectId": 6, "subjectCode": "ITA", "subjectDesc": "LINGUA E LETTERATURA ITALIANA", "lessonType": "Lezione", "lessonArg": "Ripasso argomenti."}
  ],
  "agenda": [
    {"evtId": 101, "evtCode": "AGNT", "evtDatetimeBegin": "2026-09-16T00:00:00+02:00", "evtDatetimeEnd": "2026-09-16T23:59:59+02:00", "isFullDay": true, "notes": "Esercizi da svolgere.", "authorName": "Docente A", "classDesc": "5A LICEO SCIENTIFICO", "subjectId": null, "subjectDesc": null, "homeworkId": null}
  ],
  "events": [],
  "grades": [],
  "notes": {"NTTE": [], "NTCL": [], "NTWN": [], "NTST": []},
  "homeworks": []
}
```

> `agenda` può contenere elementi con data successiva al giorno richiesto. Gli elementi di `homeworks` hanno la stessa forma di [Compiti](#compiti).

---

### Materie

```
GET /rest/w1/students/{studentId}/subjects
```

**Risposta:**

```json
{
  "subjects": [
    {
      "id": 210068,
      "description": "DISEGNO E STORIA DELL'ARTE",
      "order": 14,
      "teachers": [
        { "teacherId": "A1234567", "teacherName": "SURNAME NAME" }
      ]
    }
  ]
}
```

> Qui `teacherId` ha il prefisso `A`. In compiti e colloqui l'id del docente è solo numerico (`1234567`).

---

### Voti

```
GET /rest/w1/students/{studentId}/grades26
```

Restituisce tutti i voti dell'anno scolastico corrente.

**Risposta:**

```json
{
  "grades": [
    {
      "subjectId": 210068,
      "subjectCode": "ART",
      "subjectDesc": "DISEGNO E STORIA DELL'ARTE",
      "evtId": 651664,
      "evtCode": "GRV0",
      "evtDate": "2026-10-24",
      "decimalValue": 7.0,
      "displayValue": "7",
      "displaPos": 1,
      "notesForFamily": "",
      "color": "green",
      "canceled": false,
      "underlined": false,
      "periodPos": 1,
      "periodDesc": "1° PERIODO",
      "periodLabel": "1° PERIODO",
      "componentPos": 3,
      "componentDesc": "Pratico",
      "weightFactor": 100,
      "noAverage": false,
      "teacherName": "SURNAME NAME",
      "evtPosition": "S1_3_1"
    }
  ]
}
```

**Note:**
- Il suffisso `26` non è l'anno scolastico: è lo stesso per il 2025/26 e il 2026/27.
- Formato di `evtPosition`: `S{periodPos}_{componentPos}_{index}`
- `color`: `"green"` (≥6), `"yellow"` (~5-6), `"red"` (<5) - in modo approssimativo
- `periodPos`: vedi [Periodi](#periodi)
- `componentPos`: `1` Scritto/Grafico, `2` Orale, `3` Pratico
- `decimalValue` è il voto numerico grezzo; `displayValue` è la stringa formattata (es. `"8½"` = 8.5)
- I giudizi non numerici (es. `displayValue: "ds"` oppure `"o"`, visti in Religione) hanno **`decimalValue: null`** e `noAverage: true`: usa sempre `displayValue` come ripiego
- `weightFactor` è una percentuale (`100` = peso 1)
- I voti in `/dashboard` (`latestGrades`) includono anche campi di competenza vuoti (`skillId`, `skillDesc`, `skillCode`, ...)

---

### Medie

Restituisce la media generale e la media per materia.

```
GET /rest/w1/students/{studentId}/avg/
GET /rest/w1/students/{studentId}/avg/{subjectId}
```

**Risposta:**

```json
{
  "subjectAverages": {
    "407840": {
      "subjectId": 407840,
      "subjectCode": "EDC",
      "subjectDesc": "EDUCAZIONE CIVICA",
      "periodAverages": {
        "S1": {"periodPos": 1, "periodDesc": "1° PERIODO", "periodLabel": "1° PERIODO", "average": 9.5, "color": "green", "gradeCount": 2}
      },
      "globalAverage": {"periodPos": 0, "periodDesc": "Generale", "periodLabel": "", "average": 9.5, "color": "green", "gradeCount": 2}
    },
    "210068": {
      "subjectId": 210068,
      "subjectCode": null,
      "subjectDesc": "DISEGNO E STORIA DELL'ARTE",
      "periodAverages": [],
      "globalAverage": {"periodPos": 0, "periodDesc": "Generale", "periodLabel": "", "average": null, "color": "orange", "gradeCount": 0}
    }
  },
  "generalAverages": {
    "S1": {"periodPos": 1, "periodDesc": "1° PERIODO", "periodLabel": "1° PERIODO", "average": 8.95, "color": "green", "subjectCount": 5}
  }
}
```

**Note:**
- `subjectAverages` ha come chiave l'id della materia.
- `periodAverages` e `generalAverages` sono oggetti con chiave `S{periodPos}`, oppure un array vuoto `[]` quando non ci sono voti.
- `average` è `null` e `color` è `"orange"` quando una materia non ha voti.

---

### Assenze

```
GET /rest/w1/students/{studentId}/absences/details/
GET /rest/w1/students/{studentId}/absences/details/{dateFrom}/{dateTo}
```

Restituisce tutti gli eventi di assenza e ritardo.

**Risposta:**

```json
{
  "events": [
    {
      "evtId": 543814,
      "evtCode": "ABA0",
      "evtDate": "2026-09-22",
      "evtHPos": null,
      "evtValue": null,
      "isJustified": true,
      "justifReasonCode": "B",
      "justifReasonDesc": "Motivi di famiglia",
      "hoursAbsence": [],
      "webJustifStatus": 1
    }
  ]
}
```

**Codici evento:**

| Codice | Descrizione |
|---|---|
| `ABA0` | Assenza giornaliera |
| `ABR0` | Ingresso in ritardo |
| `ABR1` | Ingresso in ritardo breve |
| `ABU0` | Uscita anticipata (vedi `evtHPos` per l'ora di lezione) |

**Stato della giustificazione:** se `isJustified` è true l'evento è giustificato; altrimenti `webJustifStatus: 1` significa che una giustificazione è in attesa di approvazione; altrimenti è ancora da giustificare.

**Codici dei motivi di giustificazione:**

| Codice | Descrizione |
|---|---|
| `A` | Motivi di salute |
| `AC` | Motivi di salute + certificato medico |
| `B` | Motivi di famiglia |
| `C` | Altri motivi |
| `D` | Problemi di trasporto / traffico |

#### Giustificazione online

```
GET    /rest/w1/students/{studentId}/absences/librettowebconf
GET    /rest/w1/students/{studentId}/absences/librettoweb
POST   /rest/w1/students/{studentId}/absences/librettoweb
DELETE /rest/w1/students/{studentId}/absences/librettoweb/{id}
```

Risposta di `librettowebconf`:

```json
{
  "enableJustA": false,
  "enableJustR": false,
  "enableJustU": false,
  "numDaysStopA": 99,
  "numDaysStopR": 99,
  "numDaysStopU": 99,
  "otherInfo": [],
  "causals": [
    {"code": "A", "usercode": "A", "shortdesc": "Salute", "longdesc": "Motivi di salute"}
  ]
}
```

---

### Agenda

```
GET /rest/w1/students/{studentId}/agendav2/all/{dateFrom}/{dateTo}
GET /rest/w1/students/{studentId}/agendav2/{evtCode}/{dateFrom}/{dateTo}
```

Restituisce gli eventi dell'agenda (compiti assegnati, verifiche, promemoria) nell'intervallo di date dato. La seconda forma filtra per codice evento.

**Esempio:**
```
GET /rest/w1/students/{studentId}/agendav2/all/20260901/20261221
```

**Risposta:**

```json
{
  "agenda": [
    {
      "evtId": 630205,
      "evtCode": "AGNT",
      "evtDatetimeBegin": "2026-11-19T10:00:00+01:00",
      "evtDatetimeEnd": "2026-11-19T11:00:00+01:00",
      "isFullDay": false,
      "notes": "Verifica scritta di fisica",
      "authorName": "SURNAME NAME",
      "classDesc": "5A LICEO SCIENTIFICO",
      "subjectId": null,
      "subjectDesc": null,
      "homeworkId": null
    }
  ]
}
```

**Codici evento:**

| Codice | Descrizione |
|---|---|
| `AGNT` | Annotazione del docente |
| `AGHW` | Compito assegnato (`homeworkId` rimanda a [Compiti](#compiti)) |
| `AGCR` | Prenotazione aula |

---

### Lezioni

```
GET /rest/w1/students/{studentId}/lessons/{dateFrom}/{dateTo}
GET /rest/w1/students/{studentId}/lessons/{date}
GET /rest/w1/students/{studentId}/lessons/today
GET /rest/w1/students/{studentId}/lessons/subject/{subjectId}/{dateFrom}/{dateTo}
```

Restituisce le voci del registro delle lezioni.

**Esempio:**
```
GET /rest/w1/students/{studentId}/lessons/20260901/20270630
```

**Risposta:**

```json
{
  "lessons": [
    {
      "evtId": 26623458,
      "evtDate": "2026-10-21",
      "evtCode": "LSF0",
      "evtHPos": 1,
      "evtDuration": 1,
      "classDesc": "5A LICEO SCIENTIFICO",
      "authorName": "SURNAME NAME",
      "subjectId": 210068,
      "subjectCode": "ART",
      "subjectDesc": "DISEGNO E STORIA DELL'ARTE",
      "lessonType": "Lezione",
      "lessonArg": "Argomento della lezione"
    }
  ]
}
```

**Codici evento:**

| Codice | Descrizione |
|---|---|
| `LSF0` | Lezione normale |
| `LSC0` | Compresenza (es. docente di sostegno) |

**`lessonType`** è testo libero impostato dal docente. Visti: `Lezione`, `Compresenza`, `Prova pratica`, `Orientamento`, `Interrogazione`, `Compito in classe`, `Verifica scritta`, `Verifiche orali`, `Assemblea di istituto`, `Supplenza`.

**`evtHPos`**: numero dell'ora di lezione nella giornata (1 = prima ora, ecc.). Una lezione di due ore compare come due voci.

> `subjectCode` può essere `null` (visto per materie come Educazione civica): usa `subjectId` come chiave.

---

### Bacheca

> [!NOTE]
> Alcune scuole sembrano usare una bacheca diversa: in quel caso
> `/noticeboard` può restituire `items: []` mentre il sito mostra comunque
> degli avvisi, che vanno cercati in
> [`noticeboarduser/{studentId}/communications`](#comunicazioni).
> Il caso opposto è altrettanto comune: in account con `old_bacheca`
> `communications` è sempre vuoto e le circolari stanno in `/noticeboard`.

#### Elenco degli avvisi

```
GET /rest/w1/students/{studentId}/noticeboard
```

Restituisce l'elenco delle circolari e degli altri elementi della bacheca.

**Risposta:**

```json
{
  "items": [
    {
      "pubId": 40000001,
      "pubDT": "2026-10-21T16:01:14+02:00",
      "readStatus": true,
      "evtCode": "CF",
      "cntId": 14000001,
      "cntValidFrom": "2026-10-21",
      "cntValidTo": "2026-10-30",
      "cntValidInRange": true,
      "cntStatus": "active",
      "cntTitle": "CIRC. N. 110 - Titolo della circolare",
      "cntNum": "136",
      "cntCategory": "Circolare",
      "cntHasChanged": false,
      "cntHasAttach": true,
      "needJoin": false,
      "needReply": false,
      "needFile": false,
      "needSign": false,
      "evento_id": "14000001",
      "dinsert_allegato": "2026-10-21 16:01:13",
      "attachments": [
        {
          "fileName": "Circolare.pdf",
          "attachNum": 1
        }
      ]
    }
  ]
}
```

Valori di `evtCode` visti: `CF`, `CF_SDG`. Valori di `cntCategory` visti: `Circolare`, `Scuola/famiglia`.

#### Leggere un avviso (segna come letto + ottieni il contenuto)

```
POST /rest/w1/students/{studentId}/noticeboard/read/{evtCode}/{pubId}/101
POST /rest/w1/students/{studentId}/noticeboard/readmulti/{evtCode}/{pubId}/101
```

**Parametri del percorso presi dalla risposta dell'elenco:**
- `evtCode`: es. `CF`
- `pubId`: es. `40000001`
- `101`: costante usata sempre dal client web, significato sconosciuto

Body vuoto con `Content-Type: application/x-www-form-urlencoded`. Quando si risponde a un avviso (`needReply` / `needJoin`) il body è JSON.

**Risposta:**

```json
{
  "item": {
    "title": "136 - CIRC. N. 110 - Titolo della circolare",
    "text": "Testo del messaggio"
  },
  "reply": {
    "replJoin": false,
    "replText": null,
    "replFile": null,
    "replSign": null
  }
}
```

#### Scaricare un allegato

```
GET /rest/w1/students/{studentId}/noticeboard/attach/{evtCode}/{pubId}/{attachNum}
```

Risponde `302` con una `Location` verso un URL firmato temporaneo su `cdndoc.spaggiari.eu`; segui il redirect per ottenere il file binario.

---

#### Comunicazioni

```
GET /rest/w1/noticeboarduser/{studentId}/communications
GET /rest/w1/noticeboarduser/{studentId}/communications_minister
```

Restituisce le comunicazioni dirette allo studente, comprese quelle ministeriali.

> [!NOTE]
> Su alcune scuole la risposta è sempre `{"communications": []}`, anche
> se `/noticeboard` contiene avvisi.

**Risposta** (campi selezionati, dati sintetici):

```json
{
  "communications": [
    {
      "id": 1001,
      "titolo": "Avviso: Orario definitivo",
      "testo": "<p>Consultare l'allegato.</p>",
      "tipologia_desc": "News",
      "pubblicazione": "2026-10-09 16:04:00",
      "scadenza": "2027-01-15 13:49:00",
      "anno_scol": 2026,
      "n_allegati": 1,
      "attachment": [
        { "id": 2001, "descrizione": "Orario definitivo.pdf", "extension": "" }
      ]
    }
  ]
}
```

- `testo` può contenere HTML ed entità HTML.
- `attachment` ha nome singolare ma è un **array**.
- L'elenco può includere avvisi scaduti (`scadenza`) e record con `anno_scol` diversi.

#### Scaricare un allegato

```
GET /rest/w1/noticeboarduser/{studentId}/attachments/{schoolYear}/{communicationId}/{attachmentId}
```

| Parametro | Origine |
|---|---|
| `schoolYear` | `anno_scol` del record (non l'anno corrente) |
| `communicationId` | `id` della comunicazione |
| `attachmentId` | `attachment[].id` (non l'indice nell'array) |

La risposta è il file binario, non JSON; il nome file è in `attachment[].descrizione`.

---

### Didattica (Materiali)

```
GET /rest/w1/students/{studentId}/didactics
GET /rest/w1/students/{studentId}/didactics/item/{id}
```

Restituisce i materiali didattici condivisi dai docenti, organizzati in cartelle. L'endpoint `item` scarica una singola voce.

**Risposta:**

```json
{
  "didacticts": [
    {
      "teacherId": "A1234567",
      "teacherName": "SURNAME NAME",
      "teacherFirstName": "NAME",
      "teacherLastName": "SURNAME",
      "folders": [
        {
          "folderId": 10218873,
          "folderName": "Nome cartella",
          "lastShareDT": "2025-11-21T09:46:29+01:00",
          "contents": [
            {
              "contentId": 10218874,
              "contentName": "Nome contenuto",
              "objectId": 5844429,
              "objectType": "link",
              "shareDT": "2025-11-21T09:46:29+01:00"
            },
            {
              "contentId": 10218877,
              "contentName": "Nome file",
              "objectId": 5844431,
              "objectType": "file",
              "shareDT": "2025-11-21T09:46:29+01:00"
            }
          ]
        }
      ]
    }
  ]
}
```

> **Nota:** la chiave della risposta è `"didacticts"` (refuso dell'API originale). È `[]` quando non ci sono materiali.

**Valori di `objectType` (osservati):**

| Valore | Descrizione |
|---|---|
| `file` | File scaricabile |
| `link` | URL esterno |

---

### Compiti

```
GET /rest/w1/students/{studentId}/homeworks/index
```

**Risposta:**

```json
{
  "items": [
    {
      "evtId": 125021,
      "evtCode": "NEWDC",
      "teacherId": 1234567,
      "teacherName": "SURNAME NAME",
      "homeworkDesc": "Testo del compito",
      "homeworkDone": false,
      "homeworkMarkedDone": true,
      "assignmentDate": "2026-09-10",
      "assignmentTime": null,
      "expiryDate": "2026-09-14",
      "expiryTime": null,
      "studentAttachmentsAllowed": false,
      "subjectId": 210064,
      "subjectDesc": "LINGUA E LETTERATURA ITALIANA",
      "lastStudentMsg": null,
      "lastTeacherMsg": null,
      "newMessages": false,
      "teacherFiles": [],
      "teacherLinks": [],
      "studentFiles": [],
      "correctedFiles": []
    }
  ]
}
```

Azioni correlate (tutte sotto `/rest/w1/students/{studentId}/homeworks`):

| Metodo | Percorso |
|---|---|
| GET | `/downloadTeacherFile/{a}/{b}/{c}` |
| GET | `/downloadStudentFile/{a}/{b}/{c}` |
| POST | `/insertStudentMsg/{a}/{b}` |
| POST | `/uploadStudentFile/{a}/{b}` |
| POST | `/removeStudentFile/{a}/{b}/{c}` |
| POST | `/setTeacherMsgStatus/{a}/{b}` |

---

### Note

```
GET /rest/w1/students/{studentId}/notes/all/
POST /rest/w1/students/{studentId}/notes/{type}/read/{id}
```

Restituisce le note disciplinari per categoria. La `POST` ne segna una come letta.

**Risposta:**

```json
{
  "NTTE": [],
  "NTCL": [],
  "NTWN": [],
  "NTST": []
}
```

**Chiavi dei tipi di nota:**

| Chiave | Significato |
|---|---|
| `NTTE` | Annotazione del docente |
| `NTCL` | Nota disciplinare |
| `NTWN` | Richiamo |
| `NTST` | Sanzione disciplinare |

---

### Documenti

```
POST /rest/w1/students/{studentId}/documents
POST /rest/w1/students/{studentId}/documents/check/{hash}
POST /rest/w1/students/{studentId}/documents/read/{hash}
```

Restituisce le pagelle (scrutini) e altri documenti. Body vuoto. `read` restituisce il file binario.

**Risposta:**

```json
{
  "documents": [],
  "schoolReports": []
}
```

---

### Colloqui

I colloqui si trovano sotto `parents/{studentId}`.

```
GET /rest/w1/parents/{studentId}/talks/teachers
GET /rest/w1/parents/{studentId}/talks/getframes/{teacherId}/{dateFrom}/{dateTo}
GET /rest/w1/parents/{studentId}/talks/mytalks
GET /rest/w1/parents/{studentId}/overalltalks/list
```

**Risposta di `talks/teachers`:**

```json
{
  "teachers": [
    {
      "teacherId": 1234567,
      "teacherName": "SURNAME NAME",
      "subjects": [
        { "subjectId": 210068, "description": "DISEGNO E STORIA DELL'ARTE" }
      ],
      "hasOpenTalks": false
    }
  ]
}
```

**Risposta di `talks/getframes`** (`teacherId` è l'id numerico, senza il prefisso `A`):

```json
{
  "frames": [
    {
      "teacherId": 1234567,
      "frameId": 13404173,
      "frameHPos": 4,
      "frameDate": "2026-10-08",
      "framePlace": "a distanza",
      "frameTimeRange": "10:55 - 11:45",
      "frameTimeFrom": "10:55",
      "frameTimeTo": "11:45",
      "overallSlots": 5,
      "busySlotMask": 31,
      "busySlotFlags": "11111",
      "message": "",
      "freeSlotTimeRange": [
        { "pos": 5, "time": "11:35 - 11:45" }
      ]
    }
  ]
}
```

> `busySlotFlags` ha un carattere per slot (`1` occupato, `0` libero); `busySlotMask` è lo stesso valore come bitmask.

`mytalks` restituisce `{"talks": []}` e `overalltalks/list` restituisce `{"overallTalks": []}` quando sono vuoti.

Prenotazione e messaggi (tutti sotto `/rest/w1/parents/{studentId}`):

| Metodo | Percorso |
|---|---|
| GET | `/talks/teachersframes2/{dateFrom}/{dateTo}` |
| GET | `/talks/mytalks/{dateFrom}/{dateTo}` |
| POST | `/talks/book/{a}/{b}/{c}` |
| POST | `/talks/delete/{a}` |
| POST | `/talks/mymessage/{a}` |
| POST | `/talks/teachermessage/{a}` |
| GET | `/overalltalks/getframes/{a}/{b}` |
| POST | `/overalltalks/book/{a}/{b}/{c}/{d}` |
| POST | `/overalltalks/delete/{a}/{b}` |

---

### Pagamenti

```
GET /rest/w1/parents/{studentId}/pagoonline/payments
```

**Risposta:**

```json
{
  "items": [
    {
      "evtId": 39717,
      "evtType": "POL01",
      "schoolYear": 2025,
      "evtDesc": "Descrizione del pagamento",
      "evtAnn": "",
      "payReasonId": 36,
      "payReasonDesc": "Visite guidate e viaggi di istruzione",
      "partecipation": false,
      "cntHasAttach": false,
      "payPlan": [
        {
          "payId": 1394540,
          "amountDue": 27,
          "deadlineDate": "2026-04-07",
          "payExpired": false,
          "amountPaid": 27,
          "amountBonus": 0,
          "payDate": "2026-04-06",
          "payStatus": 8,
          "payKey": "...",
          "payIndex": 0,
          "payFile": true,
          "scuolapayEnabled": false
        }
      ]
    }
  ]
}
```

**Note:**
- `evtType`: `POL01` (gite / attività), `POL02` (contributi volontari / quote)
- L'elenco include pagamenti di anni scolastici precedenti: filtra su `schoolYear`
- Le rate non pagate hanno `payId: 0`, `payKey: null`, `payDate: null`

**Valori di `payStatus`:**

| Valore | Significato |
|---|---|
| `0`-`3` | Da pagare |
| `4`-`8` | Pagato |
| `9` | Rimborsato |
| `10` | Annullato |

Correlati (tutti sotto `/rest/w1/parents/{studentId}/pagoonline`):

| Metodo | Percorso |
|---|---|
| GET | `/downloadfile/{a}` |
| GET | `/downloadpayment/{a}/{b}` |
| GET | `/getprivacy` |
| POST | `/setprivacy` |
| POST | `/downloadfileprivacy/{a}` |

---

### Libri di testo

```
GET /rest/w1/students/{studentId}/schoolbooks/index
```

Restituisce l'elenco dei libri di testo adottati per il corso dello studente.

**Risposta:**

```json
{
  "schoolbooks": [
    {
      "courseId": 104,
      "courseDesc": "LICEO SCIENTIFICO",
      "books": [
        {
          "bookId": 181249,
          "isbnCode": "9788808564177",
          "title": "TITOLO DEL LIBRO",
          "subheading": "SOTTOTITOLO",
          "volume": "U",
          "author": "COGNOME AUTORE",
          "publisher": "EDITORE",
          "subjectDesc": "MATERIA",
          "price": 14.9,
          "toBuy": true,
          "newAdoption": false,
          "alreadyOwned": false,
          "alreadyInUse": true,
          "recommended": false,
          "recommendedFor": null,
          "coverUrl": null,
          "publisherUnlockCode": ""
        }
      ]
    }
  ]
}
```

---

### Altri endpoint

Risposte non ancora documentate. `{a}`, `{b}`, ... sono id posizionali.

**Studenti**

| Metodo | Percorso |
|---|---|
| GET | `/students/{id}/recoveries/list/{a}` |
| ? | `/students/{id}/newui-feedback` |

**Mensa**

| Metodo | Percorso |
|---|---|
| GET | `/canteenuser/{id}/options/{meal}` (`meal` vale `pranzo` di default) |
| GET | `/canteenuser/{id}/events/{a}/{b}/{c}` |
| POST | `/canteenuser/{id}/events/{a}/{b}` |
| GET | `/canteenuser/{id}/booking_state/{a}/{b}` |
| GET | `/canteenuser/{id}/profile/{meal}` |
| GET | `/canteenuser/{id}/menu/{meal}` |
| GET | `/canteenuser/{id}/summary_meals/{meal}` |
| GET | `/canteenuser/{id}/wallet` |
| GET | `/canteenuser/{id}/file_menu/{a}/{b}/{c}/{d}` |
| GET | `/canteenuser/{id}/download_file/{a}/{b}` |

**Appello**

| Metodo | Percorso |
|---|---|
| GET | `/rollcall/{id}/options/{a}` |
| GET | `/rollcall/{id}/events/{a}/{b}/{c}` |
| POST | `/rollcall/{id}/events/{a}` |
| PUT | `/rollcall/{id}/events/{a}/{b}` |
| DELETE | `/rollcall/{id}/events/{a}/{b}` |
| GET | `/rollcall/{id}/booking_state/{a}/{b}` |
| GET | `/rollcall/{id}/assets/{a}` (default `SPA1`) |

---

## Riferimento tipi di dato

### Formati di data / data e ora

| Formato | Esempio | Usato in |
|---|---|---|
| `YYYY-MM-DD` | `2026-10-24` | voti, assenze, lezioni, compiti, periodi |
| `YYYY-MM-DDTHH:MM:SS+HH:MM` | `2026-10-21T16:01:14+02:00` | agenda, bacheca, didattica |
| `YYYYMMDD` | `20260901` | parametri nei percorsi URL (agenda, lezioni, panoramica, assenze, colloqui) |

### Tipi di ID comuni

| Campo | Tipo | Esempio |
|---|---|---|
| ID numerico dello studente | intero (stringa in `whoami`) | `12345678` |
| Codice identificativo dello studente | stringa | `S12345678C` |
| ID docente in materie / didattica | stringa con prefisso `A` | `A1234567` |
| ID docente in compiti / colloqui | intero | `1234567` |
| ID materia | intero | `210068` |
| ID evento | intero | `630205` |

> Le collezioni vuote che normalmente sono oggetti (es. `periodAverages`) arrivano come `[]`, quindi controlla `Array.isArray` prima di leggere le chiavi.

### Particolarità da gestire

| Particolarità | Dove |
|---|---|
| Le collezioni vuote che normalmente sono oggetti arrivano come `[]` | `periodAverages`, `generalAverages` |
| `decimalValue: null` per i giudizi (`"ds"`, `"o"`) | voti, `latestGrades` della dashboard |
| `subjectCode: null` | lezioni, medie |
| ID docente con prefisso `A` (stringa) oppure numerico | materie / didattica contro compiti / colloqui |
| L'id dello studente è una stringa in `whoami`, un intero altrove | whoami |

---

## Contribuire

Hai trovato un nuovo endpoint? Hai notato un errore? PR e issue sono benvenute.

Quando aggiungi un nuovo endpoint, includi per favore:
- Il pattern completo dell'URL
- Cookie / autenticazione richiesti
- Almeno una risposta di esempio anonimizzata
- Note su eventuali casi limite osservati o campi non documentati
