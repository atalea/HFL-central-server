#!/bin/bash
echo "Enter Port For Central to Run on:"
read PORT
echo "Enter Central Server IP to run on(local-IP):"
read HOST

export PORT
export HOST
node central/index.js