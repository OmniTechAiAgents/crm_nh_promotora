import FgtsConsulta from "../modules/fgts/FgtsConsulta";
import CreateUser from "../pages/CreateUsers";
import FgtsEsteira from "../modules/fgts/FgtsEsteira";
import UsersList from "../modules/users/UsersList";
import AdminFgtsLotePage from "../pages/admin/AdminFgtsLotePage";
import EditarUsuario from "../modules/users/EditarUsuario";


export const routesConfig = [
  {
    path: "/fgts",
    label: "Consultar FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <FgtsConsulta />
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
}


];
