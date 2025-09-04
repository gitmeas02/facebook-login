<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Facebook Login Demo</h1>

    <!-- Display error if present -->
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>

    <!-- Login button when user is not logged in -->
    <div v-if="!user">
      <button
        @click="login"
        class="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        :disabled="!sdkLoaded"
      >
        {{ sdkLoaded ? 'Login with Facebook' : 'Loading SDK...' }}
      </button>
    </div>

    <!-- User info when logged in -->
    <div v-else>
      <p class="mt-4">Welcome, {{ user.name || 'User' }}</p>
      <img
        :src="user.picture.data.url"
        class="rounded-full mt-2 w-16 h-16"
        alt="Profile picture"
      />
      <button
        @click="logout"
        class="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import FacebookAuthService from '../service/FacebookAuthService.js';

// Use environment variable for App ID
const appId = "4255300844748841";
// const appId = import.meta.env.VITE_FB_APP_ID;

export default {
  name: 'FacebookLogin',
  setup() {
    // Reactive state
    const user = ref(null);
    const sdkLoaded = ref(false);
    const error = ref(null);
    let sdkInitialized = false;

    // Helper to check if HTTPS is required
    const isHttpsRequired = () => {
      const { hostname, protocol } = window.location;
      return !(
        hostname === 'localhost' ||
        /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
      ) && protocol !== 'https:';
    };

    // Set error message
    const setError = (message) => {
      console.error('🚨 Error occurred:', message);
      error.value = message;
      console.log('📝 Error state updated:', error.value);
    };

    // Watch for state changes
    watch(user, (newUser, oldUser) => {
      console.log('👤 User state changed:');
      console.log('  Old user:', oldUser);
      console.log('  New user:', newUser);
    });

    watch(sdkLoaded, (newValue, oldValue) => {
      console.log('🔧 SDK loaded state changed:');
      console.log('  Old value:', oldValue);
      console.log('  New value:', newValue);
    });

    watch(error, (newError, oldError) => {
      console.log('🚨 Error state changed:');
      console.log('  Old error:', oldError);
      console.log('  New error:', newError);
    });

    // Check initial login status
    const checkInitialLoginStatus = async () => {
      console.log('🔍 Checking initial login status...');
      
      // First check if we have a stored JWT token
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        console.log('🔑 Found stored JWT token, verifying...');
        try {
          const verificationResult = await FacebookAuthService.verifyToken(storedToken);
          console.log('✅ JWT token verified:', verificationResult);
          
          if (verificationResult.valid && verificationResult.user) {
            user.value = verificationResult.user;
            console.log('👤 User restored from JWT:', user.value);
            return; // Exit early if JWT is valid
          }
        } catch (error) {
          console.error('❌ JWT verification failed:', error);
          localStorage.removeItem('jwt_token');
          console.log('🗑️ Removed invalid JWT token');
        }
      }
      
      // Fallback to Facebook SDK status check
      if (!window.FB) {
        console.log('⚠️ Facebook SDK not available for status check');
        return;
      }
      
      window.FB.getLoginStatus((response) => {
        console.log('📊 Facebook login status response:', response);
        console.log('📊 Login status:', response.status);
        
        if (response.status === 'connected') {
          console.log('✅ User is connected, fetching user data...');
          console.log('🔑 Access token:', response.authResponse?.accessToken);
          
          // Fetch user info if already logged in
          window.FB.api('/me?fields=id,name,picture,email', (userResponse) => {
            console.log('👤 User data response:', userResponse);
            
            if (userResponse && !userResponse.error) {
              console.log('✅ Successfully fetched user data:', userResponse);
              user.value = userResponse;
              console.log('📝 User state updated:', user.value);
            } else {
              console.error('❌ Error fetching user data:', userResponse?.error);
              setError('Failed to fetch user data');
            }
          });
        } else if (response.status === 'not_authorized') {
          console.log('⚠️ User is logged into Facebook but not authorized for this app');
        } else {
          console.log('❌ User is not logged into Facebook');
        }
      });
    };

    // Initialize Facebook SDK
    const initFacebookSDK = () => {
      console.log('🔧 Initializing Facebook SDK...');
      console.log('🔧 FB object exists:', !!window.FB);
      console.log('🔧 SDK already initialized:', sdkInitialized);

      if (window.FB && sdkInitialized) {
        console.log('✅ SDK already loaded and initialized');
        sdkLoaded.value = true;
        return;
      }

      window.fbAsyncInit = () => {
        console.log('🔧 fbAsyncInit callback fired');
        try {
          console.log('🔧 Calling FB.init with config...');
          window.FB.init({
            appId,
            cookie: true,
            xfbml: true,
            version: 'v23.0',
            status: false,
          });

          sdkLoaded.value = true;
          sdkInitialized = true;
          console.log('✅ Facebook SDK initialized successfully');
          console.log('🔧 SDK loaded state:', sdkLoaded.value);

          if (isHttpsRequired()) {
            console.warn('⚠️ HTTPS required for production');
            setError(
              '⚠️ Facebook requires HTTPS in production. Please use a secure connection.'
            );
          } else {
            console.log('✅ HTTPS check passed, checking login status...');
            checkInitialLoginStatus();
          }
        } catch (err) {
          console.error('❌ Failed to initialize Facebook SDK:', err);
          setError('Failed to initialize Facebook SDK');
        }
      };

      // Load SDK script if not already loaded
      if (!document.getElementById('facebook-jssdk')) {
        console.log('📥 Loading Facebook SDK script...');
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        js.onload = () => console.log('✅ Facebook SDK script loaded');
        js.onerror = () => {
          console.error('❌ Failed to load Facebook SDK script');
          setError('Failed to load Facebook SDK. Check connection.');
        };
        document.head.appendChild(js);
      } else {
        console.log('✅ Facebook SDK script already exists in DOM');
      }
    };

    // Login with redirect
    const login = () => {
      console.log('🚀 Login function called');
      console.log('🔧 SDK loaded:', sdkLoaded.value);
      console.log('🔧 FB object available:', !!window.FB);
      
      if (!window.FB || !sdkLoaded.value) {
        console.error('❌ Facebook SDK not ready');
        setError('Facebook SDK not ready');
        return;
      }

      const redirectUri = encodeURIComponent(window.location.origin + '/');
      const scope = encodeURIComponent('email,public_profile,pages_show_list,pages_read_engagement');
      const facebookLoginUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=redirect_login`;

      console.log('🔗 Redirect URI:', window.location.origin + '/');
      console.log('🔗 Facebook login URL:', facebookLoginUrl);
      console.log('🚀 Redirecting to Facebook...');

      window.location.href = facebookLoginUrl;
    };

    // Logout
    const logout = async () => {
      console.log('🚪 Logout function called');
      
      // Clear JWT token
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        console.log('� Found JWT token, logging out from backend...');
        try {
          await FacebookAuthService.logout(storedToken);
          console.log('✅ Backend logout successful');
        } catch (error) {
          console.error('❌ Backend logout failed:', error);
        }
        localStorage.removeItem('jwt_token');
        console.log('🗑️ JWT token removed from localStorage');
      }
      
      // Clear Facebook SDK session if available
      if (window.FB && sdkLoaded.value) {
        console.log('🚪 Calling FB.logout...');
        window.FB.logout((response) => {
          console.log('📊 Facebook logout response:', response);
          console.log('✅ Facebook SDK logout completed');
        });
      } else {
        console.log('⚠️ Facebook SDK not available for logout');
      }
      
      // Clear user state
      user.value = null;
      console.log('✅ User logged out, user state cleared');
      console.log('👤 Current user state:', user.value);
    };

    // Handle redirect from Facebook
    const handleFacebookRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('🔄 Checking for Facebook redirect parameters...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🔍 URL parameters:', Object.fromEntries(urlParams.entries()));

      if (error) {
        console.error('❌ Facebook login error:', error);
        console.error('❌ Error description:', errorDescription);
        setError(`Facebook login error: ${errorDescription || error}`);
        return;
      }

      if (code && state === 'redirect_login') {
        console.log('✅ Facebook authorization code received:', code);
        console.log('🔄 User returned from Facebook login');
        
        // Clear URL parameters
        const newUrl = window.location.origin + window.location.pathname;
        console.log('🧹 Cleaning URL, redirecting to:', newUrl);
        window.history.replaceState({}, document.title, newUrl);
        
        try {
          console.log('🚀 Authenticating with backend using authorization code...');
          const redirectUri = window.location.origin + '/';
          
          // Use the backend service to handle authentication
          const authResult = await FacebookAuthService.loginWithAuthCode(code, redirectUri);
          
          console.log('✅ Backend authentication successful:', authResult);
          
          // Store the JWT token
          if (authResult.token) {
            localStorage.setItem('jwt_token', authResult.token);
            console.log('💾 JWT token stored in localStorage');
          }
          
          // Update user state
          if (authResult.user) {
            user.value = authResult.user;
            console.log('👤 User state updated:', user.value);
          }
          
        } catch (authError) {
          console.error('❌ Backend authentication failed:', authError);
          setError(`Authentication failed: ${authError.message}`);
        }
      }
    };

    // Initialize SDK on component mount
    onMounted(() => {
      console.log('🔧 Component mounted, initializing...');
      console.log('🔑 App ID:', appId);
      console.log('🌐 Current location:', window.location.href);
      
      if (!appId) {
        console.error('❌ Facebook App ID is missing');
        setError('Facebook App ID is missing. Please configure VITE_FB_APP_ID.');
        return;
      }
      
      // Handle Facebook redirect first
      handleFacebookRedirect();
      
      // Then initialize SDK
      initFacebookSDK();
    });

    // Add a method to manually check state (useful for debugging)
    const debugCurrentState = () => {
      console.log('🔍 === CURRENT STATE DEBUG ===');
      console.log('👤 User:', user.value);
      console.log('🔧 SDK Loaded:', sdkLoaded.value);
      console.log('🚨 Error:', error.value);
      console.log('🔧 FB Object:', !!window.FB);
      console.log('🔧 SDK Initialized:', sdkInitialized);
      console.log('🌐 Current URL:', window.location.href);
      console.log('=== END STATE DEBUG ===');
    };

    // Expose debug function to window for manual testing
    window.debugFacebookLogin = debugCurrentState;
    console.log('🔧 Added window.debugFacebookLogin() for manual debugging');

    return {
      user,
      sdkLoaded,
      error,
      login,
      logout,
      debugCurrentState,
    };
  },
};
</script>