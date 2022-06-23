import { useState, useEffect } from "react";
import NavBar from "../components/landing/nav/navBar";
import { Toaster } from "react-hot-toast";
import styles from "../public/styles/login.module.css";
import Link from "next/link";
import functions from "../src/functions";
import router from "next/router";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = (e: any) => {
        e.preventDefault();
        fetch(`/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    functions.ToastAlert(res.message, "error");
                }
                else {
                    functions.ToastAlert(res.message, "success");
                    localStorage.setItem("token", res.token);
                    setTimeout(() => router.push("/dashboard"), 1000);
                }
            })
            .catch(err => {
                functions.ToastAlert(err, "error");
            });
    }

    
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "password":
            setPassword(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetch(`/api/checkToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${localStorage.getItem("token")}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        functions.ToastAlert("You are already logged in, redirecting", "success");
                        setTimeout(() => router.push("/dashboard"), 1000);
                    }
                    else {
                        localStorage.removeItem("token");
                    }
                })
                .catch(err => {
                    functions.ToastAlert("Error please check console", "error");
                    console.log(err);
                });
        }
    }, []);

    return (
        <>
            <NavBar />
            <Toaster />
            <div className={styles.mainWrapper}>
                <div className={styles.loginWrapper}>
                    <div className={styles.header}>
                        <h2>Login to your Account</h2>
                    </div>
                    <form className={styles.formWrapper} onSubmit={handleSubmit}>
                        <div className={styles.form}>
                            <div className={styles.inputWrapper}>
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
                            </div>
                            
                            <div className={styles.formTextWrapper}>
                                <a className={styles.formText}>
                                    Don&#39;t have an account? Register <Link href="/register"><span>here</span></Link>.
                                </a>
                            </div>
                        </div>

                        
                        <div>
                            <button type="submit" className={styles.formButton}>
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}