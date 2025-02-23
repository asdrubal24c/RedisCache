import express from 'express';
import axios from 'axios';
import responseTime from 'response-time';
import { createClient } from 'redis';

const app = express();

const client = createClient({
    host: 'localhost',
    port: 6379
});

app.use(responseTime());

app.get('/characters', async (req, res) => {

    const reply = await client.get('characters');

    if (reply) return res.json(JSON.parse(reply));

    const { data } = await axios.get('https://rickandmortyapi.com/api/character')

    const saveResult = await client.set('characters', JSON.stringify(data));
    console.log('Data saved in Redis:', saveResult);

    return res.json(data);
});

app.get('/characters/:id', async (req, res) => {
    const { id } = req.params;

    const reply = await client.get(id)
        
    if (reply) return res.json(JSON.parse(reply));    

    const { data } = await axios.get(`https://rickandmortyapi.com/api/character/${id}`);

    await client.set(id, JSON.stringify(data));

    return res.json(data);
});

const main = async () => {
    try {
        await client.connect();
        app.listen(3000);
    } catch (error) {
    }
}

main()