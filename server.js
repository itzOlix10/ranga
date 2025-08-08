const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;
const SECRET = process.env.API_TOKEN || 'default_token';
const RIOT_API_KEY = process.env.RIOT_API_KEY || ''; // ustaw w Renderze

// Dane twojego konta
const VALO_NAME = '자폐성';
const VALO_TAG = 'Olix';

// Funkcja do pobierania danych z Riot API
async function getValorantRank() {
  try {
    // Pobieramy PUUID gracza
    const accountRes = await axios.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(VALO_NAME)}/${encodeURIComponent(VALO_TAG)}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );

    const puuid = accountRes.data.puuid;

    // Pobieramy MMR / rank
    const mmrRes = await axios.get(
      `https://ap.api.riotgames.com/val/ranked/v1/mmr/${puuid}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );

    const data = mmrRes.data;

    const rank = `${data.currenttierpatched}`; // np. "Diamond 2"
    const rr = `${data.ranking_in_tier}RR`; // np. 74RR
    // Statystyki meczów z tego aktu
    const wins = data.wins;
    const losses = data.number_of_games - wins;

    return { rank, rr, wins, losses, today: '+0RR', lastValue: '+0RR', lastBreakdown: '0/0/0', agent: '' };
  } catch (err) {
    console.error('Błąd pobierania danych:', err.response?.data || err.message);
    return null;
  }
}

// Funkcja formatująca wiadomość
function buildMessage({ rank, rr, wins, losses, today, lastValue, lastBreakdown, agent }) {
  const nickname = `${VALO_NAME}#${VALO_TAG}`;
  const bilans = `${wins}W/${losses}L`;
  const last = lastBreakdown ? `${lastValue} (${lastBreakdown} ${agent || ''})`.trim() : lastValue || '';
  return `${nickname} | ${rank} ${rr} | Bilans: ${bilans} | Dzisiaj: ${today} | Last: ${last}`;
}

app.get('/api/rank', async (req, res) => {
  if (req.query.token !== SECRET) return res.status(403).send('Forbidden');

  const stats = await getValorantRank();
  if (!stats) return res.status(500).send('Błąd pobierania danych z Riot API');

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(buildMessage(stats));
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
