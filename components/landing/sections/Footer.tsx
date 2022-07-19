import { faDiscord, faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="pb-10">
            <ul className="flex items-center justify-center">
                <li className="mx-2 sm:mx-0">
                    <a className="md:pr-4 md:pl-4 pr-1 text-gray-200" href="https://community.restorecord.com">Support</a>
                </li>
                <li className="mx-2 sm:mx-0">
                    <a className="md:pr-4 md:pl-4 pr-1 text-gray-200" href="#pricing">Pricing</a>
                </li>
                <li className="mx-2 sm:mx-0">
                    <a className="md:pr-4 md:pl-4 pr-1 text-gray-200"
                        href="mailto:support@restorecord.com">Contact
                    </a>
                </li>
                <li className="mx-2 sm:mx-0">
                    <Link href="/terms">
                        <a className="md:pr-4 md:pl-4 pr-1 text-gray-200">
                            Terms
                        </a>
                    </Link>
                </li>
                <li className="mx-2 sm:mx-0">
                    <Link href="/privacy">
                        <a className="md:pr-4 md:pl-4 pr-1 text-gray-200">
                            Privacy
                        </a>
                    </Link>
                </li>
            </ul>

            <ul className="flex items-center justify-center my-5">
                <li className="mx-1">
                    <a href="https://www.youtube.com/channel/UCdO4LjbTjSJWxP9VQg7ZNXw">
                        <FontAwesomeIcon icon={faYoutube} className="text-xl hover:text-gray-400 text-gray-200 transition-all cursor-pointer" />
                    </a>
                </li>
                <li className="mx-1">
                    <a href="https://twitter.com/restorecord">
                        <FontAwesomeIcon icon={faTwitter} className="text-xl hover:text-gray-400 text-gray-200 transition-all cursor-pointer" />
                    </a>
                </li>
            </ul>

            <div className="text-center">
                <p className="text-gray-400">© {new Date().getFullYear()} RestoreCord. All rights reserved.</p>
            </div>
        </footer>
    )
}