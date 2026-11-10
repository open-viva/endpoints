# ClasseViva Web API Docs

Documentazione non ufficiale, mantenuta dalla community, delle API REST di ClasseViva (Spaggiari) usate dal client web su `web.spaggiari.eu`.

> [!WARNING]
> Questa documentazione è il risultato di un'analisi indipendente. Non è affiliata, approvata né supportata da Spaggiari. Usala a tuo rischio e nel rispetto dei termini di servizio applicabili.

> [!IMPORTANT]
> se pensi di usare le API da una cdn o simili, devi configurare un cloudflare worker che faccia da proxy. vedi come configurarlo [qui](https://github.com/open-viva/endpoints/blob/main/worker/README.md).

Una descrizione OpenAPI 3.0 è disponibile in [`openapi.yaml`](https://github.com/open-viva/endpoints/blob/main/openapi.yaml).

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
  - [Recuperi](#recuperi)
  - [Colloqui](#colloqui)
  - [Pagamenti](#pagamenti)
  - [Libri di testo](#libri-di-testo)
  - [Feedback](#feedback)
  - [Mensa](#mensa)
  - [Appello (Attività extra)](#appello-attività-extra)
  - [Altri endpoint](#altri-endpoint)
- [Riferimento tipi di dato](#riferimento-tipi-di-dato)
  - [Particolarità da gestire](#particolarità-da-gestire)
- [Contribuire](#contribuire)

---

## URL di base

| Servizio       | URL di base                                                 |
| -------------- | ----------------------------------------------------------- |
| API REST       | `https://web.spaggiari.eu/rest/w1/`                         |
| CDN documenti  | `https://cdndoc.spaggiari.eu/`                              |
| Autenticazione | `https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php` |

`{studentId}` nei percorsi qui sotto è l'`id` numerico restituito da `whoami` (di solito il numero dopo la "S"), non il codice identificativo `S12345678C`.

> Le sezioni contrassegnate **(dal sorgente del client)** sono state ricostruite dai bundle JavaScript del client web, non da risposte catturate: percorsi, parametri e body delle richieste sono esatti, mentre le risposte elencano i campi che il client legge e possono essere incomplete.

---

## Autenticazione

### Login

```
POST https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd
```

**Campi del form** (application/x-www-form-urlencoded):

| Campo    | Descrizione                          |
| -------- | ------------------------------------ |
| `uid`    | Nome utente                          |
| `pwd`    | Password                             |
| `cid`    | Codice scuola (può essere vuoto)     |
| `pin`    | PIN (se impostato, altrimenti vuoto) |
| `target` | Può essere vuoto                     |

Esempio di body:

```
cid=&uid=USERNAME&pwd=PASSWORD&pin=&target=
```

**Risposta:**

```
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
- Il client web chiama `POST AuthApi4.php?a=aLoginSamPrep` (stesso body form `uid=<account scelto>`) prima di `aLoginSam`; risponde `{ "status": true, "error": ... }` **(dal sorgente del client)**.
- `actionRequested: "changePasswordDialog"` significa che la password è scaduta.
- Un 401 su qualsiasi chiamata REST significa che la sessione non è più valida.

Se il login riesce, il server imposta questi cookie, che vanno inviati in tutte le richieste successive:

| Cookie            | Descrizione                                   |
| ----------------- | --------------------------------------------- |
| `PHPSESSID`       | Token di sessione                             |
| `webidentity`     | Identificativo dell'account (`S{studentId}C`) |
| `webrole`         | Identificativo del ruolo (es. `gen`)          |
| `i18n_redirected` | Lingua (`it`)                                 |

---

## Endpoint

Tutti gli endpoint usano **GET** salvo diversa indicazione e richiedono i cookie di sessione descritti sopra. Le date nei percorsi sono `YYYYMMDD` (eccezione: [Mensa](#mensa) e [Appello](#appello-attività-extra), vedi le relative sezioni).

### Info utente

```
GET /rest/w1/misc/whoami
```

**Risposta:**

```
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
> `account_type`: `S` studente, `A` admin (il client web rimanda all'area admin), qualsiasi altro valore è un account genitore **(dal sorgente del client)**.

---

### Menu / Funzioni

```
GET /rest/w1/students/{studentId}/_functions
```

Restituisce quali sezioni la scuola ha abilitato, più le opzioni di interfaccia per sezione.

**Risposta:**

```
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

```
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

```
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

```
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

Gestione account **(dal sorgente del client)**:

```
POST /rest/w1/xauth/connect
POST /rest/w1/xauth/disconnect
POST /rest/w1/xauth/changepassword
```

Body (JSON) di `changepassword`:

```
{ "oldPass": "...", "newPass": "...", "newPassCpy": "..." }
```

> L'interfaccia web impone: almeno 10 caratteri, con una maiuscola, una minuscola, una cifra e un simbolo; `newPass` deve coincidere con `newPassCpy`.

---

### Dashboard

```
GET /rest/w1/students/{studentId}/dashboard
```

Tutto ciò che serve alla dashboard in una sola chiamata.

**Risposta:**

```
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

```
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

```
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

```
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
- I voti per competenze hanno un array `skills` con `displayValue`, `skillDesc`, `skillValueShortDesc`, `skillValueDesc` e `note` **(dal sorgente del client)**

---

### Medie

Restituisce la media generale e la media per materia.

```
GET /rest/w1/students/{studentId}/avg/
GET /rest/w1/students/{studentId}/avg/{subjectId}
```

**Risposta:**

```
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

```
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

| Codice | Descrizione                                             |
| ------ | ------------------------------------------------------- |
| `ABA0` | Assenza giornaliera                                     |
| `ABR0` | Ingresso in ritardo                                     |
| `ABR1` | Ingresso in ritardo breve                               |
| `ABU0` | Uscita anticipata (vedi `evtHPos` per l'ora di lezione) |

**Stato della giustificazione:** se `isJustified` è true l'evento è giustificato; altrimenti `webJustifStatus: 1` significa che una giustificazione è in attesa di approvazione; altrimenti è ancora da giustificare.

**Codici dei motivi di giustificazione:**

| Codice | Descrizione                           |
| ------ | ------------------------------------- |
| `A`    | Motivi di salute                      |
| `AC`   | Motivi di salute + certificato medico |
| `B`    | Motivi di famiglia                    |
| `C`    | Altri motivi                          |
| `D`    | Problemi di trasporto / traffico      |

#### Giustificazione online

```
GET    /rest/w1/students/{studentId}/absences/librettowebconf
GET    /rest/w1/students/{studentId}/absences/librettoweb
POST   /rest/w1/students/{studentId}/absences/librettoweb
PUT    /rest/w1/students/{studentId}/absences/librettoweb/{id}
DELETE /rest/w1/students/{studentId}/absences/librettoweb/{id}
```

Risposta di `librettowebconf`:

```
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

Altri campi che il client web legge da questo oggetto (può essere dentro `params[0]`) **(dal sorgente del client)**: `enableJustM` (interruttore generale), `autoApproveA/R/U` (nessuna approvazione del docente), `numDaysEditA/R/U` (giorni in cui la richiesta è ancora modificabile), `maxDaysFuture` (di quanti giorni in avanti si può giustificare), `maxPeriodDays` (durata massima di un'assenza su più giorni, default 15). Gli elementi di `otherInfo` sono `{ "id": 3, "desc": "..." }`.

**Body di `POST` / `PUT`** (JSON) **(dal sorgente del client)**:

```
{
  "evtType": 0,
  "causalCode": "A",
  "dateStart": "2026-11-09",
  "dateEnd": "2026-11-10",
  "reason": "Testo libero",
  "otherInfo": [{ "id": 3 }]
}
```

| Campo        | Descrizione                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `evtType`    | `0` assenza, `1` ritardo, `2` uscita anticipata                                                                |
| `causalCode` | `causals[].code` di `librettowebconf`                                                                          |
| `dateStart`  | `YYYY-MM-DD`                                                                                                   |
| `dateEnd`    | `YYYY-MM-DD`; per `evtType` 1 e 2 coincide con `dateStart` (intervalli su più giorni solo per le assenze)      |
| `reason`     | Testo libero, obbligatorio                                                                                     |
| `otherInfo`  | Array di `{ "id": n }` scelti da `librettowebconf.otherInfo`                                                   |
| `time`       | `HH:MM`, solo per `evtType` 1 e 2 (ora di ingresso / uscita)                                                   |
| `pickup`     | Nome di chi ritira lo studente, solo per `evtType` 2                                                           |
| `hPos`       | Ora di lezione, solo in `PUT` e se maggiore di 0                                                               |

`GET librettoweb` restituisce un array oppure `{ "events": [] }` (il client accetta entrambi). Gli elementi hanno i campi della richiesta più `evtId`, `evtDate`, `evtTime`, `isEditable`, `isDeletable`, `isRejected`, `rejectReason`, `rejectData`, `rejectAuthor`, `dinsert` (data di inserimento) e `authorType` (`G` genitore 1, `X` genitore 2, `S` studente).

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

```
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

| Codice | Descrizione                                                           |
| ------ | --------------------------------------------------------------------- |
| `AGNT` | Annotazione del docente                                               |
| `AGHW` | Compito assegnato (`homeworkId` rimanda a [Compiti](#compiti)) |
| `AGCR` | Prenotazione aula                                                     |

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

```
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

| Codice | Descrizione                           |
| ------ | ------------------------------------- |
| `LSF0` | Lezione normale                       |
| `LSC0` | Compresenza (es. docente di sostegno) |

**`lessonType`** è testo libero impostato dal docente. Visti: `Lezione`, `Compresenza`, `Prova pratica`, `Orientamento`, `Interrogazione`, `Compito in classe`, `Verifica scritta`, `Verifiche orali`, `Assemblea di istituto`, `Supplenza`.

**`evtHPos`** : numero dell'ora di lezione nella giornata (1 = prima ora, ecc.). Una lezione di due ore compare come due voci.

> `subjectCode` può essere `null` (visto per materie come Educazione civica): usa `subjectId` come chiave.

---

### Bacheca

#### Elenco degli avvisi

```
GET /rest/w1/students/{studentId}/noticeboard
```

Restituisce l'elenco delle circolari e degli altri elementi della bacheca.

**Risposta:**

```
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

**Body delle risposte** (JSON, una azione per chiamata, **dal sorgente del client**):

| Azione             | Body                                                          |
| ------------------ | ------------------------------------------------------------- |
| Adesione (`needJoin`)  | `{ "join": true }`                                        |
| Firma (`needSign`)  | `{ "sign": true }` per accettare, `{ "sign": false }` per rifiutare |
| Testo (`needReply`) | `{ "text": "..." }`                                          |
| File (`needFile`)  | `{ "file": "<base64>", "filename": "nome.ext" }` (l'interfaccia web limita i file a 2 MB) |

Dopo ogni azione il client ripete la chiamata senza body per ricaricare il dettaglio.

**Risposta:**

```
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

### Comunicazioni

```
GET /rest/w1/noticeboarduser/{studentId}/communications
GET /rest/w1/noticeboarduser/{studentId}/communications_minister
```

Restituisce le comunicazioni dirette allo studente, comprese quelle ministeriali.

**Risposta:**

```
{
  "communications": []
}
```

**Campi di una comunicazione** (letti dal client web, tipi non verificati) **(dal sorgente del client)**:

| Campo                                                                          | Descrizione                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `id`, `anno_scol`                                                              | Id della comunicazione e anno scolastico, usati come `{annoScol}` / `{communicationId}` qui sotto |
| `pubblicazione`, `scadenza`                                                    | Data di pubblicazione e di scadenza                                        |
| `tipologia_desc`, `tipologia_colore`                                           | Categoria e relativo colore                                                |
| `autore_nome`, `autore_cognome`                                                | Autore                                                                     |
| `risposta_conferma`, `risposta_adesione`, `risposta_testo`, `risposta_file`    | `1` quando il tipo di risposta è richiesto (accetto / adesione / testo / file) |
| `editable_response`                                                            | `0` quando la risposta non è più modificabile                              |
| `num_file_risposta`                                                            | Numero massimo di file di risposta                                         |
| `attachment[]`                                                                 | `{ id, descrizione, firma: { tipo_firma, da_firmare } }`; `tipo_firma` è `pv` (presa visione) o `fg` (firma grafica), `da_firmare: 1` significa che serve la firma |
| `response`                                                                     | `{ id, letto, conferma_lettura, conferma_motivazione, adesione, adesione_motivazione, testo_risposta, allegati_risposta[], documenti_firmati[] }`; `adesione` è `"1"` aderisco, `"0"` non aderisco, `"2"` preferisco non dirlo |

Gli elementi di `communications_minister` hanno `titoloComunicazione`, `sottotitoloComunicazione`, `contenutoComunicazione`, `urlNotizia`, `urlAnteprimaNotizia`, `labelUrl`, `dataInizioVisibilitaAccesso`, `dataFineVisibilitaAccesso` e `record_status`.

Azioni correlate (tutte sotto `/rest/w1/noticeboarduser/{studentId}`):

| Metodo | Percorso                                                              | Body                                                                                                                                  |
| ------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/attachments/{annoScol}/{communicationId}/{attachmentId}`            | file binario                                                                                                                          |
| POST   | `/response/{annoScol}/{communicationId}`                              | JSON con le sole chiavi richieste: `conferma_lettura` (`1`/`0`), `conferma_motivazione`, `adesione` (`1`/`0`/`2`), `adesione_motivazione`, `testo_risposta`. `{}` segna la comunicazione come letta |
| POST   | `/file_response/{annoScol}/{communicationId}`                         | multipart: `files[0]` = file, `payload` = JSON `{ "descrizione": "nome.ext", "risposta_id": <response.id>, "comunicazione_id": "<id>" }` |
| DELETE | `/file_response/{annoScol}/{communicationId}/{fileResponseId}`        |                                                                                                                                       |
| GET    | `/signature/{annoScol}/{communicationId}/{attachmentId}`              |                                                                                                                                       |
| POST   | `/signature/{annoScol}/{communicationId}/{attachmentId}/{type}`       | `type` = `pv` (nessun body) oppure `fg` (body `{ "base64Sign": "<immagine della firma disegnata>" }`)                                 |
| POST   | `/communication/{annoScol}/{communicationId}/signer`                  |                                                                                                                                       |

---

### Didattica (Materiali)

```
GET /rest/w1/students/{studentId}/didactics
GET /rest/w1/students/{studentId}/didactics/item/{id}
```

Restituisce i materiali didattici condivisi dai docenti, organizzati in cartelle. L'endpoint `item` scarica una singola voce.

**Risposta:**

```
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

| Valore | Descrizione      |
| ------ | ---------------- |
| `file` | File scaricabile |
| `link` | URL esterno      |

Il client web gestisce anche `text`.

---

### Compiti

```
GET /rest/w1/students/{studentId}/homeworks/index
```

**Risposta:**

```
{
  "items": [
    {
      "evtId": 125021,
      "evtCode": "NEWDC",
      "teacherId": 1234567,
      "teacherName": "SURNAME NAME",
      "homeworkDesc": "Testo del compito",
      "homeworkDone": false,
      "homeworkMarkedDone": false,
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

Azioni correlate (tutte sotto `/rest/w1/students/{studentId}/homeworks`; `{evtCode}` e `{evtId}` vengono dall'elemento dell'elenco) **(dal sorgente del client)**:

| Metodo | Percorso                                          | Body                                                       |
| ------ | ------------------------------------------------- | ---------------------------------------------------------- |
| GET    | `/downloadTeacherFile/{evtCode}/{evtId}/{fileId}` | file binario                                               |
| GET    | `/downloadStudentFile/{evtCode}/{evtId}/{fileId}` | file binario                                               |
| POST   | `/insertStudentMsg/{evtCode}/{evtId}`             | `{ "studentMsg": "..." }`                                  |
| POST   | `/uploadStudentFile/{evtCode}/{evtId}`            | `{ "filename": "nome.ext", "file": "<base64>" }` (un file per chiamata, base64 senza il prefisso `data:`) |
| POST   | `/removeStudentFile/{evtCode}/{evtId}/{fileId}`   |                                                            |
| POST   | `/setTeacherMsgStatus/{evtCode}/{evtId}`          | `{ "messageRead": true }`                                  |

#### Segna compito come fatto

```
POST https://web.spaggiari.eu/rest/w1/students/{studentId}/homeworks/setHomeworkMarkedDone/NEWDC/{evtId}
```

**Body:**

```
homeworkMarkedDone: true // or false
```

**Risposta**:

```
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
  "newMessages": true,
  "teacherFiles": [],
  "teacherLinks": [],
  "studentFiles": [],
  "correctedFiles": []
}
```

---

### Note

```
GET /rest/w1/students/{studentId}/notes/all/
POST /rest/w1/students/{studentId}/notes/{type}/read/{id}
```

Restituisce le note disciplinari per categoria. La `POST` ne segna una come letta (`{type}` è una delle chiavi qui sotto, `{id}` è l'`evtId` della nota).

**Risposta:**

```
{
  "NTTE": [],
  "NTCL": [],
  "NTWN": [],
  "NTST": []
}
```

**Chiavi dei tipi di nota:**

| Chiave | Significato             |
| ------ | ----------------------- |
| `NTTE` | Annotazione del docente |
| `NTCL` | Nota disciplinare       |
| `NTWN` | Richiamo                |
| `NTST` | Sanzione disciplinare   |

Campi letti dal client web: `evtId`, `evtDate`, `evtBegin`, `evtEnd`, `evtText`, `warningType`, `authorName`, `readStatus` (`false` = non letta) **(dal sorgente del client)**.

---

### Documenti

```
POST /rest/w1/students/{studentId}/documents
POST /rest/w1/students/{studentId}/documents/check/{hash}
POST /rest/w1/students/{studentId}/documents/read/{hash}
```

Restituisce le pagelle (scrutini) e altri documenti. Body vuoto. `read` restituisce il file binario.

**Risposta:**

```
{
  "documents": [],
  "schoolReports": []
}
```

`documents/check/{hash}` risponde `{ "document": { "available": true } }` **(dal sorgente del client)**.

---

### Recuperi

```
GET /rest/w1/students/{studentId}/recoveries/list/{session}
```

Restituisce i corsi / le prove di recupero di una sessione di scrutinio **(dal sorgente del client)**. `{session}` è `S1`, `S2`, `S3` oppure `SD` (scrutinio differito).

**Risposta:**

```
{
  "recoveries": [
    {
      "evento_id": "1",
      "materia_desc": "MATEMATICA",
      "recupero_descr": "Corso di recupero",
      "tipo_prova_descr": "Prova scritta",
      "argomento": "...",
      "nota_1": "",
      "nota_2": "",
      "esito_prova_descr": "",
      "grades": [{ "displayValue": "6", "color": "green" }],
      "adesione": null
    }
  ]
}
```

> `adesione`: `null` = non ancora scelto, `1` = aderito, `0` = non aderito. La forma sopra elenca i campi letti dal client; i valori sono d'esempio.
> Il client web non invia l'adesione al server: `postRecoveryAdhesion` è uno stub che restituisce `{ status: true }` senza nessuna chiamata di rete.

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

```
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

```
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

Prenotazione e messaggi (tutti sotto `/rest/w1/parents/{studentId}`) **(dal sorgente del client)**:

| Metodo | Percorso                                                          | Body                                                                                                   |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/talks/teachersframes2/{dateFrom}/{dateTo}`                      |                                                                                                        |
| GET    | `/talks/mytalks/{dateFrom}/{dateTo}`                              |                                                                                                        |
| POST   | `/talks/book/{teacherId}/{frameId}/{slotMask}`                    | `{ "cell": "...", "email": "...", "altro": "..." }`: `cell` ed `email` solo se la scuola li richiede, `altro` sempre (può essere vuoto); `slotMask` è la bitmask dello slot prenotato (`1` = primo slot) |
| POST   | `/talks/delete/{talkId}`                                          |                                                                                                        |
| POST   | `/talks/mymessage/{talkId}`                                       | `{ "myMsg": "..." }` (stringa vuota = elimina l'avviso)                                                |
| POST   | `/talks/teachermessage/{talkId}`                                  | `{ "messageRead": true }`                                                                              |
| GET    | `/overalltalks/getframes/{overallTalkId}/{teacherId}`             |                                                                                                        |
| POST   | `/overalltalks/book/{overallTalkId}/{teacherId}/{availabilityId}/{slotNumber}` | `{ "altro": "..." }` (`availabilityId` è l'`evtFrameId` dello slot)                       |
| POST   | `/overalltalks/delete/{overallTalkId}/{eventId}`                  |                                                                                                        |

Campi dei colloqui letti dal client web: `talkId`, `myMsg` (avviso del genitore), `teacherMsg`, `flagNewMsg` (messaggio del docente non letto), `flagMsgReadByTeacher`, `live_link` (URL del colloquio a distanza); colloqui generali: `overallTalkId`, `overallTalkDesc`, `evtFrameId`, `slotNumber`.

---

### Pagamenti

```
GET /rest/w1/parents/{studentId}/pagoonline/payments
```

**Risposta:**

```
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

| Valore  | Significato |
| ------- | ----------- |
| `0`-`3` | Da pagare   |
| `4`-`8` | Pagato      |
| `9`     | Rimborsato  |
| `10`    | Annullato   |

Correlati (tutti sotto `/rest/w1/parents/{studentId}/pagoonline`) **(dal sorgente del client)**:

| Metodo | Percorso                                | Note                                                     |
| ------ | --------------------------------------- | -------------------------------------------------------- |
| GET    | `/downloadfile/{attachId}`              | allegato dell'avviso (`attachments[].attachId`), binario |
| GET    | `/downloadpayment/{evtId}/{payKey}`     | avviso / ricevuta di pagamento, binario                  |
| GET    | `/getprivacy`                           |                                                          |
| POST   | `/setprivacy`                           | body sconosciuto (nessun chiamante nel client web)       |
| POST   | `/downloadfileprivacy/{fileId}`         | binario                                                  |

Il pagamento vero e proprio non passa dall'API: il client web rimanda a `https://www.istruzione.it/pagoinrete/`.

---

### Libri di testo

```
GET /rest/w1/students/{studentId}/schoolbooks/index
```

Restituisce l'elenco dei libri di testo adottati per il corso dello studente.

**Risposta:**

```
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

Il client web legge anche `classNotes` (note per la famiglia in HTML) da ogni corso **(dal sorgente del client)**.

---

### Feedback

```
GET  /rest/w1/students/{studentId}/newui-feedback
POST /rest/w1/students/{studentId}/newui-feedback
```

Valutazione e commenti sul portale web **(dal sorgente del client)**.

**Body di `POST`** (JSON, almeno uno dei due campi):

```
{ "comment": "Testo libero", "score": 4 }
```

- `score`: intero da `0` a `5`
- `comment`: al massimo 2000 caratteri

**Risposta** (entrambi i metodi):

```
{
  "score": { "score": 4 },
  "commentsLeft": 4,
  "comments": []
}
```

> `commentsLeft` parte da 5: è il numero di commenti che lo studente può ancora inviare.

---

### Mensa

Tutti i percorsi sono sotto `/rest/w1/canteenuser/{studentId}`. Le forme qui sotto sono **dal sorgente del client**.

`{canteenCode}` è `pranzo` (default) oppure `cena` (solo se `options.gestione_cena` è `1`). A differenza del resto dell'API, le date in questi percorsi sono `YYYY-MM-DD` (con i trattini).

| Metodo | Percorso                                                       | Descrizione                                              |
| ------ | -------------------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/options/{canteenCode}`                                       | Configurazione del servizio (vedi sotto)                 |
| GET    | `/events/{canteenCode}/{dateFrom}/{dateTo}`                    | `{ "events": [] }` calendario dell'intervallo            |
| POST   | `/events/{canteenCode}/{date}`                                 | Prenota, cambia scelta o disdici un pasto                |
| GET    | `/booking_state/{canteenCode}/{date}`                          | Cosa si può fare in quel giorno                          |
| GET    | `/profile/{canteenCode}`                                       | `{ "profile": [{ "opzioni": [] }] }` opzioni selezionabili |
| GET    | `/menu/{canteenCode}`                                          | Array di menù `[{ "code": "..." }]`                      |
| GET    | `/summary_meals/{canteenCode}`                                 | `{ "data": {} }` riepilogo dei buoni pasto               |
| GET    | `/wallet`                                                      | `{ "valore": 12.5 }` saldo del borsellino in EUR         |
| GET    | `/file_menu/{canteenCode}/{dateStart}/{dateStop}/{filterType}` | `{ "file_menu": [] }` file PDF dei menù                  |
| GET    | `/download_file/{canteenCode}/{fileId}`                        | PDF binario                                              |

**Body di `POST /events/{canteenCode}/{date}`** (prenotare, cambiare scelta e disdire sono la stessa chiamata):

```
{
  "evento_codice": "M",
  "id_pagamento": null,
  "menu": "",
  "opzione": ""
}
```

- `evento_codice`: il `scelte[].codice` scelto da `booking_state`. La disdetta usa la scelta il cui codice inizia con `MPA`.
- `id_pagamento`: `booking_state.contesto.id_pagamento`, oppure `null`.
- `menu`, `opzione`: `code` del menù e codice dell'opzione; stringa vuota se la scelta non mostra quel campo (`scelte[].campi.menu.visibile`, `scelte[].campi.opzione.visibile`).

**Risposta di `booking_state`:**

```
{
  "fase": "libero",
  "contesto": { "evento_codice": "", "menu": "", "opzione": "", "id_pagamento": null },
  "scelte": [
    {
      "codice": "M",
      "azione": "prenota",
      "visibile": true,
      "abilitata": true,
      "evento_prenotazione": "",
      "campi": { "menu": { "visibile": true }, "opzione": { "visibile": false } }
    }
  ],
  "popup": { "tipo": "avviso", "message": "", "ref": "" }
}
```

- `fase`: `libero` (non prenotato), `prenotato`, `confermato`.
- `popup.ref` spiega perché non si può prenotare: `avviso_ora` ora limite superata, `avviso` data fuori dalla finestra di prenotazione o giorno di chiusura, `sola_visualizzazione` pagina in sola consultazione, `no_prenotazione` giorno non previsto dal profilo mensa dello studente, `avviso_profilo` nessun profilo mensa assegnato, `avviso_profilo_no_prenotazione` profilo non abilitato alla prenotazione, `avviso_saldo_non_disponibile` buoni pasto o borsellino insufficienti, `studente_minorenne` possono prenotare solo gli studenti maggiorenni, `studente_non_abilitato` account non abilitato.

**`events[].evento_codice`:**

| Codice             | Significato                                |
| ------------------ | ------------------------------------------ |
| `v` / `s` / `f`    | Vacanza / giorno di scuola / festivo       |
| `M`, `MC`, `MTU`   | Mensa (`MC` cena, `MTU` turno mensa)       |
| `MPM`, `MPMC`      | Pasto in bianco (`MPMC` cena)              |
| `MP`, `MPC`        | Prenotazione (`MPC` cena)                  |
| `N`, `MD`, `MDC`   | No pasto / disdetto (`MDC` cena)           |
| `MPA`, `MPAC`      | Prenotazione annullata (`MPAC` cena)       |
| `-`                | Nessuna prenotazione                       |

Gli elementi di `events[]` hanno anche `stato_giorno` (`scuola`, `vacanza`, `festivo`), `menu` e `opzione`.

**Campi di `options`** (flag `0`/`1` salvo diversa indicazione): `current_date`, `current_time`, `inizio_anno`, `fine_anno` (limiti dell'anno scolastico), `gestione_cena` (cena abilitata), `profilo_disponibile`, `wallet_disponibile`, `sola_visualizzazione` (sola consultazione), `segremat_attivo`, `sgmt_addebito_prenotazione` (addebito al momento della prenotazione), `sgmt_scelta_opzione` / `sgmt_scelta_opzione_obb` (opzione selezionabile / obbligatoria), `cvv_paritarie`, `ora_prenotazione` (ora limite di prenotazione), `codice_tim`, `eventi_codice`.

**Campi di `summary_meals.data`:** `buoni_pasti_rimanenti` (o `saldo_buoni`) buoni residui, `totale_pasti` (o `pasti_consumati`) pasti utilizzati, `totale_buoni_pasto` buoni acquistati (se manca il client usa residui + utilizzati).

**`file_menu`:** `filterType` è `0` tutti (usa `1970-01-01` / `2099-12-31` oppure i limiti anno di `options`), `1` giorno singolo (`dateStop` = `dateStart`), `2` intervallo di date. Elementi: `id_evento` / `id_file`, `descrizione`, `file_name`, `file_path` (usato direttamente se è un URL assoluto), `note`, `data_start`, `data_stop`.

---

### Appello (Attività extra)

Tutti i percorsi sono sotto `/rest/w1/rollcall/{studentId}`. Le forme qui sotto sono **dal sorgente del client**. `{code}` è `SPA1` (default) oppure `SPA2`; le date in questi percorsi sono `YYYY-MM-DD`.

| Metodo | Percorso                                  | Descrizione                                             |
| ------ | ----------------------------------------- | ------------------------------------------------------- |
| GET    | `/options/{code}`                         | Configurazione (gli stessi flag di `options` della mensa, più `ora_prenotazione`, `inizio_anno`, `fine_anno`, `eventi_codice.tipologia`) |
| GET    | `/events/{code}/{dateFrom}/{dateTo}`      | `{ "events": [] }`                                      |
| POST   | `/events/{code}`                          | Prenota un'attività                                     |
| PUT    | `/events/{code}/{eventId}`                | Modifica una prenotazione                               |
| DELETE | `/events/{code}/{eventId}`                | Annulla una prenotazione (con body)                     |
| GET    | `/booking_state/{code}/{date}`            | Stessa forma del `booking_state` della mensa            |
| GET    | `/assets/{code}`                          | Risorse (codice di default `SPA1`)                      |

**Body di `POST` / `PUT`:**

```
{
  "evento_data": "2026-11-12",
  "evento_data_ora": "2026-11-12 08:00:00",
  "opzione_codice": "...",
  "evento_prenotazione": "PA1"
}
```

- `evento_prenotazione`: `PA1` per `SPA1`, `PA2` per `SPA2` (oppure `scelte[azione=prenota].evento_prenotazione` da `booking_state`).
- `PUT` aggiunge `"id": <eventId>` al body.
- `opzione_codice` viene da `GET /canteenuser/{studentId}/profile/attivita_1` (o `attivita_2`), campo `profile[0].opzioni`.

**Body di `DELETE`:** `{ "evento_prenotazione": "PA1" }` (preso dalla scelta di `booking_state` con `azione: "annulla"`).

**Campi di `events[]`:** la data è in `data`, `giorno` o `evento_data`; l'id in `id`, `id_evento`, `eventi.extra.id_evento` o `eventi.attivita.id_evento`; `evento_codice` (`ATT` / `SPA*` attività svolta, `PA*` prenotazione, `v` / `s` / `f` come nella mensa), `stato_giorno`.

---

### Altri endpoint

Fuori da `/rest/w1`, stessa origine (`https://web.spaggiari.eu`) e stessi cookie di sessione **(dal sorgente del client)**:

| Metodo | Percorso                                                                      | Descrizione                                                      |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/acc/app/default/me.fn.php?act=acEmailMsgFwdSwitch&flag_send_mail={0 o 1}`   | Disattiva (`0`) / attiva (`1`) l'inoltro dei messaggi scolastici via e-mail |

---

## Riferimento tipi di dato

### Formati di data / data e ora

| Formato                     | Esempio                     | Usato in                                                                    |
| --------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `YYYY-MM-DD`                | `2026-10-24`                | voti, assenze, lezioni, compiti, periodi, parametri URL di mensa e appello  |
| `YYYY-MM-DDTHH:MM:SS+HH:MM` | `2026-10-21T16:01:14+02:00` | agenda, bacheca, didattica                                                  |
| `YYYYMMDD`                  | `20260901`                  | parametri nei percorsi URL (agenda, lezioni, panoramica, assenze, colloqui) |

### Tipi di ID comuni

| Campo                                | Tipo                         | Esempio      |
| ------------------------------------ | ---------------------------- | ------------ |
| ID numerico dello studente           | intero (stringa in `whoami`) | `12345678`   |
| Codice identificativo dello studente | stringa                      | `S12345678C` |
| ID docente in materie / didattica    | stringa con prefisso `A`     | `A1234567`   |
| ID docente in compiti / colloqui     | intero                       | `1234567`    |
| ID materia                           | intero                       | `210068`     |
| ID evento                            | intero                       | `630205`     |

> Le collezioni vuote che normalmente sono oggetti (es. `periodAverages`) arrivano come `[]`, quindi controlla `Array.isArray` prima di leggere le chiavi.

### Particolarità da gestire

| Particolarità                                                       | Dove                                          |
| ------------------------------------------------------------------- | --------------------------------------------- |
| Le collezioni vuote che normalmente sono oggetti arrivano come `[]` | `periodAverages`, `generalAverages`           |
| `decimalValue: null` per i giudizi (`"ds"`, `"o"`)                  | voti, `latestGrades` della dashboard          |
| `subjectCode: null`                                                 | lezioni, medie                                |
| ID docente con prefisso `A` (stringa) oppure numerico               | materie / didattica contro compiti / colloqui |
| L'id dello studente è una stringa in `whoami`, un intero altrove    | whoami                                        |
| Date con i trattini (`YYYY-MM-DD`) invece di `YYYYMMDD` nei percorsi | mensa, appello                               |
| L'adesione ai recuperi non viene mai inviata dal client web         | recuperi                                      |

---

## Contribuire

Hai trovato un nuovo endpoint? Hai notato un errore? PR e issue sono benvenute.

Quando aggiungi un nuovo endpoint, includi per favore:

- Il pattern completo dell'URL
- Cookie / autenticazione richiesti
- Almeno una risposta di esempio anonimizzata
- Note su eventuali casi limite osservati o campi non documentati
