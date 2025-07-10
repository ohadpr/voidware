# Voidware

> **This app doesn't exist.** Voidware is a web server where any HTTP request becomes an LLM conversation. No endpoints, no database, no application logic - just AI responding to requests in real-time.

**Read more:** [Voidware: This App Doesn't Exist](https://www.ohad.com/2025/07/10/voidware/)

## How It Works

The entire server is ~50 lines of code that pipes HTTP requests to an LLM:

```javascript
const conversation = [{ role: 'system', content: SYSTEM_PROMPT }];

http.createServer(async (req, res) => {
  conversation.push({ role: 'user', content: `Request: ${req.method} ${req.url}` });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4', 
    messages: conversation
  });
  
  conversation.push({ role: 'assistant', content: response.choices[0].message.content });
  res.end(response.choices[0].message.content);
  
}).listen(3000);
```

The AI generates HTML, handles API calls, maintains state, and responds to any request - all without pre-written application code.

## Demo

https://github.com/user-attachments/assets/b4935c9b-2494-417f-9538-c0eb943b3ead

*Watch voidware build a todo app in real-time*

## Installation

### Prerequisites

- Node.js (v14+)
- OpenAI API key

### Setup

```bash
# Clone the repo
git clone https://github.com/ohadpr/voidware.git
cd voidware

# Install dependencies
npm install

# Add your OpenAI API key
echo "OPENAI_API_KEY=your_key_here" > .env

# Start the server
npm start
```

## Usage

### Create Applications in Your Browser

1. **Open http://localhost:3000** in your browser
2. **Generate an app** by visiting: `http://localhost:3000/?prompt=todo+list`
3. **Interact with the app** - click buttons, fill forms, navigate around
4. **Watch the server logs** to see HTTP requests being handled by AI in real-time

The AI will create a complete web application and handle all your interactions through the same conversational context.

### Example: Building a Todo List

1. Visit: `http://localhost:3000/?prompt=todo+list`
2. The AI generates a todo app with HTML, CSS, and JavaScript
3. Add some todos using the interface
4. Watch your server logs show the API calls being invented and handled

### Server Logs Show the Magic

```
→ GET /?prompt=todo+list
  ← 200 text/html <!DOCTYPE html><html>...

→ POST /api/todos Body: {"text":"Buy milk"}
  ← 201 application/json {"id":1,"text":"Buy milk","completed":false}

→ GET /api/todos
  ← 200 application/json [{"id":1,"text":"Buy milk","completed":false}]
```

The AI creates API endpoints that never existed and maintains state purely through conversation context.

### API Interaction (Advanced)

You can also interact directly with the generated APIs:

```bash
# The AI creates endpoints on demand
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Call mom"}'

# Data persists in AI conversation context
curl http://localhost:3000/api/todos
```

## What Can It Build?

Based on testing, voidware works well for:

- **Simple web apps**: Todo lists, basic forms, calculators
- **CRUD interfaces**: Add/edit/delete items with persistence via context
- **Interactive demos**: Apps that respond to user input

The persistence is remarkable - the AI remembers data across requests using only its conversation context. It works best for single-session demos and prototypes.

**Try it yourself and see what works!** The boundaries are still being discovered.

## Configuration

Edit `system-prompt.txt` to customize how the AI behaves. The prompt instructs the AI on response formats, HTTP codes, and consistency requirements.

Environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 3000)

## Limitations

- Single user at a time
- No persistent storage (data lives in AI context)
- Limited by OpenAI context window
- Response time depends on OpenAI API
- Experimental prototype, not production ready

## License

MIT License