const { embedArticle } = require('./embedding');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const ArticleVectorModel = require('../models/ArticleVector');
const _ = require('lodash');
dotenv.config();

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

async function getSimilarDoc(question) {
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
    const ArticleVector = ArticleVectorModel(sequelize);
    // get all rows in article_vector table
    const vectors = await ArticleVector.findAll();
    sequelize.close();
    // console.log(vectors[0]);

    // Calculate cosine similarity for each vector
    const embeddedQuestion = await embedArticle(question);

    // Calculate cosine similarity for each vector
    // Calculate cosine similarity for each vector
    const similarities = vectors.map((vector) => {
        const similarity = cosineSimilarity(
            embeddedQuestion,
            vector.content_vector
        );
        return {
            id: vector.id,
            content: vector.content,
            similarity: similarity,
        };
    });
    const mostSimilarDoc = _.orderBy(similarities, ['similarity'], ['desc'])[0];
    // console.log(mostSimilarDoc);
    return mostSimilarDoc;
}

async function askAI(question) {
    const mostSimilarDoc = await getSimilarDoc(question);
    const context = mostSimilarDoc.content;
    try {
        const result = await openai.createChatCompletion({
            model: process.env.MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are ${
                        process.env.DOC_OWNER || 'a'
                    } documentation assistant. You will be provided a reference docs article and a question, please answer the question based on the article provided. Please don't make up anything.`,
                },
                {
                    role: 'user',
                    content: `Here is an article related to the question: \n ${context} \n Answer this question: \n ${question}`,
                },
            ],
        });
        // get the answer
        const answer = result.data.choices[0].message.content;
        console.log(answer);
        return {
            answer: answer,
            docId: mostSimilarDoc.id,
        };
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

// Function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
    const dotProduct = _.sum(_.zipWith(vecA, vecB, (a, b) => a * b));
    const magnitudeA = Math.sqrt(_.sum(_.map(vecA, (a) => Math.pow(a, 2))));
    const magnitudeB = Math.sqrt(_.sum(_.map(vecB, (b) => Math.pow(b, 2))));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = askAI;
