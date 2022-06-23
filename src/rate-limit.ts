import LRU from "lru-cache";

const rateLimit = (options: any) => {
    const tokenCache = new LRU({
        max: parseInt(options.uniqueTokenPerInterval || 500, 10),
        maxAge: parseInt(options.interval || 60000, 10),
    })

    return {
        check: (res: any, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount: any = tokenCache.get(token) || [0]
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount)
                }
                tokenCount[0] += 1

                const currentUsage = tokenCount[0]
                const isRateLimited = currentUsage >= parseInt(options.limit, 10)
                res.setHeader("X-RateLimit-Limit", options.limit)
                res.setHeader(
                    "X-RateLimit-Remaining",
                    isRateLimited ? 0 : options.limit - currentUsage
                )

                return isRateLimited ? reject() : resolve()
            }),
    }
} 

export default rateLimit