import { Store } from '@tanstack/store'

type AuthState = {
  accessToken: string | null
}

type AuthActions = {
  setAccessToken: (token: string | null) => void
  clear: () => void
}

const initialState: AuthState = {
  accessToken: null,
}

export const authStore = new Store<AuthState>(initialState)

export const authActions: AuthActions = {
  setAccessToken: (token) => {
    authStore.setState((prev) => ({ ...prev, accessToken: token }))
  },
  clear: () => {
    authStore.setState(initialState)
  },
}
