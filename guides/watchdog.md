# Watchdog

A Watchdog is created which is run by as a cronjob every 2 minutes.

It uses netcat to check the backend port. If it isn't available, the script for starting/restarting the backend is executed.

The cronjob is configured to log to `watchdog_log.txt`. This keeps a list of all crashes/startups for monitoring.

This is `watchdog.sh`:
```
if ! nc -z localhost 41920; then
        echo "$(date) - Port is closed"
        source ~/BrettSpiel_Backend/deployment/startServer.sh
fi
```