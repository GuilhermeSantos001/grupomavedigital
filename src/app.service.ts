import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Grupo Mave - 2022 © Todos direitos reservados.';
  }
}
