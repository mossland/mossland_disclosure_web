import { Router } from "express";
import StatusCodes from 'http-status-codes';

import DB from '../db/db';
import ServerError from "../util/serverError";

const router = Router();
router.get('/market', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.market_data', 
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch market fail', e));
    }
});

export default router;