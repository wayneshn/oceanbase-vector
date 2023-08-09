const express = require('express');
const app = express();
const db = require('./models');
app.use(express.json());
const articleEmbedding = require('./embeddings/trainDocs');
const askAI = require('./embeddings/askDocs');
app.post('/train', async (req, res, next) => {
    try {
        await articleEmbedding(
            req.body.repo,
            req.body.path,
            req.body.branch,
            req.body.limit
        );
        res.json({
            status: 'Success',
            message: 'Docs trained successfully.',
        });
    } catch (e) {
        next(e); // Pass the error to the error handling middleware
    }
});

app.post('/ask', async (req, res, next) => {
    try {
        const answer = await askAI(req.body.question);
        res.json({
            status: 'Success',
            answer: answer.answer,
            docId: answer.docId,
        });
    } catch (e) {
        next(e); // Pass the error to the error handling middleware
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).json({
        status: 'Failed',
        message: err.message,
    });
});

db.sequelize.sync().then((req) => {
    app.listen(3000, () => {
        console.log('Server running at port 3000...');
    });
});
