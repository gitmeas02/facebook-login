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
    
    <div v-if="isLoggedIn" class="user-info">
      <img :src="userInfo.picture" alt="Profile" class="profile-pic" />
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

const isLoggedIn = ref(false)
const isLoading = ref(false)
const userInfo = ref({})
const appId = "4255300844748841"

onMounted(() => {
  initFacebookSDK()
})

function initFacebookSDK() {
  // Load Facebook SDK
  window.fbAsyncInit = function() {
    FB.init({
      appId: appId,
      cookie: true,
      xfbml: true,
      version: 'v18.0',
      status: true
    })
    
    console.log('Facebook SDK initialized')
    console.log('Current URL:', window.location.href)
    console.log('App ID:', appId)
    console.log('Protocol:', window.location.protocol)
    console.log('Host:', window.location.host)
    
    // Note: Skip FB API calls until after login for HTTPS requirement
    
    // Check login status after initialization (only works on HTTPS)
    if (window.location.protocol === 'https:') {
      FB.getLoginStatus(function(response) {
        console.log('Initial login status:', response)
        console.log('Status details:', {
          status: response.status,
          authResponse: response.authResponse,
          hasAuthResponse: !!response.authResponse
        })
      }, true) // Force a round trip to Facebook
    } else {
      console.log('Skipping login status check - HTTPS required')
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
  isLoading.value = true
  
  FB.login(function(response) {
    isLoading.value = false
    console.log('Login response:', response)
    
    if (response.authResponse && response.status === 'connected') {
      console.log('Login successful!')
      console.log('Auth Response:', response.authResponse)
      getUserInfo()
    } else {
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
}

function getUserInfo() {
  FB.api('/me', { fields: 'name,email,picture' }, function(response) {
    if (response && !response.error) {
      userInfo.value = {
        name: response.name,
        email: response.email,
        picture: response.picture.data.url
      }
      isLoggedIn.value = true
      console.log('User info:', response)
    }
  })
}

function logout() {
  FB.logout(function(response) {
    isLoggedIn.value = false
    userInfo.value = {}
    console.log('Logged out successfully')
  })
}
</script>

