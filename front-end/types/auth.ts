//TYPER PER REGISTER
export interface SignUpResponse {
    message: string;
    user: AuthUser;
}

// TYPES PER LOGIN
export interface AuthUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    last_login_at: string|null;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
}


export interface LoginCredentials {
    email:string;
    password: string;
}


//  TYPES PER USER
export interface CurrentUserResponse {
    user: AuthUser;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterUser {
    id: string;
    name: string;
    surname: string;
    email: string;
}