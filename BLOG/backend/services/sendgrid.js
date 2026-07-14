
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport
(sendgridTransport({

    auth: {
        api_key: process.env.SENDGRID_KEY
    }
    
}));

exports.enviarEmail = async function(email, titulo, mensagemHTML)
{
    try {
    
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_GOOGLE,
            subject: titulo,
            html: mensagemHTML
        });
    } catch (err)
    {
        throw err; // Repassa o erro pra quem chamou
    }
}



exports.mensagemAtivarConta = (link) =>
{
    return (`
    <div style="margin:0; padding:0; background-color:#0F1115; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">

            <table width="500" cellpadding="0" cellspacing="0" style="background:#1A1D24; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                
                <!-- Header -->
                <tr>
                <td align="center" style="padding-bottom:20px;">
                    <h1 style="color:#00D4FF; margin:0;">
                    ${process.env.SITE_NAME}
                    </h1>
                </td>
                </tr>

                <!-- Title -->
                <tr>
                <td style="padding-bottom:10px;">
                    <h2 style="color:#E6EAF2; margin:0;">
                    Ative sua conta
                    </h2>
                </td>
                </tr>

                <!-- Text -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#A5ADBA; font-size:14px; line-height:1.6;">
                    Olá 👋,<br><br>
                    Obrigado por criar uma conta na <strong style="color:#00D4FF;">${process.env.SITE_NAME}</strong>.
                    <br><br>
                    Para ativar sua conta, clique no botão abaixo:
                    </p>
                </td>
                </tr>

                <!-- Button -->
                <tr>
                <td align="center" style="padding-bottom:25px;">
                    <a href="${link}" 
                    style="display:inline-block; padding:12px 25px; background:#00D4FF; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">
                    Ativar Conta
                    </a>
                </td>
                </tr>

                <!-- Fallback -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#6C7483; font-size:12px; word-break:break-all;">
                    Se o botão não funcionar, copie e cole este link no navegador:
                    <br><br>
                    <span style="color:#00D4FF;">${link}</span>
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="border-top:1px solid #2C313C; padding-top:15px;">
                    <p style="color:#6C7483; font-size:11px; text-align:center;">
                    Se você não criou essa conta, pode ignorar este email.
                    </p>
                </td>
                </tr>

            </table>

            </td>
        </tr>
        </table>

    </div>
    `)
}

exports.mensagemContaAtivada = (nome, linkLogin) =>
{
    return (`
    <div style="margin:0; padding:0; background-color:#0F1115; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">

            <table width="500" cellpadding="0" cellspacing="0" style="background:#1A1D24; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                
                <!-- Header -->
                <tr>
                <td align="center" style="padding-bottom:20px;">
                    <h1 style="color:#00D4FF; margin:0;">
                    ${process.env.SITE_NAME}
                    </h1>
                </td>
                </tr>

                <!-- Title -->
                <tr>
                <td style="padding-bottom:10px;">
                    <h2 style="color:#E6EAF2; margin:0;">
                    Conta ativada com sucesso 🎉
                    </h2>
                </td>
                </tr>

                <!-- Text -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#A5ADBA; font-size:14px; line-height:1.6;">
                    Olá <strong style="color:#E6EAF2;">${nome}</strong> 👋,<br><br>
                    Sua conta na <strong style="color:#00D4FF;">${process.env.SITE_NAME}</strong> foi ativada com sucesso.
                    <br><br>
                    Agora você já pode acessar a plataforma e aproveitar todos os recursos disponíveis.
                    </p>
                </td>
                </tr>

                <!-- Button -->
                <tr>
                <td align="center" style="padding-bottom:25px;">
                    <a href="${linkLogin}" 
                    style="display:inline-block; padding:12px 25px; background:#00D4FF; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">
                    Acessar minha conta
                    </a>
                </td>
                </tr>

                <!-- Extra -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#6C7483; font-size:12px;">
                    Se tiver qualquer dúvida ou problema, nossa equipe está pronta para ajudar.
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="border-top:1px solid #2C313C; padding-top:15px;">
                    <p style="color:#6C7483; font-size:11px; text-align:center;">
                    Bem-vindo(a), ${nome}! 🚀
                    </p>
                </td>
                </tr>

            </table>

            </td>
        </tr>
        </table>

    </div>
    `)
}

