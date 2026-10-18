const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateName = (value: string) =>
  value.trim().length >= 2 ? undefined : "Enter your full name.";

export const validateEmail = (value: string) =>
  EMAIL.test(value.trim()) ? undefined : "Enter a valid email address.";

export const validateNewPassword = (value: string) =>
  value.length >= 8 ? undefined : "Use at least 8 characters.";

export const validatePassword = (value: string) =>
  value.length > 0 ? undefined : "Enter your password.";
