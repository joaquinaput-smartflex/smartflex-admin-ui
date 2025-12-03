#!/bin/bash
# Add panel configuration to nginx

# Create the new config block
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

    # Admin Panel API (Backend)
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

PANELEOF

# Insert before "# Deny access to sensitive files"
sudo sed -i '/# Deny access to sensitive files/r /tmp/panel_block.conf' /etc/nginx/sites-enabled/smartflex.conf

# Verify and reload
sudo nginx -t && sudo systemctl reload nginx && echo "Success!" || echo "Failed!"
