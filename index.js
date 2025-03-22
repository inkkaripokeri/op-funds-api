const express = require('express');
const puppeteer = require('puppeteer');  // Käytämme Puppeteeria

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/op-ilmasto', async (req, res) => {
    try {
        // Käynnistetään Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Avaa OP:n rahastosivun
        await page.goto('https://www.op.fi/henkiloasiakkaat/saastot-ja-sijoitukset/rahastot/kaikki-rahastot', {
            waitUntil: 'networkidle2', // Odottaa, että verkkosivun kaikki pyynnöt on ladattu
        });

        // Hae OP Ilmasto -rahaston arvo käyttäen valittua CSS-selainta
        const fundValue = await page.$eval(
            '#tab-panel-today > div > table > tbody > tr:nth-child(12) > td:nth-child(3)',  // CSS-Polku
            element => element.innerText.trim()  // Poimitaan arvon teksti
        );

        // Suljetaan selain
        await browser.close();

        // Palautetaan rahaston arvo JSON-muodossa
        res.json({
            fund: 'OP Ilmasto',
            value: fundValue
        });

    } catch (error) {
        console.error('Virhe tiedon hakemisessa:', error);
        res.status(500).json({ error: 'Tietojen haku epäonnistui.' });
    }
});

app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}`));
