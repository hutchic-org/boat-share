export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return;

    const accessToken = process.client ? sessionStorage.getItem('googleAccessToken') : null;

    if (!accessToken && to.path !== '/') {
      return navigateTo('/');
    }

    if (accessToken && to.path === '/') {
      return navigateTo('/secure');
    }
  });
