import Express from 'express';

const app = Express();


app.post('/recieve/start',(req,res,next)=>{

})




app.get('/',(req,res,next)=>{
    res.send("server do be running!")
})

app.use("*", (req, res, next) => {
    res.status(404);
    res.send({ error: "Request not found." });
  });
  
app.use((error, req, res, next) => {
    res.status(500);
    res.send({ error });
});