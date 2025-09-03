<template>
  <div class="facebook-login">
    <button 
      v-if="!isLoggedIn" 
      @click="login" 
      class="facebook-btn"
      :disabled="isLoading"
    >
      <span v-if="isLoading">Loading...</span>
      <span v-else>Login with Facebook</span>
    </button>
    
    <!-- Debug button for testing Facebook API -->
    <button 
      v-if="!isLoggedIn" 
      @click="testFacebookAPI" 
      class="debug-btn"
      style="margin-left: 10px; background: #333; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
    >
      Test FB API
    </button>
    
    <div v-if="isLoggedIn" class="user-info">
      <img 
        :src="userInfo.picture || 'https://via.placeholder.com/80x80/1877f2/ffffff?text=User'" 
        :alt="`${userInfo.name} Profile`" 
        class="profile-pic"
        @error="handleImageError"
      />
      <div>
        <h3>Welcome, {{ userInfo.name }}!</h3>
        <p>{{ userInfo.email }}</p>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FacebookAuthService from '../service/FacebookAuthService.js'

const isLoggedIn = ref(false)
const isLoading = ref(false)
const userInfo = ref({})
const appId = "4255300844748841"
const authService = new FacebookAuthService()

onMounted(() => {
  initFacebookSDK()
  checkExistingLogin()
})

async function checkExistingLogin() {
  // Check if user is already logged in via stored JWT
  if (authService.isLoggedIn()) {
    try {
      const isValid = await authService.verifyToken()
      if (isValid) {
        const profile = await authService.getUserProfile()
        userInfo.value = {
          name: profile.name,
          email: profile.email,
          picture: profile.profilePicture
        }
        isLoggedIn.value = true
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken')
      }
    } catch (error) {
      console.error('Error checking existing login:', error)
      localStorage.removeItem('authToken')
    }
  }
}

function initFacebookSDK() {
  // Add error handling for async listener issues
  window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection (likely browser extension):', event.reason)
    // Don't prevent default to avoid breaking other functionality
  })
  
  // Load Facebook SDK
  window.fbAsyncInit = function() {
    try {
      FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v23.0',
        status: true
      })
      
      console.log('Facebook SDK initialized')
      console.log('Current URL:', window.location.href)
      console.log('App ID:', appId)
      console.log('Protocol:', window.location.protocol)
      console.log('Host:', window.location.host)
      
      // Check login status with error handling
      if (window.location.protocol === 'https:') {
        setTimeout(() => {
          try {
            FB.getLoginStatus(function(response) {
              console.log('Initial login status:', response)
              console.log('Status details:', {
                status: response.status,
                authResponse: response.authResponse,
                hasAuthResponse: !!response.authResponse
              })
              
              // If user is already connected, handle the login automatically
              if (response.status === 'connected' && response.authResponse) {
                console.log('User already connected, processing login...')
                handleFacebookSuccess(response.authResponse)
              }
            }, true) // Force a round trip to Facebook
          } catch (error) {
            console.warn('Error checking login status:', error)
          }
        }, 1000) // Add delay to avoid timing issues
      } else {
        console.log('Skipping login status check - HTTPS required')
      }
    } catch (error) {
      console.error('Error initializing Facebook SDK:', error)
    }
  }

  // Load the SDK script
  if (!document.getElementById('facebook-jssdk')) {
    const js = document.createElement('script')
    js.id = 'facebook-jssdk'
    js.src = 'https://connect.facebook.net/en_US/sdk.js'
    document.head.appendChild(js)
  }
}

