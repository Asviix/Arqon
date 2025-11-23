// ecosystem.config.js

module.exports = {  
    apps: [
        {
            name: "Arqon-dev",
            interpreter: "node",
            script: "src/index.ts",
            node_args: [
                "-r", 
                "ts-node/register", 
                "-r", 
                "tsconfig-paths/register",
            ],
            env: {
                "NODE_ENV": "local"
            },
            exec_mode: "fork",
            stop_exit_codes: [0],
            autorestart: true,
            ignore_watch: ["node_modules"],
            instances: 1,
            out_file: "./logs/app.stdout.log",
            error_file: "./logs/app.stderr.log",
        },
    ],
};