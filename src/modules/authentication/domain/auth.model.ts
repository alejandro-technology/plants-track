export interface UserEntity {
  uid: string;
  email: string;
  name?: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: UserEntity;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: UserEntity;
}
