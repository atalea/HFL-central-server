#!/bin/bash
PublicIP=$(curl ifconfig.me)
node central/index.js ${PublicIP}