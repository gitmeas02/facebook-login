<template>
  <div class="home">
    <h1>Facebook Login Demo</h1>
    <FacebookLoginButton />
    
    <div class="footer-links">
      <router-link to="/privacy">Privacy Policy</router-link>
      <span> | </span>
      <router-link to="/terms">Terms of Service</router-link>
    </div>
  </div>
</template>

<script setup>
import FacebookLoginButton from '../Components/FacebookLoginButton.vue';
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

.footer-links {
  margin-top: 2rem;
  padding: 1rem;
}

.footer-links a {
  color: #1877f2;
  text-decoration: none;
  margin: 0 0.5rem;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>
