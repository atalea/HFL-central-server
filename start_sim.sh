#!/bin/bash
PublicIP=$(curl ifconfig.me)
google-chrome ${PublicIP}:3000/start