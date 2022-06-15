function toUptime(time) {
    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

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