import { Router } from "express";

const router = Router();
router.get('/market', (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.market_data', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

export default router;