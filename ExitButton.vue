<template>
    <button
      @click="panic"
      class="panic-btn btn btn-dark"
      aria-label="Panic Button"
      title="Exit quickly"
    >
      Exit the site
      <span class="ms-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
          <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
        </svg>
      </span>
    </button>
  </template>

  <script setup>
  import { onMounted, onBeforeUnmount } from 'vue'

  const panic = () => {
    for (let i = 0; i < 50; i++) {
      history.pushState(null, "", "/exit");
    }
  
    // Open wiki without noopener so Brave doesn't flag it as a popup
    window.open("https://en.wikipedia.org/wiki/Toronto", "_blank");
  
    // Small delay before redirecting current tab
    // gives Brave time to process the window.open first
    setTimeout(() => {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
      localStorage.clear();
      sessionStorage.clear();
  
      window.location.replace("https://www.google.com");
    }, 10);
  };

  onMounted(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        panic()
      }
  }
    
  window.addEventListener('keydown', handleKey)

  // 7️⃣ Clean up on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKey)
  })
})
</script>

  
  <style scoped>
  .panic-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    border-radius: 10px;
    padding: 10px 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.1s ease-in-out;
    /* for matching the nav/content max-width */
    @media (min-width: 1600px) {
        right: calc(50% - 800px + 20px); 
    }
  }
  </style>
  
