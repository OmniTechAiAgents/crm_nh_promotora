import { FgtsConsulta } from "../modules/fgts/FgtsConsulta";
import Layout from "../layout/Layout";

export const routesConfig = [
  {
    path: "/fgts",
    label: "FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: (
      <Layout>
        <FgtsConsulta />
      </Layout>
    )
  }
];
