
const { createPixPayment, getPaymentStatus } = require("../services/mercadoPago.js");

const User = require("../models/user");
const Payment = require("../models/payment");

const { enviarEmail, mensagemAgradecimentoDoacao } = require("../services/sendgrid");


exports.createPix = async (req, res) => {
    try
    {
        let { amount } = req.body;

        if (!amount || amount < 1) {
        return res.status(400).json({ error: "Valor mínimo de 1,00 R$" });
        }

        if (amount > 10000) {
            return res.status(400).json({ error: "Valor máximo de 10.000,00 R$ 😂" });
        }

        amount = Number(Number(amount).toFixed(2));

        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: "Não autenticado." });
        }

        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (user.statusAccount.isActive === false) {
        return res.status(403).json({ error: "Conta desativada." });
        }

        const response = await createPixPayment(amount, user.profile.email);

        await Payment.create({
        paymentId: response.id,
            userId: user._id,
            amount: amount,
            status: "pending"
        });

        // const valorFormatado = (amount / 100).toLocaleString("pt-BR", {
        //     style: "currency",
        //     currency: "BRL"
        // });

        // enviarEmail(
        //     user.email,
        //     `Pagamento gerado - ${process.env.SITE_NAME}!`,
        //     mensagemAgradecimentoDoacao(user.name, valorFormatado)
        // )
        // .catch(err => {
        //     console.error("/controllers/payment.js webhook erro ao enviar email:", err);
        // });

        return res.status(200).json(response.point_of_interaction.transaction_data);

    } catch (err) {

        if (err?.message?.includes("circuit breaker")) {
            return res.status(503).json({
                error: "Serviço de pagamento temporariamente indisponível. Tente novamente."
            });
        }

        console.error("/controllers/payment.js createPix:", err);
        return res.status(500).json({ error: "Erro ao criar pagamento" });
    }
};

exports.webhook = async (req, res) => {
    try
    {
        const paymentId = req.body.data?.id;
        if (!paymentId) return res.sendStatus(200);

        const payment = await getPaymentStatus(paymentId);

        if (payment !== "approved")
        {
            return res.sendStatus(200);
        }

        const record = await Payment.findOne({ paymentId });

        if (!record) return res.sendStatus(200);

        const updated = await Payment.updateOne({
                paymentId: paymentId,
                status: { $ne: "approved" } // só atualiza se ainda não foi aprovado
            },
            {
                $set: { status: "approved" }
            }
        );

        if (updated.modifiedCount === 0) 
        {
            // Já foi processado
            return res.sendStatus(200);
        }
        
        const user = await User.findById(record.userId);

        if (!user)
        {
            console.log(`ALERTA! Um pagamento foi concluído, mas o usuário não foi encontrado, id: ${record.userId}`);
            return res.sendStatus(200);
        }

        await User.updateOne(
            { _id: record.userId },
            {
                $inc: { "stats.amountDonation": record.amount }
        });

        const valorFormatado = (record.amount / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        enviarEmail(
            user.profile.email,
            `Pagamento confirmado - ${process.env.SITE_NAME}!`,
            mensagemAgradecimentoDoacao(user.profile.name, valorFormatado)
        )
        .catch(err => {
            console.error("/controllers/payment.js webhook erro ao enviar email:", err);
        });

        console.log(`Pagamento confirmado 🔥 | User: ${user._id} | Valor: ${valorFormatado}`);

        return res.sendStatus(200);

    } catch (err) {
        console.error("/controllers/payment.js webhook:", err);
        return res.sendStatus(500);
    }
};
