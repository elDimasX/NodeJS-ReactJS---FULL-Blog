
const { MercadoPagoConfig, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST
});

const payment = new Payment(client);

exports.createPixPayment = async (amount, email) => {

    if (!amount || amount < 1)
    {
        throw new Error("Valor inválido");
    }

    if (amount > 10000)
    {
        throw new Error("Valor muito alto");
    }

    const response = await payment.create({
        body: {
            transaction_amount: amount,
            description: "Pagamento PIX",
            payment_method_id: "pix",
            payer: {
                email: email
            }
        }
    });

    return response;
};

exports.getPaymentStatus = async (id) => {
    const response = await payment.get({ id });
    return response.status;
};