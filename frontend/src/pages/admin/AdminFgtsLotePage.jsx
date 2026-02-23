import { useState } from "react";
import AdminUploadFgtsLote from "./AdminUploadFgtsLote";
import AdminFgtsLote from "./AdminFgtsLote";

export default function AdminFgtsLotePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <AdminUploadFgtsLote onSuccess={handleUploadSuccess} />
      <hr style={{ margin: "40px 0" }} />
      <AdminFgtsLote refreshKey={refreshKey} />
    </>
  );
}