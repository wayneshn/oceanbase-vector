const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

async function embedArticle(article) {
    // Create article embeddings using OpenAI
    try {
        const result = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: article,
        });
        // get the embedding
        const embedding = result.data.data[0].embedding;
        return embedding;
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

// Store an article embedding into database
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}
const ArticleVectorModel = require('../models/ArticleVector');
const ArticleVector = ArticleVectorModel(sequelize);
async function storeEmbedding(article) {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const articleVector = await ArticleVector.create({
            content_vector: await embedArticle(article),
            content: article,
        });
        console.log('New article vector created:', articleVector.id);
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = {
    storeEmbedding,
    embedArticle,
};
