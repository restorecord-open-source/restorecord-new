import { useState, useEffect } from "react";
import NavBar from "../components/landing/NavBar";
import { Toaster } from "react-hot-toast";
import styles from "../public/styles/login.module.css";
import Link from "next/link";
import functions from "../src/functions";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const redirect_to: any = router.query.redirect_to;
    const username_query: any = router.query.username;


    const onSubmit = (e: any) => {
        e.preventDefault();
        fetch(`/api/v1/auth/login`, {
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
                    setTimeout(() => router.push(redirect_to ? redirect_to : "/dashboard"), 500);
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
        try {
            if (localStorage.getItem("token")) {
                fetch(`/api/v1/user`, {
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
        }
        catch (error) {
            console.log(error);
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>RestoreCord | Login</title>
                <meta name="description" content="Login to RestoreCord, the best option if you need to backup and restore your Discord Server Members, Settings, Channels, Roles, etc." />
            </Head>

            <NavBar />
            <Toaster />
            <div className={styles.mainWrapper}>
                <div className={styles.loginWrapper}>
                    <div className={styles.header}>
                        <h1>Log into your Account</h1>
                    </div>
                    <form className={styles.formWrapper} onSubmit={onSubmit}>
                        <div className={styles.form}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username</label>
                                <div className="relative mb-6">
                                    <input name="username" onChange={handleChange} type="text" id="username" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Username" defaultValue={username_query} />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input name="password" onChange={handleChange} type="password" id="password" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••••" />
                                </div>
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