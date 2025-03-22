const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/op-ilmasto', async (req, res) => {
    try {
        const url = 'https://www.op.fi/henkiloasiakkaat/saastot-ja-sijoitukset/rahastot/kaikki-rahastot';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let fundDetails = {};
        $('div.fund-card').each((_, element) => {
            const title = $(element).find('.fund-name').text().trim();
            const value = $(element).find('.fund-value').text().trim();

            if (title.includes('OP-Ilmasto')) {
                fundDetails = { name: title, value: value };
            }
        });

        res.json(fundDetails);  // Palauttaa rahastotiedot JSON-muodossa
    } catch (error) {
        res.status(500).json({ error: 'Tietojen haku epäonnistui' });
    }
});

app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}`));
