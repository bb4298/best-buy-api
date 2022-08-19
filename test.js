var arr = [
    [1,2,3],
    ['x','y','z'],
    ['a','b','c']
];
var [id, name, text] = arr;

for(i=0; i <arr.length; i++){
    console.log(id[i]+name[i]+text[i]);
}