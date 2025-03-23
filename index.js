const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/op-ilmasto', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://www.op.fi/henkiloasiakkaat/saastot-ja-sijoitukset/rahastot/kaikki-rahastot', {
            waitUntil: 'networkidle2', // Odottaa, että kaikki verkkopyynnöt on ladattu
        });

        // Odotetaan CSS-valitsinta, joka osoittaa oikeaan HTML-elementtiin
        await page.waitForSelector('#tab-panel-today > div > table > tbody > tr:nth-child(12) > td:nth-child(3)', { timeout: 10000 });

        // Hae OP Ilmasto -rahaston arvo
        const fundValue = await page.$eval(
            '#tab-panel-today > div > table > tbody > tr:nth-child(12) > td:nth-child(3)',
            element => element.innerText.trim()
        );

        // Tallennetaan kuvankaappaus verkkosivusta, jotta nähdään, mitä oikeasti näkyy
        await page.screenshot({ path: 'op-ilmasto-debug.png', fullPage: true });

        await browser.close();

        // Palautetaan JSON-vastaus, jos arvo löytyi
        res.json({
            fund: 'OP Ilmasto',
            value: fundValue
        });

    } catch (error) {
        console.error('Virhe tiedon hakemisessa:', error);
        res.status(500).json({ error: 'Tietojen haku epäonnistui. Tarkista sivun rakenne.' });
    }
});

app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}`));
