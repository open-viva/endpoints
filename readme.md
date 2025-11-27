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
classeviva doesn't have an api for grades, but it uses PHPSESSID, webidentity and webrole.
so you will need a tool to scrape the html and export that data in a json.
see [grades](/grades/grades.js) example
