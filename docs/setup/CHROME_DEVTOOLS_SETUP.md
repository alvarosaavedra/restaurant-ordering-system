# Chrome DevTools MCP Setup Instructions

## Step 1: Enable Remote Debugging in Chrome

1. Open Chrome browser
2. Navigate to `chrome://inspect/#remote-debugging`
3. Enable "Discover network targets" if not already enabled
4. Click "Configure" and make sure `localhost:9222` is added
5. Grant permission when Chrome asks for debugging access

## Step 2: Test the Configuration

Your OpenCode configuration is now set up with:
- Svelte MCP (for Svelte/SvelteKit development)
- Chrome DevTools MCP (for browser automation and testing)

## Step 3: Usage Examples

Once remote debugging is enabled, you can use prompts like:

### Performance Testing
```
Check the performance of http://localhost:5173/ and analyze the loading bottlenecks
```

### User Interaction Testing  
```
Navigate to http://localhost:5173/ and take a screenshot of the login page
```

### Network Analysis
```
Go to http://localhost:5173/ and list all network requests when the page loads
```

### Form Testing
```
Navigate to http://localhost:5173/login, fill in the login form with test credentials, and click submit
```

## Configuration Details

Your current configuration in `opencode.json`:
```json
{
  "mcp": {
    "svelte": {
      "type": "remote",
      "url": "https://mcp.svelte.dev/mcp"
    },
    "chrome-devtools": {
      "type": "local", 
      "command": [
        "npx", "-y", "chrome-devtools-mcp@latest",
        "--autoConnect",
        "--channel=stable"
      ]
    }
  }
}
```

The `--autoConnect` flag will automatically connect to your running Chrome instance once you enable remote debugging.