JOHN HEALTH - corrected secure deployment

1. Deploy the entire project folder to Netlify (not just index.html).
2. In Netlify, open Site configuration > Environment variables.
3. Add OPENROUTER_API_KEY and paste a NEW OpenRouter key as its value.
4. Optionally add OPENROUTER_MODEL = openai/gpt-4o-mini.
5. Redeploy the site, then test the AI assistant.

The HTML calls /.netlify/functions/health-chat. The function adds the API
Authorization header on the server, so visitors cannot see the secret.
Opening index.html directly from your computer will not run the function.

SECURITY: The supplied HTML contained an exposed API key. Revoke that key
at https://openrouter.ai/keys and create a replacement before deployment.
