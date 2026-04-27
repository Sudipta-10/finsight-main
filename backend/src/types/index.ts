export enum Role {
  VIEWER = 'VIEWER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN'
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
