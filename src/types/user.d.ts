export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  role: 'client' | 'teammate' | 'admin';

  [key: string]: unknown;
}
