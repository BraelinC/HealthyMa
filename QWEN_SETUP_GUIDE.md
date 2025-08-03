# Qwen 3 Coder CLI Setup Guide

## Quick Start (Recommended)

I've created a simple CLI interface that uses the Hugging Face API for easy setup without downloading large models.

### 1. Get a Hugging Face Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name like "Qwen3 CLI"
4. Select "Read" permissions
5. Click "Generate a token"
6. Copy the token

### 2. Set Environment Variable

```bash
export HUGGINGFACE_TOKEN='your_token_here'
```

### 3. Use the CLI

```bash
# Basic usage
python3 qwen3_simple_cli.py "Your coding question"

# Examples
python3 qwen3_simple_cli.py "Write a Python function to calculate fibonacci numbers"
python3 qwen3_simple_cli.py "Create a React component for a todo list"
python3 qwen3_simple_cli.py "Debug this JavaScript code: console.log(undefined.length)"
python3 qwen3_simple_cli.py "How do I set up a REST API with Express.js?"
```

## Advanced Setup (Local Model)

If you want to run Qwen 3 Coder locally (requires more resources):

### 1. Install Dependencies

```bash
pip install transformers torch accelerate tiktoken huggingface_hub
```

### 2. Use Local Script

```bash
python3 qwen3_local.py "Your coding question"
```

**Note:** The first run will download ~14GB model which may take time and requires significant RAM.

## Features

### Simple CLI Features:
- ✅ No large downloads required
- ✅ Fast responses via API
- ✅ Works on any system with Python and internet
- ✅ Supports all programming languages
- ✅ Code generation, debugging, and explanations

### Local CLI Features:
- ✅ Works offline after initial setup
- ✅ Full control over generation parameters
- ✅ No API rate limits
- ⚠️ Requires 16GB+ RAM for optimal performance
- ⚠️ Large initial download

## Usage Examples

### Web Development
```bash
python3 qwen3_simple_cli.py "Create a responsive navbar with CSS flexbox"
python3 qwen3_simple_cli.py "Write a JavaScript function to validate email addresses"
```

### Python Programming
```bash
python3 qwen3_simple_cli.py "Create a class for managing a shopping cart"
python3 qwen3_simple_cli.py "How do I read a CSV file and convert it to JSON?"
```

### Debugging
```bash
python3 qwen3_simple_cli.py "Fix this error: TypeError: 'NoneType' object is not subscriptable"
python3 qwen3_simple_cli.py "Why is my React component not re-rendering?"
```

### Database & Backend
```bash
python3 qwen3_simple_cli.py "Write a SQL query to find duplicate records"
python3 qwen3_simple_cli.py "Create a REST API endpoint with authentication"
```

## Troubleshooting

### Common Issues:

1. **"HUGGINGFACE_TOKEN not set"**
   - Make sure you exported the token: `export HUGGINGFACE_TOKEN='your_token'`
   - Check if it's set: `echo $HUGGINGFACE_TOKEN`

2. **API Error 401**
   - Your token might be invalid or expired
   - Generate a new token from Hugging Face

3. **API Error 429**
   - You've hit rate limits
   - Wait a few minutes and try again

4. **No response or timeout**
   - Check your internet connection
   - Try a simpler prompt

5. **Local model out of memory**
   - Your system needs more RAM (16GB+ recommended)
   - Use the simple API version instead

## Integration with Your Project

You can also integrate Qwen 3 Coder into your existing project:

```python
from qwen3_simple_cli import QwenCoderAPI

qwen = QwenCoderAPI()
response = qwen.generate_code("Create a Python function to sort a list")
print(response)
```

## Files Created

- `qwen3_simple_cli.py` - Main CLI using Hugging Face API (recommended)
- `qwen3_local.py` - Local model setup (advanced users)
- `QWEN_SETUP_GUIDE.md` - This setup guide

The simple CLI is perfect for most use cases and requires minimal setup!