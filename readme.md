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
## noticeboard (bacheca)
- **<code>POST</code> https://web.spaggiari.eu/sif/app/default/bacheca_personale.php**
#### how to request (example)
```
curl -X POST "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/" \
  -H "Cookie: PHPSESSID=xxxxxx; webrole=gen; webidentity=xxxxx" \
  --data-urlencode "action=get_comunicazioni" \
  --data-urlencode "cerca=" \ <-- dove appaiono le query di ricerca
  --data-urlencode "ncna=0" \ <-- non nascondere comunicazioni non attive
  --data-urlencode "tipo_com=" <-- tipo di comunicazione
```
##### understanding the comunication type
- tipo_com=1 -> Scuola/Famiglia
- tipo_com=2 -> Modulistica
- tipo_com=3 -> News
- tipo_com=4 -> Circolare
- tipo_com=docsdg -> Documenti SegreteriaDigitale

## absences
classeviva doesn't have a web api for absences, but it uses PHPSESSID, webidentity and webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/tic/app/default/consultasingolo.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/tic/app/default/consultasingolo.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
then scrape the html

## didattica
classeviva doesn't have a web api for didattica, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
then scrape the html

## colloqui
classeviva doesn't have a web api for colloqui, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/genitori_colloqui.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
then scrape the html
### colloqui generali
classeviva doesn't have a web api for colloqui generali, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/genitori_colloqui_generali.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
then scrape the html
## activity
classeviva doesn't have a web api for colloqui, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/attivita_studente.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/attivita_studente.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
then scrape the html

there are some other points that /attivita_studente.pphp calls:
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_stato_giorno&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_notifiche&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_note_disciplinari&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_annotazioni&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_lezioni&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_lezioni_extracurriculari&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_eventi_smart&data=date
- https://web.spaggiari.eu/fml/app/default/attivita_studente.php?a=get_eventi_smart_extracurriculari&data=date

## sportello
classeviva doesn't have a web api for sportello, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/alunni_sportello.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/alunni_sportello.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
and scrape the html

## class
classeviva doesn't have a web api for class, but it uses PHPSESSID, webidentity adn webrole.
so you will need a tool to scrape the html and export that data in a json.
- **<code>GET</code> https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php**
#### how to request (example)
```
curl -X GET "https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php" \
  -H "User-Agent: CVVS/std/4.1.7 Android/10" \
  -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
  -H "Origin: https://web.spaggiari.eu" \
  -H "Referer: https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php" \
  -b "PHPSESSID=xxxx; webrole=gen; webidentity=xxxx" \
```
and scrape the html

other points that regclasse_lezioni_xstudenti.php calls:
- https://web.spaggiari.eu/fml/app/default/regclasse_lezioni_xstudenti.php?action=loadLezioni&materia=IDMATERIA&autori_id=IDAUTORE
