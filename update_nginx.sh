#!/bin/bash
# Backup original config
sudo cp /etc/nginx/sites-enabled/smartflex.conf /etc/nginx/sites-enabled/smartflex.conf.bak

# Insert panel config before Admin Panel API section
sudo sed -i '/# Admin Panel API/r /tmp/nginx-panel.conf' /etc/nginx/sites-enabled/smartflex.conf

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "Nginx config test failed. Restoring backup..."
    sudo cp /etc/nginx/sites-enabled/smartflex.conf.bak /etc/nginx/sites-enabled/smartflex.conf
fi
