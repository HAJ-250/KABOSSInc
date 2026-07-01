echo "=== Server Health ==="
curl -s http://localhost:3001/api/health || echo "SERVER DOWN"

echo ""
echo "=== Auth Test ==="
RES=$(curl -s http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@kabossinc.com","password":"admin123"}')
echo "$RES" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.token?'Token: OK':'Token: FAIL');console.log('Role:',j.user?.role)})"

echo ""
echo "=== Database Stats ==="
TOKEN=$(echo "$RES" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
curl -s http://localhost:3001/api/admin/stats -H "Authorization: Bearer $TOKEN"

echo ""
echo "=== NPM Audit ==="
npm audit 2>&1 | tail -5

echo ""
echo "=== TypeScript ==="
npx tsc --noEmit 2>&1 && echo "No TS errors" || echo "TS errors found"
