import { Platform } from 'quasar';
import { defineBoot } from '#q-app/wrappers'
import { reboot } from '../plugins/processor';
import { useBootstrapStore } from '../stores/bootstrap';
import { useUserStore } from '../stores/user-store'

export default defineBoot(({ app, router }) => {
  router.beforeResolve(async () => {
    // Load stores
    const userStore = useUserStore();
    const bootStore = useBootstrapStore();
    const user = userStore.user;

    // Set user to global
    app.config.globalProperties.$user = user
    // Set boot to global
    app.config.globalProperties.$boot = bootStore

    // Check if the app is booted or not and reboot if not booted
    if (bootStore.isBooted === false && !Platform.is.capacitor) {
      await reboot(app);
    } else {
      // Update user global
      app.config.globalProperties.$user = userStore.user
      // Update boot global
      app.config.globalProperties.$boot = bootStore
    }

    return true;
  });
})
