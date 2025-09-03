<template>
  <div class="terms">
    <div class="container">
      <h1>Terms of Service</h1>
      
      <div class="back-link">
        <router-link to="/">← Back to Home</router-link>
      </div>
      
      <div class="content">
        <p><strong>Last updated:</strong> {{ currentDate }}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only.
        </p>
        
        <h2>3. User Account</h2>
        <p>When you create an account with us through Facebook Login, you must provide information that is accurate, complete, and current at all times.</p>
        
        <h2>4. Prohibited Uses</h2>
        <p>You may not use our service:</p>
        <ul>
          <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
          <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
          <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
          <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
          <li>To submit false or misleading information</li>
        </ul>
        
        <h2>5. Service Availability</h2>
        <p>
          We do not guarantee that the service will be available at all times. We may experience hardware, software, or other problems.
        </p>
        
        <h2>6. Privacy Policy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
        </p>
        
        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
          under our sole discretion, for any reason whatsoever.
        </p>
        
        <h2>8. Disclaimer</h2>
        <p>
          The information on this application is provided on an "as is" basis. To the fullest extent permitted by law, 
          this Company excludes all representations, warranties, conditions and terms.
        </p>
        
        <h2>9. Limitation of Liability</h2>
        <p>
          In no event shall this Company, nor its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, punitive, consequential, or special damages.
        </p>
        
        <h2>10. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at: 
          <a href="mailto:legal@yourapp.com">legal@yourapp.com</a>
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
.terms {
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
