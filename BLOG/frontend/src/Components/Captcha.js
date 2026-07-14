
import { TOKEN_CAPTCHA } from "../Contexts/Variables"

export async function executeCaptcha(action)
{
    if (!window.grecaptcha)
        throw new Error("reCAPTCHA não carregado");

    return new Promise((resolve, reject) =>
    {
        window.grecaptcha.enterprise.ready(async () =>
        {
            try {

                const token = await window.grecaptcha.enterprise.execute(
                    TOKEN_CAPTCHA,
                    { action }
                );

                resolve(token);

            } catch (err) {
                reject(err);
            }
        });
    });
}