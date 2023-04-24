#!/bin/bash
echo "Enter Port For Central:"
read PORT
echo "Enter Central Server IP:"
read HOST
google-chrome ${HOST}:${PORT}/start