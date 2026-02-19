# 🚨 Exit Button — Quick Exit Component

A safety-focused quick-exit button for sensitive websites (e.g. domestic abuse support, mental health, or any site where a user may need to hide their browsing activity instantly). When triggered, it redirects the current tab to a neutral site, opens a decoy tab, and floods the browser history to prevent easy back-navigation.

---

## Concept

The core problem this solves: **a user needs to hide what they're viewing, fast.**

Standard browser behaviour makes this hard:
- `window.location.replace()` replaces only the *current* history entry — all previous entries remain accessible via the back button
- JavaScript cannot clear the browser's full history — this is a security restriction enforced by all browsers
- `window.close()` is blocked by browsers unless the tab was opened programmatically

### The Solution

The panic button combines three techniques to make back-navigation as difficult as possible:

1. **History flooding** — Before redirecting, push 50 entries of an `/exit` route onto the history stack. The back button now has to cycle through 50 `/exit` entries before reaching any real page.

2. **Server-side `/exit` redirect** — The `/exit` route immediately 302-redirects back to the neutral site (e.g. Weather Network). So even if the user clicks back 50 times, each `/exit` entry just sends them back to the neutral site again. They can never navigate back to the original site.

3. **Decoy tab** — A second tab opens automatically (e.g. Wikipedia Toronto) to provide cover — something innocent to explain why the browser was open.

### Flow

```
User clicks button
       │
       ▼
50x history.pushState("/exit")     ← floods back-button stack
       │
       ▼
window.open(Wikipedia)             ← opens decoy tab in background
       │
       ▼ (10ms delay)
Clear cookies + localStorage + sessionStorage
       │
       ▼
window.location.replace(neutral site)   ← current tab navigates away
       │
       ▼
If user hits back button:
  → hits /exit → server 302 → back to neutral site
  → repeat 50 times
  → never reaches original site
```

### Known Limitations

- **Brave / aggressive popup blockers** may block `window.open()`. Users need to allow popups for the site once. Using `_blank` without `noopener,noreferrer` improves compatibility.
- **`window.close()`** is blocked by browsers when the tab was opened by the user (typed URL, bookmark). There is no JS workaround for this.
- **Full history erasure is impossible** via JavaScript — the browser security model prevents cross-origin history manipulation.
- **Incognito mode** is the only fully reliable privacy solution. Consider prompting users to browse in incognito on first visit.
- The **Escape key** trigger may be blocked for `window.open()` in some browsers as keyboard events are not always treated as trusted gestures for popups.

---

## Implementations

### Vue 3 / Nuxt 4

**Component: `ExitButton.vue`**

```vue
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
  // Flood history stack with /exit entries
  for (let i = 0; i < 50; i++) {
    history.pushState(null, "", "/exit");
  }

  // Open decoy tab (without noopener for Brave compatibility)
  window.open("https://en.wikipedia.org/wiki/Toronto", "_blank");

  // Short delay so browser processes window.open before navigating away
  setTimeout(() => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });
    localStorage.clear();
    sessionStorage.clear();

    window.location.replace("https://www.theweathernetwork.com");
  }, 10);
};

onMounted(() => {
  const handleKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      panic();
    }
  };
  window.addEventListener("keydown", handleKey);

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKey);
  });
});
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

  @media (min-width: 1600px) {
    right: calc(50% - 800px + 20px);
  }
}
</style>
```

**Nuxt config: `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://www.theweathernetwork.com' },
        { rel: 'preconnect', href: 'https://en.wikipedia.org' },
        { rel: 'prefetch', href: 'https://www.theweathernetwork.com' },
        { rel: 'prefetch', href: 'https://en.wikipedia.org/wiki/Toronto' },
      ]
    }
  },
  routeRules: {
    '/exit': {
      redirect: {
        to: 'https://www.theweathernetwork.com',
        statusCode: 302
      }
    }
  }
})
```

---

### Vue 3 (without Nuxt)

**Router: `router/index.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ...your existing routes
    {
      path: '/exit',
      beforeEnter: () => {
        window.location.replace('https://www.theweathernetwork.com')
        return false
      },
      component: { template: '<div></div>' }
    }
  ]
})

export default router
```

---

### Vanilla HTML / JS / CSS

**`exit-button.html`** (drop-in component)

```html
<button
  id="panicBtn"
  class="panic-btn"
  aria-label="Panic Button"
  title="Exit quickly"
>
  Exit the site
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
    <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
  </svg>
</button>

<style>
.panic-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  border-radius: 10px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #212529;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.1s ease-in-out;
}
.panic-btn:hover { background-color: #343a40; }

@media (min-width: 1600px) {
  .panic-btn { right: calc(50% - 800px + 20px); }
}
</style>

<script>
function panic() {
  for (let i = 0; i < 50; i++) {
    history.pushState(null, "", "/exit");
  }

  window.open("https://en.wikipedia.org/wiki/Toronto", "_blank");

  setTimeout(() => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("https://www.theweathernetwork.com");
  }, 10);
}

document.getElementById("panicBtn").addEventListener("click", panic);

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    e.preventDefault();
    panic();
  }
});
</script>
```

**`/exit.html`** — place on your server at the `/exit` path:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://www.theweathernetwork.com" />
  <script>window.location.replace("https://www.theweathernetwork.com");</script>
</head>
<body></body>
</html>
```

---

## Tips for Maximum Privacy

| Tip | Why |
|-----|-----|
| Prompt users to use incognito mode on first visit | No history is saved at all — the most reliable solution |
| Use `preconnect` + `prefetch` in `<head>` | Destination pages load near-instantly on click |
| Use `@click` not `@mousedown` | Most browsers treat `click` as the most trusted gesture for popups |
| Avoid `noopener,noreferrer` on the decoy `window.open` | Brave and some browsers block it as a suspicious popup |
| Keep the 10ms `setTimeout` | Gives the browser time to process `window.open` before navigating away |
| Host `/exit` server-side | Ensures the back-button redirect works even if JS hasn't loaded |
