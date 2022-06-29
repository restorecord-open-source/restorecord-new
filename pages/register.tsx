import NavBar from "../components/landing/Nav/NavBar"
import { useEffect, useState, useRef } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha";
import functions from "../src/functions";
import { Toaster } from "react-hot-toast";
import styles from "../public/styles/register.module.css"
import Link from "next/link";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken]: any = useState();
    const captchaRef: any = useRef();


    const onExpire = () => {
        functions.ToastAlert("Captcha expired", "error");
    }

    const onError = (err: any) => {
        functions.ToastAlert(err, "error");
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        captchaRef.current.execute();
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "email":
            setEmail(value);
            break;
        case "password":
            setPassword(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        if (token) {
            fetch(`/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    captcha: token
                })
            })
                .then(res => res.json())
                .then(res => {
                    setToken(null);
                    if (res.success) {
                        functions.ToastAlert("Account created", "success");
                    } 
                    else {
                        functions.ToastAlert(res.message, "error");
                    }
                });
        }
    }, [token, email, username, password]);


    return (
        <>
            <NavBar />
            <Toaster />
            <div className={styles.mainWrapper}>
                <div className={styles.registerWrapper}>
                    <div className={styles.header}>
                        <h2>Register an Account</h2>
                    </div>
                    <form className={styles.formWrapper} onSubmit={handleSubmit}>
                        <div className={styles.form}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Username</label>
                                <div className="relative mb-6">
                                    <input name="username" onChange={handleChange} type="text" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Username" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                                <div className="relative mb-6">
                                    <input name="email" onChange={handleChange} type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
                                <div className="flex">
                                    <input name="password" onChange={handleChange} type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••••" />
                                </div>
                            </div>

                            {/* <div className={styles.inputWrapper}>
                                <label htmlFor="username" className="sr-only">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    placeholder="Username"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email-address"
                                    required
                                    placeholder="Email address"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="password"
                                    required
                                    placeholder="Password"
                                    onChange={handleChange}
                                />
                            </div> */}

                            <div>
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                            </div>
                            
                            <div className={styles.formTextWrapper}>
                                <a className={styles.formText}>
                                    Already have an account? Login <Link href="/login"><span>here</span></Link>.
                                </a>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className={styles.formButton}>
                                Register
                            </button>
                        </div>  
                    </form>
                </div>
            </div>
        </>
    )
}
