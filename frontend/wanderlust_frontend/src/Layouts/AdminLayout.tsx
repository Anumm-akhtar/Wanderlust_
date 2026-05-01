import { Suspense, lazy } from "react";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* <ModuleAccessGuard /> */}
      {/* <SidebarWrapper /> */}

      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<div>Loading...</div>}>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;