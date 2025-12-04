const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;
const LEADERBOARD_FILE = './data/leaderboard.json';

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

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([], null, 2));
}

function readLeaderboard() {
    try {
        const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeLeaderboard(data) {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

function getTopScores(leaderboard, limit = 5) {
    return leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function sanitizeUsername(username) {
    return username
        .replace(/[<>\"\'&]/g, '')
        .substring(0, 20)
        .trim();
}

function updateScore(username, score) {
    const leaderboard = readLeaderboard();
    const sanitizedName = sanitizeUsername(username);
    const existingIndex = leaderboard.findIndex(
        entry => entry.username.toLowerCase() === sanitizedName.toLowerCase()
    );
    
    if (existingIndex >= 0) {
        if (score > leaderboard[existingIndex].score) {
            leaderboard[existingIndex].score = score;
            leaderboard[existingIndex].date = new Date().toISOString();
        }
    } else {
        leaderboard.push({
            username: sanitizedName,
            score: score,
            date: new Date().toISOString()
        });
    }
    
    writeLeaderboard(leaderboard);
    return getTopScores(leaderboard);
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

function handleAPI(req, res, parsedUrl) {
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
        const leaderboard = readLeaderboard();
        sendJSON(res, { leaderboard: getTopScores(leaderboard) });
        return true;
    }
    
    if (parsedUrl.pathname === '/api/score' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
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
                
                const topScores = updateScore(username, score);
                sendJSON(res, { success: true, leaderboard: topScores });
            } catch (e) {
                sendJSON(res, { error: 'Invalid request body' }, 400);
            }
        });
        return true;
    }
    
    return false;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    
    if (parsedUrl.pathname.startsWith('/api/')) {
        if (handleAPI(req, res, parsedUrl)) {
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Olè Game Server running at http://0.0.0.0:${PORT}`);
    console.log(`Server started at: ${new Date().toISOString()}`);
});
