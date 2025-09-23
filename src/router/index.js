import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import ModalFormPage from '../views/ModalFormPage.vue'  // Import the page where ModalForm will be displayed

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ModalFormPage,
    }
  ],
})

export default router
