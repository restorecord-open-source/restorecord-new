
import { FC } from "react"
import styles from "../../public/styles/dashboard/sidebar.module.css"


interface Props {
    page?: boolean | undefined
}

const NavBarLoading: FC<Props> = ({ page }) =>  {
    const number = [0,1,2,3,4,5,6,7,8,9]

    return (
        <>
            <div className="bg-slate-900 h-screen w-full">
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
            </div>
        </>
    )
}

export default NavBarLoading;
