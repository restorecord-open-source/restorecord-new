import { object, string, array, number, setLocale  } from "yup";

export const SignupSchema = object({
    username: string().required().min(2).max(40).typeError("Username must be between 2 and 40 characters"),
    email: string().required().email().min(6).max(40).typeError("Email must be a valid email address"),
    password: string().required().min(6).max(32).typeError("Password must be between 6 and 32 characters"),
    captcha: string().required().typeError("Please verify you are not a robot"),
})

export const LoginSchema = object({
    username: string().required().min(2).max(40).typeError("Username must be between 2 and 40 characters"),
    password: string().required().min(6).max(32).typeError("Password must be between 6 and 32 characters"),
});

setLocale({
    string: {
        email: "Email must be a valid email address",
        min: "${path} must be at least ${min} characters",
        max: "${path} can't be more than ${max} characters",
    },
    number: {
        min: "${path} must be at least ${min} characters",
        max: "${path} can't be more than ${max} characters",
    },
    mixed: {
        required: "${path} is required",
    },
})

