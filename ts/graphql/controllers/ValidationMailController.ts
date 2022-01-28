export class ValidationMailController {
  async handle(mail: string) {
    return mail.match(new RegExp(/^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/));
  }
}