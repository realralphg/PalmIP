import { isCurrent } from '@toneflix/vue-auth'

/**
 * Simple middleware that checkes if the user is authenticated
 *
 * Checks if the target route requires authentication
 *
 * Redirects user to specified route if user is not authenticated.
 *
 * @param redirectRoute If the user fails the check, they will be redirected here.
 * @returns
 */
export const authMiddleware = (redirectRoute) => {
  return (to, _, next, state, router) => {
    if (!(!!state.token && !!state.user.id) && !isCurrent(to, redirectRoute, router) && to.meta.requiresAuth) {
      return next(redirectRoute)
    }

    next()
  }
}
