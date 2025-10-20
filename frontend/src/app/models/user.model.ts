// frontend/src/app/models/user.model.ts

/**
 * Interface para el registro de usuarios
 * Debe coincidir con UserCreate del backend
 */
export interface UserRegister {
  email: string;
  password: string;
}

/**
 * Interface para el login
 * Usa los mismos campos que UserCreate en el backend
 */
export interface UserLogin {
  email: string;
  password: string;
}

/**
 * Interface para la respuesta del login
 * Coincide con Token del backend
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/**
 * Interface para mensajes del servidor
 */
export interface MessageResponse {
  msg: string;
}