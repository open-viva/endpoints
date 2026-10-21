# ClasseViva Web API Docs
Unofficial, community-maintained documentation of the ClasseViva (Spaggiari) REST API used by the web client at `web.spaggiari.eu`.

> [!WARNING]
> This documentation is the result of independent analysis.
> It is not affiliated with, endorsed by, or supported by Spaggiari.
> Use at your own risk and in compliance with applicable terms of service.

> [!IMPORTANT]
> if you're planning to use the API on cdn or similar,
> you must set up a cloudflare worker that acts as a proxy.
> see how to setup [here](./worker/README.md).

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [User Info](#user-info)
  - [Menu / Functions](#menu--functions)
  - [Periods](#periods)
  - [Student Card](#student-card)
  - [Portfolio](#portfolio)
  - [Dashboard](#dashboard)
  - [Daily Overview](#daily-overview)
  - [Subjects](#subjects)
  - [Grades](#grades)
  - [Average](#average)
  - [Absences](#absences)
  - [Agenda](#agenda)
  - [Lessons](#lessons)
  - [Noticeboard](#noticeboard)
  - [Communications](#communications)
  - [Didactics (Materials)](#didactics-materials)
  - [Homeworks](#homeworks)
  - [Notes](#notes)
  - [Documents](#documents)
  - [Talks (Colloqui)](#talks-colloqui)
  - [Payments](#payments)
  - [Schoolbooks](#schoolbooks)
  - [Other endpoints](#other-endpoints)
- [Data Types Reference](#data-types-reference)
- [Contributing](#contributing)

---

## Base URLs

| Service | Base URL |
|---|---|
| REST API | `https://web.spaggiari.eu/rest/w1/` |
| Document CDN | `https://cdndoc.spaggiari.eu/` |
| Auth | `https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php` |

`{studentId}` in the paths below is the numeric `id` returned by `whoami` (usally the codes after "S"), not the `S12345678C` ident code.

---

## Authentication

### Login

```
POST https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd
```

**Form fields** (application/x-www-form-urlencoded):

| Field | Description |
|---|---|
| `uid` | Username |
| `pwd` | Password |
| `cid` | School code (can be empty) |
| `pin` | PIN (if set, otherwise empty) |
| `target` | Can be empty |

Example body:

```
cid=&uid=USERNAME&pwd=PASSWORD&pin=&target=
```

**Response:**

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

**Notes:**
- Success is `data.auth.loggedIn === true`. Don't rely on `Set-Cookie` to detect it: if the request already carries a `PHPSESSID`, the server may not send a new one.
- `verified: true` with `loggedIn: false` means several accounts match and one must be chosen: `POST AuthApi4.php?a=aLoginSam` with `uid=<chosen account>`.
- `actionRequested: "changePasswordDialog"` means the password has expired.
- A 401 on any REST call means the session is no longer valid.

On success the server sets the following cookies, which must be sent on all subsequent requests:

| Cookie | Description |
|---|---|
| `PHPSESSID` | Session token |
| `webidentity` | Account ident (`S{studentId}C`) |
| `webrole` | Role identifier (e.g. `gen`) |
| `i18n_redirected` | Locale (`it`) |

---

## Endpoints

All endpoints use **GET** unless otherwise noted, and require the session cookies described above. Dates in paths are `YYYYMMDD`.

### User Info

```
GET /rest/w1/misc/whoami
```

**Response:**

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
  "data_nascita": "2011-01-01",
  "codice_fisc": "RSSMRA11A01H501X",
  "login_type": null,
  "last_login_at": null,
  "email": "mario.rossi@example.com",
  "schoolpass": "512345678"
}
```

> `id` is the numeric student ID used in all `/students/{id}/...` endpoints. `anno_scol` is the start year only (`"2026"` = 2026/27).

---

### Menu / Functions

```
GET /rest/w1/students/{studentId}/_functions
```

Returns which sections the school has enabled, plus per-section UI options.

**Response:**

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

**Function keys:** `dashboard`, `oas`, `old_bacheca`, `valutazioni`, `didattica`, `agenda`, `assenze`, `lezioni`, `note_disciplinari`, `colloqui`, `scrutini`, `pol`, `feedback`, `other`, `ap`.

> Options only control what the web UI shows. For example `opt:votiHideAverage` hides averages in the page, but `/avg/` still returns them.

---

### Periods

```
GET /rest/w1/students/{studentId}/periods
```

**Response:**

```json
{
  "periods": [
    { "periodCode": "Q1", "periodPos": 1, "periodDesc": "1° PERIODO", "periodLabel": "1° PERIODO", "isFinal": false, "dateStart": "2026-09-01", "dateEnd": "2026-12-04", "miurDivisionCode": null },
    { "periodCode": "Q3", "periodPos": 3, "periodDesc": "2° PERIODO", "periodLabel": "2° PERIODO", "isFinal": true, "dateStart": "2026-12-05", "dateEnd": "2027-06-08", "miurDivisionCode": null }
  ]
}
```

> `periodPos` is not sequential (1 and 3 with two periods).

---

### Student Card

```
GET /rest/w1/students/{studentId}/card
```

**Response:**

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
    "birthDate": "2011-01-01",
    "fiscalCode": "RSSMRA11A01H501X",
    "schCode": "PGXX0000",
    "schName": "ISTITUTO D'ISTRUZIONE SUPERIORE",
    "schDedication": "...",
    "schCity": "CITTA",
    "schProv": "PG"
  }
}
```

> `schName` and `schDedication` come padded with trailing spaces.

---

### Portfolio

```
GET /rest/w1/xauth/myportfolio
```

Returns the accounts linked to the login.

**Response:**

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
          "birthDate": "2011-01-01",
          "fiscalCode": "RSSMRA11A01H501X",
          "classDesc": "5A LICEO SCIENTIFICO",
          "schoolYY": 2026
        }
      }
    ]
  }
}
```

Account management: `POST /rest/w1/xauth/connect`, `POST /rest/w1/xauth/disconnect`, `POST /rest/w1/xauth/changepassword`.

---

### Dashboard

```
GET /rest/w1/students/{studentId}/dashboard
```

Everything the dashboard needs in one call.

**Response:**

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

> Each key has the same shape as its dedicated endpoint (`avg`, `grades26`, `absences/details`, `lessons`, `homeworks/index`).

---

### Daily Overview

```
GET /rest/w1/students/{studentId}/overview/all26/{dateFrom}/{dateTo}
```

Returns lessons, agenda, homework and notes for the given range (`YYYYMMDD`, usually a single day).

**Response:**

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

> `agenda` can contain items dated after the requested day. `homeworks` items have the same shape as in [Homeworks](#homeworks).

---

### Subjects

```
GET /rest/w1/students/{studentId}/subjects
```

**Response:**

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

> `teacherId` here has an `A` prefix. In homeworks and talks the teacher id is numeric only (`1234567`).

---

### Grades

```
GET /rest/w1/students/{studentId}/grades26
```

Returns all grades for the current school year.

**Response:**

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

**Notes:**
- The `26` suffix is not the school year: it is the same for 2025/26 and 2026/27.
- `evtPosition` format: `S{periodPos}_{componentPos}_{index}`
- `color`: `"green"` (≥6), `"yellow"` (~5-6), `"red"` (<5) - approximately
- `periodPos`: see [Periods](#periods)
- `componentPos`: `1` Scritto/Grafico, `2` Orale, `3` Pratico
- `decimalValue` is the raw numeric grade; `displayValue` is the formatted string (e.g. `"8½"` = 8.5)
- `weightFactor` is a percentage (`100` = weight 1)
- Grades in `/dashboard` (`latestGrades`) also include empty skill fields (`skillId`, `skillDesc`, `skillCode`, ...)

---

### Average

Returns global average and per-subject average.

```
GET /rest/w1/students/{studentId}/avg/
GET /rest/w1/students/{studentId}/avg/{subjectId}
```

**Response:**

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

**Notes:**
- `subjectAverages` is keyed by subject id.
- `periodAverages` and `generalAverages` are objects keyed `S{periodPos}`, or an empty array `[]` when there are no grades.
- `average` is `null` and `color` is `"orange"` when a subject has no grades.

---

### Absences

```
GET /rest/w1/students/{studentId}/absences/details/
GET /rest/w1/students/{studentId}/absences/details/{dateFrom}/{dateTo}
```

Returns all absence and delay events.

**Response:**

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

**Event codes:**

| Code | Description |
|---|---|
| `ABA0` | Full-day absence |
| `ABR0` | Late entry |
| `ABR1` | Short late entry |
| `ABU0` | Early exit (see `evtHPos` for lesson slot) |

**Justification state:** if `isJustified` is true the event is justified; otherwise `webJustifStatus: 1` means a justification is waiting for approval; otherwise it is still to justify.

**Justification reason codes:**

| Code | Description |
|---|---|
| `A` | Motivi di salute |
| `AC` | Motivi di salute + certificato medico |
| `B` | Motivi di famiglia |
| `C` | Altri motivi |
| `D` | Problemi di trasporto / traffico |

#### Online justification

```
GET    /rest/w1/students/{studentId}/absences/librettowebconf
GET    /rest/w1/students/{studentId}/absences/librettoweb
POST   /rest/w1/students/{studentId}/absences/librettoweb
DELETE /rest/w1/students/{studentId}/absences/librettoweb/{id}
```

`librettowebconf` response:

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

Returns agenda events (homework assignments, tests, reminders) in the given date range. The second form filters by event code.

**Example:**
```
GET /rest/w1/students/{studentId}/agendav2/all/20260901/20261221
```

**Response:**

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

**Event codes:**

| Code | Description |
|---|---|
| `AGNT` | Teacher annotation |
| `AGHW` | Assigned homework (`homeworkId` links to [Homeworks](#homeworks)) |
| `AGCR` | Classroom reservation |

---

### Lessons

```
GET /rest/w1/students/{studentId}/lessons/{dateFrom}/{dateTo}
GET /rest/w1/students/{studentId}/lessons/{date}
GET /rest/w1/students/{studentId}/lessons/today
GET /rest/w1/students/{studentId}/lessons/subject/{subjectId}/{dateFrom}/{dateTo}
```

Returns lesson log entries.

**Example:**
```
GET /rest/w1/students/{studentId}/lessons/20260901/20270630
```

**Response:**

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

**Event codes:**

| Code | Description |
|---|---|
| `LSF0` | Regular lesson |
| `LSC0` | Co-presence (compresenza, e.g. support teacher) |

**`lessonType`** is free text set by the teacher. Seen: `Lezione`, `Compresenza`, `Prova pratica`, `Orientamento`, `Interrogazione`, `Compito in classe`, `Verifica scritta`, `Verifiche orali`, `Assemblea di istituto`, `Supplenza`.

**`evtHPos`**: lesson slot number within the day (1 = first hour, etc.). A two-hour lesson appears as two entries.

---

### Noticeboard

#### List notices

```
GET /rest/w1/students/{studentId}/noticeboard
```

Returns the list of circular notices (circolari) and other board items.

**Response:**

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

`evtCode` values seen: `CF`, `CF_SDG`. `cntCategory` values seen: `Circolare`, `Scuola/famiglia`.

#### Read a notice (mark as read + get content)

```
POST /rest/w1/students/{studentId}/noticeboard/read/{evtCode}/{pubId}/101
POST /rest/w1/students/{studentId}/noticeboard/readmulti/{evtCode}/{pubId}/101
```

**Path params taken from the list response:**
- `evtCode`: e.g. `CF`
- `pubId`: e.g. `40000001`
- `101`: constant always used by the web client, meaning unknown

Empty body with `Content-Type: application/x-www-form-urlencoded`. When replying to a notice (`needReply` / `needJoin`) the body is JSON.

**Response:**

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

#### Download attachment

```
GET /rest/w1/students/{studentId}/noticeboard/attach/{evtCode}/{pubId}/{attachNum}
```

Answers `302` with a `Location` to a temporary signed URL on `cdndoc.spaggiari.eu`; follow the redirect to get the binary file.

---

### Communications

```
GET /rest/w1/noticeboarduser/{studentId}/communications
GET /rest/w1/noticeboarduser/{studentId}/communications_minister
```

Returns communications directed to the student, including ministerial ones.

**Response:**

```json
{
  "communications": []
}
```

Related actions (all under `/rest/w1/noticeboarduser/{studentId}`):

| Method | Path |
|---|---|
| GET | `/attachments/{a}/{b}/{c}` |
| POST | `/response/{a}/{b}` |
| POST | `/file_response/{a}/{b}` |
| DELETE | `/file_response/{a}/{b}/{c}` |
| GET | `/signature/{a}/{b}/{c}` |
| POST | `/signature/{a}/{b}/{c}/{d}` |
| POST | `/communication/{a}/{b}/signer` |

---

### Didactics (Materials)

```
GET /rest/w1/students/{studentId}/didactics
GET /rest/w1/students/{studentId}/didactics/item/{id}
```

Returns teaching materials shared by teachers, organized in folders. The `item` endpoint downloads one entry.

**Response:**

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

> **Note:** The response key is `"didacticts"` (typo in the original API). It is `[]` when there is no material.

**`objectType` values (observed):**

| Value | Description |
|---|---|
| `file` | Downloadable file |
| `link` | External URL |

---

### Homeworks

```
GET /rest/w1/students/{studentId}/homeworks/index
```

**Response:**

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

Related actions (all under `/rest/w1/students/{studentId}/homeworks`):

| Method | Path |
|---|---|
| GET | `/downloadTeacherFile/{a}/{b}/{c}` |
| GET | `/downloadStudentFile/{a}/{b}/{c}` |
| POST | `/insertStudentMsg/{a}/{b}` |
| POST | `/uploadStudentFile/{a}/{b}` |
| POST | `/removeStudentFile/{a}/{b}/{c}` |
| POST | `/setTeacherMsgStatus/{a}/{b}` |

---

### Notes

```
GET /rest/w1/students/{studentId}/notes/all/
POST /rest/w1/students/{studentId}/notes/{type}/read/{id}
```

Returns disciplinary notes by category. The `POST` marks one as read.

**Response:**

```json
{
  "NTTE": [],
  "NTCL": [],
  "NTWN": [],
  "NTST": []
}
```

**Note type keys:**

| Key | Meaning |
|---|---|
| `NTTE` | Teacher annotation |
| `NTCL` | Disciplinary note |
| `NTWN` | Warning (richiamo) |
| `NTST` | Disciplinary sanction |

---

### Documents

```
POST /rest/w1/students/{studentId}/documents
POST /rest/w1/students/{studentId}/documents/check/{hash}
POST /rest/w1/students/{studentId}/documents/read/{hash}
```

Returns school reports (scrutini) and other documents. Empty body. `read` returns the binary file.

**Response:**

```json
{
  "documents": [],
  "schoolReports": []
}
```

---

### Talks (Colloqui)

Talks live under `parents/{studentId}`.

```
GET /rest/w1/parents/{studentId}/talks/teachers
GET /rest/w1/parents/{studentId}/talks/getframes/{teacherId}/{dateFrom}/{dateTo}
GET /rest/w1/parents/{studentId}/talks/mytalks
GET /rest/w1/parents/{studentId}/overalltalks/list
```

**`talks/teachers` response:**

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

**`talks/getframes` response** (`teacherId` is the numeric id, without the `A` prefix):

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

> `busySlotFlags` has one character per slot (`1` busy, `0` free); `busySlotMask` is the same as a bitmask.

`mytalks` returns `{"talks": []}` and `overalltalks/list` returns `{"overallTalks": []}` when empty.

Booking and messaging (all under `/rest/w1/parents/{studentId}`):

| Method | Path |
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

### Payments

```
GET /rest/w1/parents/{studentId}/pagoonline/payments
```

**Response:**

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

**Notes:**
- `evtType`: `POL01` (trips / activities), `POL02` (voluntary contributions / fees)
- The list includes payments from previous school years: filter on `schoolYear`
- Unpaid installments have `payId: 0`, `payKey: null`, `payDate: null`

**`payStatus` values:**

| Value | Meaning |
|---|---|
| `0`-`3` | To pay |
| `4`-`8` | Paid |
| `9` | Refunded |
| `10` | Cancelled |

Related (all under `/rest/w1/parents/{studentId}/pagoonline`):

| Method | Path |
|---|---|
| GET | `/downloadfile/{a}` |
| GET | `/downloadpayment/{a}/{b}` |
| GET | `/getprivacy` |
| POST | `/setprivacy` |
| POST | `/downloadfileprivacy/{a}` |

---

### Schoolbooks

```
GET /rest/w1/students/{studentId}/schoolbooks/index
```

Returns the list of adopted textbooks for the student's course.

**Response:**

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

### Other endpoints

Responses not documented yet. `{a}`, `{b}`, ... are positional ids.

**Students**

| Method | Path |
|---|---|
| GET | `/students/{id}/recoveries/list/{a}` |
| ? | `/students/{id}/newui-feedback` |

**Canteen**

| Method | Path |
|---|---|
| GET | `/canteenuser/{id}/options/{meal}` (`meal` defaults to `pranzo`) |
| GET | `/canteenuser/{id}/events/{a}/{b}/{c}` |
| POST | `/canteenuser/{id}/events/{a}/{b}` |
| GET | `/canteenuser/{id}/booking_state/{a}/{b}` |
| GET | `/canteenuser/{id}/profile/{meal}` |
| GET | `/canteenuser/{id}/menu/{meal}` |
| GET | `/canteenuser/{id}/summary_meals/{meal}` |
| GET | `/canteenuser/{id}/wallet` |
| GET | `/canteenuser/{id}/file_menu/{a}/{b}/{c}/{d}` |
| GET | `/canteenuser/{id}/download_file/{a}/{b}` |

**Roll call**

| Method | Path |
|---|---|
| GET | `/rollcall/{id}/options/{a}` |
| GET | `/rollcall/{id}/events/{a}/{b}/{c}` |
| POST | `/rollcall/{id}/events/{a}` |
| PUT | `/rollcall/{id}/events/{a}/{b}` |
| DELETE | `/rollcall/{id}/events/{a}/{b}` |
| GET | `/rollcall/{id}/booking_state/{a}/{b}` |
| GET | `/rollcall/{id}/assets/{a}` (default `SPA1`) |

---

## Data Types Reference

### Date / DateTime formats

| Format | Example | Used in |
|---|---|---|
| `YYYY-MM-DD` | `2026-10-24` | grades, absences, lessons, homeworks, periods |
| `YYYY-MM-DDTHH:MM:SS+HH:MM` | `2026-10-21T16:01:14+02:00` | agenda, noticeboard, didactics |
| `YYYYMMDD` | `20260901` | URL path params (agenda, lessons, overview, absences, talks) |

### Common ID types

| Field | Type | Example |
|---|---|---|
| Student numeric ID | integer (string in `whoami`) | `12345678` |
| Student identity code | string | `S12345678C` |
| Teacher ID in subjects / didactics | string with `A` prefix | `A1234567` |
| Teacher ID in homeworks / talks | integer | `1234567` |
| Subject ID | integer | `210068` |
| Event ID | integer | `630205` |

> Empty collections that are normally objects (e.g. `periodAverages`) come back as `[]`, so check `Array.isArray` before reading keys.

---

## Contributing

Found a new endpoint? Spotted an error? PRs and issues welcome.

When adding a new endpoint, please include:
- Full URL pattern
- Required cookies / auth
- At least one sanitized example response
- Notes on any observed edge cases or undocumented fields
