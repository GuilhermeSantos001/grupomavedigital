/**
 * @description Metodos do modelo de projetos
 * @author @GuilhermeSantos001
 * @update 31/08/2021
 * @version 1.0.0
 */

import {
    Op
} from 'sequelize';

/**
 * @description Importação dos modelos
 */
import Project from '@/models/project';

/**
 * @description Cria um novo projeto
 */
export async function createProject(ownerId: number, name: string) {
    const newProject = await Project.create({
        name,
        ownerId
    });

    console.log(newProject.id, newProject.name);

    return newProject;
};

// /**
//  * @description Busca pelo usuário
//  */
// export async function findUser(userId: number) {
//     const user = await User.findByPk(userId, {
//         rejectOnEmpty: true,
//         include: [User.associations.projects],
//         attributes: {
//             exclude: ['email'] // Retorna os atributos, menos o email
//         }
//     });

//     return user;
// };

// export async function findAllUserByProjectName(projectName: string) {
//     const user = await User.findAll({
//         attributes: {
//             exclude: ['preferredName'] // Retorna os atributos, menos o preferredName
//         },
//         include: [
//             {
//                 association: User.associations.projects,
//                 required: true, // Define que esse include deve ser atendido
//                 where: {
//                     name: {
//                         [Op.iLike]: `%${projectName}%`
//                     }
//                 }
//             }
//         ]
//     });

//     return user;
// };

// export async function removeUser(userId: number) {
//     return new Promise<boolean>(async (resolve, reject) => {
//         try {
//             const user = await User.findByPk(userId, { rejectOnEmpty: true });

//             await user.destroy();

//             return resolve(true);
//         } catch (error) {
//             return reject(error);
//         };
//     });
// };