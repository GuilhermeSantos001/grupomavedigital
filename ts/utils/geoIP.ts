/**
 * @description Retorna as informações de IP do cliente
 * @author @GuilhermeSantos001
 * @update 21/09/2021
 * @version 1.0.0
 */

import { lookup } from 'geoip-lite';

interface IP {
  country: string;
  region: string;
  city: string;
  location: string;
  ip: string;
};

export default function (req: any): IP {
  let ip = req.ip,
    geoIP = lookup(ip) || { 'country': 'Unknown', 'region': 'Unknown', 'city': 'Unknown' },
    userIP: IP = {
      country: geoIP['country'],
      region: geoIP['region'],
      city: geoIP['city'],
      location: `${geoIP['country']}(${geoIP['city']}/${geoIP['region']})`,
      ip
    };

  return userIP;
};