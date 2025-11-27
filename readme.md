# classeviva's web endpoints
endpoint found when reverse engineering classeviva's web frontend.

## access
- **<code>POST</code> https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd**
#### how to request (example)
```
curl -X POST "https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -d "cid=&uid=STUDENTID&pwd=PASSWORD&pin=&target="
```
## get access to grades
classeviva doesn't have a web api for grades, but it uses PHPSESSID, webidentity and webrole.
so you will need a tool to scrape the html and export that data in a json.
see [grades](/grades/grades.js) example

## calendar
- **<code>POST</code> https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events**
#### how to request (example)
```
curl -X POST "https://web.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/fml/app/default/agenda_studenti.php" \
  -b "PHPSESSID=xxx; webrole=gen; webidentity=xxx" \
  --data "anno_scolastico=xxxx&mese=xx&classe_id=xxx&gruppo_id=&nascondi_av=x&start=xxx&end=xxx"
```
