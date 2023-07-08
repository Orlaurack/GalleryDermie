import { createRouter, createWebHistory } from 'vue-router';
import Gallery from './components/Gallery.vue';
import Detail from './components/Detail.vue';
import AddImage from './components/AddImage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Gallery
  },
  {
    path: '/add-image',
    name: 'AddImage',
    component: AddImage
  },
  {
    path: '/:animal',
    name: 'Detail',
    component: Detail
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
