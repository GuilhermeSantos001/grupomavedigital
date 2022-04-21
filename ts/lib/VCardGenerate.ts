import vCardsJS from 'vcards-js';
import fs from 'fs-extra';
import Random from '@/utils/random';
import { UploadsController } from '@/controllers/UploadsController';
import { localPath } from '@/utils/localpath';
import { Photo } from '@/schemas/CardsSchema';
export interface Birthday {
    year: number;
    month: number;
    day: number;
}
export interface SocialUrls {
    media: string;
    url: string;
}

export type Label = 'Work Address' | 'Home Address';

export type CountryRegion = 'Brazil' | 'United States';

export type SocialmediaName = 'facebook' | 'youtube' | 'linkedin' | 'instagram' | 'twitter';

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
    metadata: Metadata;
}

export interface Metadata {
    file: {
        path: string
        name: string;
        type: string;
    }
    logotipo: {
        path: string
        name: string;
        type: string;
    }
    photo: {
        path: string
        name: string;
        type: string;
    }
}

export async function VCardGenerate(vcard: VCard): Promise<Metadata> {
    try {
        const
            uploadsController = new UploadsController(),
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

        if (!fs.existsSync('temp'))
            fs.mkdirSync('temp');

        //set properties
        vCard.firstName = vcard.firstname;
        vCard.lastName = vcard.lastname;
        vCard.organization = vcard.organization;

        const
            logotipoFileName = Random.HASH(String(`${vcard['firstname']}_${vcard['lastname']}_${logotipo.name}`).length, 'hex'),
            logotipoFilePath = `temp/${logotipoFileName}${logotipo.type}`,
            logotipoWriteStream = fs.createWriteStream(logotipoFilePath),
            photoFileName = Random.HASH(String(`${vcard['firstname']}_${vcard['lastname']}_${photoProfile.name}`).length, 'hex'),
            photoFilePath = `temp/${photoFileName}${photoProfile.type}`,
            photoWriteStream = fs.createWriteStream(photoFilePath);

        await uploadsController.raw(logotipoWriteStream, logotipo.id);
        await uploadsController.raw(photoWriteStream, photoProfile.id);

        vCard.photo.embedFromString(Buffer.from(fs.readFileSync(logotipoFilePath)).toString('base64'), formatterIMG(`${logotipo.name}${logotipo.type}`));
        vCard.logo.embedFromString(Buffer.from(fs.readFileSync(photoFilePath)).toString('base64'), formatterIMG(`${photoProfile.name}${photoProfile.type}`));
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
            youtube: "",
            linkedIn: "",
            instagram: "",
            twitter: "",
            tiktok: "",
            flickr: "",
        };

        vcard.socialUrls.forEach(social => vCard.socialUrls[String(social.media).toLowerCase()] = social.url);

        // ? Save to File in temp folder
        const
            filename = Random.HASH(String(`${vcard['firstname']}_${vcard['lastname']}_${vcard['organization']}.vcf`).length, 'hex'),
            filepath = localPath(`temp/${filename}.vcf`);

        vCard.version = '3.0'; // * can also support 2.1 and 4.0, certain versions only support certain fields

        await vCard.saveToFile(filepath);

        return {
            file: {
                path: `temp/${filename}.vcf`,
                name: filename,
                type: '.vcf'
            },
            logotipo: {
                path: logotipoFilePath,
                name: vcard.logo.name,
                type: vcard.logo.type
            },
            photo: {
                path: photoFilePath,
                name: vcard.photo.name,
                type: vcard.photo.type,
            }
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
    }
}