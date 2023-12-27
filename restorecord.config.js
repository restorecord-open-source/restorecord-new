module.exports = {
    apps: [{
        name: "restorecord",
        max_restarts: 100,
        script: "node_modules/next/dist/bin/next",
        args: "start",
        autorestart: true,
    }],
};