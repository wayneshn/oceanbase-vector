const dotenv = require('dotenv');

dotenv.config();

const { storeEmbedding } = require('./embedding');

async function fetchRepoContents(
    repo,
    path = '',
    branch = 'main',
    limit = 10000
) {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const accessToken = process.env.GITHUB_TOKEN;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });
    const data = await response.json();

    // If the path is a directory, recursively fetch the contents
    if (Array.isArray(data)) {
        let count = 0;
        const files = [];
        for (const item of data) {
            if (count >= limit) {
                break;
            }
            if (item.type === 'dir') {
                const dirFiles = await fetchRepoContents(
                    repo,
                    item.path,
                    branch,
                    limit - count
                );
                files.push(...dirFiles);
                count += dirFiles.length;
            } else if (item.type === 'file' && item.name.endsWith('.md')) {
                files.push(item);
                count++;
            }
        }
        return files;
    }

    return [];
}

/**
 * @param {RequestInfo | URL} url
 */
async function fetchFileContent(url) {
    const response = await fetch(url);
    const content = await response.text();
    return content;
}

// @ts-ignore
async function articleEmbedding(repo, path = '', branch, limit) {
    const contents = await fetchRepoContents(repo, path, branch, limit);
    console.log(contents.length);
    contents.forEach(async (item) => {
        const content = await fetchFileContent(item.download_url);
        await storeEmbedding(content);
    });
}

// articleEmbedding('oceanbase/oceanbase-doc', 'en-US', 'V4.1.0');

module.exports = articleEmbedding;
