
module.exports = (vcard) => {
    return new Promise(async (resolve, reject) => {
        try {
            const vCardsJS = require('vcards-js'),
                fs = require('fs'),
                path = require('./localPath'),
                vCard = vCardsJS(),
                formatterIMG = (filename) => {
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
                },
                logotipo = vcard['logo'],
                fotoPerfil = vcard['photo'];

            //set properties
            vCard.firstname = vcard['firstname'];
            vCard.lastname = vcard['lastname'];
            vCard.organization = vcard['organization'];
            vCard.photo.embedFromString(Buffer.from(fs.readFileSync(path.localPath(`public/${fotoPerfil.path}${fotoPerfil.name}`))).toString('base64'), formatterIMG(fotoPerfil.name));
            vCard.logo.embedFromString(Buffer.from(fs.readFileSync(path.localPath(`public/${logotipo.path}${logotipo.name}`))).toString('base64'), formatterIMG(logotipo.name));
            vCard.workPhone = vcard['workPhone'];
            vCard.birthday = new Date(vcard['birthday']['year'], vcard['birthday']['month'], vcard['birthday']['day']);
            vCard.title = vcard['title'];
            vCard.url = vcard['url'];
            vCard.workUrl = vcard['workUrl'];
            vCard.workEmail = vcard['email'];
            vCard.workAddress.label = vcard['label'];
            vCard.workAddress.street = vcard['street'];
            vCard.workAddress.city = vcard['city'];
            vCard.workAddress.stateProvince = vcard['stateProvince'];
            vCard.workAddress.postalCode = vcard['postalCode'];
            vCard.workAddress.countryRegion = vcard['countryRegion'];
            vCard.socialUrls = (() => {
                let value = {};

                vcard['socialUrls'].forEach(social => {
                    value[social['media']] = social['url'];
                });

                return value;
            })();
            //save to file
            vCard.filename = String(`${vcard['firstname']}_${vcard['lastName']}_${vcard['organization']}.vcf`).replace(/\s{1,}/g, '_');
            vCard.filepath = path.localPath(`public/vcf/${vCard.filename}`);
            await vCard.saveToFile(vCard.filepath);

            resolve(vCard.filename);
        } catch (error) {
            reject(error);
        }
    });
}