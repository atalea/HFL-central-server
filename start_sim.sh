#!/bin/bash
read -p "Enter Central Server IP: " HOST
xdg-open http://${Host}:3000/start
