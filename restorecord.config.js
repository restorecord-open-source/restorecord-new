module.exports = {
    apps : [{
        name: "restorecord",
        script: 'npx next start',
        max_restarts: 100,
        autorestart: true
    }],
};
