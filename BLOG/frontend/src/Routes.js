
import Home from "./Pages/Home"

import Login from "./Pages/Login"
import Register from "./Pages/Register"
import VerificarEmail from "./Pages/VerificarEmail"
import ResetarSenha from "./Pages/ResetarSenha"

import Perfil from "./Pages/Perfil"
import EditarPerfil from "./Pages/EditarPerfil"

import Payment from "./Pages/Payment"
import Apoiadores from "./Pages/Apoiadores"

import PostsList from "./Pages/PostsList"
import Posts from "./Pages/Post"
import Poll from "./Pages/Poll"
import CriarPost from "./Pages/Admins/CriarPost"

import Sobre from "./Pages/Sobre"


import AuthSuccessGoogle from "./Pages/Auth/AuthSuccessGoogle"

import { Routes, Route } from "react-router-dom"


export default function RoutesFront()
{
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/resetar-senha" element={<ResetarSenha/>} />

            <Route path="/verificar-email" element={<VerificarEmail/>} />

            <Route path="/posts" element={<PostsList/>} />
            <Route path="/posts/:postLoad" element={<Posts/>} />
            <Route path="/posts/:q" element={<PostsList/>} />

            <Route path="/polls/:postLoad" element={<Poll/>} />

            <Route path="/criar-post" element={<CriarPost/>} />
            <Route path="/criar-post/:post" element={<CriarPost/>} />

            <Route path="/pagamento" element={<Payment/>} />
            <Route path="/apoiadores" element={<Apoiadores/>} />

            {/* <Route path="/meuperfil" element={<Perfil isOwner={true}/>} /> */}
            <Route path="/perfil/contadesativada" element={<Home/>} />
            <Route path="/perfil/:nickname" element={<Perfil/>} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />


            <Route path="/sobre" element={<Sobre/>} />


            <Route path="/auth/google/success" element={<AuthSuccessGoogle status="success"/>} />
            <Route path="/auth/google/fail" element={<AuthSuccessGoogle status="fail"/>} />
            
        </Routes>
    )

}
