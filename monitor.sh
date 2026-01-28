#!/bin/bash

HEALTH_URL="http://localhost:3000/health"
ALERT_EMAIL="your-email@example.com"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $STATUS -ne 200 ]; then
  echo "$(date): Application unhealthy (HTTP $STATUS)" >> /var/www/restaurant-orders/logs/monitor.log

  pm2 restart restaurant-orders

  echo "Application restarted due to unhealthy status" | mail -s "Alert: Restaurant Orders" $ALERT_EMAIL
else
  echo "$(date): Application healthy" >> /var/www/restaurant-orders/logs/monitor.log
fi
