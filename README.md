# OceanBase Document Chatbot

This project is a document chatbot that uses AI to answer user queries with information from the OceanBase documentation. It leverages the power of OpenAI's Embedding API to transform user questions and document articles into vector representations, and then uses cosine similarity to find the most relevant article to a user's question. The chatbot then uses this article to generate a contextually appropriate answer.

## Features

-   Fetches OceanBase documentation from a GitHub repository
-   Transforms document articles into vector representations
-   Stores vectors in an OceanBase database
-   Retrieves the most relevant article for a user's question
-   Generates an answer using OpenAI's API

## Getting Started

### Prerequisites

-   Node.js
-   OceanBase database
-   OpenAI API key
-   GitHub access token

### Installation

1. Clone the repository:
2. Navigate into the project directory:
    ```
    cd oceanbase-vector
    ```
3. Install the dependencies:
    ```
    npm install
    ```
4. Create a `.env` file in the root directory and add your OpenAI API key, GitHub access token, and OceanBase database details:
    ```
    OPENAI_KEY=your-openai-key
    GITHUB_TOKEN=your-github-token
    ```
5. Run the server:
    ```
    node index.js
    ```

## Usage

The project exposes two main endpoints: `/train` and `/ask`.

-   **Training the model**: Send a POST request to the `/train` endpoint with the GitHub repository details (`repo`, `path`, `branch`, and `limit`) in the request body. This will fetch the documentation, transform it into vectors, and store these vectors in the database.

-   **Asking a question**: Send a POST request to the `/ask` endpoint with the user's question in the request body. This will find the most relevant article and generate an answer using OpenAI's API.
