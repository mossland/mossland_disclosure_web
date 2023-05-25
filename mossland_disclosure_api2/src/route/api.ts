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

router.get('/recent_release', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.release_schedule WHERE date BETWEEN NOW() - INTERVAL 3 MONTH AND NOW()', 
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
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch recent release fail', e));
    }
});

router.get('/expected_release', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.release_schedule WHERE date >= CURDATE() AND date <= (CURDATE() + INTERVAL 3 MONTH)',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result)
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});


router.get('/disclosure', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.disclosure ORDER BY date DESC',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});


router.get('/materials', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.materials ORDER BY date DESC',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});

export default router;