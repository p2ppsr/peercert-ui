# PeerCert UI

**Elegant web interface for peer-to-peer certificate management**

A modern React application that provides an intuitive UI for creating, sending, and receiving peer certificates using the `peercert` library with support for compact binary serialization and multiple delivery methods.

## Features

✨ **Create Certificates**
- User-friendly form to create certificates for peers
- Add custom attributes (key-value pairs)
- Choose delivery method:
  - **Auto-send via MessageBox** - Direct peer-to-peer delivery
  - **Get compact data** - Export as base64 for QR codes, URLs, files
- Sign certificates with your BSV identity key
- Compact binary format (50-70% smaller than JSON)

📥 **Receive Certificates**
- Accept certificates via MessageBox OR paste compact data
- Smart format detection (compact base64 or JSON)
- Review certificate details before accepting
- Accept to store in Metanet Client wallet
- Reject to discard unwanted certificates

📜 **My Certificates**
- View all your stored certificates
- Reveal selected fields publicly
- Revoke certificates on-chain
- Relinquish (remove from local storage)
- Check revocation status

🎨 **Modern UI**
- Clean, professional design with TailwindCSS
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Intuitive tab-based navigation
- Real-time status updates

## Getting Started (CARS)

This project uses the **CARS** (Containerized Application Runtime System) architecture.

### Prerequisites

- Node.js 18+
- npm
- LARS (Local Application Runtime System) - `npm i -g @p2ppsr/lars`
- CARS CLI - `npm i -g @p2ppsr/cars-cli`

### Installation & Development

```bash
# Clone and navigate to project
cd peercert-ui

# Install root dependencies (LARS/CARS)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start development server with LARS
npm run start
```

