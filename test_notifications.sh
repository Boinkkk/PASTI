#!/bin/bash

echo "🔔 Testing PASTI Notification System"
echo "=================================="

# Test 1: Trigger manual notification
echo "📱 Test 1: Triggering manual notification cron job..."
curl -X POST "http://localhost:8080/api/guru/notifications/trigger" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

echo -e "\n"

# Test 2: Get notification stats  
echo "📊 Test 2: Getting notification statistics..."
curl -X GET "http://localhost:8080/api/guru/notifications/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

echo -e "\n"

echo "✅ Test completed!"
echo ""
echo "📝 Instructions:"
echo "1. Make sure your API server is running: go run main.go"
echo "2. Replace YOUR_JWT_TOKEN_HERE with actual JWT token from login"
echo "3. Ensure FONNTE_API_KEY is set correctly in .env file"
echo "4. Check database for notifikasi_tugas table entries"
