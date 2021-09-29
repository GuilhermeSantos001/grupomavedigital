/**
 * @description Retorna as informações de IP do cliente
 * @author @GuilhermeSantos001
 * @update 21/09/2021
 * @version 1.0.0
 */

import express from 'express';
import { lookup } from 'geoip-lite';

interface IP {
  country: string;
  region: string;
  city: string;
  location: string;
  ip: string;
}

export default function (req: express.Request): IP {
  const ip = req.ip,
    geoIP = lookup(ip) || { 'country': 'Unknown', 'region': 'Unknown', 'city': 'Unknown' },
    userIP: IP = {
      country: geoIP['country'],
      region: geoIP['region'],
      city: geoIP['city'],
      location: `${geoIP['country']}(${geoIP['city']}/${geoIP['region']})`,
      ip
    };

  return userIP;
}