
require("dotenv").config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

const client = new RecaptchaEnterpriseServiceClient({
    credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID
    },
    projectId: process.env.GOOGLE_PROJECT_ID
}
);

async function verifyCaptcha(token, action) {

    const request = {
        parent: `projects/${process.env.GOOGLE_PROJECT_ID}`,
        assessment: {
            event: {
                token: token,
                siteKey: process.env.RECAPTCHA_SITE_KEY
            }
        }
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties.valid) {
        throw new Error("Token CAPTCHA inválido.");
    }

    // if (response.tokenProperties.hostname !== "seudominio.com") {
    //     throw new Error("Hostname inválido");
    // }

    if (response.tokenProperties.action !== action) {
        throw new Error("Ação inválida.");
    }

    return response.riskAnalysis.score;
}

exports.VerificarCaptcha = async (req, res, next) => {

    try {

        const token = req.body.captchaToken;
        const action = req.body.action;

        if (!token)
            return res.status(400).json({ error: "Captcha ausente." });

        const score = await verifyCaptcha(token, action);

        // Níveis para determinar se é bot ou não
        if (score < 0.5)
        {
            return res.status(403).json(
            {
                error: "Possível bot.",
                score
            });
        }

        next();

    } catch (err) {

        res.status(500).json({ error: err.message });
    }

};
