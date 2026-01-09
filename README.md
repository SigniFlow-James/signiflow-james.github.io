# Signiflow Procore Integration

A Nuxt 3 application that integrates Signiflow's digital signature platform with Procore's construction management software. This side panel application allows users to send contracts to recipients directly from within Procore.

## Features

- **Procore iframe integration** - Runs as a side panel within Procore's interface
- **Backend authentication** - Secure authentication with auto-refresh capabilities
- **Contract sending** - Send contracts via Signiflow with custom messages
- **Debug mode** - Built-in debugging tools for development and troubleshooting
- **Cross-origin messaging** - Secure communication between iframe and parent window

## Project Structure

```
.
├── pages/
│   └── index.vue                 # Main application page
├── components/
│   ├── SigniflowHeader.vue       # Logo and title component
│   ├── ErrorMessage.vue          # Error display component
│   ├── SigniflowForm.vue         # Contract form with inputs
│   └── DebugPanel.vue            # Debug information panel
├── composables/
│   ├── useProcoreContext.ts      # Procore iframe communication logic
│   └── useBackendAuth.ts         # Backend authentication management
└── app.vue                       # Root application component
```

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Access to Procore platform
- Signiflow backend server running

## Configuration

### Backend URL

The application connects to the Signiflow backend at:
```
https://signiflow-procore-backend-net.onrender.com
```

To change the backend URL, update the fetch calls in:
- `composables/useBackendAuth.ts`
- `pages/index.vue` (sendToBackend function)

### Logo

Place your logo at `/public/logo.png`

## Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview production build
npm run preview
# or
yarn preview
```

## Usage

### Running in Procore

1. Deploy the application to a web server
2. Configure the Procore app manifest to load your application URL
3. Install the app in your Procore project
4. Open the side panel to use the integration

### Sending a Contract

1. Ensure backend authentication is successful (check status in debug panel)
    - Add Procore PROCORE_CLIENT_ID and PROCORE_CLIENT_SWCRET to backend environment
    - Visit ```https://signiflow-procore-backend-net.onrender.com/launch``` for initial OAuth connection
2. Enter recipient name and email
3. Add a custom message (optional)
4. Click "Send via Signiflow"
5. Wait for confirmation message

### Debug Mode

Toggle "Show debug info" to view:
- Backend authentication status
- Token expiration time
- Procore context data
- Error messages

## API Endpoints

### Backend Authentication

**GET** `/api/auth/status`
- Returns current authentication status
- Response: `{ authenticated: boolean, expiresAt: number | null }`

**POST** `/api/auth/refresh`
- Refreshes authentication token
- Response: `{ refreshed: boolean, auth: BackendStatus, loginRequired?: boolean }`

### Contract Sending

**POST** `/api/send`
- Sends contract to recipient via Signiflow
- Body: `{ form: FormData, context: ProcoreContext }`
- Response: Success or error message

## Components

### SigniflowHeader
Simple presentational component displaying the logo and title.

### ErrorMessage
Displays error messages with red styling.

**Props:**
- `message: string` - Error message to display

### SigniflowForm
Main form for entering recipient details and sending contracts.

**Props:**
- `form: FormData` - Form data object
- `procoreContext: any` - Procore context from iframe
- `sending: boolean` - Whether a send operation is in progress
- `sendResult: string | null` - Result message from send operation

**Events:**
- `update:form` - Emitted when form data changes
- `submit` - Emitted when send button is clicked

### DebugPanel
Collapsible panel showing authentication and context information.

**Props:**
- `enabled: boolean` - Whether debug panel is visible
- `backendStatus: BackendStatus | null` - Authentication status
- `procoreContext: any` - Procore context data
- `error: string | null` - Error message if any

**Events:**
- `update:enabled` - Emitted when debug toggle changes

## Scripts

### useProcoreContext()
Manages communication with Procore parent window via postMessage API.

**Returns:**
- `procoreContext: Ref<any>` - Context data from Procore
- `initializeProcoreListener: () => void` - Initializes message listener

### useBackendAuth()
Manages authentication with the Signiflow backend.

**Returns:**
- `backendStatus: Ref<BackendStatus | null>` - Current auth status
- `error: Ref<string | null>` - Error message if any
- `fetchBackendStatus: () => boolean` - Fetches current auth status
- `tryRefreshAuth: () => boolean` - Attempts to refresh authentication

## Troubleshooting

### "No document.referrer" Error
This occurs when the app is not loaded within an iframe. The application must be embedded in Procore to function properly.

### Authentication Failures
- Check that the backend server is running and accessible
- Verify CORS settings on the backend
- Check browser console for detailed error messages
- Use debug mode to inspect authentication status

### Context Not Received
- Ensure the app is properly configured in Procore
- Check browser console for postMessage logs
- Verify the parent window is sending context messages

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari

Note: The application uses modern JavaScript features and requires a recent browser version.

## Security Considerations

- All authentication tokens are managed by the backend
- Cross-origin communication is validated
- No sensitive data is stored in localStorage
- HTTPS should be used in production

## Support

For issues or questions:
- Check the debug panel for detailed error information
- Review browser console logs
- Contact [your support email/channel]