function login() {
  // Check if FB SDK is loaded
  if (typeof FB === 'undefined') {
    console.error('Facebook SDK not loaded')
    alert('Facebook SDK not loaded. Please refresh the page.')
    return
  }
  
  console.log('Starting Facebook login...')
  console.log('FB object available:', typeof FB)
  console.log('FB.login available:', typeof FB.login)
  console.log('FB.api available:', typeof FB.api)
  
  isLoading.value = true
  
  try {
    FB.login(function(response) {
      console.log('Login response:', response)
      
      if (response.authResponse && response.status === 'connected') {
        console.log('Login successful!')
        console.log('Auth Response:', response.authResponse)
        handleFacebookSuccess(response.authResponse)
      } else {
        isLoading.value = false
        console.log('Login failed or cancelled')
        console.log('Status:', response.status)
        console.log('Full response:', response)
        
        // More specific error messages
        switch(response.status) {
          case 'unknown':
            alert('Facebook login failed. Possible issues:\n1. App not properly configured\n2. You\'re not a test user for this app\n3. App domains mismatch')
            break
          case 'not_authorized':
            alert('You declined to authorize this app')
            break
          default:
            alert('Login failed with status: ' + response.status)
        }
      }
    }, { 
      scope: 'email,public_profile',
      return_scopes: true,
      auth_type: 'rerequest'
    })
  } catch (error) {
    console.error('Error during Facebook login:', error)
    isLoading.value = false
    alert('An error occurred during login. Please try again.')
  }
}

function testFacebookAPI() {
  console.log('=== Testing Facebook API ===')
  
  if (typeof FB === 'undefined') {
    console.error('Facebook SDK not loaded')
    alert('Facebook SDK not loaded')
    return
  }
  
  console.log('FB SDK loaded successfully')
  console.log('Available FB methods:', Object.keys(FB))
  
  // Test login status
  FB.getLoginStatus(function(response) {
    console.log('Current login status:', response)
    
    if (response.status === 'connected') {
      console.log('User is connected, testing API call...')
      
      // Test API call
      FB.api('/me', { fields: 'id,name,email' }, function(response) {
        console.log('API test response:', response)
        if (response && !response.error) {
          alert(`API Test Success!\nName: ${response.name}\nEmail: ${response.email}`)
        } else {
          console.error('API test failed:', response.error)
          alert(`API Test Failed: ${response.error?.message || 'Unknown error'}`)
        }
      })
    } else {
      console.log('User not connected, status:', response.status)
      alert(`User not connected. Status: ${response.status}\nTry logging in first.`)
    }
  })
}

