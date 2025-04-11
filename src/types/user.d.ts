export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  role: 'client' | 'teammate' | 'admin';
  access_token?: string;

  [key: string]: unknown;
}
