# Email SaaS Platform

A modern web-based email service built with React, Node.js, and PostgreSQL.

## Features

- User authentication and authorization
- Email composition and sending
- Inbox management
- Real-time notifications
- Contact management
- Search functionality
- File attachments
- Custom domain support

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: Auth0
- Email Processing: AWS SES
- Styling: Tailwind CSS
- State Management: Redux Toolkit

## Prerequisites

- Node.js >= 16
- Yarn
- PostgreSQL
- AWS Account (for SES)
- Auth0 Account

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start development servers
```bash
yarn dev
```

## Project Structure

```
email-saas/
├── client/              # React frontend
├── server/              # Node.js backend
├── shared/              # Shared types and utilities
├── package.json         # Root package.json
└── README.md           # This file
```

## License

MIT 