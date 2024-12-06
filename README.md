# BlockFix - Property Management Platform!

BlockFix is a modern property management platform that combines traditional property management features with blockchain technology for enhanced security and transparency.

## Features

### Property Management
- Property listing and details management
- Smart contract integration for property ownership verification
- Property statistics and analytics
- Detailed property information tracking

### Maintenance Management
- Create and track maintenance requests
- Work order management
- Contractor assignment and scheduling
- Real-time status updates
- AI-powered maintenance request analysis

### Contractor Management
- Contractor database
- Skill and specialty tracking
- Performance monitoring
- Scheduling and availability management

### Warranty Management
- Warranty tracking and documentation
- Expiration notifications
- Coverage details
- AI-powered warranty analysis

### Analytics & Reporting
- Property distribution analytics
- Maintenance trends
- Expense tracking
- Custom report generation

### Smart Contract Integration
- Property ownership verification on blockchain
- Transparent transaction history
- Secure document storage
- Integration with Polygon Amoy Testnet

## Technology Stack

- **Frontend**
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - shadcn/ui for UI components
  - Tanstack Query for data fetching
  - React Router for navigation

- **Backend**
  - Supabase for backend services
  - PostgreSQL database
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions
  - Edge Functions for serverless computing

- **Blockchain**
  - Ethereum/Polygon smart contracts
  - Web3.js for blockchain interactions
  - MetaMask integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- MetaMask wallet
- Polygon Amoy Testnet POL tokens

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blockfix
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Blockchain Setup

1. Install MetaMask browser extension
2. Connect to Polygon Amoy Testnet
3. Get test POL tokens from the Polygon Amoy faucet

## Development Guidelines

### Code Structure

```
src/
  ├── components/     # React components
  ├── hooks/         # Custom React hooks
  ├── lib/           # Utility functions
  ├── pages/         # Page components
  ├── services/      # Service layer
  └── types/         # TypeScript type definitions
```

### Key Components

- `PropertyCard`: Displays property information
- `MaintenanceRequestForm`: Handles maintenance request creation
- `ContractorList`: Manages contractor information
- `DashboardStats`: Shows key statistics

### State Management

- Tanstack Query for server state
- React Context for global UI state
- Local state for component-specific data

## Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Lovable Platform**
   - Click "Share" -> "Publish" in the Lovable interface
   - Your app will be deployed to a Lovable subdomain

2. **Custom Domain**
   - Deploy to Netlify or similar platform
   - Configure custom domain settings
   - Update environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- All data is protected by Supabase RLS policies
- Smart contracts are deployed on Polygon Amoy Testnet
- User authentication via Supabase Auth
- Secure API endpoints with rate limiting

## Support

For support, please:
1. Check the documentation
2. Open an issue in the repository
3. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Smart contract infrastructure by [Polygon](https://polygon.technology)