The application will be available at the configured LARS port (default: http://localhost:3000)

### Building & Deployment

```bash
# Build the frontend artifact
npm run build

# Deploy to CARS hosting
npm run deploy
```

`npm run deploy` verifies that the configured CARS project has at least 1 satoshi
available for artifact upload before publishing. If the balance is low, it uses
the current CARS CLI top-up flow to reconcile the balance up to 250,000 sats.

## Usage

### Creating a Certificate

1. Click the **"Create Certificate"** tab
2. Search for recipient by name or paste their identity key
3. Choose delivery method:
   - **Auto-send via MessageBox** - Sends directly to recipient
   - **Get compact data** - Generates base64 string to copy
4. Optionally set a custom certificate type
5. Add attributes (key-value pairs)
6. Click **"Create Certificate"** or **"Create & Send Certificate"**

If you chose manual delivery, copy the compact base64 data and share via QR code, URL, or file.

### Receiving Certificates

**Via MessageBox:**
1. Click the **"Receive Certificates"** tab
2. View all incoming certificates from MessageBox
3. Review and accept/reject each certificate

**Via Paste:**
1. Click the **"Receive Certificates"** tab
2. Paste compact base64 data into the text area
3. Click **"Receive Certificate"** to decode and store

### Managing Certificates

1. Click the **"My Certificates"** tab
2. View all certificates you've received and stored
3. For each certificate:
   - **Reveal** - Publicly reveal selected fields
   - **Revoke** - Revoke the certificate on-chain
   - **Relinquish** - Remove from local storage (no on-chain action)
   - **Check Revocation** - Verify current revocation status

## How It Works

### Certificate Flow

```
Issuer (You)                     MessageBox                    Recipient (Peer)
     |                                |                                |
     |--1. Create Certificate-------->|                                |
     |--2. Sign with Identity-------->|                                |
     |--3. Send via MessageBox------->|                                |
     |                                |--4. Store Message------------->|
     |                                |--5. Live Notification--------->|
     |                                |                                |
     |                                |<--6. Review Certificate--------|
     |                                |<--7. Accept/Reject-------------|
     |<--8. Acknowledge Message-------|<--8. Store in Wallet-----------|
```

### MessageBox Integration

The application uses the MessageBoxClient with the `'peercert'` messageBox type:

- **Sending**: `sendMessage()` delivers certificates to recipients
- **Receiving**: `listenForLiveMessages()` provides real-time notifications
- **Persistence**: `listMessages()` retrieves pending certificates
- **Acknowledgment**: `acknowledgeMessage()` marks certificates as processed

### Certificate Format

Certificates are sent as JSON messages:

```json
{
  "type": "certificate",
  "certificateType": "base64-encoded-type",
  "serializedCertificate": "{...MasterCertificate...}",
  "senderName": "optional-sender-identity"
}
```

## Development

### Project Structure (CARS)

```
peercert-ui/
├── frontend/                        # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateCertificate.tsx    # Certificate creation UI
│   │   │   ├── ReceiveCertificates.tsx  # Certificate inbox UI
│   │   │   └── MyCertificates.tsx       # Certificate management UI
│   │   ├── lib/
│   │   │   └── utils.ts                 # Helper functions
│   │   ├── App.tsx                      # Main application
│   │   ├── main.tsx                     # Application entry point
│   │   └── index.css                    # Global styles
│   ├── build/                       # Production build output
│   ├── Dockerfile                   # Container configuration
│   ├── nginx.conf                   # NGINX web server config
│   └── package.json                 # Frontend dependencies
├── package.json                     # LARS/CARS scripts
└── LICENSE.txt                      # Open BSV License
```

### Key Components

**CreateCertificate.tsx**
- Form for entering recipient and attributes
- Delivery method selection (MessageBox or manual)
- Certificate creation with `PeerCert.issue()`
- Compact serialization with `PeerCert.encodeCertificate()`
- Auto-send via MessageBox or copy base64 data

**ReceiveCertificates.tsx**
- Lists incoming certificates from MessageBox
- Manual certificate input (paste base64 or JSON)
- Smart format detection and decoding
- Certificate verification and storage

**MyCertificates.tsx**
- Lists all stored certificates
- Reveal selected fields publicly
- Revoke certificates on-chain
- Relinquish (remove) from local storage
- Check revocation status

## Compact Certificate Format

Certificates can be serialized to a compact binary format (~50-70% smaller than JSON):

```typescript
// Encode to compact base64
const compact = PeerCert.encodeCertificate(masterCert)
// Example: "AQdteXBlTm..." (400-800 chars vs 1500-2500 for JSON)

// Decode back to certificate data
const certData = PeerCert.decodeCertificate(compact)

// Receive the decoded certificate
await peercert.receive(JSON.stringify(certData))
```

Perfect for QR codes, URLs, NFC tags, and files!

## Wallet Integration

The application requires the Metanet Desktop Client (or compatible WalletClient) for:
- Signing certificates with your identity key
- Sending messages via MessageBox
- Receiving and verifying certificates
- Storing certificates in your wallet

Make sure you have the Metanet Desktop Client installed and running before using this application.

## Deployment (CARS)

Deploy to CARS hosting infrastructure:

```bash
# Build the containerized artifact
npm run build

# Deploy to production
npm run deploy
```

The application will be packaged as a Docker container with NGINX and deployed to the CARS infrastructure.

## Troubleshooting

### "No wallet available" error
- Ensure Metanet Desktop Client is installed and running
- Refresh the page after starting the wallet

### Certificates not appearing
- Check the "Receive Certificates" tab
- Click the "Refresh" button
- Verify MessageBox connectivity

### Certificate sending fails
- Verify the recipient's identity key is correct
- Ensure you have a valid BSV identity key
- Check browser console for detailed errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Open BSV License - See LICENSE.txt

## Related Projects

- **peercert** - Core peer-to-peer certificate library
- **@bsv/sdk** - BSV blockchain SDK with certificate support
- **@bsv/message-box-client** - Peer-to-peer messaging
- **@bsv/identity-react** - Identity search components
- **@bsv/lars** - Local Application Runtime System
- **@bsv/cars-cli** - Containerized Application Runtime System

## Support

For issues or questions:
- Check the browser console for error messages
- Review the MessageBox server status
- Verify wallet connectivity
- Open an issue on GitHub
