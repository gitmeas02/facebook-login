<template>
  <div class="privacy">
    <div class="container">
      <h1>Privacy Policy</h1>
      
      <div class="back-link">
        <router-link to="/">← Back to Home</router-link>
      </div>
      
      <div class="content">
        <p><strong>Last updated:</strong> {{ currentDate }}</p>
        
        <h2>1. Information We Collect</h2>
        <p>
          When you use our Facebook Login service, we collect information that Facebook provides to us, including:
        </p>
        <ul>
          <li>Your name</li>
          <li>Email address</li>
          <li>Profile picture</li>
          <li>Facebook user ID</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>We use the information collected to:</p>
        <ul>
          <li>Authenticate and identify you</li>
          <li>Provide personalized services</li>
          <li>Improve our application</li>
        </ul>
        
        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
          except as described in this privacy policy.
        </p>
        
        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access, 
          alteration, disclosure, or destruction.
        </p>
        
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and data</li>
          <li>Withdraw consent</li>
        </ul>
        
        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at: 
          <a href="mailto:privacy@yourapp.com">privacy@yourapp.com</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.privacy {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-link {
  margin-bottom: 2rem;
}

.back-link a {
  color: #1877f2;
  text-decoration: none;
  font-weight: 500;
}

.back-link a:hover {
  text-decoration: underline;
}

h1 {
  color: #333;
  border-bottom: 2px solid #1877f2;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

h2 {
  color: #444;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.content {
  color: #555;
}

ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

li {
  margin: 0.5rem 0;
}

a {
  color: #1877f2;
}
</style>
