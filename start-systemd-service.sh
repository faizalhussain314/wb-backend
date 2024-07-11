# This is the script to start the server as a systemd service

# Load all environmental variables and start server
export PATH=/root/NodeJS/bin:$PATH

# Application specific environmental variables, scripts and commands
sh ./start.sh