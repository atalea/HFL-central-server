# HFL-NodeJS

# Usage Instructions
0. Ensure you are running NodeJS 18.X.X or above!
1. Run `npm i`

# Windows:
1. run start_central.bat
2. run start_sim.bat when all clients are connected.

# Mac:
1. change line 6 of "start_sim.sh" to `open -a Google\ Chrome http://${HOST}:3000/start` 
2. Follow Linux instructions.

# Linux: 
1. run `chmod +x start_central.sh` to ensure it is executeable.
2. run `chmod +x start_sim.sh` to ensure it is executeable.
3. run `./start_central.sh` to start central server.
4. run `./start_sim.sh` to begin HFL training when all clients are connected and loaded