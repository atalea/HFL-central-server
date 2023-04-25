# HFL-NodeJS

# Usage Instructions
0. Ensure you are running NodeJS 18.X.X or above!
1. Run `npm i`

# Windows:
1. run start_central.bat
2. run start_sim.bat when all clients are connected.

# Mac:
1. change line 3 of "start_sim.sh" to `open http://${PublicIP}:3000/start` 
2. Follow Linux instructions.

# Linux: 
1. run `chmod +x start_central.sh` to ensure it is executeable.
2. run `chmod +x start_sim.sh` to ensure it is executeable.
<<<<<<< HEAD
3. change line 3 of "start_sim.sh" to `xdg-open http://${PublicIP}:3000/start` 
4. run `./start_central.sh` to start central server.
5. run `./start_sum.sh` to begin HFL training when all clients are connected
   
=======
3. run `./start_central.sh` to start central server.
4. run `./start_sim.sh` to begin HFL training when all clients are connected and loaded
>>>>>>> 2c2d9b1d64cd28b8b123e973738284ea15c9ccf3
