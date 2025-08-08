const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;

const VALO_NAME = '자폐성';
const VALO_TAG = 'Olix';
const VALO_REGION = 'eu'; // podaj region swojego konta Valorant

// Formatowanie wiadomości na czat
function buildMessage(data) {
  if (!data || !data.data) return 'Brak danych o rankingu';

  const mmr = data.data.currenttierpatched;    // np. "Diamond 2"
  const rr = data.data.ranking_in_tier;        // np. 74
  const wins = data.data.wins;
  const losses = data.data.losses;

  return `${VALO_NAME}#${VALO_TAG} | ${mmr} ${rr}RR | Bilans: ${wins}W/${losses}L`;
}

app.get('/api/rank', async (req, res) => {
  try {
    const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/mmr/${VALO_REGION}/${encodeURIComponent(VALO_NAME)}/${encodeURIComponent(VALO_TAG)}`);

    const message = buildMessage(response.data);
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(message);
  } catch (err) {
    console.error('Błąd pobierania z HenrikDev:', err.message);
    res.status(500).send('Błąd pobierania danych');
  }
});

app.listen(port, () => {
  console.log(`API działa na porcie ${port}`);
});
