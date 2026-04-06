import FgtsConsulta from "../modules/fgts/FgtsConsulta";
import CreateUser from "../pages/CreateUsers";
import FgtsEsteira from "../modules/fgts/FgtsEsteira";
import UsersList from "../modules/users/UsersList";
import AdminFgtsLotePage from "../pages/admin/AdminFgtsLotePage";
import EditarUsuario from "../modules/users/EditarUsuario";
import FgtsOfertasPromotor from "../modules/fgts/FgtsOfertasPromotor";
import RegistrarNovoCliente from "../modules/clientes/RegistrarNovoCliente";
import CltConsulta from "../modules/clt/CltConsulta";
import CltEsteira from "../modules/clt/CltEsteira";


export const routesConfig = [
  {
    path: "/fgts",
    label: "Consultar FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <FgtsConsulta />
  },
  {
    path: "/clt",
    label: "Consultar CLT",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <CltConsulta />
  },
  {
    path: "/registro",
    label: "Criar Usuário",
    permission: "USER_MANAGE",
    showInMenu: true,
    element: <CreateUser />
  },
  {
  path: "/fgts/esteira",
  label: "Esteira FGTS",
  permission: "FGTS_VIEW",
  showInMenu: true,
  element: <FgtsEsteira />
},
{
  path: "/clt/esteira",
  label: "Esteira CLT",
  permission: "FGTS_VIEW",
  showInMenu: true,
  element: <CltEsteira />
},
{
  path: "/usuarios",
  label: "Gestão de Usuários",
  permission: "USER_MANAGE",
  showInMenu: true,
  element: <UsersList />
},
{
  path: "/admin/fgts-lote",
  label: "FGTS em Lote",
  permission: "USER_MANAGE",
  showInMenu: true,
  element: <AdminFgtsLotePage />
},
{
  path: "/usuarios/editar/:id",
  label: "Editar Usuário",
  permission: "USER_MANAGE",
  showInMenu: false, // importante para não aparecer no menu
  element: <EditarUsuario />
},
{
  path: "/fgts/ofertas",
  label: "Minhas Ofertas FGTS",
  permission: "FGTS_VIEW",
  showInMenu: true,
  element: <FgtsOfertasPromotor />
},
{
  path: "/registro-cliente",
  label: "Registrar novo cliente",
  permission: "FGTS_VIEW",
  showInMenu: true,
  element: <RegistrarNovoCliente />
}

];
