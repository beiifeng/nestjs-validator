# Benchmark

``` powershell
pnpm run build
pnpm --filter "@example/benchmark" build
pnpm --filter "@example/benchmark" start:prod
```

``` powershell
$body = '{"id":"550e8400-e29b-41d4-a716-446655440000","username":"john_doe","gender":"male","age":30,"email":"john_doe@example.com","roles":[{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"},{"code":"ADMIN","name":"Administrators"}],"createdAt":"2024-06-05T12:00:00.000Z"}'
```

``` powershell
pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/typebox
pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/zod

pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/typebox
pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/zod

pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/typebox
pnpm dlx autocannon -c 50 -d 30 -m POST -H "content-type: application/json" -b $body http://127.0.0.1:3000/app/zod
```

``` powershell
Invoke-RestMethod -Uri "http://localhost:3000/app/typebox" -Method POST -ContentType "application/json" -Body $body
Invoke-RestMethod -Uri "http://localhost:3000/app/zod" -Method POST -ContentType "application/json" -Body $body
```