exports.mensagemAgradecimentoDoacao = (nome, valor) =>
{
    return (`
    <div style="margin:0; padding:0; background-color:#0F1115; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">

            <table width="500" cellpadding="0" cellspacing="0" style="background:#1A1D24; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                
                <!-- Header -->
                <tr>
                <td align="center" style="padding-bottom:20px;">
                    <h1 style="color:#00D4FF; margin:0;">
                    ${process.env.SITE_NAME}
                    </h1>
                </td>
                </tr>

                <!-- Title -->
                <tr>
                <td style="padding-bottom:10px;">
                    <h2 style="color:#E6EAF2; margin:0;">
                    Obrigado pelo seu apoio 💙
                    </h2>
                </td>
                </tr>

                <!-- Text -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#A5ADBA; font-size:14px; line-height:1.6;">
                    Olá <strong style="color:#E6EAF2;">${nome || 'Apoiador'}</strong> 👋,<br><br>
                    
                    Recebemos sua contribuição de 
                    <strong style="color:#00D4FF;">R$ ${valor}</strong> com sucesso.
                    <br><br>

                    Seu apoio é extremamente importante e nos ajuda a continuar melhorando a 
                    <strong style="color:#00D4FF;">${process.env.SITE_NAME}</strong>.
                    <br><br>

                    💡 Cada contribuição faz diferença — de verdade.
                    </p>
                </td>
                </tr>

                <!-- Highlight -->
                <tr>
                <td align="center" style="padding:15px; background:#0F1115; border-radius:8px; margin-bottom:20px;">
                    <p style="color:#00D4FF; font-size:18px; margin:0; font-weight:bold;">
                        R$ ${valor}
                    </p>
                    <p style="color:#6C7483; font-size:12px; margin:5px 0 0;">
                        Valor da sua contribuição
                    </p>
                </td>
                </tr>

                <!-- Extra -->
                <tr>
                <td style="padding-top:20px;">
                    <p style="color:#6C7483; font-size:12px;">
                    Se tiver qualquer dúvida ou precisar de suporte, estamos aqui pra ajudar.
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="border-top:1px solid #2C313C; padding-top:15px;">
                    <p style="color:#6C7483; font-size:11px; text-align:center;">
                    Com gratidão, 💙<br>
                    Equipe ${process.env.SITE_NAME}
                    </p>
                </td>
                </tr>

            </table>

            </td>
        </tr>
        </table>

    </div>
    `)
}

exports.mensagemRecuperacaoSenha = (nome, linkResetar) =>
{
    return (`
    <div style="margin:0; padding:0; background-color:#0F1115; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">

            <table width="500" cellpadding="0" cellspacing="0" style="background:#1A1D24; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                
                <!-- Header -->
                <tr>
                <td align="center" style="padding-bottom:20px;">
                    <h1 style="color:#00D4FF; margin:0;">
                    ${process.env.SITE_NAME}
                    </h1>
                </td>
                </tr>

                <!-- Title -->
                <tr>
                <td style="padding-bottom:10px;">
                    <h2 style="color:#E6EAF2; margin:0;">
                    Recuperação de senha
                    </h2>
                </td>
                </tr>

                <!-- Text -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#A5ADBA; font-size:14px; line-height:1.6;">
                    Olá <strong style="color:#E6EAF2;">${nome}</strong> 👋,<br><br>

                    Recebemos uma solicitação para redefinir a senha da sua conta na 
                    <strong style="color:#00D4FF;">${process.env.SITE_NAME}</strong>.
                    <br><br>

                    Clique no botão abaixo para criar uma nova senha:
                    </p>
                </td>
                </tr>

                <!-- Button -->
                <tr>
                <td align="center" style="padding-bottom:25px;">
                    <a href="${linkResetar}" 
                    style="display:inline-block; padding:12px 25px; background:#00D4FF; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">
                    Redefinir senha
                    </a>
                </td>
                </tr>

                <!-- Extra -->
                <tr>
                <td style="padding-bottom:20px;">
                    <p style="color:#6C7483; font-size:12px;">
                    Se você não solicitou essa alteração, ignore este e-mail. 
                    Por motivos de segurança, o link possui tempo limitado de expiração.
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="border-top:1px solid #2C313C; padding-top:15px;">
                    <p style="color:#6C7483; font-size:11px; text-align:center;">
                    ${process.env.SITE_NAME} • Segurança da conta 🛡️
                    </p>
                </td>
                </tr>

            </table>

            </td>
        </tr>
        </table>

    </div>
    `)
}

exports.mensagemSenhaAlterada = (nome, linkLogin) =>
{
    return (`
    <div style="margin:0; padding:0; background-color:#0F1115; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
                <td align="center">

                    <table width="500" cellpadding="0" cellspacing="0" style="background:#1A1D24; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h1 style="color:#00D4FF; margin:0;">
                                    ${process.env.SITE_NAME}
                                </h1>
                            </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                            <td style="padding-bottom:10px;">
                                <h2 style="color:#E6EAF2; margin:0;">
                                    Senha alterada com sucesso
                                </h2>
                            </td>
                        </tr>

                        <!-- Text -->
                        <tr>
                            <td style="padding-bottom:20px;">
                                <p style="color:#A5ADBA; font-size:14px; line-height:1.6;">
                                    Olá <strong style="color:#E6EAF2;">${nome}</strong> 👋,<br><br>

                                    A senha da sua conta na 
                                    <strong style="color:#00D4FF;">${process.env.SITE_NAME}</strong> 
                                    foi alterada com sucesso.
                                    <br><br>

                                    Por motivos de segurança, todos os dispositivos conectados foram desconectados automaticamente.
                                </p>
                            </td>
                        </tr>

                        <!-- Button -->
                        <tr>
                            <td align="center" style="padding-bottom:25px;">
                                <a href="${linkLogin}" 
                                   style="display:inline-block; padding:12px 25px; background:#00D4FF; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">
                                    Fazer login
                                </a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="border-top:1px solid #2C313C; padding-top:15px;">
                                <p style="color:#6C7483; font-size:11px; text-align:center;">
                                    ${process.env.SITE_NAME} • Segurança da conta 🛡️
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </div>
    `)
}
