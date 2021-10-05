/**
 * @description Metodos do modelo de usuários
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
import User from '@/models/User';

/**
 * @description Cria um novo usuário
 */
export async function createUser(): Promise<User> {
    const newUser = await User.create({
        name: "Johnny 2",
        preferredName: "John 2",
        email: "ti@grupomave.com.br"
    });

    console.log(newUser.id, newUser.name, newUser.preferredName);

    const project = await newUser.createProject({
        name: `Teste ${new Date().toLocaleDateString('pt-br')} às ${new Date().toLocaleTimeString('pt-br')}`,
    });

    const ourUser = await User.findByPk(newUser.id, {
        include: [User.associations.projects],
        rejectOnEmpty: true, // Especificar true aqui remove `null` do tipo de retorno!
    });

    // Observe a asserção nula `!` Uma vez que TS não pode saber se incluímos o modelo ou não
    console.log('Project Name', ourUser.projects![0].name);
    console.log(`Project props`, project)
    console.log(`User has a ${await ourUser.countProjects()} projects.`);
    console.log('User props', ourUser);

    return newUser;
}

/**
 * @description Busca pelo usuário
 */
export async function updateUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId, { rejectOnEmpty: true });

    await user.update({ name: 'Guilherme', email: 'suporte@grupomave.com.br' });

    await user.save({ fields: ["name", "email"] });

    return user;
}

/**
 * @description Busca pelo usuário
 */
export async function findUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId, {
        rejectOnEmpty: true,
        include: [User.associations.projects],
        attributes: {
            exclude: ['email'] // Retorna os atributos, menos o email
        }
    });

    return user;
}

export async function findAllUserByProjectName(projectName: string): Promise<User[]> {
    const user = await User.findAll({
        attributes: {
            exclude: ['preferredName'] // Retorna os atributos, menos o preferredName
        },
        include: [
            {
                association: User.associations.projects,
                required: true, // Define que esse include deve ser atendido
                where: {
                    name: {
                        [Op.iLike]: `%${projectName}%`
                    }
                }
            }
        ]
    });

    return user;
}

export async function removeUser(userId: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findByPk(userId, { rejectOnEmpty: true });

            await user.destroy();

            return resolve(true);
        } catch (error) {
            return reject(error);
        }
    });
}