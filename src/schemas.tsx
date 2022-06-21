import { object, string, array, number } from "yup";

export const SignupSchema = object({
    username: string().required().min(2).max(24),
    email: string().required().email(),
    password: string().required().min(6).max(32),
});