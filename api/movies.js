export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
    try {
        const response = await fetch('https://heavstal.com.ng/api/v1/movies/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.HEAVSTAL_API_KEY 
            },
            body: JSON.stringify({ id: req.body.id })
        })
        const data = await response.json()
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch from Heavstal API', error: error.message });
    }
}
