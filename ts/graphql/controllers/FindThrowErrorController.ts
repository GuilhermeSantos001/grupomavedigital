export class FindThrowErrorController {
    async handle<ReturnType>(handle: Promise<ReturnType>, msgError: string) {
        try {
            const data = await handle;

            if (!data)
                throw new Error('Data not found.');

            return {
                success: true,
                data
            }
        } catch (error) {
            return { success: false, message: msgError, error: error instanceof Error ? error.message : JSON.stringify(error) };
        }
    }
}