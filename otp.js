function otp(){
    a="";
    for(i=0;i<4;i++){
        b=Math.floor(Math.random()*10);
        a+=b;
    }
    // console.log(a);
    return a;
}

module.exports=otp;