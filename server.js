require('dotenv').config({ debug: false });
const http = require('http');
const url = require('url');
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SYSTEM_PROMPT = fs.readFileSync('./system-prompt.txt', 'utf8');
const INDEX_HTML = fs.readFileSync('./index.html', 'utf8');

let conversation = [{ role: 'system', content: SYSTEM_PROMPT }];

const colors = { cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m', bright: '\x1b[1m' };

http.createServer(async (req, res) => {
  // Read request body
  let body = '';
  req.on('data', chunk => body += chunk);
  await new Promise(resolve => req.on('end', resolve));
  
  const fullRequest = `${req.method} ${req.url}${body ? ` Body: ${body}` : ''}`;
  console.log(`${colors.cyan}${colors.bright}→ ${fullRequest}${colors.reset}`);
  
  // Serve index page
  if (req.url === '/') {
    res.end(INDEX_HTML);
    console.log(`${colors.green}  ← 200 text/html ${INDEX_HTML.substring(0, 60)}...${colors.reset}`);
    return;
  }
  
  // USER REQUEST → LLM
  const prompt = `Request: ${fullRequest}`;
  conversation.push({ role: 'user', content: prompt });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-2025-04-14', 
    messages: conversation
  });
  
  const reply = response.choices[0].message.content;
  conversation.push({ role: 'assistant', content: reply });
  
  // LLM → USER RESPONSE  
  const parsed = JSON.parse(reply);
  const status = parsed.statusCode || 200;
  const contentType = parsed.contentType || 'text/html';
  const responseBody = parsed.body;
  
  res.writeHead(status, { 'Content-Type': contentType });
  
  // Send response (stringify if JSON content type)
  if (contentType.includes('application/json')) {
    res.end(JSON.stringify(responseBody));
  } else {
    res.end(responseBody);
  }
  
  // Log response
  const bodyStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
  const truncated = bodyStr.replace(/\n/g, ' ').substring(0, 80) + (bodyStr.length > 80 ? '...' : '');
  console.log(`${colors.green}  ← ${colors.yellow}${status} ${colors.blue}${contentType}${colors.reset} ${truncated}`);
  
}).listen(3000, () => {
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  VOIDWARE DEMO - Any HTTP request becomes a ChatGPT conversation${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}Server running at http://localhost:3000/${colors.reset}\n`);
});