class functions {
    constructor() {
        this.toUptime = this.toUptime.bind(this);
    }

    static toUptime(uptime) {
        const days = Math.floor(uptime / (60 * 60 * 24));
        const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);
        const milliseconds = Math.floor((uptime % 1) * 1000);

        return { 
            full: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`,
            short: `${hours}h ${minutes}m`,

            days: days, 
            hours: hours, 
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds
        };
    }

    static totalRequests() {
        // 
    }
}

export default functions;