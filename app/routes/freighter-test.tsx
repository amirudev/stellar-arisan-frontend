import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import freighterApi from '@stellar/freighter-api';

const { 
  isConnected, 
  getAddress, 
  signTransaction, 
  setAllowed,
  getNetworkDetails,
  requestAccess
} = freighterApi;

export function meta() {
  return [
    { title: 'Freighter Wallet Test' },
    { name: 'description', content: 'Test Freighter Wallet Detection' },
  ];
}

export default function FreighterTest() {
  const [results, setResults] = useState<any>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const runDiagnostics = async () => {
    if (typeof window === 'undefined') {
      setResults({ error: 'Window is undefined (SSR)' });
      return;
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
      freighterApi: {
        isConnected: null as any,
        getAddress: null as any,
        requestAccess: null as any,
        getNetworkDetails: null as any,
      },
      manualTest: null as any,
    };

    // Test Freighter API methods
    try {
      console.log('Testing Freighter API methods...');
      console.log('Available methods:', Object.keys(freighterApi));
      console.log('Full freighterApi object:', freighterApi);
      
      // Test isConnected
      try {
        const connected = await isConnected();
        diagnostics.freighterApi.isConnected = { success: true, connected };
      } catch (error: any) {
        diagnostics.freighterApi.isConnected = { success: false, error: error.message };
      }

      // Test getAddress
      try {
        const address = await getAddress();
        diagnostics.freighterApi.getAddress = { success: true, address };
      } catch (error: any) {
        diagnostics.freighterApi.getAddress = { success: false, error: error.message };
      }

      // Test getNetworkDetails
      try {
        const networkDetails = await getNetworkDetails();
        diagnostics.freighterApi.getNetworkDetails = { success: true, networkDetails };
      } catch (error: any) {
        diagnostics.freighterApi.getNetworkDetails = { success: false, error: error.message };
      }

      // Test requestAccess
      try {
        await requestAccess();
        diagnostics.freighterApi.requestAccess = { success: true };
      } catch (error: any) {
        diagnostics.freighterApi.requestAccess = { success: false, error: error.message };
      }

      // Overall test result
      const hasWorkingApi = Object.values(diagnostics.freighterApi).some(test => test.success);
      diagnostics.manualTest = {
        success: hasWorkingApi,
        message: hasWorkingApi ? 'Freighter API is working correctly!' : 'Freighter API is not responding',
        details: diagnostics.freighterApi
      };

    } catch (error: any) {
      console.error('Freighter API test failed:', error);
      diagnostics.manualTest = {
        success: false,
        error: error.message,
      };
    }

    setResults(diagnostics);
    console.log('Full diagnostics:', diagnostics);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Freighter Wallet Diagnostics</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure Freighter is installed and enabled in your browser</li>
          <li>Open the Freighter extension and unlock it</li>
          <li>Click the "Run Diagnostics" button below</li>
          <li>Check the results and browser console</li>
        </ol>
      </div>

      <button 
        onClick={runDiagnostics}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        Run Diagnostics
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">What to check:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>window.hasFreighterApi</strong>: Should be true if Freighter is properly loaded</li>
          <li><strong>allWindowKeys</strong>: Should show "freighterApi" if extension is detected</li>
          <li><strong>manualTest.methods</strong>: Should show available Freighter methods</li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">Browser Extension Check:</h3>
        <p className="text-sm">
          Go to your browser's extension settings and verify:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
          <li><strong>Chrome:</strong> chrome://extensions/</li>
          <li><strong>Firefox:</strong> about:addons</li>
          <li><strong>Edge:</strong> edge://extensions/</li>
        </ul>
        <p className="text-sm mt-2">
          Make sure Freighter is:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm mt-1">
          <li>✅ Installed</li>
          <li>✅ Enabled (toggle is on)</li>
          <li>✅ Allowed to run on this site</li>
        </ul>
      </div>
    </div>
  );
}

