// models/ArticleVector.js

const { DataTypes, Model } = require('sequelize');

class ArticleVector extends Model {}

module.exports = (sequelize) => {
    ArticleVector.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            content_vector: {
                type: DataTypes.JSON,
            },
            content: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            modelName: 'ArticleVector',
            tableName: 'article_vectors',
            timestamps: false,
        },
        {
            sequelize,
            modelName: 'ArticleVector',
            tableName: 'content',
            timestamps: false,
        }
    );

    return ArticleVector;
};
