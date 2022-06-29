import { useRouter } from "next/router";

export default function Settings() {
    const router = useRouter();
    const { server } = router.query;

    return (
        <>
            <span>{server}</span>
        </>
    )
}