#!/bin/bash
read -p "Enter Central Server IP to run on: " HOST
export HOST
node central/index.js