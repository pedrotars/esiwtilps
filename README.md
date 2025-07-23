# Esiwtilps - Expense Sharing App

A modern expense splitting application with AI-powered categorization and advanced filtering.

## Features

- ✅ **Customizable Categories** - Create, edit, and manage spending categories
- ✅ **Smart Expense Splitting** - Select who paid and automatically calculate splits
- ✅ **AI Categorization** - Automatic expense categorization using Anthropic Claude
- ✅ **Interactive Charts** - Click pie chart segments to drill down into categories
- ✅ **Date Filtering** - Filter expenses by various time periods
- ✅ **Settlement Tracking** - Mark payments as settled
- ✅ **People Management** - Add, edit, and manage users
- ✅ **CSV Export** - Download expense data
- ✅ **Responsive Design** - Works on all devices

## Technologies

- **Frontend**: React, TypeScript, Styled Components
- **Charts**: Recharts
- **Date Handling**: date-fns
- **AI Integration**: Anthropic Claude API

## Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variable: `REACT_APP_ANTHROPIC_API_KEY`

### Supabase Integration (Optional)

For persistent data storage, you can integrate with Supabase:

1. Create a Supabase project
2. Set up tables for users, expenses, categories, payments
3. Add Supabase client configuration
4. Replace local state with Supabase queries

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Local Development

```bash
npm install
npm start
```

## Building for Production

```bash
npm run build
```

---

*a tars & co product*