import axios from "axios";
import cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export async function getVotes(username, password) {
    const jar = new CookieJar();
    const client = wrapper(
        axios.create({
            baseURL: "https://web.spaggiari.eu",
            jar,
            withCredentials: true
        })
    );

    const loginRes = await client.post(
        "/auth-p7/app/default/AuthApi.php?a=login",
        new URLSearchParams({
            uid: username,
            pwd: password
        }).toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0"
            }
        }
    );

    if (!loginRes.data || loginRes.data.status !== "ok") {
        throw new Error("Credenziali sbagliate o login fallito.");
    }


    const votiPage = await client.get("/cvv/app/default/genitori_voti.php", {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    const html = votiPage.data;
    const $ = cheerio.load(html);

    const results = [];

    $("tr.riga_materia_componente").each((i, row) => {
        const subject = $(row).find(".materia_desc").text().trim();

        $(row).find("td.cella_voto").each((j, cell) => {
            const date = $(cell).find(".voto_data").text().trim();
            const value = $(cell).find(".s_reg_testo").text().trim();
            const type = $(cell).find("div[title]").attr("title");

            if (value) {
                results.push({
                    subject,
                    date,
                    value,
                    type
                });
            }
        });
    });

    return results;
}
