export class CreateThrowErrorController {
  async handle<ReturnType>(handle: Promise<ReturnType>, msgError: string) {
    try {
      return {
        success: true,
        data: await handle
      }
    } catch (error) {
      return { success: false, message: msgError, error: error instanceof Error ? error.message : JSON.stringify(error) };
    }
  }
}