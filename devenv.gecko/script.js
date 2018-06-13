(function(){
  console.log(1);
  return function(){
    console.log(2);
    return function (params) {
      console.log(3);
    }
  }
})()()();