// Frontend service to interact with the backend
class FacebookAuthService {
  constructor() {
    // Use HTTPS for Facebook developer mode compatibility
    this.baseURL = 'https://localhost:3000';
    this.token = localStorage.getItem('authToken');
  }

  async loginWithFacebook(facebookResponse) {
    try {
      const response = await fetch(`${this.baseURL}/auth/facebook/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: facebookResponse.accessToken,
          userID: facebookResponse.userID,
          name: facebookResponse.name,
          email: facebookResponse.email,
          profilePicture: facebookResponse.profilePicture
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store JWT token
      localStorage.setItem('authToken', data.accessToken);
      this.token = data.accessToken;
      
      return data;
    } catch (error) {
      console.error('Backend login error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('Logout error:', error);
      // Remove token anyway
      localStorage.removeItem('authToken');
      this.token = null;
    }
  }

  async verifyToken() {
    if (!this.token) return false;
    
    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  isLoggedIn() {
    return !!this.token;
  }
}

export default FacebookAuthService;
