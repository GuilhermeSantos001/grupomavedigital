/**
 * @description Gerador de vcard
 * @author @GuilhermeSantos001
 * @update 12/10/2021
 */

import { readFileSync } from 'fs';
import vCardsJS from 'vcards-js';

import { localPath } from '@/utils/localpath';
import Random from '@/utils/random';

export interface Photo {
    name: string;
    path: string;
}

export interface Birthday {
    year: number;
    month: number;
    day: number;
}

export interface SocialUrls {
    media: string;
    url: string;
}

export interface File {
    name: string;
    path: string;
}

export type Label = 'Work Address' | 'Home Address';

export type CountryRegion = 'Brazil' | 'United States';

export type SocialmediaName = 'Facebook' | 'Youtube' | 'Linkedin' | 'Instagram' | 'Twitter';

export interface VCard {
    firstname: string;
    lastname: string;
    organization: string;
    photo: Photo;
    logo: Photo;
    workPhone: string[];
    birthday: Birthday;
    title: string;
    url: string;
    workUrl: string;
    email: string;
    label: Label;
    countryRegion: CountryRegion;
    street: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    socialUrls: SocialUrls[];
    file?: File;
}

export default async function vcard(vcard: VCard): Promise<string> {
    try {
        const
            vCard = vCardsJS(),
            formatterIMG = (filename: string) => {
                if (String(filename).indexOf('.png') != -1)
                    return 'image/png';
                if (
                    String(filename).indexOf('.pjpeg') != -1 ||
                    String(filename).indexOf('.jpeg') != -1 ||
                    String(filename).indexOf('.pjp') != -1 ||
                    String(filename).indexOf('.jpg') != -1
                )
                    return 'image/jpg';
                if (
                    String(filename).indexOf('.gif') != -1 ||
                    String(filename).indexOf('.jfif') != -1
                )
                    return 'image/gif';

                return 'image';
            },
            logotipo = vcard.logo,
            photoProfile = vcard.photo;

        //set properties
        vCard.firstName = vcard.firstname;
        vCard.lastName = vcard.lastname;
        vCard.organization = vcard.organization;
        vCard.photo.embedFromString(Buffer.from(readFileSync(localPath(`public/${photoProfile.path}${photoProfile.name}`))).toString('base64'), formatterIMG(photoProfile.name));
        vCard.logo.embedFromString(Buffer.from(readFileSync(localPath(`public/${logotipo.path}${logotipo.name}`))).toString('base64'), formatterIMG(logotipo.name));
        vCard.workPhone = vcard.workPhone;
        vCard.birthday = new Date(vcard.birthday.year, vcard.birthday.month, vcard.birthday.day);
        vCard.title = vcard.title;
        vCard.url = vcard.url;
        vCard.workUrl = vcard.workUrl;
        vCard.workEmail = vcard.email;
        vCard.workAddress.label = vcard.label;
        vCard.workAddress.street = vcard.street;
        vCard.workAddress.city = vcard.city;
        vCard.workAddress.stateProvince = vcard.stateProvince;
        vCard.workAddress.postalCode = vcard.postalCode;
        vCard.workAddress.countryRegion = vcard.countryRegion;
        vCard.socialUrls = {
            facebook: "",
            flickr: "",
            linkedIn: "",
            twitter: ""
        };

        vcard.socialUrls.forEach(social => vCard.socialUrls[social.media] = social.url);

        //save to file
        const
            filename = Random.HASH(String(`${vcard['firstname']}_${vcard['lastname']}_${vcard['organization']}.vcf`).length, 'hex'),
            filepath = localPath(`public/vcf/${filename}`);

        vCard.version = '3.0'; //can also support 2.1 and 4.0, certain versions only support certain fields

        await vCard.saveToFile(filepath);

        return filename;
    } catch (error) {
        throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
    }
}