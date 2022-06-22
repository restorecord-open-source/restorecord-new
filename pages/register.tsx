import Link from "next/link"
import NavBar from "../components/landing/nav/navBar"
import { useEffect, useState, useRef } from "react"
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken]: any = useState();
    const captchaRef: any = useRef();


    const onExpire = () => {
        console.log("Captcha expired");
    }

    const onError = (err: any) => {
        console.log(err);
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log(token);
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
            fetch(`/api/register`, {
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
                    if (res.success) {
                        console.log(res);
                    } 
                    else {
                        console.log(res);setToken(null);
                    }
                });
        }
    }, [token, email, username, password]);


    return (
        <>
            <NavBar />
            <div className="h-full min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-200">Register an Account</h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="username" className="sr-only">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pt-5">
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Register
                            </button>
                        </div>  
                    </form>
                </div>
            </div>
        </>
    )
}
