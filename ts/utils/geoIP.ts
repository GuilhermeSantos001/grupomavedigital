/**
 * @description Retorna as informações de IP do cliente
 * @author GuilhermeSantos001
 * @update 13/11/2021
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

export function clearIPAddress(ip: string): string {
  const words = [
    '::',
    ':',
    'ffff'
  ]

  words.forEach(word => ip = ip.replace(word, ''));

  return ip;
}

export default function (req: express.Request): IP {
  const ip: string | number = req.headers['x-real-ip'] instanceof Array ? req.headers['x-real-ip'][0] : req.headers['x-real-ip'] || req.ip,
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