import { Card, Tag, Button } from "antd";
import { AppstoreOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Package } from "../services/packages.service";

const ACCENT = "#aa3bff";

interface Props {
  pkg: Package;
}

const PackageCard = ({ pkg }: Props) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      cover={
        pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.name}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
            <AppstoreOutlined style={{ fontSize: 36, color: "#cbd5e1" }} />
          </div>
        )
      }
      bodyStyle={{ padding: "16px" }}
    >
      <h3 className="font-semibold text-slate-800 text-base leading-tight line-clamp-1 mb-2">
        {pkg.name}
      </h3>

      {pkg.description && (
        <p className="text-slate-500 text-sm mb-3 line-clamp-2">
          {pkg.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Tag color="purple" className="font-semibold text-sm m-0">
          ${pkg.price.toLocaleString()}
        </Tag>
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/packages/${pkg.pkg_id}`)}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          View
        </Button>
      </div>
    </Card>
  );
};

export default PackageCard;
