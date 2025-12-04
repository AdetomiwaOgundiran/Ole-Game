const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('Database pool error:', err.message);
});

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                username VARCHAR(20) NOT NULL UNIQUE,
                score INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

async function getTopScores(limit = 5) {
    try {
        const result = await pool.query(
            'SELECT username, score, updated_at as date FROM leaderboard ORDER BY score DESC LIMIT $1',
            [limit]
        );
        return result.rows;
    } catch (err) {
        console.error('Error getting leaderboard:', err);
        return [];
    }
}

function sanitizeUsername(username) {
    return username
        .replace(/[<>\"\'&]/g, '')
        .substring(0, 20)
        .trim();
}

async function updateScore(username, score) {
    const sanitizedName = sanitizeUsername(username);
    
    try {
        const existing = await pool.query(
            'SELECT score FROM leaderboard WHERE LOWER(username) = LOWER($1)',
            [sanitizedName]
        );
        
        if (existing.rows.length > 0) {
            if (score > existing.rows[0].score) {
                await pool.query(
                    'UPDATE leaderboard SET score = $1, updated_at = CURRENT_TIMESTAMP WHERE LOWER(username) = LOWER($2)',
                    [score, sanitizedName]
                );
            }
        } else {
            await pool.query(
                'INSERT INTO leaderboard (username, score) VALUES ($1, $2)',
                [sanitizedName, score]
            );
        }
        
        return await getTopScores();
    } catch (err) {
        console.error('Error updating score:', err);
        return await getTopScores();
    }
}

function sendJSON(res, data, status = 200) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

async function handleAPI(req, res, parsedUrl) {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return true;
    }
    
    if (parsedUrl.pathname === '/api/leaderboard' && req.method === 'GET') {
        const leaderboard = await getTopScores();
        sendJSON(res, { leaderboard });
        return true;
    }
    
    if (parsedUrl.pathname === '/api/score' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                let username = (data.username || '').trim();
                const score = parseInt(data.score, 10);
                
                if (!username || username.length === 0) {
                    sendJSON(res, { error: 'Username is required' }, 400);
                    return;
                }
                
                username = sanitizeUsername(username);
                
                if (username.length === 0) {
                    sendJSON(res, { error: 'Invalid username' }, 400);
                    return;
                }
                
                if (isNaN(score) || score < 0) {
                    sendJSON(res, { error: 'Invalid score' }, 400);
                    return;
                }
                
                const topScores = await updateScore(username, score);
                sendJSON(res, { success: true, leaderboard: topScores });
            } catch (e) {
                sendJSON(res, { error: 'Invalid request body' }, 400);
            }
        });
        return true;
    }
    
    return false;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);
    
    if (parsedUrl.pathname.startsWith('/api/')) {
        if (await handleAPI(req, res, parsedUrl)) {
            return;
        }
    }
    
    let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    filePath = '.' + filePath;
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            const etag = crypto.createHash('md5').update(content).digest('hex');
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': 'Thu, 01 Jan 1970 00:00:00 GMT',
                'ETag': etag,
                'Last-Modified': new Date().toUTCString(),
                'Surrogate-Control': 'no-store',
                'Vary': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

initDatabase().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Olè Game Server running at http://0.0.0.0:${PORT}`);
        console.log(`Server started at: ${new Date().toISOString()}`);
        console.log('Using PostgreSQL database for leaderboard storage');
    });
});
