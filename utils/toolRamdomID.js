const ids = require('short-id');
ids.configure({
    length: 12,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt: Math.random   // A salt value or function
});
for(let i =0;i<500;i++){
    console.log(ids.generate().toUpperCase());
}