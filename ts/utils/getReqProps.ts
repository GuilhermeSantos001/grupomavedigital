/**
 * @description Retorna propriedades inseridas na rota.
 * @author @GuilhermeSantos001
 * @update 29/09/2021
 */

import express from "express";

export default function getReqProps(req: express.Request, props: string[]): Record<string, unknown> {
  const reqProps: Record<string, unknown> = {};

  props.forEach((prop: string) => {
    if (Object.keys(req.headers).filter(param => param === prop).length > 0) {
      if (req.headers[prop] != undefined)
        return reqProps[prop] = req.headers[prop];
    }

    if (Object.keys(req.params).filter(param => param === prop).length > 0) {
      if (req.params[prop] != undefined)
        return reqProps[prop] = req.params[prop];
    }

    if (Object.keys(req.body).filter(param => param === prop).length > 0) {
      if (req.body[prop] != undefined)
        return reqProps[prop] = req.body[prop];
    }

    if (Object.keys(req.query).filter(param => param === prop).length > 0) {
      if (req.query[prop] != undefined)
        return reqProps[prop] = req.query[prop];
    }
  });

  return reqProps;
}