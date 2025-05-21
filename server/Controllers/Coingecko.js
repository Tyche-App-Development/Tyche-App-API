import https from 'https';

export const getCoinDetails = (req, res) => {
    const coinId = req.params.id.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;

    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const json = JSON.parse(data);

                const result = {
                    name: json.name,
                    symbol: json.symbol,
                    rank: json.market_cap_rank,
                    market_cap_usd: json.market_data.market_cap.eur,
                    circulating_supply: json.market_data.circulating_supply,
                    all_time_high: json.market_data.ath.usd,
                    all_time_low: json.market_data.atl.usd,
                    issue_date: json.genesis_date
                };

                res.json({ coin: result });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Failed to parse data or invalid coin ID', error: err.message });
            }
        });

    }).on('error', (err) => {
        console.error(err);
        res.status(500).json({ message: 'Request failed', error: err.message });
    });
};
