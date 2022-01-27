import { Request, Response } from 'express';

export class Router404Controller {
    async handle(request: Request, response: Response) {
        return response.json({
            success: false,
            message: 'Rota não encontrada.'
        });
    }
}