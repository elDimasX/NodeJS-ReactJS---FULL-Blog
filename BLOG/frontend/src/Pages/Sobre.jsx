
import "../Css/Sobre.css"

import { NOME_WEBSITE, DESCRICAO, GITHUB, LINKEDIN, EMAIL } from "../Contexts/Variables";
import {
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaLock,
  FaMoneyBillWave,
  FaUsers,
  FaRocket,
  FaCloud,

  FaEnvelope, 
  FaLinkedin, 
  FaGithub, 
  FaBriefcase 
} from "react-icons/fa";

import Banner from "../Images/banner.png"

export default function Sobre() {
  return (
    <div className="sobre">

      {/* HERO */}
      <section>
        <h1>{NOME_WEBSITE}</h1>
        <p>{DESCRICAO}</p>

        <img src={Banner} className="bannerAbout" alt="banner"/>

        <p>
          Um <strong>ecossistema completo de site</strong>, pronto para produção,
          com frontend e backend integrados, focado em <strong>escala, segurança e monetização</strong>.
        </p>
      </section>

      {/* DIFERENCIAL */}
      <section>
        <h2><FaRocket /> Por que esse projeto é diferente?</h2>
        <ul>
          <li>Pronto para uso imediato (não é só template)</li>
          <li>Backend completo já funcional</li>
          <li>Fácil de personalizar (variáveis centralizadas)</li>
          <li>Estrutura pensada para escalar</li>
        </ul>
      </section>

      {/* BACKEND */}
      <section>
        <h2><FaNodeJs /> Backend completo (Node.js)</h2>
        <p>
          API robusta com sistema completo de gerenciamento de usuários, conteúdo e monetização.
        </p>

        <ul>
          <li>Autenticação (login, registro e sessão persistente)</li>
          <li>Posts, comentários, likes e notificações</li>
          <li>Proteção contra spam (rate limit + cooldown)</li>
          <li>Proteção contra XSS e validações</li>
          <li>Atualizações seguras no banco (atomic updates)</li>
        </ul>
      </section>

      {/* FRONTEND */}
      <section>
        <h2><FaReact /> Frontend moderno (React)</h2>
        <ul>
          <li>Interface responsiva e rápida</li>
          <li>Consome toda a API automaticamente</li>
          <li>Renderização de posts com Markdown</li>
          <li>Páginas dinâmicas (perfil, posts, busca)</li>
        </ul>
      </section>

      {/* DATABASE + CLOUD */}
      <section>
        <h2><FaDatabase /> Banco de dados e mídia</h2>
        <ul>
          <li>MongoDB (estrutura escalável e relacional)</li>
          <li><FaCloud /> Cloudinary para armazenamento e otimização de imagens</li>
          <li>Organização eficiente de dados e uploads</li>
        </ul>
      </section>

      {/* FUNCIONALIDADES */}
      <section>
        <h2><FaUsers /> Funcionalidades completas</h2>
        <ul>
          <li>Sistema de usuários com perfis personalizados</li>
          <li>Criação e gerenciamento de posts</li>
          <li>Comentários com respostas (threads)</li>
          <li>Sistema de likes em perfis</li>
          <li>Notificações automáticas</li>
          <li>Ranking de apoiadores</li>
          <li>Recuperação de conta por e-mail</li>
        </ul>
      </section>

      {/* MONETIZAÇÃO */}
      <section>
        <h2><FaMoneyBillWave /> Monetização integrada</h2>
        <p>
          O sistema já vem preparado para gerar receita.
        </p>

        <ul>
          <li>Pagamentos via PIX (Mercado Pago)</li>
          <li>Sistema de apoiadores com insígnias</li>
          <li>Ranking automático de doações</li>
        </ul>
      </section>

      {/* SEGURANÇA */}
      <section>
        <h2><FaLock /> Segurança</h2>
        <ul>
          <li>Criptografia de dados sensíveis</li>
          <li>Proteção contra XSS</li>
          <li>Rate limit contra spam</li>
          <li>Captcha integrado</li>
        </ul>
      </section>

      {/* FINAL (VENDA) */}
      <section>
        <h2><FaBriefcase /> Ideal para</h2>
        <ul>
          <li>Blogs profissionais</li>
          <li>Portais de conteúdo</li>
          <li>Comunidades online</li>
          <li>Projetos com monetização</li>
        </ul>

        <p>
          Este projeto pode ser entregue pronto ou totalmente personalizado
          para atender às necessidades do cliente.
        </p>
      </section>

      <section>
        <h2><FaRocket /> Quer um site assim?</h2>

        <p>
            Se você quer um site completo, profissional e pronto para crescer,
            eu posso personalizar este projeto exatamente para o seu negócio.
        </p>

        <p>
            Entre em contato e vamos transformar sua ideia em uma plataforma real.
        </p>

        <ul>
            <li>
            <FaEnvelope />{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>

            <li>
            <FaLinkedin />{" "}
            <a href={LINKEDIN} target="_blank" rel="noreferrer">
                LinkedIn
            </a>
            </li>

            <li>
            <FaGithub />{" "}
            <a href={GITHUB} target="_blank" rel="noreferrer">
                GitHub
            </a>
            </li>
        </ul>

        <p>
            💡 <strong>Diferencial:</strong> entrega rápida, código escalável e
            possibilidade de evolução contínua do sistema.
        </p>
        </section>

    </div>
  );
}