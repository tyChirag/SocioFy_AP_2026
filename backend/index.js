const express=require('express');
const cors=require('cors')
const app=express()
app.use(cors());
require('dotenv').config()
app.get('/',(req,res)=>{
console.log(req.url,req.method)
res.status(200).json({message:'This is your backend'})
})
app.listen(process.env.PORT,()=>{
  console.log('Server is running on port on http://localhost:3000')
})