async function handleFacebookSuccess(authResponse) {
  try {
    console.log('Processing Facebook login success...')
    console.log('Auth Response:', authResponse)
    
    // Get user info from Facebook first
    console.log('Making Facebook API call...')
    console.log('Access token available:', !!authResponse.accessToken)
    console.log('Access token length:', authResponse.accessToken?.length)
    
    FB.api('/me', { 
      fields: 'id,name,email,picture.width(200).height(200)'
    }, async function(fbUserData) {
      console.log('Facebook API response:', fbUserData)
      console.log('Response type:', typeof fbUserData)
      console.log('Has error:', !!fbUserData?.error)
      console.log('User data details:', {
        id: fbUserData?.id,
        name: fbUserData?.name,
        email: fbUserData?.email,
        picture: fbUserData?.picture
      })
      
      if (fbUserData && !fbUserData.error && fbUserData.id) {
        console.log('Facebook user data:', fbUserData)
        console.log('✅ Condition passed: fbUserData exists, no error, has ID')
        
        // Validate required fields (email might not be available)
        if (!fbUserData.name) {
          console.error('Missing required user data from Facebook - no name')
          alert('Unable to get your name from Facebook. Please try again.')
          isLoading.value = false
          return
        }
        
        console.log('✅ Name validation passed:', fbUserData.name)
        console.log('Processing user data for backend...')
        
        try {
          // Prepare data for backend (use a default email if not provided)
          const loginData = {
            accessToken: authResponse.accessToken,
            userID: authResponse.userID || fbUserData.id,
            name: fbUserData.name,
            email: fbUserData.email || null, // Don't provide a fallback email
            profilePicture: fbUserData.picture?.data?.url || ''
          }
          
          console.log('Sending to backend:', loginData)
          
          // Send Facebook data to backend
          const backendResponse = await authService.loginWithFacebook(loginData)
          
          // Update UI with backend response
          userInfo.value = {
            name: backendResponse.user.name,
            email: backendResponse.user.email,
            picture: backendResponse.user.profilePicture
          }
          isLoggedIn.value = true
          console.log('Backend login successful:', backendResponse)
          console.log('User profile picture URL:', backendResponse.user.profilePicture)
          
        } catch (backendError) {
          console.error('Backend login failed:', backendError)
          console.error('Backend error details:', {
            message: backendError.message,
            status: backendError.status,
            response: backendError.response
          })
          alert('Login successful with Facebook, but backend authentication failed. Please try again.')
        }
      } else {
        console.error('Failed to get Facebook user data:', fbUserData?.error || 'No user data received')
        console.error('Facebook API response:', fbUserData)
        
        // Try alternative API call with explicit access token
        console.log('Trying alternative Facebook API call...')
        FB.api('/me', { 
          fields: 'id,name,email,picture.width(200).height(200)',
          access_token: authResponse.accessToken 
        }, async function(altFbUserData) {
          console.log('Alternative Facebook API response:', altFbUserData)
          
          if (altFbUserData && !altFbUserData.error) {
            console.log('Alternative call successful:', altFbUserData)
            
            // Process the successful alternative response
            if (!altFbUserData.name) {
              console.error('Missing required user data from Facebook (alternative) - no name')
              alert('Unable to get your name from Facebook. Please try again.')
              isLoading.value = false
              return
            }
            
            try {
              // Prepare data for backend (use fallback email if not provided)
              const loginData = {
                accessToken: authResponse.accessToken,
                userID: authResponse.userID || altFbUserData.id,
                name: altFbUserData.name,
                email: altFbUserData.email || `${altFbUserData.id}@facebook.com`, // Fallback email
                picture: altFbUserData.picture?.data?.url || ''
              }
              
              console.log('Sending to backend (alternative):', loginData)
              
              // Send Facebook data to backend
              const backendResponse = await authService.loginWithFacebook(loginData)
              
              // Update UI with backend response
              userInfo.value = {
                name: backendResponse.user.name,
                email: backendResponse.user.email,
                picture: backendResponse.user.profilePicture || altFbUserData.picture?.data?.url
              }
              
              isLoggedIn.value = true
              console.log('Login process completed successfully (alternative)')
            } catch (backendError) {
              console.error('Backend login failed (alternative):', backendError)
              console.error('Backend error details:', {
                message: backendError.message,
                status: backendError.status,
                response: backendError.response
              })
              alert('Login successful with Facebook, but backend authentication failed. Please try again.')
            }
          } else {
            console.error('Both Facebook API calls failed')
            if (altFbUserData?.error) {
              alert(`Facebook API Error: ${altFbUserData.error.message}`)
            } else if (fbUserData?.error) {
              alert(`Facebook API Error: ${fbUserData.error.message}`)
            } else {
              alert('Failed to get user information from Facebook. Please check permissions and try again.')
            }
          }
          
          isLoading.value = false
        })
        return // Don't continue with the original failed response
      }
      isLoading.value = false
    })
  } catch (error) {
    console.error('Error in handleFacebookSuccess:', error)
    alert('An error occurred during login. Please try again.')
    isLoading.value = false
  }
}

async function logout() {
  try {
    // Logout from backend first
    await authService.logout()
    
    // Then logout from Facebook
    FB.logout(function(response) {
      isLoggedIn.value = false
      userInfo.value = {}
      console.log('Logged out successfully from both backend and Facebook')
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Even if backend logout fails, clear local state
    isLoggedIn.value = false
    userInfo.value = {}
    localStorage.removeItem('authToken')
    
    // Still try to logout from Facebook
    FB.logout(function(response) {
      console.log('Logged out from Facebook')
    })
  }
}

function handleImageError(event) {
  console.warn('Profile picture failed to load, using fallback')
  event.target.src = 'https://via.placeholder.com/80x80/1877f2/ffffff?text=User'
}
</script>

<style scoped>
.facebook-login {
  text-align: center;
  padding: 2rem;
}

.facebook-btn {
  background-color: #1877f2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 200px;
}

.facebook-btn:hover:not(:disabled) {
  background-color: #166fe5;
}

.facebook-btn:disabled {
  background-color: #8a8d91;
  cursor: not-allowed;
}

.user-info {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1877f2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info div {
  flex: 1;
  text-align: left;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.user-info p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.logout-btn {
  background-color: #f02849;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #d91e36;
}

/* Loading animation */
.facebook-btn:disabled span {
  opacity: 0.7;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-info div {
    text-align: center;
  }
  
  .profile-pic {
    width: 100px;
    height: 100px;
  }
}
</style>

