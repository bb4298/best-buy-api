const jwt1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkTmd1b2lEdW5nIjoiNWU3NjIwYTdiZDc0NzIzNTc0YmJiODEzIiwiZW1haWwiOiJxdWFuZ25ndXk0M2VuLjQyOThAZ21haWwuY29tIn0sImlhdCI6MTU4OTU1NzkwMCwiZXhwIjoxNTg5NTU4ODAwfQ.NroX-Ybs3VsyLzyepyOGxeEVH--f4Bejq8w4as5e8rI';
const jwt2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjVlNzYyMGE3YmQ3NDcyMzU3NGJiYjgxMyIsInZhaVRybyI6MX0sImlhdCI6MTU4OTk1NzcxNSwiZXhwIjoxNTkwMzg5NzE1fQ.Sbvb3s-5BW5V9p5P6wWxJ1DxMvQYt_Kh-uxdihEMb-Q';
const jwt3 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjVlNzYyMTVhYmQ3NDcyMzU3NGJiYjgxNCIsInZhaVRybyI6Mn0sImlhdCI6MTU4OTczOTg2OCwiZXhwIjoxNTkwMTcxODY4fQ.69HP-md83eMbvjMGGeK4hDA4snehbUdbuHhXmuJ7bOw';

console.log(jwt1.split('',3))

console.log(jwt1.length)
console.log(jwt2.length)
console.log(jwt3.length)


console.log(jwt1.slice(jwt1.length - 43, jwt1.length));
console.log(jwt2.slice(jwt2.length - 43, jwt2.length));
console.log(jwt3.slice(jwt3.length - 43, jwt3.length));