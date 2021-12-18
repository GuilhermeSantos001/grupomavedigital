/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Retorna propriedades inseridas na rota.
 * @author @GuilhermeSantos001
 * @update 16/12/2021
 */

import express from "express";

export default function getReqProps(req: express.Request, props: string[]): Record<string, any> {
  const reqProps: Record<string, any> = {};

  props.forEach((prop: string) => {
    if (req.headers && Object.keys(req.headers).filter(param => param === prop).length > 0) {
      if (req.headers[prop] != undefined)
        return reqProps[prop] = req.headers[prop];
    }

    if (req.params && Object.keys(req.params).filter(param => param === prop).length > 0) {
      if (req.params[prop] != undefined)
        return reqProps[prop] = req.params[prop];
    }

    if (req.body && Object.keys(req.body).filter(param => param === prop).length > 0) {
      if (req.body[prop] != undefined)
        return reqProps[prop] = req.body[prop];
    }

    if (req.query && Object.keys(req.query).filter(param => param === prop).length > 0) {
      if (req.query[prop] != undefined)
        return reqProps[prop] = req.query[prop];
    }
  });

  return reqProps;
}