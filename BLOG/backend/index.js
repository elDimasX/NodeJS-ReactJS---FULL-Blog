
// Para o .env
require("dotenv").config();

// Express (assícrono, que vai continuar executando)
const { app }= require("./utils/mongoose");




/*

    ROTAS

*/
const userRoutes = require("./routes/userRoutes").routes;
const postRoutes = require("./routes/postRoutes");
const commentRotes = require("./routes/commentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const passport = require("passport");

require("./services/passport");



const googleAuthRoutes = require("./routes/googleAuthRoutes");

// O rateLimit (usado em routes) usa IP por padrão.
// Se seu site estiver atrás de proxy (Cloudflare, Nginx, etc), você precisa colocar no Express:
// Senão todos usuários podem acabar compartilhando o mesmo limite.
app.set("trust proxy", 1);

app.use(userRoutes);
app.use(postRoutes);
app.use(commentRotes);
app.use("/payment", paymentRoutes);




// Necessário para login com o google
app.use(passport.initialize());
// app.use(passport.session());

app.use("/auth", googleAuthRoutes);





const multer = require("multer");


app.use((err, req, res, next) => {

    try {

        console.log("ERROR MIDDLEWARE");
        console.log("URL:", req.originalUrl);
        console.log("METHOD:", req.method);
        console.log("ERROR:", err);

        // Se a resposta já foi enviada, deixa o Express lidar
        if (res.headersSent) {
            console.log("headersSent = true");
            return next(err);
        }

        // Erro do multer
        if (err instanceof multer.MulterError) {
            console.log("Multer error:", err.message);

            return res.status(400).json({
                error: err.message
            });
        }

        // Qualquer outro erro
        if (err) {
            console.log("Generic error:", err.message);

            return res.status(400).json({
                error: err.message
            });
        }

        // Se não for erro, passa pro próximo middleware
        next();

    } catch (catchErr) {

        console.error("Error inside error middleware:", catchErr);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Internal server error"
            });
        } else {
            next(catchErr);
        }
    }
});







/*

    Limpa o banco de dados de pagamentos que estão pendentes, de 1 em 1 hora

*/
const PaymentModel = require("./models/payment");

const cleanupPayments = async () => {
    await PaymentModel.deleteMany({
        status: "pending",
        createdAt: {
            $lt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    });

    console.log("Pagamentos antigos limpos 🧹");
};


const cron = require("node-cron");

cron.schedule("0 * * * *", () => {
    cleanupPayments();
});



/*

    INICIALIZAÇÃO

*/

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {

})
.then
(() =>
{

    app.listen(3001, () => {
        console.log("Servidor do Blog executando!");
    });
})
.catch
(err => console.log(`mongoose.connect error: ${err}`));


