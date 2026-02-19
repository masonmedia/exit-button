// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // your existing routes...
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
