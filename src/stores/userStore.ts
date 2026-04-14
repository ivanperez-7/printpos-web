import { Store } from '@tanstack/store';
import type { UserResponse } from '@/lib/types';

export const userStore = new Store<UserResponse>({} as UserResponse);

export const userActions = {
  setUserInfo: (info: UserResponse) => userStore.setState(info),
  clear: () => userStore.setState({} as UserResponse),
};
