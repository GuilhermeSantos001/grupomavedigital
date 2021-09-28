/**
 * @description Retorna propriedades inseridas na rota.
 * @author @GuilhermeSantos001
 * @update 28/06/2021
 * @version 1.0.0
 */

import { Request } from 'express';

export default function getReqProps(req: Request, props: string[]) {
  let reqProps: any = {};

  props.forEach((prop: string) => {
    if (Object.keys(req.headers).filter(param => param === prop).length > 0) {
      if (req.headers[prop] != undefined)
        return reqProps[prop] = req.headers[prop];
    };

    if (Object.keys(req.params).filter(param => param === prop).length > 0) {
      if (req.params[prop] != undefined)
        return reqProps[prop] = req.params[prop];
    };

    if (Object.keys(req.body).filter(param => param === prop).length > 0) {
      if (req.body[prop] != undefined)
        return reqProps[prop] = req.body[prop];
    };

    if (Object.keys(req.query).filter(param => param === prop).length > 0) {
      if (req.query[prop] != undefined)
        return reqProps[prop] = req.query[prop];
    };
  });

  return reqProps;
};