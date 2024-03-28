#!/bin/bash

echo
echo 
echo "Creating Admin Login"
echo 

# Prompt the user for username
read -p "Enter username: " username

# Prompt the user for password (hide input)
read -s -p "Enter password: " password
echo

node dist/main.js "$username" "$password"