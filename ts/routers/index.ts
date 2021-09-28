/**
 * @description Organizador das rotas do sistema
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.6
 */

/**
 * @description Rota Principal
 */
import Home from '@/routers/home';

/**
 * @description Rotas de Usuário
 */
import User from '@/routers/user';

/**
 * @description Rotas do Sistema
 */
import Cpanel from '@/routers/cpanel';
import StorageHercules from '@/routers/storageHercules';
import System from '@/routers/system';

/**
 * @description Rotas dos Cartões Digitais
 */
import Card from '@/routers/cards';

export default function Router(app: any): void {
    //- Route of users
    User(app);

    // - Route of system
    Cpanel(app);
    StorageHercules(app);
    System(app);

    // - Route of Cards
    Card(app);

    // - Route Home(All *)
    Home(app);
}