#!/bin/bash
# Add only panel configuration (without duplicating /admin)

# Restore from git to ensure clean state first
cd /home/joaquin_aput/smartflex_chatbot 2>/dev/null || true

# Create the new config block (only panel and _next)
cat > /tmp/panel_block.conf << 'PANELEOF'

    # New Admin Panel (Next.js) - Added automatically
    location /panel {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Next.js static assets
    location /_next {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

PANELEOF

# Check if panel already exists
if grep -q "location /panel" /etc/nginx/sites-enabled/smartflex.conf; then
    echo "Panel config already exists, skipping..."
else
    # Insert before "# Admin Panel API"
    sudo sed -i '/# Admin Panel API/r /tmp/panel_block.conf' /etc/nginx/sites-enabled/smartflex.conf
fi

# Verify and reload
sudo nginx -t && sudo systemctl reload nginx && echo "Success!" || echo "Failed!"
