import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useEffect, useState } from "react"
import styles from "../../public/styles/dashboard/sidebar.module.css"
import navItemWrappers from "../../src/dashboard/navBarItems"

export default function NavBar({ user }: any) {
    const [pathName, setPathName] = useState("/")
    const number = [0,1,2,3,4,5,6,7,8,9]

    useEffect(() => {
        setPathName(window.location.pathname);
    }, [])

    if (!user.username) {
        return (
            <>
                <aside className={styles.sideBarMainWrapper} aria-label="Sidebar">
                    <div className={styles.sideBarWrapper}>
                        <span className={styles.sideBarTitleWrapper}>
                            <span className={styles.sideBarTitle}>Restore<span>Cord</span></span>
                        </span>

                        <div className="animate-pulse space-y-5">
                            {number.map(num => (
                                <div className="flex flex-row" key={num}>
                                    <div className="h-6 w-6 rounded-lg bg-gray-500 ml-2"></div>
                                    <div className="flex flex-col space-y-3 pl-2">
                                        <div className="h-7 w-32 rounded-md bg-gray-500"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </>
        )
    }

    return (
        <>
            <FontAwesomeIcon id="menu" className={styles.sideBurgerMenu} icon={faBars} onClick={() => {
                document.querySelector("#sidebar")?.classList.toggle(styles.sideBarOpen);
                document.querySelector("#menu")?.classList.toggle(styles.sideBurgerClose);
            } } />

            <aside className={styles.sideBarMainWrapper} aria-label="Sidebar" id="sidebar">
                <div className={styles.sideBarWrapper}>
                    <div className="inline-flex">
                        <FontAwesomeIcon id="close" className={styles.sideBurgerMenuClose} icon={faBars} onClick={() => {
                            document.querySelector("#sidebar")?.classList.toggle(styles.sideBarOpen);
                            document.querySelector("#menu")?.classList.toggle(styles.sideBurgerClose);
                        } } />

                        <span className={styles.sideBarTitleWrapper}>
                            <span className={styles.sideBarTitle}>Restore<span>Cord</span></span>
                        </span>
                    </div>
                    
                    {navItemWrappers.map((item, index) => {
                        return (
                            <ul className={item.seperator ? `${styles.itemWrapperSeperator}` : `${styles.itemWrapperNormal}`} key={index}>
                                {item.items.map((item, index) => {
                                    if (item.admin && !user.admin) {
                                        return null
                                    }
                                    return (
                                        <li key={index}>
                                            <Link href={item.href}>
                                                <a className={pathName === item.href ? `${styles.itemWrapper} ${styles.itemWrapperActive}` : `${styles.itemWrapper}`}>
                                                    {item.icon}
                                                    <span>{item.name}</span>
                                                </a>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )
                    })}

                </div>
            </aside>
        </>
    )
}


