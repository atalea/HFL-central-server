# HFL-NodeJS

# Usage Instructions
0. Ensure you are running NodeJS 18.X.X or above!
1. Run `npm i`
2. Windows: run start_central.bat, run start_sim.bat when all clients are connected.
   Mac: change line 3 of "start_sim.sh" to `open http://${PublicIP}:3000/start` then follow Linux instructions.
   Linux: run `chmod +x start_central.sh` to ensure it is executeable.
          run `./start_central.sh` to start central server.
          run `chmod +x start_sim.sh` to ensure it is executeable.
          run `./start_sum.sh` to begin HFL training when all clients are connected
   
