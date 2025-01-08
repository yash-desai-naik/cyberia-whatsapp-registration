import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import webhookRoutes from './routes/webhook.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
