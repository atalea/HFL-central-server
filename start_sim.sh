#!/bin/bash
read -p "Enter Central Server IP: " HOST
xdg-open http://${HOST}:3000/start
