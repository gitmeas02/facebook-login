// FacebookAuthService.js
class FacebookAuthService {
  constructor() {
    this.baseURL = 'http://localhost:3000/auth'; // Your backend URL (HTTP for development)
  }

  /**
   * Login with authorization code (backend handles token exchange)
   */
  async loginWithAuthCode(code, redirectUri) {
    console.log('� Sending authorization code to backend...');
    console.log('📝 Code:', code);
    console.log('📝 Redirect URI:', redirectUri);
    
    try {
      const response = await fetch(`${this.baseURL}/facebook/auth-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirectUri: redirectUri,
        }),
      });

      const data = await response.json();
      console.log('� Backend auth code response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Backend authentication failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Backend authentication failed:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token with backend
   */
  async verifyToken(token) {
    console.log('� Verifying token with backend...');
    
    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📊 Token verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Token verification failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      throw error;
    }
  }

  /**
   * Logout from backend
   */
  async logout(token) {
    console.log('� Logging out from backend...');
    
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📊 Logout response:', data);

      return data;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }
}

export default new FacebookAuthService();